import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getModules } from '../lib/api'

export default function ModulePage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [mod, setMod] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const mods = await getModules()
        setMod(mods?.find(m => m.id === parseInt(moduleId)))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [moduleId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin-slow text-3xl">⚽</div></div>
  if (!mod) return <div className="min-h-screen flex items-center justify-center"><p className="text-white/40">Módulo não encontrado.</p></div>

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-bahia-blue/[0.1]">
        <button onClick={() => navigate('/')} className="w-[38px] h-[38px] rounded-[10px] bg-bahia-blue/[0.12] flex items-center justify-center text-bahia-blue-light/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
        <div>
          <p className="text-bahia-red text-[11px] font-semibold uppercase tracking-wide">{mod.week}</p>
          <p className="text-white text-base font-bold">{mod.title}</p>
        </div>
      </div>
      {mod.description && <div className="px-5 pt-4"><p className="text-bahia-blue-light/50 text-sm leading-relaxed">{mod.description}</p></div>}
      <div className="p-5">
        <h3 className="text-bahia-blue-light/50 text-[13px] font-semibold uppercase tracking-wider mb-3.5">Aulas</h3>
        <div className="flex flex-col gap-2.5">
          {(mod.lessons || []).map(lesson => (
            <button key={lesson.id} onClick={() => navigate(`/lesson/${lesson.id}`)}
              className="card card-active text-left cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 bg-bahia-red/[0.15] text-bahia-red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-[15px] font-semibold mb-1">{lesson.title}</p>
                  <p className="text-bahia-blue-light/50 text-[13px] leading-snug mb-1.5">{lesson.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-white/[0.05] rounded-md px-2 py-0.5 text-[11px] text-white/30 font-medium">▶ {lesson.duration_label || '~10 min'}</span>
                    {lesson.channel_name && <span className="bg-white/[0.05] rounded-md px-2 py-0.5 text-[11px] text-white/30 font-medium">{lesson.channel_name}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
