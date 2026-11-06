import { useEffect, useState } from 'react'

export function ListaProdutos() {
  // Estado dos dados: null = ainda não carregou
  const [produtos, setProdutos] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // AbortController cancela a requisição se o componente sumir antes da resposta
    const ctrl = new AbortController()

    // ⚠️ ADAPTE esta URL à sua API Express real (porta e caminho)
    fetch('http://localhost:3000/produtos', { signal: ctrl.signal })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
        }
        return resp.json()
      })
      .then((dados) => {
        setProdutos(dados)
        setCarregando(false)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return // requisição cancelada, não é erro
        setErro(e.message)
        setCarregando(false)
      })

    // Limpeza: cancela a requisição ao desmontar o componente
    return () => ctrl.abort()
  }, []) // [] = roda só uma vez, ao montar

  // Três estados possíveis na tela
  if (carregando) return <p>Carregando produtos…</p>
  if (erro) return <p>Erro: {erro}</p>

  return (
    <ul aria-label="lista de produtos">
      {produtos.map((p) => (
        <li key={p._id ?? p.id}>
          {p.nome} — R$ {p.preco} {p.ativo ? '(ativo)' : '(inativo)'}
        </li>
      ))}
    </ul>
  )
}