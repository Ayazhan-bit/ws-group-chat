/**
 * Backend endpoints. Both can be overridden with a `.env` file:
 *   VITE_API_BASE=https://...
 *   VITE_WS_URL=wss://...
 */
export const API_BASE = (
  import.meta.env.VITE_API_BASE ?? 'https://inai-col3.fishrungames.com/api'
).replace(/\/+$/, '')

export const WS_URL =
  import.meta.env.VITE_WS_URL ?? 'wss://inai-col3.fishrungames.com/chat/'

export const ACCESS_TOKEN_STORAGE_KEY = 'group-chat.access-token'

export const MAX_MESSAGE_LENGTH = 2000
