export default function ChatsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">Чаты</h1>
        <p className="text-xs text-muted">Личные · Группы · Каналы</p>
      </header>

      <div className="p-8 text-center">
        <p className="text-muted mb-4">Чаты появятся здесь после подключения Supabase Realtime.</p>
        <p className="text-sm text-muted">
          В Phase 1 будут: личные диалоги, групповые чаты и каналы.
        </p>
      </div>
    </div>
  )
}
