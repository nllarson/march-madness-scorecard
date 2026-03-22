import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function adjustBank() {
  try {
    // Find Ryan's person record
    const person = await prisma.person.findFirst({
      where: {
        name: {
          contains: 'Ryan',
          mode: 'insensitive'
        }
      },
      include: {
        personTournaments: true
      }
    })

    if (!person) {
      console.error('Ryan not found in database')
      process.exit(1)
    }

    console.log(`Found person: ${person.name} (ID: ${person.id})`)

    // Get the default tournament
    const tournament = await prisma.tournament.findFirst({
      orderBy: { createdAt: 'asc' }
    })

    if (!tournament) {
      console.error('No tournament found')
      process.exit(1)
    }

    // Find PersonTournament record
    let personTournament = await prisma.personTournament.findUnique({
      where: {
        personId_tournamentId: {
          personId: person.id,
          tournamentId: tournament.id
        }
      }
    })

    if (!personTournament) {
      console.error('PersonTournament record not found')
      process.exit(1)
    }

    const oldBank = Number(personTournament.bank)
    const adjustment = 1
    const newBank = oldBank + adjustment

    // Update the bank balance
    const updated = await prisma.personTournament.update({
      where: {
        personId_tournamentId: {
          personId: person.id,
          tournamentId: tournament.id
        }
      },
      data: {
        bank: newBank
      }
    })

    console.log(`✅ Adjusted ${person.name}'s bank by $${adjustment.toFixed(2)}`)
    console.log(`   Old balance: $${oldBank.toFixed(2)}`)
    console.log(`   New balance: $${Number(updated.bank).toFixed(2)}`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

adjustBank()
