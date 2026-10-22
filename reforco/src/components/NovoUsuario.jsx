import { useState, useEffect, useRef } from 'react'

export default function NovoUsuario() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [criado, setCriado] = useState(null)

  // Referência para guardar o controle atual e podermos abortar no unmount
  const controleRef = useRef(null)

  // Cleanup: cancela a requisição se o usuário mudar de página no meio do envio
  useEffect(() => {
    return () => {
      if (controleRef.current) {
        controleRef.current.abort()
      }
    }
  }, [])

  async function enviar(e) {
    e.preventDefault() // 1. Evita o recarregamento automático da página
    
    setEnviando(true)
    setErro(null)
    setCriado(null)

    // Instancia o AbortController para esta submissão específica
    const controle = new AbortController()
    controleRef.current = controle

    try {
      const resp = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST', // 2. Verbo HTTP correto para criação
        headers: { 'Content-Type': 'application/json' }, // 3. Header obrigatório (no plural!)
        body: JSON.stringify({ name: nome, email: email }), // 4. Transforma o objeto JS em string JSON
        signal: controle.signal
      })

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} — Não foi possível cadastrar.`)
      }

      const data = await resp.json() // Recebe o status 201 Created + ID fictício
      
      setCriado(data) // Mostra a mensagem de sucesso
      setNome('')     // 5. Limpa os campos do formulário
      setEmail('')
    } catch (e) {
      if (e.name !== 'AbortError') {
        setErro(e.message)
      }
    } finally {
      setEnviando(false)
      controleRef.current = null
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '20px 0', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>📝 Cadastro de Novo Usuário</h2>
      
      <form onSubmit={enviar}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome completo"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: nome@email.com"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        {/* Botão fica desabilitado para evitar duplo clique acidental */}
        <button 
          type="submit" 
          disabled={enviando}
          style={{ padding: '10px 15px', cursor: enviando ? 'not-allowed' : 'pointer' }}
        >
          {enviando ? 'Enviando...' : 'Cadastrar'}
        </button>
      </form>

      {/* Renderização Condicional dos Estados */}
      {enviando && <p style={{ color: 'orange' }}>⏳ Realizando envio dos dados...</p>}
      {erro && <p style={{ color: 'red' }}>❌ Erro: {erro}</p>}
      {criado && (
        <p style={{ color: 'green', backgroundColor: '#e8f8f5', padding: '10px', borderRadius: '4px' }}>
          🎉 Sucesso! Criado com <strong>ID {criado.id}</strong>.<br />
          Nome cadastrado: {criado.name}
        </p>
      )}
    </div>
  )
}
