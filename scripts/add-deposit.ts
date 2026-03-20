import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addDeposit() {
  try {
    // Find Nick's person record
    const person = await prisma.person.findFirst({
      where: {
        name: {
          contains: 'Nick',
          mode: 'insensitive'
        }
      },
      include: {
        personTournaments: true
      }
    })

    if (!person) {
      console.error('Nick not found in database')
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

    // Find or create PersonTournament record
    let personTournament = await prisma.personTournament.findUnique({
      where: {
        personId_tournamentId: {
          personId: person.id,
          tournamentId: tournament.id
        }
      }
    })

    if (!personTournament) {
      personTournament = await prisma.personTournament.create({
        data: {
          personId: person.id,
          tournamentId: tournament.id,
          bank: 0
        }
      })
    }

    const oldBank = Number(personTournament.bank)
    const newBank = oldBank + 1

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

    console.log(`✅ Deposited $1 to ${person.name}'s account`)
    console.log(`   Old balance: $${oldBank.toFixed(2)}`)
    console.log(`   New balance: $${Number(updated.bank).toFixed(2)}`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addDeposit()
