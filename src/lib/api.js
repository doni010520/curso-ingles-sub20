import { supabase } from './supabase'

export async function getTurmas() {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data
}

export async function getTurmaBySlug(slug) {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function getModulesByTurma(turmaId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('turma_id', turmaId)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'lessons' })
  if (error) throw error
  return data
}

export async function getModule(moduleId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('id', moduleId)
    .order('sort_order', { referencedTable: 'lessons' })
    .single()
  if (error) throw error
  return data
}

export async function getLesson(lessonId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*, modules(title, week)')
    .eq('id', lessonId)
    .single()
  if (error) throw error
  return data
}

export async function getUserProgress(userId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

export async function markLessonComplete(userId, lessonId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId, lesson_id: lessonId,
      completed: true, completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    .select()
  if (error) throw error
  return data
}

export async function updateBestQuizScore(userId, lessonId, percentage) {
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('best_quiz_score')
    .eq('user_id', userId).eq('lesson_id', lessonId).single()
  if (existing && existing.best_quiz_score >= percentage) return existing
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId, lesson_id: lessonId,
      completed: true, completed_at: new Date().toISOString(),
      best_quiz_score: percentage,
    }, { onConflict: 'user_id,lesson_id' })
    .select()
  if (error) throw error
  return data
}

export async function getCachedQuiz(lessonId) {
  const { data } = await supabase
    .from('quizzes').select('*')
    .eq('lesson_id', lessonId)
    .order('generated_at', { ascending: false })
    .limit(1).single()
  return data
}

export async function saveQuiz(lessonId, questions) {
  const { data, error } = await supabase
    .from('quizzes').insert({ lesson_id: lessonId, questions })
    .select().single()
  if (error) throw error
  return data
}

export async function saveQuizAttempt(userId, lessonId, quizId, score, total, answers) {
  const percentage = Math.round((score / total) * 100)
  const { error } = await supabase
    .from('quiz_attempts')
    .insert({ user_id: userId, lesson_id: lessonId, quiz_id: quizId, score, total, percentage, answers })
  if (error) throw error
  await updateBestQuizScore(userId, lessonId, percentage)
  return percentage
}

export async function generateQuizAI(lesson) {
  // Gera as questões do quiz via Edge Function 'quiz' (Supabase),
  // com a chave do provedor protegida no servidor.
  const { data, error } = await supabase.functions.invoke('quiz', {
    body: {
      title: lesson.title,
      description: lesson.description,
      channel_name: lesson.channel_name,
    },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  if (!Array.isArray(data?.questions)) throw new Error('Não foi possível carregar o quiz')
  return data.questions
}
