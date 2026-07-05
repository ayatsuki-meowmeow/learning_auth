const KEY = 'access_token'

export const tokenStorage = {
  get: (): string | null =>
    typeof window === 'undefined' ? null : sessionStorage.getItem(KEY),
  set: (token: string): void => sessionStorage.setItem(KEY, token),
  clear: (): void => sessionStorage.removeItem(KEY),
}
