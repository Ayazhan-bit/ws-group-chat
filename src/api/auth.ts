import { API_BASE } from '../lib/config'
import type { UserProfile } from '../types'

export interface AuthResponse {
  access: string
  user?: UserProfile
}

export class ApiError extends Error {
  readonly status: number
  readonly fields?: Record<string, string[]>

  constructor(message: string, status = 0, fields?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

function describeFailure(data: unknown, status: number): ApiError {
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>

    const fields: Record<string, string[]> = {}
    for (const [key, value] of Object.entries(body)) {
      if (key === 'detail') continue
      if (Array.isArray(value)) {
        fields[key] = value.map(String)
      } else if (typeof value === 'string') {
        fields[key] = [value]
      }
    }

    if (typeof body.detail === 'string') {
      return new ApiError(body.detail, status, fields)
    }

    const firstMessage = Object.values(fields).flat()[0]
    if (firstMessage) {
      return new ApiError(firstMessage, status, fields)
    }
  }

  if (status === 0) {
    return new ApiError(
      'Не удалось связаться с сервером. Проверьте подключение к интернету.',
      0,
    )
  }

  if (status === 500) {
    return new ApiError(
      'Сервер не смог обработать запрос. Возможно, такое имя пользователя уже занято.',
      status,
    )
  }

  return new ApiError(`Запрос завершился с ошибкой (${status}).`, status)
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as unknown
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text.trim() || null
  } catch {
    return null
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      // Required for the HttpOnly refresh-token cookie.
      credentials: 'include',
    })
  } catch {
    throw describeFailure(null, 0)
  }

  const data = await readBody(response)

  if (!response.ok) {
    throw describeFailure(data, response.status)
  }

  return data as T
}

export function login(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function register(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/register/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function logout(accessToken: string): Promise<{ detail: string }> {
  return request<{ detail: string }>('/logout/', { method: 'POST' }, accessToken)
}

/** Reads the refresh token from the HttpOnly cookie and returns a new access token. */
export async function refreshAccessToken(): Promise<string> {
  const data = await request<{ access?: string }>('/token/refresh/', {
    method: 'POST',
  })

  if (!data?.access) {
    throw new ApiError('Сервер не вернул новый токен.', 401)
  }

  return data.access
}

export function getProfile(accessToken: string): Promise<UserProfile> {
  return request<UserProfile>('/profile/', { method: 'GET' }, accessToken)
}
