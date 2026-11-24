import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { BrandMark } from '../components/Logo'
import {
  AlertIcon,
  BoltIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
  SpinnerIcon,
  UserIcon,
  UsersIcon,
} from '../components/Icons'
import '../styles/auth.css'

type Mode = 'login' | 'register'

const USERNAME_PATTERN = /^[\p{L}\p{N}_.@+-]+$/u

interface FieldErrors {
  username?: string
  password?: string
  confirm?: string
}

function validate(
  mode: Mode,
  username: string,
  password: string,
  confirm: string,
): FieldErrors {
  const errors: FieldErrors = {}
  const name = username.trim()

  if (!name) {
    errors.username = 'Введите имя пользователя.'
  } else if (name.length < 3) {
    errors.username = 'Имя должно быть не короче 3 символов.'
  } else if (name.length > 150) {
    errors.username = 'Имя должно быть не длиннее 150 символов.'
  } else if (!USERNAME_PATTERN.test(name)) {
    errors.username =
      'Допустимы буквы, цифры и символы @ . + - _ (без пробелов).'
  }

  if (!password) {
    errors.password = 'Введите пароль.'
  } else if (password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов.'
  }

  if (mode === 'register' && confirm !== password) {
    errors.confirm = 'Пароли не совпадают.'
  }

  return errors
}

export function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const switchMode = (next: Mode) => {
    if (next === mode || pending) return
    setMode(next)
    setPassword('')
    setConfirm('')
    setFieldErrors({})
    setFormError(null)
    setShowPassword(false)
  }

  const applyServerErrors = (error: ApiError) => {
    const next: FieldErrors = {}
    for (const key of ['username', 'password'] as const) {
      const message = error.fields?.[key]?.[0]
      if (message) next[key] = message
    }
    if (Object.keys(next).length > 0) {
      setFieldErrors(next)
      return
    }
    setFormError(error.message)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    const errors = validate(mode, username, password, confirm)
    setFieldErrors(errors)
    setFormError(null)

    if (Object.keys(errors).length > 0) return

    setPending(true)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        applyServerErrors(error)
      } else {
        setFormError('Что-то пошло не так. Попробуйте ещё раз.')
      }
      setPending(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="aurora" aria-hidden="true">
          <span className="aurora-blob aurora-blob--one" />
          <span className="aurora-blob aurora-blob--two" />
          <span className="aurora-grid" />
        </div>

        <BrandMark subtitle="групповой чат" />

        <div className="auth-hero">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            WebSocket · JWT
          </span>
          <h1>
            Ваша группа.
            <br />
            <span className="grad-text">В одном эфире.</span>
          </h1>
          <p className="auth-lead">
            Комната реального времени для своих: сообщения приходят мгновенно,
            а писать могут только авторизованные участники.
          </p>

          <ul className="feature-list">
            <li>
              <span className="feature-icon">
                <BoltIcon />
              </span>
              <div>
                <strong>Мгновенная доставка</strong>
                <span>Постоянное WebSocket-соединение без перезагрузок</span>
              </div>
            </li>
            <li>
              <span className="feature-icon">
                <ShieldIcon />
              </span>
              <div>
                <strong>Вход по JWT</strong>
                <span>Access-токен обновляется автоматически</span>
              </div>
            </li>
            <li>
              <span className="feature-icon">
                <UsersIcon />
              </span>
              <div>
                <strong>Только свои</strong>
                <span>Читать и писать может лишь авторизованный участник</span>
              </div>
            </li>
          </ul>
        </div>

        <footer className="auth-meta">
          <span className="live-dot" aria-hidden="true" />
          <code>wss://inai-col3.fishrungames.com/chat/</code>
        </footer>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>{isRegister ? 'Создать аккаунт' : 'С возвращением'}</h2>
            <p>
              {isRegister
                ? 'Придумайте имя и пароль — и сразу в чат.'
                : 'Войдите, чтобы попасть в общую комнату.'}
            </p>
          </div>

          <div className="segmented" role="group" aria-label="Режим входа">
            <button
              type="button"
              className={mode === 'login' ? 'is-active' : undefined}
              aria-pressed={mode === 'login'}
              onClick={() => switchMode('login')}
            >
              Вход
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'is-active' : undefined}
              aria-pressed={mode === 'register'}
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {formError ? (
              <div className="alert alert--error" role="alert" key={formError}>
                <AlertIcon />
                <span>{formError}</span>
              </div>
            ) : null}

            <label className="field">
              <span className="field-label">Имя пользователя</span>
              <span
                className={`input-shell${fieldErrors.username ? ' has-error' : ''}`}
              >
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="например, kurt_cobain"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={150}
                  aria-invalid={Boolean(fieldErrors.username)}
                  disabled={pending}
                />
              </span>
              {fieldErrors.username ? (
                <span className="field-error">{fieldErrors.username}</span>
              ) : null}
            </label>

            <label className="field">
              <span className="field-label">Пароль</span>
              <span
                className={`input-shell${fieldErrors.password ? ' has-error' : ''}`}
              >
                <LockIcon className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isRegister ? 'минимум 6 символов' : '••••••••'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  maxLength={128}
                  aria-invalid={Boolean(fieldErrors.password)}
                  disabled={pending}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </span>
              {fieldErrors.password ? (
                <span className="field-error">{fieldErrors.password}</span>
              ) : null}
            </label>

            {isRegister ? (
              <label className="field">
                <span className="field-label">Повторите пароль</span>
                <span
                  className={`input-shell${fieldErrors.confirm ? ' has-error' : ''}`}
                >
                  <LockIcon className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="ещё раз"
                    autoComplete="new-password"
                    maxLength={128}
                    aria-invalid={Boolean(fieldErrors.confirm)}
                    disabled={pending}
                  />
                </span>
                {fieldErrors.confirm ? (
                  <span className="field-error">{fieldErrors.confirm}</span>
                ) : null}
              </label>
            ) : null}

            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? (
                <>
                  <SpinnerIcon />
                  {isRegister ? 'Создаём аккаунт…' : 'Входим…'}
                </>
              ) : isRegister ? (
                'Создать аккаунт'
              ) : (
                'Войти в чат'
              )}
            </button>

            <p className="auth-note">
              {isRegister
                ? 'Уже есть аккаунт? '
                : 'Впервые здесь? '}
              <button
                type="button"
                className="link-button"
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
              >
                {isRegister ? 'Войти' : 'Создать аккаунт'}
              </button>
            </p>
          </form>
        </div>

        <p className="auth-legal">
          Пароль передаётся только на сервер авторизации. Refresh-токен хранится
          в HttpOnly cookie.
        </p>
      </main>
    </div>
  )
}
