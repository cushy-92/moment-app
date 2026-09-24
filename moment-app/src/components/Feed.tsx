'use client'

import { useEffect, useState } from 'react'
import { PostCard } from './PostCard'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/database'

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author_id: 'u1',
    parent_id: null,
    content: 'Я сегодня впервые приехал в Москву. Холодно, но красиво ❄️',
    media_url: null,
    media_type: 'none',
    like_count: 42,
    comment_count: 8,
    remix_count: 3,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author: {
      id: 'u1',
      username: 'alex_travel',
      display_name: 'Алекс',
      avatar_url: null,
      bio: null,
      created_at: '',
    },
  },
  {
    id: '2',
    author_id: 'u2',
    parent_id: '1',
    content: 'А я живу здесь уже 10 лет. Если хочешь — могу показать настоящие места, куда туристы не ходят.',
    media_url: null,
    media_type: 'none',
    like_count: 28,
    comment_count: 4,
    remix_count: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: {
      id: 'u2',
      username: 'moscow_local',
      display_name: 'Мария',
      avatar_url: null,
      bio: null,
      created_at: '',
    },
  },
  {
    id: '3',
    author_id: 'u3',
    parent_id: '2',
    content: 'Обязательно сходи в ГУМ на каток вечером. И попробуй пончики на Арбате — это классика.',
    media_url: null,
    media_type: 'none',
    like_count: 15,
    comment_count: 2,
    remix_count: 0,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    author: {
      id: 'u3',
      username: 'foodie_msk',
      display_name: 'Дима',
      avatar_url: null,
      bio: null,
      created_at: '',
    },
  },
  {
    id: '4',
    author_id: 'u4',
    parent_id: null,
    content: 'Концерт вчера был огонь 🔥 Кто ещё был?',
    media_url: null,
    media_type: 'none',
    like_count: 156,
    comment_count: 34,
    remix_count: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: {
      id: 'u4',
      username: 'music_lover',
      display_name: 'Катя',
      avatar_url: null,
      bio: null,
      created_at: '',
    },
  },
]

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setPosts(MOCK_POSTS)
        setUsingMock(true)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error || !data || data.length === 0) {
        setPosts(MOCK_POSTS)
        setUsingMock(true)
      } else {
        let likedPostIds = new Set<string>()
        if (user) {
          const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.id)

          if (likes) {
            likedPostIds = new Set(likes.map(l => l.post_id))
          }
        }

        const postsWithLikes = data.map(p => ({
          ...p,
          is_liked: likedPostIds.has(p.id),
        })) as Post[]

        setPosts(postsWithLikes)
        setUsingMock(false)
      }
    } catch {
      setPosts(MOCK_POSTS)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted">
        Загрузка ленты...
      </div>
    )
  }

  const rootPosts = posts.filter(p => !p.parent_id)
  const remixes = posts.filter(p => p.parent_id)

  return (
    <div>
      {usingMock && (
        <div className="px-4 py-2 bg-primary/10 text-primary text-xs text-center border-b border-border">
          Демо-режим · Создай пост, чтобы увидеть реальные данные
        </div>
      )}

      <div className="divide-y divide-border">
        {rootPosts.length === 0 ? (
          <div className="p-8 text-center text-muted">
            Пока нет постов. Будь первым — нажми «Создать»!
          </div>
        ) : (
          rootPosts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />

              {remixes
                .filter(r => r.parent_id === post.id)
                .map((remix) => (
                  <div key={remix.id} className="ml-6 border-l-2 border-primary/30">
                    <PostCard post={remix} isRemix />

                    {remixes
                      .filter(r => r.parent_id === remix.id)
                      .map((nested) => (
                        <div key={nested.id} className="ml-6 border-l-2 border-primary/20">
                          <PostCard post={nested} isRemix />
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
