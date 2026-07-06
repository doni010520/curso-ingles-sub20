import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getModules } from '../lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const mods = await getModules()
        setModules(mods || [])
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 pt-8 pb-7 border-b border-bahia-blue/[0.12]"
        style={{ background: 'linear-gradient(145deg, #004d80 0%, #041428 80%, rgba(237,50,55,0.08) 100%)' }}>
        <p className="text-bahia-gold text-xs font-semibold uppercase tracking-wider mb-1">Modalidade Online</p>
        <h1 className="text-white text-[24px] font-bold leading-tight">Curso de Inglês Sub-20</h1>
        <p className="text-bahia-blue-light/50 text-sm mt-1.5">Aprenda inglês no seu ritmo, com aulas em vídeo e quiz.</p>
        <div className="tricolor-stripe mt-4 max-w-[140px]"><div /><div /><div /></div>
      </div>

      <div className="p-5">
        <h2 className="text-bahia-blue-light/60 text-sm font-semibold uppercase tracking-wider mb-4">Módulos do Curso</h2>
        <div className="flex flex-col gap-3">
          {modules.map(mod => {
            const lessons = mod.lessons || []
            return (
              <button key={mod.id} onClick={() => !mod.is_locked && navigate(`/module/${mod.id}`)}
                className={`card text-left flex items-center gap-3.5 ${mod.is_locked ? 'opacity-40 cursor-default' : 'card-active cursor-pointer'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold
                  ${mod.is_locked ? 'bg-white/[0.04] text-white/30' : 'bg-bahia-blue/[0.15] text-bahia-blue-light'}`}>
                  {mod.is_locked ? '🔒' : mod.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-bahia-red text-[11px] font-semibold uppercase tracking-wide">{mod.week}</p>
                  <p className="text-white text-[15px] font-semibold truncate">{mod.title}</p>
                  <p className="text-bahia-blue-light/40 text-xs">{mod.is_locked ? 'Disponível em breve' : `${lessons.length} aulas`}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
