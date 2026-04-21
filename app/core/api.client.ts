// TODO: REST API client — placeholder for future backend integration
export function useApiClient() {
  const baseUrl = '/api'

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`)
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
  }

  return { get, post }
}
