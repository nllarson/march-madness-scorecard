import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, DollarSign, CheckCircle, Trophy } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/queries'

interface SummaryStatsProps {
  leaderboardData: LeaderboardEntry[]
}

export function SummaryStats({ leaderboardData }: SummaryStatsProps) {
  const totalBets = leaderboardData.reduce(
    (sum, entry) => sum + entry.winCount + entry.lossCount + entry.pendingCount,
    0
  )

  const totalWagered = leaderboardData.reduce(
    (sum, entry) => sum + entry.totalWagered,
    0
  )

  const totalSettled = leaderboardData.reduce(
    (sum, entry) => sum + entry.winCount + entry.lossCount,
    0
  )

  const biggestWin = leaderboardData.reduce((max, entry) => {
    return entry.netProfit > max ? entry.netProfit : max
  }, 0)

  const stats = [
    {
      title: 'Total Bets',
      value: totalBets.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Total Wagered',
      value: formatCurrency(totalWagered),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Settled Bets',
      value: totalSettled.toString(),
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      title: 'Biggest Win',
      value: formatCurrency(biggestWin),
      icon: Trophy,
      color: 'text-yellow-600',
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
