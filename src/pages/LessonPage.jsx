import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getLesson, generateQuizAI, getCachedQuiz, saveQuiz, markLessonComplete, saveQuizAttempt } from '../lib/api'

export default function LessonPage() {
  const { lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quizMode, setQuizMode] = useState(false)
  const [quizData, setQuizData] = useState([])
  const [quizId, setQuizId] = useState(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getLesson(parseInt(lessonId))
        setLesson(data)
        if (user) setTimeout(() => markLessonComplete(user.id, data.id).catch(() => {}), 5000)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [lessonId, user])

  async function handleStartQuiz() {
    setQuizLoading(true)
    try {
      const cached = await getCachedQuiz(lesson.id)
      if (cached) { setQuizData(cached.questions); setQuizId(cached.id) }
      else {
        const questions = await generateQuizAI(lesson)
        const saved = await saveQuiz(lesson.id, questions)
        setQuizData(questions); setQuizId(saved?.id || null)
      }
      setQuizIndex(0); setSelectedAnswer(null); setShowResult(false); setScore(0); setQuizFinished(false); setQuizMode(true)
    } catch (err) { console.error(err); alert('Erro ao gerar quiz. Tente novamente.') }
    setQuizLoading(false)
  }

  async function handleNewQuiz() {
    setQuizLoading(true)
    try {
      const questions = await generateQuizAI(lesson)
      const saved = await saveQuiz(lesson.id, questions)
      setQuizData(questions); setQuizId(saved?.id || null)
      setQuizIndex(0); setSelectedAnswer(null); setShowResult(false); setScore(0); setQuizFinished(false)
    } catch (err) { console.error(err) }
    setQuizLoading(false)
  }

  function selectAnswer(idx) {
    if (showResult) return
    setSelectedAnswer(idx); setShowResult(true)
    if (idx === quizData[quizIndex].correct) setScore(s => s + 1)
  }

  async function nextQuestion() {
    if (quizIndex + 1 < quizData.length) {
      setQuizIndex(i => i + 1); setSelectedAnswer(null); setShowResult(false)
    } else {
      setQuizFinished(true)
      if (user) {
        try { await saveQuizAttempt(user.id, lesson.id, quizId, score, quizData.length, []) }
        catch (err) { console.error(err) }
      }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/40">Aula não encontrada.</p></div>

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 py-3 flex items-center gap-3 border-b border-bahia-blue/[0.1]">
        <button onClick={() => { setQuizMode(false); navigate(-1) }}
          className="w-[38px] h-[38px] rounded-[10px] bg-bahia-blue/[0.12] flex items-center justify-center text-bahia-blue-light/60 shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
        <p className="text-white text-[15px] font-semibold truncate flex-1">{lesson.title}</p>
      </div>

      {!quizMode && (
        <div>
          <div className="w-full aspect-video bg-black">
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${lesson.youtube_video_id}`}
              title={lesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen className="block" />
          </div>
          <div className="p-5">
            <h2 className="text-white text-lg font-bold mb-1">{lesson.title}</h2>
            {lesson.channel_name && <p className="text-bahia-blue-light/40 text-xs mb-2">{lesson.channel_name}</p>}
            <p className="text-bahia-blue-light/50 text-sm leading-relaxed mb-6">{lesson.description}</p>
            <button onClick={handleStartQuiz} disabled={quizLoading} className="btn-primary flex items-center justify-center gap-2.5">
              {quizLoading ? <><span className="animate-spin-slow inline-block">⚡</span> Preparando quiz...</>
                : <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a5 5 0 015 5c0 1.1-.4 2.1-1 2.9.6.8 1 1.8 1 2.9a5 5 0 01-3 4.6V20a2 2 0 01-4 0v-2.6A5 5 0 017 12.8c0-1.1.4-2.1 1-2.9A5 5 0 017 7a5 5 0 015-5z"/></svg> Fazer Quiz</>}
            </button>
          </div>
        </div>
      )}

      {quizMode && quizFinished && (
        <div className="p-5 pt-10 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl"
            style={{
              background: score >= 4 ? 'linear-gradient(135deg, #006CB5, #1a8cd8)' : score >= 3 ? 'linear-gradient(135deg, #FEDD22, #f5c400)' : 'linear-gradient(135deg, #ED3237, #ff5a5f)',
              boxShadow: score >= 4 ? '0 0 40px rgba(0,108,181,0.4)' : score >= 3 ? '0 0 40px rgba(254,221,34,0.3)' : '0 0 40px rgba(237,50,55,0.25)',
            }}>
            {score >= 4 ? '🏆' : score >= 3 ? '👏' : '💪'}
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">{score}/{quizData.length} corretas!</h2>
          <p className="text-bahia-blue-light/50 text-[15px] mb-2">
            {score >= 4 ? 'Excelente! Mandou muito bem!' : score >= 3 ? 'Bom trabalho! Continue praticando!' : 'Não desista! Revise a aula e tente novamente.'}
          </p>
          <p className="text-bahia-gold text-xs font-medium mb-7">⚡ Quiz da aula</p>
          <div className="flex gap-2.5">
            <button onClick={handleNewQuiz} disabled={quizLoading} className="flex-1 btn-outline">{quizLoading ? 'Gerando...' : 'Novo quiz'}</button>
            <button onClick={() => { setQuizMode(false); navigate(-1) }} className="flex-1 btn-primary">Voltar</button>
          </div>
        </div>
      )}

      {quizMode && !quizFinished && quizData.length > 0 && (
        <div className="p-5">
          <div className="flex gap-1.5 mb-5 justify-center">
            {quizData.map((_, i) => (
              <div key={i} className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === quizIndex ? 24 : 8, background: i < quizIndex ? '#006CB5' : i === quizIndex ? '#1a8cd8' : 'rgba(255,255,255,0.1)', boxShadow: i === quizIndex ? '0 0 8px rgba(0,108,181,0.5)' : 'none' }} />
            ))}
          </div>
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wide mb-2">
            Questão {quizIndex + 1} de {quizData.length}
          </p>
          <h3 className="text-white text-[17px] font-semibold leading-snug mb-5">{quizData[quizIndex].q}</h3>
          <div className="flex flex-col gap-2.5 mb-5">
            {quizData[quizIndex].options.map((opt, i) => {
              let cls = 'bg-bahia-blue/[0.06] border-bahia-blue/[0.1] text-white/90'
              if (showResult) {
                if (i === quizData[quizIndex].correct) cls = 'bg-bahia-blue/[0.18] border-bahia-blue text-bahia-blue-light'
                else if (i === selectedAnswer) cls = 'bg-bahia-red/[0.15] border-bahia-red text-bahia-red-light'
              } else if (i === selectedAnswer) cls = 'bg-bahia-blue/[0.1] border-bahia-blue/30'
              return (
                <button key={i} onClick={() => selectAnswer(i)}
                  className={`px-4 py-3.5 rounded-[10px] border text-sm font-medium text-left flex items-center gap-2.5 transition-all duration-200 ${showResult ? 'cursor-default' : 'cursor-pointer'} ${cls}`}>
                  <span className="w-[26px] h-[26px] rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/30 shrink-0">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              )
            })}
          </div>
          {showResult && <button onClick={nextQuestion} className="btn-primary">{quizIndex + 1 < quizData.length ? 'Próxima →' : 'Ver resultado'}</button>}
        </div>
      )}
    </div>
  )
}
