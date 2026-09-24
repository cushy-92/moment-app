import { Feed } from '@/components/Feed'

export default function HomePage() {
  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Лента</h1>
        <p className="text-xs text-muted">Рекомендации · REMIX</p>
      </header>
      
      <Feed />
    </div>
  )
}
