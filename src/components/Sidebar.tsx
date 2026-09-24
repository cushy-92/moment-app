'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, MessageCircle, User, PlusSquare, Sparkles, LogOut, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navItems = [
  { href: '/', label: 'Лента', icon: Home },
  { href: '/chats', label: 'Чаты', icon: MessageCircle },
  { href: '/create', label: 'Создать', icon: PlusSquare },
  { href: '/profile', label: 'Профиль', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Hide sidebar on auth pages
  if (pathname.startsWith('/auth')) {
    return null
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 p-6 border-r border-border sticky top-0 h-screen">
      <div className="flex items-center gap-2 mb-10">
        <Sparkles className="w-7 h-7 text-primary" />
        <span className="text-xl font-bold tracking-tight">MOMENT</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted hover:bg-card-hover hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border space-y-3">
        {!loading && (
          user ? (
            <div className="space-y-2">
              <div className="px-3 py-2 text-sm">
                <p className="font-medium truncate">
                  {user.user_metadata?.display_name || user.email}
                </p>
                <p className="text-xs text-muted truncate">
                  @{user.user_metadata?.username || 'user'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-muted hover:bg-card-hover hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Войти
            </Link>
          )
        )}
        <p className="text-xs text-muted px-3">
          Phase 1 MVP · REMIX + Чаты
        </p>
      </div>
    </aside>
  )
}
