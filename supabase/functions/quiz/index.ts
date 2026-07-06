// Edge Function: quiz
// Gera 5 questões de múltipla escolha usando a OpenAI.
// A API key fica só aqui no servidor (Supabase secret OPENAI_API_KEY),
// nunca é exposta no navegador.

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { title, description, channel_name } = await req.json()

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return json({ error: 'OPENAI_API_KEY não configurada no servidor.' }, 500)
    }
    const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini'

    const prompt = `You are creating an English quiz for Brazilian football players (ages 17-20) learning English.

The lesson topic is: "${title}" — ${description || ''}
Channel: ${channel_name || 'ESL Channel'}

Generate exactly 5 multiple-choice questions. Each question must:
- Test practical English relevant to the topic
- Have exactly 4 options
- Be appropriate for beginner/intermediate learners
- Include the correct answer index (0-3)

Respond ONLY with a JSON object in this exact shape:
{"questions":[{"q":"question text","options":["A","B","C","D"],"correct":0}]}`

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You output only valid JSON. No markdown, no backticks.' },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!resp.ok) {
      const detail = await resp.text()
      return json({ error: 'Falha na OpenAI', detail }, 502)
    }

    const data = await resp.json()
    const raw = data.choices?.[0]?.message?.content || '{}'
    const parsed = JSON.parse(raw)
    const questions = Array.isArray(parsed) ? parsed : parsed.questions

    if (!Array.isArray(questions) || questions.length === 0) {
      return json({ error: 'Resposta da IA em formato inesperado.' }, 502)
    }

    return json({ questions })
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
