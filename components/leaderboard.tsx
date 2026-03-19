import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { Trophy, Medal } from 'lucide-react'
import Link from 'next/link'
import type { LeaderboardEntry } from '@/lib/queries'

interface LeaderboardProps {
  data: LeaderboardEntry[]
}

export function Leaderboard({ data }: LeaderboardProps) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-muted-foreground">#{rank}</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Rank</th>
                <th className="text-left p-3 font-medium">Person</th>
                <th className="text-right p-3 font-medium">Wagered</th>
                <th className="text-right p-3 font-medium">Won</th>
                <th className="text-right p-3 font-medium">Net Profit</th>
                <th className="text-center p-3 font-medium">Record</th>
                <th className="text-right p-3 font-medium">Win %</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, index) => {
                const rank = index + 1
                const isTopThree = rank <= 3
                return (
                  <tr
                    key={entry.personId}
                    className={`border-b hover:bg-muted/50 ${
                      isTopThree ? 'bg-muted/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getRankBadge(rank)}
                      </div>
                    </td>
                    <td className="p-3">
                      <Link 
                        href={`/person/${entry.personId}`}
                        className={`hover:underline hover:text-primary transition-colors ${isTopThree ? 'font-semibold' : ''}`}
                      >
                        {entry.personName}
                      </Link>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatCurrency(entry.totalWagered)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatCurrency(entry.totalWon)}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={
                          entry.netProfit > 0
                            ? 'text-green-600 font-semibold'
                            : entry.netProfit < 0
                            ? 'text-red-600 font-semibold'
                            : 'text-muted-foreground'
                        }
                      >
                        {formatCurrency(entry.netProfit)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Badge variant="win" className="px-1.5 py-0">
                          {entry.winCount}W
                        </Badge>
                        <Badge variant="loss" className="px-1.5 py-0">
                          {entry.lossCount}L
                        </Badge>
                        <Badge variant="pending" className="px-1.5 py-0">
                          {entry.pendingCount}P
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {entry.winCount + entry.lossCount > 0
                        ? formatPercentage(entry.winRate)
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
