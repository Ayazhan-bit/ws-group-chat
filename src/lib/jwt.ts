export interface JwtPayload {
  exp?: number
  iat?: number
  username?: string
  user_id?: string
  token_type?: string
}

/** Decodes the (unsigned) JWT payload. Used only to read the expiry time. */
export function decodeJwt(token: string): JwtPayload | null {
  const part = token.split('.')[1]
  if (!part) return null

  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const payload: unknown = JSON.parse(json)
    return payload && typeof payload === 'object' ? (payload as JwtPayload) : null
  } catch {
    return null
  }
}

export function getTokenExpiry(token: string): number | null {
  const { exp } = decodeJwt(token) ?? {}
  return typeof exp === 'number' ? exp * 1000 : null
}

/** Treats a token as expired slightly before the real deadline. */
export function isTokenExpired(token: string, skewMs = 15_000): boolean {
  const expiry = getTokenExpiry(token)
  if (expiry === null) return true
  return expiry - skewMs <= Date.now()
}
