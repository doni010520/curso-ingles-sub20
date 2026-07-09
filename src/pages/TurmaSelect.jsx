import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTurmas } from '../lib/api'

export default function TurmaSelect() {
  const navigate = useNavigate()
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getTurmas()
        setTurmas(data || [])
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 pt-10 pb-7 border-b border-bahia-blue/[0.12]"
        style={{ background: 'linear-gradient(145deg, #004d80 0%, #041428 80%, rgba(237,50,55,0.08) 100%)' }}>
        <p className="text-bahia-gold text-xs font-semibold uppercase tracking-wider mb-1">Modalidade Online</p>
        <h1 className="text-white text-[24px] font-bold leading-tight">Curso de Inglês</h1>
        <p className="text-bahia-blue-light/50 text-sm mt-1.5">Selecione a sua turma para começar.</p>
        <div className="tricolor-stripe mt-4 max-w-[140px]"><div /><div /><div /></div>
      </div>

      <div className="p-5">
        <h2 className="text-bahia-blue-light/60 text-sm font-semibold uppercase tracking-wider mb-4">Turmas</h2>
        <div className="flex flex-col gap-3">
          {turmas.map(turma => (
            <button key={turma.id} onClick={() => navigate(`/turma/${turma.slug}`)}
              className="card card-active text-left flex items-center gap-3.5 cursor-pointer">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #006CB5, #1a8cd8)', boxShadow: '0 0 16px rgba(0,108,181,0.3)' }}>
                ⚽
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[16px] font-bold truncate">{turma.name}</p>
                {turma.subtitle && <p className="text-bahia-blue-light/40 text-xs">{turma.subtitle}</p>}
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bahia-blue-light/40 shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
