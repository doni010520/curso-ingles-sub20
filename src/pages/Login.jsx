import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getTurmas } from '../lib/api'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [turmas, setTurmas] = useState([])
  const [form, setForm] = useState({ fullName: '', birthDate: '', turmaId: '', username: '', password: '', recoveryEmail: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { getTurmas().then(setTurmas).catch(() => {}) }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      if (mode === 'signup') {
        if (!form.fullName || !form.birthDate || !form.turmaId || !form.username || !form.password) {
          throw new Error('Preencha todos os campos obrigatórios.')
        }
        if (form.password.length < 6) throw new Error('A senha precisa ter no mínimo 6 caracteres.')
        const { error } = await signUp(form)
        if (error) {
          if (/already registered|already exists/i.test(error.message)) throw new Error('Esse usuário já existe. Escolha outro.')
          throw new Error(error.message)
        }
      } else {
        if (!form.username || !form.password) throw new Error('Informe usuário e senha.')
        const { error } = await signIn({ username: form.username, password: form.password })
        if (error) {
          if (/invalid login credentials/i.test(error.message)) throw new Error('Usuário ou senha incorretos.')
          throw new Error(error.message)
        }
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-[10px] border border-bahia-blue/20 bg-black/30 text-white text-[15px] outline-none focus:border-bahia-blue transition-colors'
  const labelCls = 'text-bahia-blue-light/70 text-[13px] font-medium mb-1.5 block'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'linear-gradient(160deg, #041428 0%, #002b4d 55%, #041428 100%)' }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
            style={{ background: 'radial-gradient(circle at 30% 30%, #1a8cd8, #006CB5 60%, #ED3237 130%)' }}>⚽</div>
          <h1 className="text-white text-2xl font-bold">Curso de Inglês</h1>
          <p className="text-bahia-gold text-[13px] font-semibold uppercase tracking-wider mt-1">Modalidade Online</p>
        </div>

        <div className="bg-bahia-blue/[0.08] rounded-2xl p-6 border border-bahia-blue/[0.15] backdrop-blur-xl">
          <div className="flex gap-1 mb-5 bg-black/20 rounded-xl p-1">
            <button onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-bahia-blue text-white' : 'text-bahia-blue-light/50'}`}>Entrar</button>
            <button onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-bahia-blue text-white' : 'text-bahia-blue-light/50'}`}>Cadastrar</button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="mb-3">
                  <label className={labelCls}>Nome completo *</label>
                  <input type="text" value={form.fullName} onChange={set('fullName')} className={inputCls} placeholder="Seu nome" />
                </div>
                <div className="mb-3">
                  <label className={labelCls}>Data de nascimento *</label>
                  <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
                </div>
                <div className="mb-3">
                  <label className={labelCls}>Categoria *</label>
                  <select value={form.turmaId} onChange={set('turmaId')} className={inputCls}>
                    <option value="">Selecione a sua categoria</option>
                    {turmas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="mb-3">
              <label className={labelCls}>Usuário *</label>
              <input type="text" value={form.username} onChange={set('username')} className={inputCls} placeholder="ex: joao.silva" autoCapitalize="none" />
            </div>
            <div className="mb-3">
              <label className={labelCls}>Senha *</label>
              <input type="password" value={form.password} onChange={set('password')} className={inputCls} placeholder="Mínimo 6 caracteres" />
            </div>
            {mode === 'signup' && (
              <div className="mb-3">
                <label className={labelCls}>E-mail do responsável (opcional)</label>
                <input type="email" value={form.recoveryEmail} onChange={set('recoveryEmail')} className={inputCls} placeholder="para contato / recuperação" />
              </div>
            )}

            {error && <p className="text-bahia-red text-[13px] my-3">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full mt-2">
              {busy ? 'Aguarde...' : mode === 'signup' ? 'Criar cadastro' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-bahia-blue-dark/40 text-[11px] mt-5">Esporte Clube Bahia · Benitech Lab</p>
      </div>
    </div>
  )
}
