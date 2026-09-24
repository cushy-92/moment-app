'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, Users, Megaphone } from 'lucide-react'

export default function ChatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?redirect=/chats')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return <div className="p-8 text-center text-muted">Загрузка...</div>
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Чаты</h1>
        <p className="text-xs text-muted">Личные · Группы · Каналы</p>
      </header>

      <div className="p-6 space-y-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-medium">Личные сообщения</h2>
          </div>
          <p className="text-sm text-muted">
            Скоро здесь появятся диалоги 1-на-1. Мы добавим их в следующем обновлении.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-medium">Групповые чаты</h2>
          </div>
          <p className="text-sm text-muted">
            Создавай группы с друзьями и обсуждай события.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="w-5 h-5 text-primary" />
            <h2 className="font-medium">Каналы</h2>
          </div>
          <p className="text-sm text-muted">
            Публичные каналы для больших аудиторий (как в Telegram).
          </p>
        </div>

        <p className="text-center text-xs text-muted pt-4">
          Realtime-чаты будут добавлены в ближайшем обновлении
        </p>
      </div>
    </div>
  )
}
