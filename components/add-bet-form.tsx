'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react'

type Person = {
  id: string
  name: string
}

export function AddBetForm({ persons }: { persons: Person[] }) {
  const [formData, setFormData] = useState({
    personId: '',
    newPersonName: '',
    type: 'Straight' as 'Straight' | 'Parlay',
    gameDateTime: '',
    description: '',
    matchup: '',
    betType: '',
    odds: '',
    wager: '',
    potentialPayout: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    errors?: string[]
  } | null>(null)
  const [isNewPerson, setIsNewPerson] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Determine personId - either existing or create new
      let personId = formData.personId
      
      if (isNewPerson && formData.newPersonName) {
        // Create new person first
        const createPersonResponse = await fetch('/api/persons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.newPersonName }),
        })
        
        if (!createPersonResponse.ok) {
          throw new Error('Failed to create person')
        }
        
        const personData = await createPersonResponse.json()
        personId = personData.person.id
      }

      if (!personId) {
        setResult({
          success: false,
          message: 'Please select or enter a person name',
        })
        setLoading(false)
        return
      }

      // Create the bet
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          type: formData.type,
          gameDateTime: formData.gameDateTime || undefined,
          description: formData.description,
          matchup: formData.matchup,
          betType: formData.betType,
          odds: formData.odds,
          wager: parseFloat(formData.wager),
          potentialPayout: parseFloat(formData.potentialPayout),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Bet created successfully!',
        })
        // Reset form
        setFormData({
          personId: '',
          newPersonName: '',
          type: 'Straight',
          gameDateTime: '',
          description: '',
          matchup: '',
          betType: '',
          odds: '',
          wager: '',
          potentialPayout: '',
        })
        setIsNewPerson(false)
        // Reload page after short delay
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to create bet',
          errors: data.details ? (Array.isArray(data.details) ? data.details.map((e: any) => e.message) : [data.details]) : [],
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to create bet',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Bet Manually</CardTitle>
        <CardDescription>
          Create a single bet entry without uploading a spreadsheet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Person Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Person *
              </label>
              {!isNewPerson ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.personId}
                    onValueChange={(value) => setFormData({ ...formData, personId: value })}
                    disabled={loading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsNewPerson(true)}
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="New person name"
                    value={formData.newPersonName}
                    onChange={(e) => setFormData({ ...formData, newPersonName: e.target.value })}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsNewPerson(false)
                      setFormData({ ...formData, newPersonName: '' })
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Bet Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bet Type *
              </label>
              <Select
                value={formData.type}
                onValueChange={(value: 'Straight' | 'Parlay') => setFormData({ ...formData, type: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Straight">Straight</SelectItem>
                  <SelectItem value="Parlay">Parlay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Game Date/Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Game Date/Time
              </label>
              <Input
                type="datetime-local"
                value={formData.gameDateTime}
                onChange={(e) => setFormData({ ...formData, gameDateTime: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Matchup */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Matchup *
              </label>
              <Input
                type="text"
                placeholder="e.g., Duke vs UNC"
                value={formData.matchup}
                onChange={(e) => setFormData({ ...formData, matchup: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <Input
                type="text"
                placeholder="e.g., Duke -5.5"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                required
              />
              {formData.type === 'Parlay' && (
                <p className="text-xs text-muted-foreground mt-1">
                  For parlays, include all legs in the description
                </p>
              )}
            </div>

            {/* Bet Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Bet Category *
              </label>
              <Input
                type="text"
                placeholder="e.g., Game Spread, Moneyline, Total Points"
                value={formData.betType}
                onChange={(e) => setFormData({ ...formData, betType: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Odds */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Odds *
              </label>
              <Input
                type="text"
                placeholder="e.g., -110, +150"
                value={formData.odds}
                onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Wager */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Wager ($) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.wager}
                onChange={(e) => setFormData({ ...formData, wager: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {/* Potential Payout */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Potential Payout ($) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.potentialPayout}
                onChange={(e) => setFormData({ ...formData, potentialPayout: e.target.value })}
                disabled={loading}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Bet...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Bet
              </>
            )}
          </Button>
        </form>

        {result && (
          <div
            className={`mt-4 p-4 rounded-md ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.message}
                </p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-900">Errors:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>... and {result.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
