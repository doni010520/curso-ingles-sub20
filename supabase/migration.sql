-- ============================================
-- Curso de Inglês Sub-20 — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.modules (
  id serial primary key,
  title text not null,
  week text not null,
  description text,
  sort_order int not null default 0,
  is_locked boolean not null default false,
  created_at timestamptz default now()
);
alter table public.modules enable row level security;
-- Curso aberto: leitura publica (sem login)
create policy "Public read modules" on public.modules for select using (true);

create table public.lessons (
  id serial primary key,
  module_id int references public.modules(id) on delete cascade not null,
  title text not null,
  description text,
  youtube_video_id text not null,
  youtube_url text,
  channel_name text,
  duration_label text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
alter table public.lessons enable row level security;
create policy "Public read lessons" on public.lessons for select using (true);

create table public.quizzes (
  id serial primary key,
  lesson_id int references public.lessons(id) on delete cascade not null,
  questions jsonb not null,
  generated_at timestamptz default now()
);
alter table public.quizzes enable row level security;
create policy "Public read quizzes" on public.quizzes for select using (true);
create policy "Public insert quizzes" on public.quizzes for insert with check (true);

create table public.quiz_attempts (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id int references public.lessons(id) on delete cascade not null,
  quiz_id int references public.quizzes(id) on delete set null,
  score int not null,
  total int not null,
  percentage int not null,
  answers jsonb,
  created_at timestamptz default now()
);
alter table public.quiz_attempts enable row level security;
create policy "Users can view own attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);

create table public.lesson_progress (
  id serial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id int references public.lessons(id) on delete cascade not null,
  completed boolean not null default false,
  completed_at timestamptz,
  best_quiz_score int default 0,
  created_at timestamptz default now(),
  unique(user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
create policy "Users can view own progress" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "Users can upsert own progress" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.lesson_progress for update using (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- ============================================

insert into public.modules (id, title, week, description, sort_order, is_locked) values
  (1, 'Module 1 — Greetings & Introductions', 'Semana 1', 'Cumprimentar, se apresentar, perguntar o nome e a origem.', 1, false),
  (2, 'Module 2 — Football Vocabulary', 'Semana 2', 'Vocabulário essencial do futebol em inglês.', 2, false),
  (3, 'Module 3 — Daily Routine', 'Semana 3', 'Descrever a rotina diária — acordar, treinar, comer, estudar, dormir.', 3, false),
  (4, 'Module 4 — At the Airport & Travel', 'Semana 4', 'Vocabulário e frases para aeroporto, embarque, imigração.', 4, false),
  (5, 'Module 5 — Talking About a Match', 'Semana 5', 'Descrever partidas, falar de placar, comentar jogadas.', 5, true),
  (6, 'Module 6 — Numbers, Time & Money', 'Semana 6', 'Números, horas, preços, datas.', 6, true),
  (7, 'Module 7 — Food & Restaurant', 'Semana 7', 'Pedir comida, entender cardápio, interagir em restaurante.', 7, true),
  (8, 'Module 8 — Interview & Press Conference', 'Semana 8', 'Preparar o atleta para entrevistas em inglês.', 8, true);

select setval('modules_id_seq', 8);

insert into public.lessons (module_id, title, description, youtube_video_id, channel_name, duration_label, sort_order) values
  (1, 'Greetings in English', 'Learn basic greetings: Hi, Hello, Good morning, Good afternoon, Good evening.', 'hBVequEEoAQ', 'Woodward English', '7 min', 1),
  (1, 'How to Introduce Yourself', 'Practice introducing yourself: My name is…, I''m from…, I''m a…', 'UnEmEbWytI8', 'Arnel''s Everyday English', '10 min', 2),
  (1, 'Greetings & Introductions Combined', 'Review lesson combining greetings with self-introductions.', '7aWhs5G6I-I', 'MK''s English', '8 min', 3),
  (2, 'Football Vocabulary for Beginners', 'Essential football vocabulary: positions, actions, equipment.', '0BBIZpkafLs', 'English with Sbeata', '10 min', 1),
  (2, 'How to Talk about Football', 'Describe matches, talk about teams, discuss results.', 'sZ9ioZA9KFI', 'Oxford Online English', '14 min', 2),
  (2, 'Football Phrases and Expressions', 'Practical phrases: He scored a goal, The ref gave a penalty.', 'K24fr3UQIfE', 'Learn English Lab', '9 min', 3),
  (3, 'Daily Routines — Beginner', 'Vocabulary and full phrases to describe your day.', '2yNMy5et9kI', 'Arnel''s Everyday English', '12 min', 1),
  (3, 'My Daily Routine', 'First-person narration of a real daily routine. Great for listening.', '17YaQV2cu14', 'LetThemTalkTV', '8 min', 2),
  (3, 'Talking about Daily Routines', 'Focus on speaking — practice describing your own routine.', 'JwGnCIsLOpU', 'Kendra''s Language School', '10 min', 3),
  (4, 'Airport Vocabulary — English for Travel', 'Complete airport vocabulary: check-in, boarding pass, gate, security.', 'shGha68qLvY', 'English with Emma (engVid)', '13 min', 1),
  (4, 'Slow English — Airport Essentials', '30 essential airport words in slow, clear English.', 'yIPTy4BqGSA', 'POC English', '12 min', 2),
  (4, 'At the Airport — Travel English', 'Real situations: check-in, security, boarding. Practical dialogues.', 'jiBHZ_rqHB8', 'English with Bob', '10 min', 3),
  (5, 'Describing Football Matches', 'How to describe a match: They won 2-1, It was a draw.', 'sZ9ioZA9KFI', 'Oxford Online English', '14 min', 1),
  (5, 'Soccer Vocabulary Review', 'Visual flashcard review of football vocabulary.', 'FUQxqd4tH6w', 'ESL Review', '8 min', 2),
  (6, 'Numbers in English 1-100', 'Correct pronunciation of numbers.', 'DR-cfDsHCGA', 'English with Lucy', '10 min', 1),
  (6, 'How to Tell the Time', 'Hours, minutes, quarter past, half past.', 'IBBQXBhSNUs', 'English with Lucy', '12 min', 2),
  (6, 'Talking About Money and Prices', 'Prices, currencies, How much?', 'rPjez2ac1WM', 'English Addict with Mr Duncan', '10 min', 3),
  (7, 'Ordering Food in English', 'I''d like…, Can I have…, The check please.', 'WcKUJHh4rtQ', 'English with Emma (engVid)', '10 min', 1),
  (7, 'At a Restaurant — Conversation', 'Full restaurant conversation. Good for listening and role-play.', 'jTjS59K-jQg', 'Easy English', '8 min', 2),
  (8, 'Football Player Interviews', 'Real football interviews in English. Watch 2-3 and note expressions.', 'dQw4w9WgXcQ', 'English Football Interviews', '10 min', 1),
  (8, 'Professional Self-Introduction', 'Introduce yourself in a professional/interview context.', 'UnEmEbWytI8', 'Arnel''s Everyday English', '10 min', 2);

-- ============================================
-- TURMAS (multi-nível) — rode APÓS o seed acima
-- ============================================
create table if not exists public.turmas (
  id serial primary key,
  slug text unique not null,
  name text not null,
  subtitle text,
  sort_order int not null default 0,
  created_at timestamptz default now()
);
alter table public.turmas enable row level security;
create policy "Public read turmas" on public.turmas for select using (true);

insert into public.turmas (id, slug, name, subtitle, sort_order) values
  (1, 'sub-20',    'Sub-20',           'Modalidade Online', 1),
  (2, 'sub-16-17', 'Sub-16 / Sub-17',  'Turma combinada',   2),
  (3, 'sub-14-15', 'Sub-14 / Sub-15',  'Turma combinada',   3)
on conflict (id) do nothing;
select setval('turmas_id_seq', 3);

-- liga o seed acima (Sub-20) e duplica o conteúdo para as demais turmas
alter table public.modules add column if not exists turma_id int references public.turmas(id) on delete cascade;
update public.modules set turma_id = 1 where turma_id is null;

do $$
declare t int;
begin
  foreach t in array array[2,3] loop
    if not exists (select 1 from public.modules where turma_id = t) then
      insert into public.modules (title, week, description, sort_order, is_locked, turma_id)
      select title, week, description, sort_order, is_locked, t
      from public.modules where turma_id = 1;

      insert into public.lessons (module_id, title, description, youtube_video_id, youtube_url, channel_name, duration_label, sort_order)
      select md.id, l.title, l.description, l.youtube_video_id, l.youtube_url, l.channel_name, l.duration_label, l.sort_order
      from public.lessons l
      join public.modules m1 on l.module_id = m1.id and m1.turma_id = 1
      join public.modules md on md.turma_id = t and md.sort_order = m1.sort_order;
    end if;
  end loop;
end $$;
