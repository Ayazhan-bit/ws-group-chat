import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 11.7a8.4 8.4 0 0 1-9 8.3 9.2 9.2 0 0 1-3.6-.8L4 21l1.4-3.8A8.2 8.2 0 0 1 4 12.2 8.4 8.4 0 0 1 12.6 4 8.4 8.4 0 0 1 21 11.7Z" />
      <path d="M8.6 12h.01M12.6 12h.01M16.6 12h.01" />
    </svg>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.8 12 20 5l-4.2 14.4-3.9-5.1L4.8 12Z" />
      <path d="M11.9 14.3 20 5" />
    </svg>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 8.2V6.4A2.4 2.4 0 0 0 12.1 4H6.4A2.4 2.4 0 0 0 4 6.4v11.2A2.4 2.4 0 0 0 6.4 20h5.7a2.4 2.4 0 0 0 2.4-2.4v-1.8" />
      <path d="M9.6 12h10.6" />
      <path d="m17.2 8.9 3.1 3.1-3.1 3.1" />
    </svg>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.8 12S6 6.4 12 6.4 21.2 12 21.2 12 18 17.6 12 17.6 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4 4 16 16" />
      <path d="M9.9 5.1A9.5 9.5 0 0 1 12 4.9c6 0 9.2 7.1 9.2 7.1a15 15 0 0 1-3.2 4.2" />
      <path d="M6.4 7.3A15.4 15.4 0 0 0 2.8 12s3.2 7.1 9.2 7.1a9.6 9.6 0 0 0 3.9-.8" />
      <path d="M10.2 10.2a2.6 2.6 0 0 0 3.6 3.6" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.6" y="10.2" width="14.8" height="9.2" rx="2.4" />
      <path d="M8.2 10.2V7.8a3.8 3.8 0 0 1 7.6 0v2.4" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 19.4 6v5.6c0 4.2-2.9 7.6-7.4 9.2-4.5-1.6-7.4-5-7.4-9.2V6L12 3.2Z" />
      <path d="m9.2 11.9 2 2 3.6-3.9" />
    </svg>
  )
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.4 3 5.8 13.2h5.2L10.2 21l7.9-10.4h-5.4L13.4 3Z" />
    </svg>
  )
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9.2" cy="8.4" r="3.2" />
      <path d="M3.4 19.4a5.8 5.8 0 0 1 11.6 0" />
      <path d="M16.2 5.6a3.2 3.2 0 0 1 0 5.9" />
      <path d="M17.6 14.3a5.8 5.8 0 0 1 3 5.1" />
    </svg>
  )
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.8v14.4" />
      <path d="m6.4 13.6 5.6 5.6 5.6-5.6" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 8.2v4.6" />
      <path d="M12 15.9h.01" />
    </svg>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 11.4a8 8 0 1 0-2.6 6.2" />
      <path d="M20 5.2v6.2h-6.2" />
    </svg>
  )
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg {...base} {...props} className={`spin ${props.className ?? ''}`}>
      <path d="M12 3.4a8.6 8.6 0 1 0 8.6 8.6" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
