'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import type { Bet, Person, ParlayLeg } from '@prisma/client'

type BetWithRelations = Bet & {
  person: Person
  parlayLegs: ParlayLeg[]
}

interface BetListProps {
  bets: BetWithRelations[]
}

type SortField = 'gameDateTime' | 'wager' | 'potentialPayout' | 'profitLoss'
type SortDirection = 'asc' | 'desc'

export function BetList({ bets }: BetListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('gameDateTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [expandedBets, setExpandedBets] = useState<Set<string>>(new Set())

  const uniquePersons = useMemo(() => {
    const persons = new Map<string, string>()
    bets.forEach(bet => {
      persons.set(bet.person.id, bet.person.name)
    })
    return Array.from(persons.entries())
  }, [bets])

  const filteredAndSortedBets = useMemo(() => {
    let filtered = bets.filter(bet => {
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
  }, [bets, searchQuery, personFilter, typeFilter, resultFilter, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleExpanded = (betId: string) => {
    const newExpanded = new Set(expandedBets)
    if (newExpanded.has(betId)) {
      newExpanded.delete(betId)
    } else {
      newExpanded.add(betId)
    }
    setExpandedBets(newExpanded)
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium w-8"></th>
                <th className="text-left p-3 font-medium">Person</th>
                <th className="text-left p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('gameDateTime')}>
                  Date/Time {sortField === 'gameDateTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Matchup</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Odds</th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('wager')}>
                  Wager {sortField === 'wager' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('potentialPayout')}>
                  Payout {sortField === 'potentialPayout' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center p-3 font-medium">Result</th>
                <th className="text-right p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('profitLoss')}>
                  Profit/Loss {sortField === 'profitLoss' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBets.map((bet) => (
                <React.Fragment key={bet.id}>
                  <tr className={`border-b ${getRowClassName(bet.result)}`}>
                    <td className="p-3">
                      {bet.type === 'Parlay' && (
                        <button
                          onClick={() => toggleExpanded(bet.id)}
                          className="hover:bg-muted rounded p-1"
                        >
                          {expandedBets.has(bet.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-3 font-medium">{bet.person.name}</td>
                    <td className="p-3 text-sm">
                      {bet.gameDateTime
                        ? new Date(bet.gameDateTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    <td className="p-3">{bet.description}</td>
                    <td className="p-3">{bet.matchup}</td>
                    <td className="p-3">
                      <Badge variant="outline">{bet.type}</Badge>
                    </td>
                    <td className="p-3">{bet.odds}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(bet.wager))}</td>
                    <td className="p-3 text-right">{formatCurrency(Number(bet.potentialPayout))}</td>
                    <td className="p-3 text-center">
                      <Badge variant={getResultBadgeVariant(bet.result)}>{bet.result}</Badge>
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
                  {bet.type === 'Parlay' && expandedBets.has(bet.id) && (
                    <tr>
                      <td colSpan={11} className="p-0">
                        <div className="bg-muted/30 p-4 ml-12">
                          <div className="text-sm font-medium mb-2">Parlay Details:</div>
                          {bet.parlayLegs.length > 0 ? (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Description</th>
                                  <th className="text-left p-2">Matchup</th>
                                  <th className="text-left p-2">Odds</th>
                                  <th className="text-center p-2">Result</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bet.parlayLegs.map((leg) => (
                                  <tr key={leg.id} className="border-b">
                                    <td className="p-2">{leg.description}</td>
                                    <td className="p-2">{leg.matchup}</td>
                                    <td className="p-2">{leg.odds}</td>
                                    <td className="p-2 text-center">
                                      <Badge variant={getResultBadgeVariant(leg.result)} className="text-xs">
                                        {leg.result}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-sm text-muted-foreground italic">
                              Individual leg details not available. See bet description for full parlay information.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
