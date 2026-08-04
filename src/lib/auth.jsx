import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

// Login é por USUÁRIO. O Supabase Auth usa e-mail por baixo, então
// mapeamos cada usuário para um e-mail interno "fantasma" que o atleta
// nunca vê. E-mail real (do responsável) fica só no perfil (recovery_email).
const USER_DOMAIN = 'alunos.benitechlab.com'

export function normalizeUsername(username) {
  return String(username || '')
    .normalize('NFD')                 // decompõe o acento (João -> Joa + ˜ + o)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')     // remove acento, espaço e chars inválidos p/ e-mail
    .replace(/^[._-]+|[._-]+$/g, '')  // sem pontos/traços nas pontas
}
export function usernameToEmail(username) {
  return `${normalizeUsername(username)}@${USER_DOMAIN}`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*, turmas(id, slug, name, subtitle)')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp({ username, password, fullName, birthDate, turmaId, recoveryEmail }) {
    const { data, error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: {
          full_name: fullName,
          username: normalizeUsername(username),
          birth_date: birthDate || '',
          turma_id: String(turmaId || ''),
          recovery_email: recoveryEmail || '',
        },
      },
    })
    return { data, error }
  }

  async function signIn({ username, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
