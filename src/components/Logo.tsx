import type { ReactNode } from 'react'
import { ChatIcon } from './Icons'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="logo" style={{ width: size, height: size }} aria-hidden="true">
      <ChatIcon style={{ width: size * 0.56, height: size * 0.56 }} />
    </span>
  )
}

export function BrandMark({ subtitle }: { subtitle?: ReactNode }) {
  return (
    <div className="brand">
      <Logo />
      <div className="brand-text">
        <span className="brand-name">эфир</span>
        {subtitle ? <span className="brand-sub">{subtitle}</span> : null}
      </div>
    </div>
  )
}
