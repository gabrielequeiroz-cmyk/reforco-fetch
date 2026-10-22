export async function apiGet(caminho) {
  return requisicao(caminho, { method: 'GET' })
}

export async function apiPost(caminho, body) {
  return requisicao(caminho, { method: 'POST', body })
}

export async function apiPut(caminho, body) {
  return requisicao(caminho, { method: 'PUT', body })
}

export async function apiDelete(caminho) {
  return requisicao(caminho, { method: 'DELETE' })
}

// src/api.js — o único lugar do app que conhece a URL da API
const BASE_URL = 'https://jsonplaceholder.typicode.com'

async function requisicao(caminho, opcoes = {}) {
  const url = `${BASE_URL}${caminho}`
  const configuracoes = {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  }
  if (opcoes.body) {
    configuracoes.body = JSON.stringify(opcoes.body)
  }
  const resp = await fetch(url, configuracoes)
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} ${resp.statusText}`)
  }
  if (resp.status === 204) return null
  return await resp.json()
}