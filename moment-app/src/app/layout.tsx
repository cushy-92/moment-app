import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'

export const metadata: Metadata = {
  title: 'MOMENT — Соцсеть событий',
  description: 'Один момент глазами всех. Развивай истории. Исследуй мир.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          
          <main className="flex-1 max-w-2xl mx-auto border-x border-border min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          
          <aside className="hidden xl:block w-80 p-6">
            <div className="sticky top-6">
              <h3 className="text-sm font-medium text-muted mb-3">Скоро</h3>
              <p className="text-sm text-muted">
                WORLD — социальная карта города появится в следующих версиях.
              </p>
            </div>
          </aside>
        </div>
        
        <MobileNav />
      </body>
    </html>
  )
}
