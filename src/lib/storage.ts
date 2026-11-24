import { ACCESS_TOKEN_STORAGE_KEY } from './config'

export function readStoredToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeStoredToken(token: string | null): void {
  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
    }
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The app
    // keeps working, the session just does not survive a page reload.
  }
}
