export interface Profile {
  first_name: string
  specialization: string
  specialization_display: string
  bio: string
  fee: string
}

export interface UserProfile {
  id: number
  username: string
  profile: Profile
}

export interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: number
}

export type ConnectionState =
  | 'connecting'
  | 'authenticating'
  | 'online'
  | 'reconnecting'
  | 'error'
