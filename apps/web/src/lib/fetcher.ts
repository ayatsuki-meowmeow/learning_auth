import { tokenStorage } from './token'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const token = tokenStorage.get()
  // options.headers が Headers インスタンスの場合スプレッドが効かず元ヘッダが消える（orval は plain object を渡すため現状は問題なし）
  const headers: HeadersInit = {
    ...(options?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers })
  const body = [204, 205, 304].includes(res.status) ? undefined : await res.json()
  // TODO: レスポンスボディを含むエラー型を返す設計に変更する（現状はボディが失われる）
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return { data: body, status: res.status, headers: res.headers } as T
}
