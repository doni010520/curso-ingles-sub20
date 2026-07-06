import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getModules, getUserProgress } from '../lib/api'

export default function Dashboard() {
  const { profile, signOut, user } = useAuth()
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [mods, prog] = await Promise.all([getModules(), getUserProgress(user.id)])
        setModules(mods || [])
        setProgress(prog || [])
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const completedSet = new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
  const totalLessons = modules.reduce((acc, m) => acc + (m.is_locked ? 0 : (m.lessons?.length || 0)), 0)
  const completedCount = modules.reduce((acc, m) => {
    if (m.is_locked) return acc
    return acc + (m.lessons || []).filter(l => completedSet.has(l.id)).length
  }, 0)
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const firstName = profile?.full_name?.split(' ')[0] || 'Atleta'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 pt-6 pb-7 border-b border-bahia-blue/[0.12]"
        style={{ background: 'linear-gradient(145deg, #004d80 0%, #041428 80%, rgba(237,50,55,0.08) 100%)' }}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-bahia-gold text-xs font-semibold uppercase tracking-wider mb-1">Bem-vindo de volta</p>
            <h1 className="text-white text-[22px] font-bold">{firstName} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-bahia-gold/[0.15] rounded-xl px-3.5 py-2 flex items-center gap-1.5">
              <span className="text-lg">🏆</span>
              <span className="text-bahia-gold text-sm font-bold">{progressPercent}%</span>
            </div>
            <button onClick={signOut} className="text-bahia-blue-light/40 hover:text-bahia-blue-light text-xs transition-colors">Sair</button>
          </div>
        </div>
        <div className="bg-white/[0.08] rounded-md h-2 overflow-hidden">
          <div className="h-full rounded-md transition-all duration-500"
            style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #006CB5, #1a8cd8)', boxShadow: '0 0 12px rgba(0,108,181,0.4)' }} />
        </div>
        <p className="text-bahia-blue-light/40 text-xs mt-2">{completedCount}/{totalLessons} aulas concluídas</p>
      </div>

      <div className="p-5">
        <div className="tricolor-stripe mb-4"><div /><div /><div /></div>
        <h2 className="text-bahia-blue-light/60 text-sm font-semibold uppercase tracking-wider mb-4">Módulos do Curso</h2>
        <div className="flex flex-col gap-3">
          {modules.map(mod => {
            const lessons = mod.lessons || []
            const completed = lessons.filter(l => completedSet.has(l.id)).length
            const allDone = completed === lessons.length && lessons.length > 0
            return (
              <button key={mod.id} onClick={() => !mod.is_locked && navigate(`/module/${mod.id}`)}
                className={`card text-left flex items-center gap-3.5 ${mod.is_locked ? 'opacity-40 cursor-default' : 'card-active cursor-pointer'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold
                  ${mod.is_locked ? 'bg-white/[0.04] text-white/30' : allDone ? 'text-white shadow-[0_0_16px_rgba(0,108,181,0.3)]' : 'bg-bahia-blue/[0.15] text-bahia-blue-light'}`}
                  style={allDone ? { background: 'linear-gradient(135deg, #006CB5, #1a8cd8)' } : {}}>
                  {mod.is_locked ? '🔒' : allDone ? '✓' : mod.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-bahia-red text-[11px] font-semibold uppercase tracking-wide">{mod.week}</p>
                  <p className="text-white text-[15px] font-semibold truncate">{mod.title}</p>
                  <p className="text-bahia-blue-light/40 text-xs">{mod.is_locked ? 'Disponível em breve' : `${lessons.length} aulas · ${completed}/${lessons.length} concluídas`}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
