import { useState } from 'react'

export default function FormularioAvancado() {
  // Exercício 5 — Único objeto de estado como única fonte de verdade
  const [form, setForm] = useState({ 
    title: '', 
    body: '', 
    nome: '', 
    email: '' 
  })

  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [criado, setCriado] = useState(null)
  const [avisoValidacao, setAvisoValidacao] = useState(null)

  // 🛠️ MUDANÇA DE URL PARA TESTAR O EXERCÍCIO 3 (Tratamento de erro)
  // Deixe false para funcionar normal (Exercícios 1, 2, 4, 5) ou mude para true para simular o erro (Exercício 3)
  const SIMULAR_URL_ERRADA = false 

  // Exercício 5 — onChange genérico usando e.target.name
  function handleInputChange(e) {
    const { name, value } = e.target
    setForm(prevForm => ({
      ...prevForm,
      [name]: value
    }))
  }

  async function enviar(e) {
    e.preventDefault()
    setErro(null)
    setCriado(null)
    setAvisoValidacao(null)

    // Exercício 4 — Validação local: bloqueia se nome OU email estiverem vazios sem chamar fetch
    if (!form.nome.trim() || !form.email.trim()) {
      setAvisoValidacao("Preencha todos os campos obrigatórios (Nome e E-mail).")
      return // Interrompe a execução antes do fetch
    }

    setEnviando(true)

    try {
      // Exercício 3 — Alterna para uma URL inválida para testar o bloco catch
      const url = SIMULAR_URL_ERRADA 
        ? 'https://typicode.com'
        : 'https://jsonplaceholder.typicode.com/posts'

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Exercício 2 — Envia title, body e userId: 1 junto com nome e email do form
        body: JSON.stringify({ 
          title: form.title, 
          body: form.body, 
          userId: 1,
          nome: form.nome,
          email: form.email
        }),
      })

      if (!resp.ok) throw new Error(`HTTP ${resp.status} — Erro ao processar requisição`)
      
      const data = await resp.json()
      setCriado(data)

      // Exercício 1 — Formulário fica em branco para novo envio após o sucesso
      setForm({ title: '', body: '', nome: '', email: '' })

    } catch (e) {
      // Exercício 3 — Mostra o erro mas MANTÉM os campos preenchidos no estado para edição
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>📝 Formularia Avançado (Exercícios 1 ao 5)</h2>
      
      <form onSubmit={enviar}>
        {/* Exercício 1 e 5 — Campo Título */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Título do Post:</label>
          <input
            name="title"
            value={form.title}
            onChange={handleInputChange}
            placeholder="Digite o título"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Exercício 2 e 5 — Campo Corpo do Post */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Corpo do Post (Body):</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleInputChange}
            placeholder="Digite o conteúdo do corpo"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <hr style={{ margin: '15px 0', borderColor: '#eee' }} />

        {/* Exercício 4 e 5 — Campos para Validação Obrigatória */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Nome (Obrigatório):</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleInputChange}
            placeholder="Nome para validação"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>E-mail (Obrigatório):</label>
          <input
            name="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="E-mail para validação"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button type="submit" disabled={enviando} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {enviando ? 'Enviando...' : 'Cadastrar / Postar'}
        </button>
      </form>

      {/* Renderizações Condicionais dos Critérios de Sucesso */}
      
      {/* Exercício 4 — Alerta de campos vazios */}
      {avisoValidacao && <p style={{ color: 'orange', fontWeight: 'bold' }}>⚠️ {avisoValidacao}</p>}

      {/* Exercício 3 — Mensagem de erro */}
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>❌ Erro: {erro}</p>}

      {/* Exercício 1 e 2 — Exibe o ID e o JSON retornado em tag <pre> */}
      {criado && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#eafaf1', borderRadius: '4px' }}>
          <p style={{ color: 'green', fontWeight: 'bold' }}>✨ Criado com id={criado.id}!</p>
          <label style={{ fontWeight: 'bold' }}>JSON retornado pela API:</label>
          <pre style={{ backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
            {JSON.stringify(criado, null, 2)}
          </pre>
        </div>
      )}

      {/* Exercício 5 — Demonstração do estado unificado atualizando em tempo real */}
      <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
        <label style={{ fontWeight: 'bold', color: '#7f8c8d' }}>🔍 Estado Local em Tempo Real (Exercício 5):</label>
        <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', border: '1px solid #eee', fontSize: '12px' }}>
          {JSON.stringify(form, null, 2)}
        </pre>
      </div>
    </div>
  )
}
