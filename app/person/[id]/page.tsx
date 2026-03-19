import { getBetsByPerson, getAllPersons } from '@/lib/queries'
import { PersonSummaryStats } from '@/components/person-summary-stats'
import { BetList } from '@/components/bet-list'
import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PersonPageProps {
  params: {
    id: string
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = params

  // Fetch person's bets
  const bets = await getBetsByPerson(id)
  
  // If no bets found, check if person exists
  if (bets.length === 0) {
    const persons = await getAllPersons()
    const personExists = persons.find(p => p.id === id)
    if (!personExists) {
      notFound()
    }
  }

  // Get person name from first bet or fetch from persons
  let personName = ''
  if (bets.length > 0) {
    personName = bets[0].person.name
  } else {
    const persons = await getAllPersons()
    const person = persons.find(p => p.id === id)
    personName = person?.name || 'Unknown'
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Leaderboard
              </Link>
            </div>
            <h1 className="text-4xl font-bold">{personName}'s Dashboard</h1>
            <p className="text-muted-foreground">Personal betting statistics and history</p>
          </div>
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        <PersonSummaryStats bets={bets} personName={personName} />
        
        <div className="space-y-8">
          <BetList bets={bets} />
        </div>
      </div>
    </main>
  )
}
