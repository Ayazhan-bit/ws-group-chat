import { ACCESS_TOKEN_STORAGE_KEY, SIGNED_OUT_STORAGE_KEY } from './config'

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

export function readSignedOut(): boolean {
  try {
    return window.localStorage.getItem(SIGNED_OUT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeSignedOut(signedOut: boolean): void {
  try {
    if (signedOut) {
      window.localStorage.setItem(SIGNED_OUT_STORAGE_KEY, '1')
    } else {
      window.localStorage.removeItem(SIGNED_OUT_STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors in private mode.
  }
}
