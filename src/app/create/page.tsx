'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImagePlus, Video, X } from 'lucide-react'

export default function CreatePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError('Напиши что-нибудь или добавь медиа')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Нужно войти')
      setLoading(false)
      router.push('/auth/login?redirect=/create')
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
        setError('Ошибка загрузки файла: ' + uploadError.message)
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
      content: content.trim() || null,
      media_url: mediaUrl,
      media_type: mediaType,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Создать пост</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Что происходит? Расскажи историю..."
            className="w-full bg-card border border-border rounded-xl p-4 text-[15px] min-h-[160px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          {preview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              {mediaType === 'video' ? (
                <video src={preview} controls className="w-full max-h-80 object-cover" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium hover:bg-card-hover transition-colors cursor-pointer">
              <ImagePlus className="w-4 h-4" />
              Фото
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'image')}
              />
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium hover:bg-card-hover transition-colors cursor-pointer">
              <Video className="w-4 h-4" />
              Видео
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'video')}
              />
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
            {loading ? 'Публикуем...' : 'Опубликовать'}
          </button>
        </form>
      </div>
    </div>
  )
}
