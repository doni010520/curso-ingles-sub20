import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTurmaBySlug, getModulesByTurma } from '../lib/api'

export default function Dashboard() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [turma, setTurma] = useState(null)
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const t = await getTurmaBySlug(slug)
        setTurma(t)
        const mods = await getModulesByTurma(t.id)
        setModules(mods || [])
      } catch (err) { console.error(err); setNotFound(true) }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>
  if (notFound || !turma) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <p className="text-white/40">Turma não encontrada.</p>
      <button onClick={() => navigate('/')} className="btn-outline px-6">Ver turmas</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 pt-6 pb-7 border-b border-bahia-blue/[0.12]"
        style={{ background: 'linear-gradient(145deg, #004d80 0%, #041428 80%, rgba(237,50,55,0.08) 100%)' }}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-bahia-gold text-xs font-semibold uppercase tracking-wider mb-1">{turma.subtitle || 'Modalidade Online'}</p>
            <h1 className="text-white text-[24px] font-bold leading-tight">Turma {turma.name}</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-bahia-blue-light/40 hover:text-bahia-blue-light text-xs transition-colors shrink-0 mt-1">Trocar turma</button>
        </div>
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
                  {mod.is_locked ? '🔒' : mod.sort_order}
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
