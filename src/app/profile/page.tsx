'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/profile')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)

      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id)

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id)

      setStats({
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0,
      })

      setLoading(false)
    }

    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted">Загрузка профиля...</div>
    )
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Профиль</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </header>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl text-primary font-bold">
            {profile?.display_name?.[0] || profile?.username?.[0] || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {profile?.display_name || 'Пользователь'}
            </h2>
            <p className="text-muted">@{profile?.username || 'user'}</p>
          </div>
        </div>

        {profile?.bio && (
          <p className="text-sm mb-6">{profile.bio}</p>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-xl font-bold">{stats.posts}</div>
            <div className="text-xs text-muted">Постов</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-xl font-bold">{stats.followers}</div>
            <div className="text-xs text-muted">Подписчиков</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="text-xl font-bold">{stats.following}</div>
            <div className="text-xs text-muted">Подписок</div>
          </div>
        </div>
      </div>
    </div>
  )
}
