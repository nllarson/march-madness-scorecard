import { getLeaderboardData, getAllBets } from '@/lib/queries'
import { Leaderboard } from '@/components/leaderboard'
import { SummaryStats } from '@/components/summary-stats'
import { BetList } from '@/components/bet-list'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const leaderboardData = await getLeaderboardData()
  const bets = await getAllBets()

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">March Madness Bet Tracker</h1>
            <p className="text-muted-foreground">Track your tournament bets and compete with friends</p>
          </div>
          <Link 
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Admin
          </Link>
        </div>

        <SummaryStats leaderboardData={leaderboardData} />
        
        <div className="space-y-8">
          <Leaderboard data={leaderboardData} />
          <BetList bets={bets} />
        </div>
      </div>
    </main>
  )
}
