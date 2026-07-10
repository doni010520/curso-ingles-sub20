import { useState } from 'react'
import { supabase } from '../lib/supabase'

function idade(nascimento) {
  if (!nascimento) return ''
  const b = new Date(nascimento)
  const d = new Date()
  let a = d.getFullYear() - b.getFullYear()
  const m = d.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && d.getDate() < b.getDate())) a--
  return isNaN(a) ? '' : a
}
function fmtData(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleDateString('pt-BR')
}

export default function Admin() {
  const [passcode, setPasscode] = useState('')
  const [authed, setAuthed] = useState(false)
  const [athletes, setAthletes] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function call(body) {
    const { data, error } = await supabase.functions.invoke('admin', { body })
    if (error) {
      // tenta extrair mensagem do corpo da resposta
      let msg = error.message
      try { const j = await error.context?.json?.(); if (j?.error) msg = j.error } catch {}
      throw new Error(msg)
    }
    if (data?.error) throw new Error(data.error)
    return data
  }

  async function entrar(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const data = await call({ passcode, action: 'list' })
      setAthletes(data.athletes || [])
      setAuthed(true)
    } catch (err) { setError(err.message || 'Falha ao entrar') }
    setBusy(false)
  }

  async function recarregar() {
    setBusy(true)
    try { const data = await call({ passcode, action: 'list' }); setAthletes(data.athletes || []) }
    catch (err) { setError(err.message) }
    setBusy(false)
  }

  async function resetSenha(a) {
    const nova = window.prompt(`Nova senha para ${a.nome} (usuário ${a.usuario}) — mín. 6 caracteres:`)
    if (!nova) return
    try {
      await call({ passcode, action: 'reset', userId: a.id, newPassword: nova })
      alert('Senha atualizada.')
    } catch (err) { alert('Erro: ' + err.message) }
  }

  function exportarCSV() {
    const cols = ['nome', 'usuario', 'nascimento', 'idade', 'categoria', 'email', 'cadastro', 'aulas_concluidas', 'quizzes_feitos', 'media_quiz']
    const head = ['Nome', 'Usuário', 'Nascimento', 'Idade', 'Categoria', 'E-mail', 'Cadastro', 'Aulas concluídas', 'Quizzes', 'Média quiz(%)']
    const rows = athletes.map(a => [a.nome, a.usuario, a.nascimento, idade(a.nascimento), a.categoria, a.email, fmtData(a.cadastro), a.aulas_concluidas, a.quizzes_feitos, a.media_quiz ?? ''])
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [head.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `matriculados-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'linear-gradient(160deg, #041428, #002b4d)' }}>
        <form onSubmit={entrar} className="w-full max-w-[360px] bg-bahia-blue/[0.08] rounded-2xl p-6 border border-bahia-blue/[0.15]">
          <h1 className="text-white text-xl font-bold mb-1">Painel Admin</h1>
          <p className="text-bahia-blue-light/50 text-sm mb-5">Acesso restrito.</p>
          <input type="password" value={passcode} onChange={e => setPasscode(e.target.value)} placeholder="Senha do admin"
            className="w-full px-4 py-3 rounded-[10px] border border-bahia-blue/20 bg-black/30 text-white text-[15px] outline-none focus:border-bahia-blue mb-3" />
          {error && <p className="text-bahia-red text-[13px] mb-3">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-white text-xl font-bold">Matriculados</h1>
          <p className="text-bahia-blue-light/50 text-sm">{athletes.length} atleta(s)</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={recarregar} disabled={busy} className="btn-outline px-4">{busy ? '...' : 'Atualizar'}</button>
          <button onClick={exportarCSV} className="btn-primary px-4">Exportar CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-bahia-blue/[0.12]">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-bahia-blue/[0.1] text-bahia-blue-light/60 text-[12px] uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2.5">Nome</th>
              <th className="px-3 py-2.5">Usuário</th>
              <th className="px-3 py-2.5">Nasc.</th>
              <th className="px-3 py-2.5">Idade</th>
              <th className="px-3 py-2.5">Categoria</th>
              <th className="px-3 py-2.5">E-mail</th>
              <th className="px-3 py-2.5">Cadastro</th>
              <th className="px-3 py-2.5">Aulas</th>
              <th className="px-3 py-2.5">Quiz méd.</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {athletes.map(a => (
              <tr key={a.id} className="border-t border-white/[0.06]">
                <td className="px-3 py-2.5 font-medium text-white">{a.nome}</td>
                <td className="px-3 py-2.5">{a.usuario}</td>
                <td className="px-3 py-2.5">{a.nascimento}</td>
                <td className="px-3 py-2.5">{idade(a.nascimento)}</td>
                <td className="px-3 py-2.5">{a.categoria}</td>
                <td className="px-3 py-2.5 text-white/50">{a.email}</td>
                <td className="px-3 py-2.5 text-white/50">{fmtData(a.cadastro)}</td>
                <td className="px-3 py-2.5">{a.aulas_concluidas}</td>
                <td className="px-3 py-2.5">{a.media_quiz != null ? `${a.media_quiz}%` : '—'}</td>
                <td className="px-3 py-2.5">
                  <button onClick={() => resetSenha(a)} className="text-bahia-blue-light/60 hover:text-bahia-blue-light text-xs underline">reset senha</button>
                </td>
              </tr>
            ))}
            {athletes.length === 0 && <tr><td colSpan={10} className="px-3 py-6 text-center text-white/30">Nenhum matriculado ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
