'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type BetWithPerson = {
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
  createdAt: Date
  updatedAt: Date
}

interface ResultManagerProps {
  bets: BetWithPerson[]
}

export function ResultManager({ bets }: ResultManagerProps) {
  const [selectedBets, setSelectedBets] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState(false)
  const [localBets, setLocalBets] = useState(bets)

  const toggleBet = (betId: string) => {
    const newSelected = new Set(selectedBets)
    if (newSelected.has(betId)) {
      newSelected.delete(betId)
    } else {
      newSelected.add(betId)
    }
    setSelectedBets(newSelected)
  }

  const toggleAll = () => {
    if (selectedBets.size === localBets.length) {
      setSelectedBets(new Set())
    } else {
      setSelectedBets(new Set(localBets.map(b => b.id)))
    }
  }

  const updateSingleResult = async (betId: string, result: 'Win' | 'Loss' | 'Pending') => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bets/${betId}/result`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })

      if (response.ok) {
        const updatedBet = await response.json()
        setLocalBets(prev => prev.map(b => b.id === betId ? { ...b, ...updatedBet } : b))
      }
    } catch (error) {
      console.error('Failed to update bet:', error)
    } finally {
      setUpdating(false)
    }
  }

  const bulkUpdate = async (result: 'Win' | 'Loss') => {
    if (selectedBets.size === 0) return

    setUpdating(true)
    try {
      const response = await fetch('/api/bets/bulk-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betIds: Array.from(selectedBets),
          result,
        }),
      })

      if (response.ok) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('Failed to bulk update:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getResultBadgeVariant = (result: string) => {
    if (result === 'Win') return 'win'
    if (result === 'Loss') return 'loss'
    return 'pending'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Results</CardTitle>
        {selectedBets.size > 0 && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => bulkUpdate('Win')}
              disabled={updating}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark {selectedBets.size} as Win
            </Button>
            <Button
              onClick={() => bulkUpdate('Loss')}
              disabled={updating}
              variant="destructive"
            >
              {updating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Mark {selectedBets.size} as Loss
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <Checkbox
                    checked={selectedBets.size === localBets.length && localBets.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left p-3 font-medium">Person</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Matchup</th>
                <th className="text-right p-3 font-medium">Wager</th>
                <th className="text-right p-3 font-medium">Payout</th>
                <th className="text-center p-3 font-medium">Result</th>
                <th className="text-right p-3 font-medium">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {localBets.map((bet) => (
                <tr key={bet.id} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedBets.has(bet.id)}
                      onCheckedChange={() => toggleBet(bet.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{bet.person.name}</td>
                  <td className="p-3">{bet.description}</td>
                  <td className="p-3">{bet.matchup}</td>
                  <td className="p-3 text-right">{formatCurrency(Number(bet.wager))}</td>
                  <td className="p-3 text-right">{formatCurrency(Number(bet.potentialPayout))}</td>
                  <td className="p-3">
                    <Select
                      value={bet.result}
                      onValueChange={(value) => updateSingleResult(bet.id, value as 'Win' | 'Loss' | 'Pending')}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">
                          <Badge variant="pending">Pending</Badge>
                        </SelectItem>
                        <SelectItem value="Win">
                          <Badge variant="win">Win</Badge>
                        </SelectItem>
                        <SelectItem value="Loss">
                          <Badge variant="loss">Loss</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={
                        Number(bet.profitLoss) > 0
                          ? 'text-green-600 font-semibold'
                          : Number(bet.profitLoss) < 0
                          ? 'text-red-600 font-semibold'
                          : 'text-muted-foreground'
                      }
                    >
                      {formatCurrency(Number(bet.profitLoss))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
