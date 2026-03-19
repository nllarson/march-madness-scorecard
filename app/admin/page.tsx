import { getAllBets } from '@/lib/queries'
import { ImportForm } from '@/components/import-form'
import { ResultManager } from '@/components/result-manager'
import Link from 'next/link'
import { Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const bets = await getAllBets()

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Import bets and manage results</p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Leaderboard
          </Link>
        </div>

        <div className="space-y-8">
          <ImportForm />
          <ResultManager bets={bets} />
        </div>
      </div>
    </main>
  )
}
