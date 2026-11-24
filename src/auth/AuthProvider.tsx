import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  getProfile,
  login as loginRequest,
  logout as logoutRequest,
  refreshAccessToken,
  register as registerRequest,
} from '../api/auth'
import { getTokenExpiry, isTokenExpired } from '../lib/jwt'
import {
  readSignedOut,
  readStoredToken,
  writeSignedOut,
  writeStoredToken,
} from '../lib/storage'
import type { UserProfile } from '../types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

const REFRESH_MARGIN_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('booting')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const refreshPromiseRef = useRef<Promise<string | null> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const clearSession = useCallback(() => {
    writeStoredToken(null)
    if (!mountedRef.current) return
    setAccessToken(null)
    setUser(null)
    setStatus('guest')
  }, [])

  const applyToken = useCallback((token: string) => {
    writeStoredToken(token)
    if (!mountedRef.current) return
    setAccessToken(token)
  }, [])

  /** Single-flight refresh: many callers share one request. */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    const promise = (async () => {
      try {
        const token = await refreshAccessToken()
        applyToken(token)
        return token
      } catch {
        clearSession()
        return null
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    refreshPromiseRef.current = promise
    return promise
  }, [applyToken, clearSession])

  const completeSignIn = useCallback(
    (response: { access: string; user?: UserProfile }, fallbackName?: string) => {
      writeSignedOut(false)
      applyToken(response.access)

      const profile =
        response.user ??
        ({
          id: 0,
          username: fallbackName ?? '',
          profile: {
            first_name: '',
            specialization: 'other',
            specialization_display: 'Другое',
            bio: '',
            fee: '0.00',
          },
        } satisfies UserProfile)

      setUser(profile)
      setStatus('authenticated')

      if (!response.user) {
        void getProfile(response.access)
          .then((fresh) => {
            if (mountedRef.current) setUser(fresh)
          })
          .catch(() => {
            // The token works for chat even without a profile request.
          })
      }
    },
    [applyToken],
  )

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await loginRequest(username.trim(), password)
      completeSignIn(response, username.trim())
    },
    [completeSignIn],
  )

  const register = useCallback(
    async (username: string, password: string) => {
      const response = await registerRequest(username.trim(), password)
      completeSignIn(response, username.trim())
    },
    [completeSignIn],
  )

  const logout = useCallback(async () => {
    const token = accessToken
    writeSignedOut(true)
    clearSession()

    if (!token) return

    try {
      await logoutRequest(token)
    } catch {
      // The local session is already cleared, which is what matters.
    }
  }, [accessToken, clearSession])

  // Restore the session on first load: stored access token, or the refresh cookie.
  useEffect(() => {
    let cancelled = false

    const restore = async () => {
      if (readSignedOut()) {
        writeStoredToken(null)
        if (!cancelled) setStatus('guest')
        return
      }

      const stored = readStoredToken()
      let token = stored && !isTokenExpired(stored) ? stored : null

      if (!token) {
        token = await refreshToken()
      }
      if (!token || cancelled) return

      applyToken(token)

      try {
        const profile = await getProfile(token)
        if (cancelled) return
        setUser(profile)
        setStatus('authenticated')
      } catch (error) {
        if (cancelled) return

        if (error instanceof ApiError && error.status === 401) {
          const fresh = await refreshToken()
          if (!fresh || cancelled) return

          try {
            const profile = await getProfile(fresh)
            if (cancelled) return
            setUser(profile)
            setStatus('authenticated')
            return
          } catch {
            // fall through to guest state
          }
        }

        if (!cancelled) setStatus('guest')
      }
    }

    void restore()

    return () => {
      cancelled = true
    }
  }, [refreshToken, applyToken])

  // Refresh shortly before the access token expires, so the session never
  // breaks in the middle of a chat.
  useEffect(() => {
    if (!accessToken) return

    const expiry = getTokenExpiry(accessToken)
    if (!expiry) return

    const delay = Math.max(5_000, expiry - Date.now() - REFRESH_MARGIN_MS)
    const timer = window.setTimeout(() => {
      void refreshToken()
    }, Math.min(delay, 2_147_483_647))

    return () => window.clearTimeout(timer)
  }, [accessToken, refreshToken])

  // Browsers throttle timers in background tabs; refresh when the tab wakes up.
  useEffect(() => {
    if (!accessToken) return

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      if (isTokenExpired(accessToken, REFRESH_MARGIN_MS)) {
        void refreshToken()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [accessToken, refreshToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      login,
      register,
      logout,
      refreshToken,
    }),
    [status, user, accessToken, login, register, logout, refreshToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
