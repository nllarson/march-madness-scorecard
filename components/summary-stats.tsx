import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, DollarSign, CheckCircle, Trophy } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/queries'

type BetWithRelations = {
  id: string
  personId: string
  person: {
    id: string
    name: string
    createdAt: Date
  }
  type: string
  gameDateTime: Date | null
  description: string
  matchup: string
  betType: string
  odds: string
  wager: number
  potentialPayout: number
  result: string
  profitLoss: number
  parlayLegs: any[]
  createdAt: Date
  updatedAt: Date
}

interface SummaryStatsProps {
  leaderboardData: LeaderboardEntry[]
  bets: BetWithRelations[]
}

export function SummaryStats({ leaderboardData, bets }: SummaryStatsProps) {
  const totalBets = leaderboardData.reduce(
    (sum, entry) => sum + entry.winCount + entry.lossCount + entry.pendingCount,
    0
  )

  const totalBalance = leaderboardData.reduce(
    (sum, entry) => sum + entry.bank, // Bank now includes all wagers/payouts automatically
    0
  )

  const totalSettled = leaderboardData.reduce(
    (sum, entry) => sum + entry.winCount + entry.lossCount,
    0
  )

  // Calculate breakdown for Total Balance
  const atRisk = bets
    .filter(bet => bet.result === 'Pending')
    .reduce((sum, bet) => sum + Number(bet.wager), 0)
  
  const potentialPayouts = bets
    .filter(bet => bet.result === 'Pending')
    .reduce((sum, bet) => sum + Number(bet.potentialPayout), 0)
  
  const netProfitLoss = bets.reduce((sum, bet) => sum + Number(bet.profitLoss), 0)

  // Fix: Find the biggest single bet win, not biggest person net profit
  const biggestWin = bets
    .filter(bet => bet.result === 'Win')
    .reduce((max, bet) => {
      const profit = Number(bet.profitLoss)
      return profit > max ? profit : max
    }, 0)

  // Find the biggest loss (most negative profitLoss)
  const biggestLoss = bets
    .filter(bet => bet.result === 'Loss')
    .reduce((min, bet) => {
      const loss = Number(bet.profitLoss)
      return loss < min ? loss : min
    }, 0)

  // Count open (pending) bets
  const openBets = bets.filter(bet => bet.result === 'Pending').length
  const settledBetsCount = bets.filter(bet => bet.result === 'Win' || bet.result === 'Loss').length

  // Count wins and losses for settled bets breakdown
  const winCount = bets.filter(bet => bet.result === 'Win').length
  const lossCount = bets.filter(bet => bet.result === 'Loss').length

  const stats = [
    {
      title: 'Total Bets',
      value: totalBets.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      breakdown: {
        open: openBets,
        settled: settledBetsCount,
      },
    },
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      icon: DollarSign,
      color: 'text-green-600',
      breakdown: {
        atRisk: atRisk,
        potentialPayouts: potentialPayouts,
      },
    },
    {
      title: 'Settled Bets',
      value: totalSettled.toString(),
      icon: CheckCircle,
      color: 'text-purple-600',
      breakdown: {
        wins: winCount,
        losses: lossCount,
      },
    },
    {
      title: 'Biggest Win',
      value: formatCurrency(biggestWin),
      icon: Trophy,
      color: 'text-yellow-600',
      breakdown: {
        biggestLoss: biggestLoss,
      },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.breakdown && (
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {/* Total Bets breakdown */}
                {'open' in stat.breakdown && 'settled' in stat.breakdown && typeof stat.breakdown.open === 'number' && (
                  <>
                    <div className="flex justify-between">
                      <span>Open:</span>
                      <span className="font-medium">{stat.breakdown.open}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Settled:</span>
                      <span className="font-medium">{stat.breakdown.settled}</span>
                    </div>
                  </>
                )}
                
                {/* Total Balance breakdown */}
                {'atRisk' in stat.breakdown && 'potentialPayouts' in stat.breakdown && 
                 typeof stat.breakdown.atRisk === 'number' && 
                 typeof stat.breakdown.potentialPayouts === 'number' && (
                  <>
                    <div className="flex justify-between">
                      <span>At Risk:</span>
                      <span className="font-medium">{formatCurrency(stat.breakdown.atRisk)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential Payouts:</span>
                      <span className="font-medium text-green-600">{formatCurrency(stat.breakdown.potentialPayouts)}</span>
                    </div>
                  </>
                )}
                
                {/* Settled Bets breakdown */}
                {'wins' in stat.breakdown && (
                  <>
                    <div className="flex justify-between">
                      <span>Wins:</span>
                      <span className="font-medium text-green-600">{stat.breakdown.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Losses:</span>
                      <span className="font-medium text-red-600">{stat.breakdown.losses}</span>
                    </div>
                  </>
                )}
                
                {/* Biggest Win breakdown */}
                {'biggestLoss' in stat.breakdown && typeof stat.breakdown.biggestLoss === 'number' && (
                  <div className="flex justify-between border-t pt-1">
                    <span>Biggest Loss:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(stat.breakdown.biggestLoss)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
