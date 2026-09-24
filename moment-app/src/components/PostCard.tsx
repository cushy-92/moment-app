'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, GitBranch, Share2 } from 'lucide-react'
import type { Post } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface PostCardProps {
  post: Post
  isRemix?: boolean
  onLikeUpdate?: (postId: string, newCount: number, isLiked: boolean) => void
}

export function PostCard({ post, isRemix = false, onLikeUpdate }: PostCardProps) {
  const author = post.author
  const [likeCount, setLikeCount] = useState(post.like_count || 0)
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [liking, setLiking] = useState(false)

  async function handleLike() {
    if (liking) return
    setLiking(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)

        const newCount = Math.max(0, likeCount - 1)
        setLikeCount(newCount)
        setIsLiked(false)
        onLikeUpdate?.(post.id, newCount, false)

        // Update count in posts table
        await supabase
          .from('posts')
          .update({ like_count: newCount })
          .eq('id', post.id)
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: post.id })

        const newCount = likeCount + 1
        setLikeCount(newCount)
        setIsLiked(true)
        onLikeUpdate?.(post.id, newCount, true)

        await supabase
          .from('posts')
          .update({ like_count: newCount })
          .eq('id', post.id)
      }
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setLiking(false)
    }
  }

  return (
    <article className={cn(
      'px-4 py-4 hover:bg-card/50 transition-colors',
      isRemix && 'bg-card/30'
    )}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
          {author?.display_name?.[0] || author?.username?.[0] || '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">
              {author?.display_name || author?.username}
            </span>
            <span className="text-muted text-sm">@{author?.username}</span>
            <span className="text-muted text-xs">·</span>
            <span className="text-muted text-xs">{formatRelativeTime(post.created_at)}</span>
            {isRemix && (
              <span className="ml-auto text-xs text-primary flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                REMIX
              </span>
            )}
          </div>

          {/* Content */}
          {post.content && (
            <p className="text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {/* Media */}
          {post.media_url && (
            <div className="rounded-xl overflow-hidden mb-3 bg-card border border-border">
              {post.media_type === 'video' ? (
                <video src={post.media_url} controls className="w-full max-h-96 object-cover" />
              ) : (
                <img src={post.media_url} alt="" className="w-full max-h-96 object-cover" />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6 text-muted">
            <button
              onClick={handleLike}
              disabled={liking}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors group',
                isLiked ? 'text-red-400' : 'hover:text-red-400'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-red-400')} />
              <span>{likeCount}</span>
            </button>

            <button className="flex items-center gap-1.5 text-sm hover:text-blue-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count || 0}</span>
            </button>

            <Link
              href={`/remix/${post.id}`}
              className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              <span>{post.remix_count > 0 ? post.remix_count : 'Продолжить'}</span>
            </Link>

            <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors ml-auto">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
