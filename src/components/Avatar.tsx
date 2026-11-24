interface AvatarProps {
  username: string
  size?: number
  tone?: 'user' | 'self'
}

function initials(name: string): string {
  const cleaned = name.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  if (!cleaned) return '?'

  const words = cleaned.split(/\s+/)
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase()
}

function hue(name: string): number {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360
  }
  return hash
}

export function Avatar({ username, size = 34, tone = 'user' }: AvatarProps) {
  const background =
    tone === 'self'
      ? 'var(--accent-grad)'
      : `linear-gradient(140deg, hsl(${hue(username)} 68% 52%), hsl(${
          (hue(username) + 42) % 360
        } 70% 38%))`

  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
      aria-hidden="true"
    >
      {initials(username)}
    </span>
  )
}
