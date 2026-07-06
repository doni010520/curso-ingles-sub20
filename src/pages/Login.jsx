import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        if (!fullName.trim()) { setError('Preencha seu nome completo.'); setLoading(false); return }
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
      }
      navigate('/')
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message || 'Erro ao autenticar.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: 'linear-gradient(145deg, #041428 0%, #004d80 40%, #002d4f 70%, #1a0a0a 100%)' }}>
      <div className="w-full max-w-[380px] text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg, #006CB5, #ED3237)', boxShadow: '0 0 40px #006CB544, 0 0 80px #ED323722' }}>
          ⚽
        </div>
        <h1 className="text-white text-[22px] font-bold mb-1 tracking-tight">Curso de Inglês Sub-20</h1>
        <p className="text-bahia-gold text-[13px] font-semibold uppercase tracking-wider mb-1.5">DDH — Modalidade Online</p>
        <div className="flex mx-auto mb-7 w-[120px]">
          <div className="h-[3px] flex-1 bg-bahia-blue rounded-l" />
          <div className="h-[3px] flex-1 bg-white" />
          <div className="h-[3px] flex-1 bg-bahia-red rounded-r" />
        </div>
        <form onSubmit={handleSubmit} className="bg-bahia-blue/[0.08] rounded-2xl p-7 border border-bahia-blue/[0.15] backdrop-blur-xl">
          <h2 className="text-white text-lg font-semibold mb-5">{isSignUp ? 'Criar conta' : 'Entrar'}</h2>
          {isSignUp && (
            <div className="mb-3 text-left">
              <label className="text-bahia-blue-light/70 text-[13px] font-medium mb-1.5 block">Nome completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex: João Silva"
                className="w-full px-4 py-3 rounded-[10px] border border-bahia-blue/20 bg-black/30 text-white text-[15px] outline-none focus:border-bahia-blue transition-colors" />
            </div>
          )}
          <div className="mb-3 text-left">
            <label className="text-bahia-blue-light/70 text-[13px] font-medium mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required
              className="w-full px-4 py-3 rounded-[10px] border border-bahia-blue/20 bg-black/30 text-white text-[15px] outline-none focus:border-bahia-blue transition-colors" />
          </div>
          <div className="mb-4 text-left">
            <label className="text-bahia-blue-light/70 text-[13px] font-medium mb-1.5 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6}
              className="w-full px-4 py-3 rounded-[10px] border border-bahia-blue/20 bg-black/30 text-white text-[15px] outline-none focus:border-bahia-blue transition-colors" />
          </div>
          {error && <p className="text-bahia-red text-[13px] mb-3 text-left">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}</button>
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="mt-4 text-bahia-blue-light/60 text-[13px] hover:text-bahia-blue-light transition-colors">
            {isSignUp ? 'Já tenho conta — Entrar' : 'Não tenho conta — Criar agora'}
          </button>
        </form>
        <p className="text-bahia-blue-dark/40 text-[11px] mt-5">Benitech Lab</p>
      </div>
    </div>
  )
}
