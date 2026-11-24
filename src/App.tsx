import { useAuth } from './auth/AuthContext'
import { AuthPage } from './auth/AuthPage'
import { ChatPage } from './chat/ChatPage'
import { Logo } from './components/Logo'
import './styles/global.css'

function Splash() {
  return (
    <div className="splash">
      <div className="splash-inner">
        <Logo size={52} />
        <span className="splash-title">эфир</span>
        <span className="splash-bar" aria-hidden="true">
          <span />
        </span>
        <span className="splash-text" role="status">
          Восстанавливаем сессию…
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const { status } = useAuth()

  if (status === 'booting') return <Splash />
  if (status === 'guest') return <AuthPage />
  return <ChatPage />
}
