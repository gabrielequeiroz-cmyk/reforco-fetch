import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '../api'

export default function CrudUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [idEditando, setIdEditando] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // 🛠️ MUDANÇAS DE TESTE (Para você mostrar os critérios de sucesso pro professor Violin)
  // 'NORMAL' -> Executa com sucesso
  // '404'    -> Simula recurso não encontrado (Exercício 3)
  // '500'    -> Simula erro no servidor (Exercício 3)
  // 'REDE'   -> Simula queda de conexão/falha de rede (Exercício 3)
  const MODO_TESTE_ERRO = 'NORMAL' 

  // Exercício 3 — Função auxiliar para formatar mensagens de erro personalizadas
  function mapearMensagemErro(erroCapturado) {
    if (erroCapturado instanceof ApiError) {
      if (erroCapturado.status === 404) return "Recurso não encontrado (Erro 404)"
      if (erroCapturado.status === 500) return "Erro no servidor (Erro 500)"
      return erroCapturado.message
    }
    // Tratamento para falhas de conexão ("Failed to fetch")
    if (erroCapturado.message?.includes('Failed to fetch') || erroCapturado.name === 'TypeError') {
      return "Falha de rede — Verifique sua conexão com a internet"
    }
    return erroCapturado.message
  }

  // Exercício 4 — Carrega dados iniciais com AbortController propagado pelo helper
  useEffect(() => {
    const controle = new AbortController()
    
    async function carregar() {
      try {
        setCarregando(true)
        setErro(null)

        let rota = '/users'
        let opcoesExtras = { signal: controle.signal }

        // Testes do Exercício 3 & 5
        if (MODO_TESTE_ERRO === '404') rota = '/rota-inexistente-404'
        if (MODO_TESTE_ERRO === '500') rota = '/invalid-posts-500' // JSONPlaceholder simula erro em algumas rotas ruins
        if (MODO_TESTE_ERRO === 'REDE') rota = 'https://link-quebrado-que-nao-existe.com'
        
        // Exercício 5 — Adiciona um header customizado para teste de merge
        opcoesExtras.headers = { 'X-Custom': 'aula07' }

        const data = await apiGet(rota, opcoesExtras)
        setUsuarios(Array.isArray(data) ? data : [])
      } catch (e) {
        // Exercício 4 — Filtra o AbortError para nunca virar mensagem de erro na tela
        if (e.name !== 'AbortError') {
          setErro(mapearMensagemErro(e))
        }
      } finally {
        setCarregando(false)
      }
    }
    
    carregar()
    return () => controle.abort()
  }, [MODO_TESTE_ERRO])

  function handleInputChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleExcluir(id) {
    const backupLista = usuarios
    setUsuarios(prev => prev.filter(u => u.id !== id))
    setErro(null)

    try {
      await apiDelete(`/users/${id}`)
      console.log(`%cUsuário (ID: ${id}) excluído com sucesso!`, 'color: #e74c3c; font-weight: bold;')
    } catch (e) {
      setUsuarios(backupLista)
      setErro(mapearMensagemErro(e))
    }
  }

  function iniciarEdicao(usuario) {
    setIdEditando(usuario.id)
    setForm({ name: usuario.name, email: usuario.email })
  }

  function cancelarEdicao() {
    setIdEditando(null)
    setForm({ name: '', email: '' })
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    const backupLista = usuarios

    try {
      if (idEditando) {
        const dadosAtualizados = await apiPut(`/users/${idEditando}`, form)
        setUsuarios(prev => prev.map(u => u.id === idEditando ? dadosAtualizados : u))
        setIdEditando(null)
      } else {
        const novoItem = await apiPost('/users', form)
        setUsuarios(prev => [...prev, novoItem])
      }
      setForm({ name: '', email: '' })
    } catch (e) {
      setUsuarios(backupLista)
      setErro(mapearMensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <p>⏳ Carregando banco de dados usando helpers da Lista 07...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>{idEditando ? '✏️ Editar Usuário' : '➕ Adicionar Novo Usuário'}</h3>
        <form onSubmit={handleSalvar}>
          <div style={{ marginBottom: '10px' }}>
            <input
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Nome do usuário"
              style={{ width: '95%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="E-mail"
              type="email"
              style={{ width: '95%', padding: '8px' }}
              required
            />
          </div>
          <button type="submit" disabled={enviando} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            {enviando ? 'Gravando...' : idEditando ? 'Atualizar' : 'Salvar Novo'}
          </button>
          {idEditando && (
            <button type="button" onClick={cancelarEdicao} style={{ marginLeft: '10px', padding: '6px 12px' }}>
              Cancelar
            </button>
          )}
        </form>
      </div>

      {erro && (
        <p style={{ color: 'red', fontWeight: 'bold', backgroundColor: '#fdf2f2', padding: '10px', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
          ❌ {erro}
        </p>
      )}

      <h3>👥 Usuários Cadastrados ({usuarios.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {usuarios.map(u => (
          <li key={u.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{u.name}</strong> <br />
              <small style={{ color: '#666' }}>{u.email}</small>
            </div>
            <div>
              <button onClick={() => iniciarEdicao(u)} style={{ marginRight: '5px', padding: '4px 8px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                Editar
              </button>
              <button onClick={() => handleExcluir(u.id)} style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
