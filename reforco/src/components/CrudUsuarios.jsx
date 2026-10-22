import { useEffect, useState } from 'react'

export default function CrudUsuarios() {
  // Lista principal de usuários
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // Exercício 5 — Único objeto de estado para o formulário (Aula 05)
  const [form, setForm] = useState({ name: '', email: '' })
  
  // Controla se estamos no modo de edição (guarda o ID ou null)
  const [idEditando, setIdEditando] = useState(null)
  const [enviando, setEnviando] = useState(false)

  // 🛠️ ALTERNE PARA TESTAR O EXERCÍCIO 4 (Interface Otimista com Rollback)
  // Se true, vai quebrar as requisições de salvar/excluir para forçar o rollback
  const FORCAR_ERRO_API = false

  // Carrega os dados iniciais (GET)
  useEffect(() => {
    const controle = new AbortController()
    async function carregar() {
      try {
        setCarregando(true)
        const resp = await fetch('https://typicode.com', { signal: controle.signal })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const data = await resp.json()
        setUsuarios(data)
      } catch (e) {
        if (e.name !== 'AbortError') setErro(e.message)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
    return () => controle.abort()
  }, [])

  // Manipulador genérico do formulário (Exercício 5)
  function handleInputChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Exercício 1 e 2 — Função de Exclusão (DELETE) com Filtro Otimista e Logs
  async function handleExcluir(id) {
    const backupLista = usuarios // Guarda estado anterior para rollback se der erro
    
    // Atualização otimista: remove da tela imediatamente
    setUsuarios(prev => prev.filter(u => u.id !== id))
    setErro(null)

    try {
      const url = FORCAR_ERRO_API 
        ? `https://typicode.com-errado/${id}`
        : `https://typicode.com/${id}`

      const resp = await fetch(url, { method: 'DELETE' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status} ao excluir`)

      // Exercício 2 — Print no console explicitando o sucesso
      console.log(`%cUsuário (ID: ${id}) excluído com sucesso da API!`, 'color: #e74c3c; font-weight: bold;')
    } catch (e) {
      // Exercício 4 — Rollback (restaura a lista ao valor anterior em caso de erro)
      setUsuarios(backupLista)
      setErro(`Falha ao excluir: ${e.message}`)
    }
  }

  // Exercício 3 — Prepara o formulário com os dados do item selecionado
  function iniciarEdicao(usuario) {
    setIdEditando(usuario.id)
    setForm({ name: usuario.name, email: usuario.email })
  }

  // Cancela a edição e limpa os campos
  function cancelarEdicao() {
    setIdEditando(null)
    setForm({ name: '', email: '' })
  }

  // Salva os dados: Decide se faz POST (criar) ou PUT (editar)
  async function handleSalvar(e) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)

    const backupLista = usuarios // Guarda a lista atual para caso ocorra um erro

    try {
      if (idEditando) {
        // --- MODO PUT (EDITAR RECURSO) ---
        const url = FORCAR_ERRO_API 
          ? `https://typicode.com-errado/${idEditando}`
          : `https://typicode.com/${idEditando}`

        const resp = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ao atualizar`)
        
        const dadosAtualizados = await resp.json()

        // Atualiza a lista mapeando e substituindo pelo retorno da API (Exercício 3)
        setUsuarios(prev => prev.map(u => u.id === idEditando ? dadosAtualizados : u))
        setIdEditando(null)
      } else {
        // --- MODO POST (CRIAR NOVO RECURSO) ---
        const url = FORCAR_ERRO_API 
          ? 'https://typicode.com-errado'
          : 'https://typicode.com'

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ao cadastrar`)
        
        const novoItem = await resp.json()
        
        // Adiciona o novo item retornado ao final da lista
        setUsuarios(prev => [...prev, novoItem])
      }

      // Limpa os campos após salvar com sucesso
      setForm({ name: '', email: '' })
    } catch (e) {
      // Exercício 4 — Rollback: Restaura a lista anterior se a API falhar ao salvar/editar
      setUsuarios(backupLista)
      setErro(`Erro na operação: ${e.message}`)
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) return <p>⏳ Carregando banco de dados...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      
      {/* Formulário Controlado Único (Serve tanto para Criar quanto Editar) */}
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

      {/* Exercício 4 — Mensagem global de erros capturados */}
      {erro && <p style={{ color: 'red', fontWeight: 'bold', backgroundColor: '#fdf2f2', padding: '10px', borderRadius: '4px' }}>❌ {erro}</p>}

      {/* Listagem de Itens (CRUD Visual) */}
      <h3>👥 Usuários Cadastrados ({usuarios.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {usuarios.map(u => (
          <li key={u.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{u.name}</strong> <br />
              <small style={{ color: '#666' }}>{u.email}</small>
            </div>
            <div>
              {/* Exercício 3 — Botão Editar */}
              <button 
                onClick={() => iniciarEdicao(u)} 
                style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '3px' }}
              >
                Editar
              </button>
              {/* Exercício 1 — Botão Excluir */}
              <button 
                onClick={() => handleExcluir(u.id)} 
                style={{ padding: '4px 8px', cursor: 'pointer', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px' }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
