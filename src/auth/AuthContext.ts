import { createContext, useContext } from 'react'
import type { UserProfile } from '../types'

export type AuthStatus = 'booting' | 'guest' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: UserProfile | null
  accessToken: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Refreshes the access token. Returns the new token or null when the session is gone. */
  refreshToken: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
