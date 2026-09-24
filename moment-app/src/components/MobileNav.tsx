'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, User, PlusSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Лента', icon: Home },
  { href: '/chats', label: 'Чаты', icon: MessageCircle },
  { href: '/create', label: 'Создать', icon: PlusSquare },
  { href: '/profile', label: 'Профиль', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/auth')) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                isActive ? 'text-primary' : 'text-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
