// Edge Function: admin
// Painel administrativo protegido por SENHA (ADMIN_PASSCODE).
// Usa service role para ler a lista de matriculados / progresso e resetar senhas.
// Deploy com --no-verify-jwt (a proteção é o passcode).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { passcode, action, userId, newPassword } = await req.json()

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Autoriza por: (a) usuário logado com role=admin  OU  (b) senha do painel (reserva)
    let authorized = false
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    if (token) {
      const { data: { user } } = await admin.auth.getUser(token)
      if (user) {
        const { data: prof } = await admin.from('profiles').select('role').eq('id', user.id).single()
        if (prof?.role === 'admin') authorized = true
      }
    }
    if (!authorized) {
      const expected = Deno.env.get('ADMIN_PASSCODE')
      if (expected && passcode === expected) authorized = true
    }
    if (!authorized) return json({ error: 'Acesso negado' }, 401)

    if (action === 'reset') {
      if (!userId || !newPassword || String(newPassword).length < 6) {
        return json({ error: 'Informe o atleta e uma senha de no mínimo 6 caracteres.' }, 400)
      }
      const { error } = await admin.auth.admin.updateUserById(userId, { password: String(newPassword) })
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true })
    }

    // action = 'list' (padrão)
    const { data: profiles, error: pErr } = await admin
      .from('profiles')
      .select('id, full_name, username, birth_date, recovery_email, role, created_at, turma_id, turmas(name)')
      .neq('role', 'admin')
      .order('created_at', { ascending: true })
    if (pErr) return json({ error: pErr.message }, 500)

    const { data: prog } = await admin
      .from('lesson_progress')
      .select('user_id, completed, best_quiz_score')

    const stats: Record<string, { done: number; quizzes: number; bestSum: number }> = {}
    for (const p of prog || []) {
      const s = stats[p.user_id] || (stats[p.user_id] = { done: 0, quizzes: 0, bestSum: 0 })
      if (p.completed) s.done++
      if (p.best_quiz_score > 0) { s.quizzes++; s.bestSum += p.best_quiz_score }
    }

    const athletes = (profiles || []).map((p: any) => {
      const s = stats[p.id] || { done: 0, quizzes: 0, bestSum: 0 }
      return {
        id: p.id,
        nome: p.full_name,
        usuario: p.username,
        nascimento: p.birth_date,
        email: p.recovery_email || '',
        categoria: p.turmas?.name || '',
        cadastro: p.created_at,
        role: p.role,
        aulas_concluidas: s.done,
        quizzes_feitos: s.quizzes,
        media_quiz: s.quizzes ? Math.round(s.bestSum / s.quizzes) : null,
      }
    })

    return json({ total: athletes.length, athletes })
  } catch (err) {
    return json({ error: String((err as Error)?.message || err) }, 500)
  }
})
