import { useEffect, useState } from 'react'

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    // 1. Cria o controle e o sinal para monitorar a requisição
    const controle = new AbortController()
    const signal = controle.signal

    async function buscar() {
      try {
        setCarregando(true)
        setErro(null)

        // Passamos o signal dentro do objeto de configuração do fetch
        const resp = await fetch('https://jsonplaceholder.typicode.com/users', { signal })

        // 2. Garante a checagem manual do status do HTTP (Ex: 404 ou 500)
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} — ${resp.statusText}`)
        }

        const data = await resp.json()
        setUsuarios(data)
      } catch (e) {
        // 3. Se o erro for porque a requisição foi abortada, não atualiza o estado
        if (e.name !== 'AbortError') {
          setErro(e.message)
        }
      } finally {
        // 4. Desativa o loading independente de ter dado certo ou errado
        setCarregando(false)
      }
    }

    buscar()

    // Função de limpeza (cleanup): roda quando o componente sai da tela (desmonta)
    return () => {
      controle.abort()
    }
  }, [])

  // Renderização condicional seguindo a ordem correta de estados:
  if (carregando) return <p>⏳ Carregando usuários...</p>
  if (erro)       return <p style={{ color: 'red' }}>❌ Erro: {erro}</p>
  if (usuarios.length === 0) return <p>⚠️ Nenhum usuário encontrado.</p>

  return (
    <div>
      <h2>👥 Lista de Usuários</h2>
      <ul>
        {usuarios.map(u => (
          <li key={u.id}>
            <strong>{u.name}</strong> — {u.email}
          </li>
        ))}
      </ul>
    </div>
  )
}
