# Эфир — групповой чат на WebSocket

Учебный проект недели: групповой чат реального времени на **React + TypeScript + Vite**
с регистрацией, входом, выходом и авторизацией по **JWT**.

## Возможности

- Регистрация и вход через REST API бэкенда (`/api/register/`, `/api/login/`).
- Logout через `/api/logout/` — и локальная, и серверная сессия (HttpOnly cookie).
- Восстановление сессии после перезагрузки страницы.
- Автоматическое обновление access-токена через `/api/token/refresh/`
  (refresh-токен хранится в HttpOnly cookie, JS его не читает).
- WebSocket-чат: `AUTH` → `AUTH_SUCCESS` → `CHAT_MESSAGE` ⇄ `NEW_MESSAGE`.
- Писать и читать чат может только авторизованный пользователь —
  без успешного `AUTH` сервер закрывает соединение.
- Переподключение с экспоненциальной задержкой, повторная авторизация
  после обновления токена, ручная кнопка «Переподключиться».
- Адаптивный интерфейс: группировка сообщений, разделители дней,
  автоскролл и кнопка «новые сообщения», счётчик символов, горячие клавиши.

## Стек

- React 19, TypeScript, Vite
- Нативный `WebSocket` и `fetch` (без сторонних клиентов)
- CSS с дизайн-токенами, без UI-библиотек

## Запуск

```bash
npm install
npm run dev
```

По умолчанию используются боевые адреса:

| Что | Адрес |
| --- | --- |
| REST API | `https://inai-col3.fishrungames.com/api` |
| WebSocket | `wss://inai-col3.fishrungames.com/chat/` |

Их можно переопределить в `.env.local`:

```env
VITE_API_BASE=https://inai-col3.fishrungames.com/api
VITE_WS_URL=wss://inai-col3.fishrungames.com/chat/
```

## Сборка

```bash
npm run lint
npm run build
npm run preview
```

## Деплой

Пуш в `main` запускает GitHub Actions workflow
(`.github/workflows/deploy.yml`), который собирает проект и публикует `dist`
на GitHub Pages.

Базовый путь сборки — `/ws-group-chat/`, он задан в `vite.config.ts`
и соответствует имени репозитория. Если репозиторий будет называться иначе,
поправьте `base` в `vite.config.ts`.

## Протокол WebSocket

```jsonc
// клиент → сервер, первое сообщение
{ "type": "AUTH", "payload": { "token": "<access>" } }

// сервер → клиент
{ "type": "AUTH_SUCCESS", "payload": { "username": "user1" } }

// клиент → сервер
{ "type": "CHAT_MESSAGE", "payload": { "text": "Всем привет" } }

// сервер → клиент (всем участникам, включая отправителя)
{
  "type": "NEW_MESSAGE",
  "payload": { "sender": "user1", "text": "Всем привет", "timestamp": 1794203092682 }
}
```

Если токен или сообщение неверны, сервер закрывает соединение с кодом `4003`
(`Invalid Token`) — клиент обновляет токен и пробует снова, а после нескольких
неудач показывает ошибку и предлагает войти заново.

## Структура

```
src/
├── api/auth.ts          # REST-запросы к бэкенду, разбор ошибок
├── auth/                # AuthProvider, контекст, страница входа
├── chat/                # ChatPage, WebSocket-хук, список сообщений, композер
├── components/          # иконки, логотип, аватары
├── lib/                 # конфиг, работа с JWT, форматирование дат, storage
├── styles/              # global.css, auth.css, chat.css
└── types.ts
```
# ws-group-chat
