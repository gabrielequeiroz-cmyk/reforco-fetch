// src/api.js — O único lugar do app que conhece a URL base da API
const BASE_URL = 'https://typicode.com'

// Exercício 3 — Criação da classe de erro customizada ApiError
export class ApiError extends Error {
  constructor(status, statusText) {
    super(`HTTP ${status} — ${statusText}`)
    this.name = 'ApiError'
    this.status = status // Guarda o status (Ex: 404, 500) para o componente ler
  }
}

async function requisicao(caminho, opcoes = {}) {
  const url = `${BASE_URL}${caminho}`
  
  // Exercício 5 — Merge inteligente de headers: combina o Content-Type padrão com os extras da chamada
  const headersDaChamada = opcoes.headers || {}
  const configuracoes = {
    method: opcoes.method || 'GET',
    headers: { 
      'Content-Type': 'application/json',
      ...headersDaChamada // Injeta os headers adicionais passados por parâmetro
    },
    ...opcoes,
  }

  // Serializa o corpo se for um objeto
  if (opcoes.body && typeof opcoes.body === 'object') {
    configuracoes.body = JSON.stringify(opcoes.body)
  }

  const resp = await fetch(url, configuracoes)

  // Exercício 3 — Lança a classe ApiError caso a resposta não seja de sucesso
  if (!resp.ok) {
    throw new ApiError(resp.status, resp.statusText)
  }

  if (resp.status === 204) return null
  return await resp.json()
}

// Exercício 4 — Todos os métodos recebem e propagam o objeto opcoes (com o signal do AbortController)
export async function apiGet(caminho, opcoes = {}) {
  return requisicao(caminho, { method: 'GET', ...opcoes })
}

export async function apiPost(caminho, body, opcoes = {}) {
  return requisicao(caminho, { method: 'POST', body, ...opcoes })
}

export async function apiPut(caminho, body, opcoes = {}) {
  return requisicao(caminho, { method: 'PUT', body, ...opcoes })
}

export async function apiDelete(caminho, opcoes = {}) {
  return requisicao(caminho, { method: 'DELETE', ...opcoes })
}
