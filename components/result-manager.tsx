'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, XCircle, Loader2, Trash2, Calendar, Search } from 'lucide-react'

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

type SortField = 'gameDateTime' | 'wager' | 'potentialPayout' | 'profitLoss'
type SortDirection = 'asc' | 'desc'

export function ResultManager({ bets }: ResultManagerProps) {
  const router = useRouter()
  const [selectedBets, setSelectedBets] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState(false)
  const [localBets, setLocalBets] = useState(bets)
  const [editingDateTime, setEditingDateTime] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('gameDateTime')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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
    if (selectedBets.size === filteredAndSortedBets.length) {
      setSelectedBets(new Set())
    } else {
      setSelectedBets(new Set(filteredAndSortedBets.map(b => b.id)))
    }
  }

  const uniquePersons = useMemo(() => {
    const persons = new Map<string, string>()
    localBets.forEach(bet => {
      persons.set(bet.person.id, bet.person.name)
    })
    return Array.from(persons.entries())
  }, [localBets])

  const getStatusPriority = (result: string) => {
    if (result === 'Pending') return 1
    if (result === 'Win') return 2
    if (result === 'Loss') return 3
    return 4
  }

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
      // Primary sort by status
      const statusA = getStatusPriority(a.result)
      const statusB = getStatusPriority(b.result)
      if (statusA !== statusB) {
        return statusA - statusB
      }

      // Secondary sort by selected field
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
      setSortDirection('asc')
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

  const updateDateTime = async (betId: string, newDateTime: string) => {
    if (!newDateTime) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameDateTime: newDateTime }),
      })

      if (response.ok) {
        const updatedBet = await response.json()
        setLocalBets(prev => prev.map(b => b.id === betId ? { ...b, gameDateTime: updatedBet.gameDateTime } : b))
        setEditingDateTime(null)
      }
    } catch (error) {
      console.error('Failed to update datetime:', error)
    } finally {
      setUpdating(false)
    }
  }

  const deleteBet = async (betId: string) => {
    if (!confirm('Are you sure you want to delete this bet? This action cannot be undone.')) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLocalBets(prev => prev.filter(b => b.id !== betId))
        setSelectedBets(prev => {
          const newSet = new Set(prev)
          newSet.delete(betId)
          return newSet
        })
        // Refresh server data to update bank balances
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to delete bet:', error)
    } finally {
      setUpdating(false)
    }
  }

  const bulkDelete = async () => {
    if (selectedBets.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedBets.size} bet(s)? This action cannot be undone.`)) {
      return
    }

    setUpdating(true)
    try {
      const deletePromises = Array.from(selectedBets).map(betId =>
        fetch(`/api/bets/${betId}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)
      
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Failed to bulk delete:', error)
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
            <Button
              onClick={bulkDelete}
              disabled={updating}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              {updating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete {selectedBets.size}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredAndSortedBets.length} of {localBets.length} bets
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <Checkbox
                    checked={selectedBets.size === filteredAndSortedBets.length && filteredAndSortedBets.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="text-left p-3 font-medium">Person</th>
                <th className="text-left p-3 font-medium cursor-pointer hover:bg-muted" onClick={() => toggleSort('gameDateTime')}>
                  Date/Time {sortField === 'gameDateTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Matchup</th>
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
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBets.map((bet) => {
                const formatDateTimeForInput = (date: Date | null) => {
                  if (!date) return ''
                  const d = new Date(date)
                  const year = d.getFullYear()
                  const month = String(d.getMonth() + 1).padStart(2, '0')
                  const day = String(d.getDate()).padStart(2, '0')
                  const hours = String(d.getHours()).padStart(2, '0')
                  const minutes = String(d.getMinutes()).padStart(2, '0')
                  return `${year}-${month}-${day}T${hours}:${minutes}`
                }

                return (
                <tr key={bet.id} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedBets.has(bet.id)}
                      onCheckedChange={() => toggleBet(bet.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{bet.person.name}</td>
                  <td className="p-3">
                    {editingDateTime === bet.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="datetime-local"
                          defaultValue={formatDateTimeForInput(bet.gameDateTime)}
                          min="2000-01-01T00:00"
                          max="2099-12-31T23:59"
                          onBlur={(e) => {
                            if (e.target.value) {
                              updateDateTime(bet.id, e.target.value)
                            } else {
                              setEditingDateTime(null)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateDateTime(bet.id, e.currentTarget.value)
                            } else if (e.key === 'Escape') {
                              setEditingDateTime(null)
                            }
                          }}
                          className="w-48 text-sm"
                          autoFocus
                          disabled={updating}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDateTime(bet.id)}
                        className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
                        disabled={updating}
                      >
                        <Calendar className="h-3 w-3" />
                        {bet.gameDateTime
                          ? new Date(bet.gameDateTime).toLocaleString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            }).replace(/^(\d+)\/(\d+)\/\d+,\s*(.*)$/, '$1/$2 @ $3')
                          : 'Set time'}
                      </button>
                    )}
                  </td>
                  <td className="p-3">{bet.description}</td>
                  <td className="p-3">{bet.matchup}</td>
                  <td className="p-3 text-right">{formatCurrency(Number(bet.wager))}</td>
                  <td className="p-3 text-right">{formatCurrency(Number(bet.potentialPayout))}</td>
                  <td className="p-3 text-center">
                    <Select
                      value={bet.result}
                      onValueChange={(value) => updateSingleResult(bet.id, value as 'Win' | 'Loss' | 'Pending')}
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
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBet(bet.id)}
                      disabled={updating}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
