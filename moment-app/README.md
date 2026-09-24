# MOMENT — Соцсеть событий

**Phase 1 MVP**: Лента + REMIX + Авторизация + Создание постов

## Что уже работает

- Регистрация и вход (Supabase Auth)
- Создание постов (текст + фото + видео)
- **REMIX** — продолжение любого поста (дерево историй)
- Лента с реальными данными (или демо, если база пустая)
- Профиль пользователя
- Защита маршрутов (middleware)
- Адаптивный UI (мобильный + десктоп)

## Быстрый старт

### 1. Установка

```bash
cd moment-app
npm install
```

### 2. Настройка Supabase

1. Создай бесплатный проект на https://supabase.com
2. Скопируй `.env.example` → `.env.local` и вставь:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. В **SQL Editor** выполни весь файл `supabase/schema.sql`
4. В **Storage** создай два публичных бакета:
   - `avatars`
   - `posts-media`

### 3. Запуск

```bash
npm run dev
```

Открой http://localhost:3000

## Как пользоваться

1. Зарегистрируйся (`/auth/register`)
2. Создай пост (`/create`)
3. Нажми «Продолжить» / REMIX на любом посте → создай ветку истории
4. Смотри дерево REMIX в ленте

## Структура проекта

```
src/
  app/
    auth/login, auth/register
    create/          — создание поста
    remix/[id]/     — продолжение поста
    chats/           — (заготовка)
    profile/         — профиль
  components/
    Feed.tsx         — лента + дерево REMIX
    PostCard.tsx
    Sidebar.tsx
    MobileNav.tsx
  lib/supabase/      — клиенты
  middleware.ts      — защита роутов
supabase/
  schema.sql         — полная схема БД
```

## Следующие шаги (Phase 1 продолжение)

- Лайки (уже есть таблица)
- Realtime-чаты
- Уведомления
- Рекомендации

## Позже (Phase 2–3)

- MOMENT — коллективные события
- WORLD — социальная карта

---

Сделано для рабочего MVP.
