'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Search } from 'lucide-react'

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
  parlayLegs: {
    id: string
    betId: string
    description: string
    matchup: string
    odds: string
    result: string
  }[]
  createdAt: Date
  updatedAt: Date
}

interface BetListProps {
  bets: BetWithRelations[]
}

type SortField = 'gameDateTime' | 'wager' | 'potentialPayout' | 'profitLoss'
type SortDirection = 'asc' | 'desc'

export function BetList({ bets }: BetListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('gameDateTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [localBets, setLocalBets] = useState(bets)
  const [updating, setUpdating] = useState(false)

  const uniquePersons = useMemo(() => {
    const persons = new Map<string, string>()
    bets.forEach(bet => {
      persons.set(bet.person.id, bet.person.name)
    })
    return Array.from(persons.entries())
  }, [bets])

  const filteredAndSortedBets = useMemo(() => {
    let filtered = localBets.filter(bet => {
      const matchesSearch = 
        searchQuery === '' ||
        bet.person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bet.matchup.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPerson = personFilter === 'all' || bet.person.id === personFilter
      const matchesType = typeFilter === 'all' || bet.type === typeFilter
      const matchesResult = resultFilter === 'all' || bet.result === resultFilter

      return matchesSearch && matchesPerson && matchesType && matchesResult
    })

    filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'gameDateTime') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      } else {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [localBets, searchQuery, personFilter, typeFilter, resultFilter, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const updateBetResult = async (betId: string, result: 'Win' | 'Loss' | 'Pending') => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/bets/${betId}/result`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })

      if (response.ok) {
        const updatedBet = await response.json()
        setLocalBets(prev => prev.map(b => b.id === betId ? { ...b, result: updatedBet.result, profitLoss: updatedBet.profitLoss } : b))
        // Refresh server data without full page reload
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update bet:', error)
    } finally {
      setUpdating(false)
    }
  }


  const getResultBadgeVariant = (result: string) => {
    if (result === 'Win') return 'win'
    if (result === 'Loss') return 'loss'
    return 'pending'
  }

  const getRowClassName = (result: string) => {
    if (result === 'Win') return 'bg-green-50 hover:bg-green-100'
    if (result === 'Loss') return 'bg-red-50 hover:bg-red-100'
    return 'bg-amber-50 hover:bg-amber-100'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">All Bets</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={personFilter} onValueChange={setPersonFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All People" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All People</SelectItem>
              {uniquePersons.map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Straight">Straight</SelectItem>
              <SelectItem value="Parlay">Parlay</SelectItem>
            </SelectContent>
          </Select>
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="Win">Win</SelectItem>
              <SelectItem value="Loss">Loss</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedBets.length} of {bets.length} bets
        </div>
        <div>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium w-24">Person</th>
                <th className="text-left p-3 font-medium cursor-pointer hover:bg-muted w-32" onClick={() => toggleSort('gameDateTime')}>
                  Date/Time {sortField === 'gameDateTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Matchup</th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted w-24" onClick={() => toggleSort('wager')}>
                  Wager {sortField === 'wager' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted w-24" onClick={() => toggleSort('potentialPayout')}>
                  Payout {sortField === 'potentialPayout' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center p-3 font-medium w-20">Result</th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted w-28" onClick={() => toggleSort('profitLoss')}>
                  Profit/Loss {sortField === 'profitLoss' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBets.map((bet) => (
                <React.Fragment key={bet.id}>
                  <tr className={`border-b ${getRowClassName(bet.result)}`}>
                    <td className="p-3 font-medium">{bet.person.name}</td>
                    <td className="p-3 text-sm whitespace-nowrap">
                      {bet.gameDateTime
                        ? new Date(bet.gameDateTime).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          }).replace(/^(\d+)\/(\d+)\/\d+,\s*(.*)$/, '$1/$2 @ $3')
                        : '-'}
                    </td>
                    <td className="p-3 break-words">
                      {bet.description}{' '}
                      <span className="text-xs text-muted-foreground">({bet.odds})</span>
                    </td>
                    <td className="p-3 break-words">{bet.matchup}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(bet.wager))}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(bet.potentialPayout))}</td>
                    <td className="p-3 text-center">
                      <Select
                        value={bet.result}
                        onValueChange={(value) => updateBetResult(bet.id, value as 'Win' | 'Loss' | 'Pending')}
                        disabled={updating}
                      >
                        <SelectTrigger className={`w-28 border-0 ${
                          bet.result === 'Win' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : bet.result === 'Loss'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}>
                          <SelectValue>
                            <span className="font-medium">{bet.result}</span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending" className="cursor-pointer">
                            <span className="font-medium text-amber-800">Pending</span>
                          </SelectItem>
                          <SelectItem value="Win" className="cursor-pointer">
                            <span className="font-medium text-green-800">Win</span>
                          </SelectItem>
                          <SelectItem value="Loss" className="cursor-pointer">
                            <span className="font-medium text-red-800">Loss</span>
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
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
