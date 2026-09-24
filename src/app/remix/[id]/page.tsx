'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, GitBranch, ImagePlus, Video, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils'

export default function RemixPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [parentPost, setParentPost] = useState<Post | null>(null)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParent() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('id', id)
        .single()

      if (!error && data) {
        setParentPost(data as Post)
      }
      setFetching(false)
    }
    loadParent()
  }, [id])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setMediaType(type)
    setPreview(URL.createObjectURL(selected))
  }

  function clearMedia() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setMediaType('none')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !file) {
      setError('Напиши продолжение или добавь медиа')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?redirect=/remix/${id}`)
      return
    }

    let mediaUrl: string | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('posts-media')
        .upload(path, file)

      if (uploadError) {
        setError('Ошибка загрузки: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts-media')
        .getPublicUrl(path)

      mediaUrl = publicUrl
    }

    const { error: insertError } = await supabase.from('posts').insert({
      author_id: user.id,
      parent_id: id,
      content: content.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Increment remix_count on parent
    if (parentPost) {
      await supabase
        .from('posts')
        .update({ remix_count: (parentPost.remix_count || 0) + 1 })
        .eq('id', id)
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1 hover:bg-card rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            REMIX
          </h1>
          <p className="text-xs text-muted">Продолжи историю</p>
        </div>
      </header>

      <div className="p-4">
        {/* Parent post */}
        <div className="bg-card rounded-xl p-4 border border-border mb-6">
          <p className="text-xs text-muted mb-2 flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            Продолжаешь этот пост
          </p>
          {fetching ? (
            <p className="text-sm text-muted">Загрузка...</p>
          ) : parentPost ? (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="font-semibold">
                  {parentPost.author?.display_name || parentPost.author?.username}
                </span>
                <span className="text-muted text-xs">
                  {formatRelativeTime(parentPost.created_at)}
                </span>
              </div>
              <p className="text-[15px]">{parentPost.content}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Пост не найден (или ещё нет данных в базе)</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Продолжи историю... Что было дальше?"
            className="w-full bg-card border border-border rounded-xl p-4 text-[15px] min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              {mediaType === 'video' ? (
                <video src={preview} controls className="w-full max-h-64 object-cover" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium hover:bg-card-hover cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              Фото
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium hover:bg-card-hover cursor-pointer">
              <Video className="w-4 h-4" />
              Видео
              <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Публикуем REMIX...' : 'Опубликовать REMIX'}
          </button>
        </form>

        <p className="mt-8 text-sm text-muted text-center">
          Твой пост станет новой веткой в дереве этой истории.
        </p>
      </div>
    </div>
  )
}
