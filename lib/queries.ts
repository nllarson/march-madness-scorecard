import { prisma } from './db'
import { BetResult, Prisma } from '@prisma/client'

export async function getDefaultTournament() {
  let tournament = await prisma.tournament.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: 'Current Tournament',
        description: 'Default tournament',
      },
    })
  }

  return tournament
}

export async function getPersonTournament(personId: string, tournamentId: string) {
  return await prisma.personTournament.findUnique({
    where: {
      personId_tournamentId: {
        personId,
        tournamentId,
      },
    },
  })
}

export async function updatePersonBank(personId: string, amount: number) {
  const defaultTournament = await getDefaultTournament()
  
  const personTournament = await prisma.personTournament.findUnique({
    where: {
      personId_tournamentId: {
        personId,
        tournamentId: defaultTournament.id,
      },
    },
  })

  if (!personTournament) {
    return await prisma.personTournament.create({
      data: {
        personId,
        tournamentId: defaultTournament.id,
        bank: amount,
      },
    })
  }

  const newBank = Number(personTournament.bank) + amount

  return await prisma.personTournament.update({
    where: {
      personId_tournamentId: {
        personId,
        tournamentId: defaultTournament.id,
      },
    },
    data: {
      bank: newBank,
    },
  })
}

export async function getPersonBank(personId: string) {
  const defaultTournament = await getDefaultTournament()
  
  const personTournament = await prisma.personTournament.findUnique({
    where: {
      personId_tournamentId: {
        personId,
        tournamentId: defaultTournament.id,
      },
    },
  })

  return personTournament ? Number(personTournament.bank) : 0
}

export async function getAllBets() {
  const defaultTournament = await getDefaultTournament()
  
  const bets = await prisma.bet.findMany({
    where: { tournamentId: defaultTournament.id },
    include: {
      person: true,
      parlayLegs: true,
    },
    orderBy: {
      gameDateTime: 'desc',
    },
  })

  // Convert Decimal to number for Client Components
  return bets.map(bet => ({
    ...bet,
    wager: Number(bet.wager),
    potentialPayout: Number(bet.potentialPayout),
    profitLoss: Number(bet.profitLoss),
  }))
}

export async function getBetsByPerson(personId: string) {
  const defaultTournament = await getDefaultTournament()
  
  const bets = await prisma.bet.findMany({
    where: { 
      personId,
      tournamentId: defaultTournament.id,
    },
    include: {
      person: true,
      parlayLegs: true,
    },
    orderBy: {
      gameDateTime: 'desc',
    },
  })

  // Convert Decimal to number for Client Components
  return bets.map(bet => ({
    ...bet,
    wager: Number(bet.wager),
    potentialPayout: Number(bet.potentialPayout),
    profitLoss: Number(bet.profitLoss),
  }))
}

export type LeaderboardEntry = {
  personId: string
  personName: string
  bank: number
  currentBalance: number
  totalWon: number
  netProfit: number
  winCount: number
  lossCount: number
  pendingCount: number
  winRate: number
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const defaultTournament = await getDefaultTournament()
  
  const persons = await prisma.person.findMany({
    include: {
      bets: {
        where: { tournamentId: defaultTournament.id },
      },
      personTournaments: {
        where: { tournamentId: defaultTournament.id },
      },
    },
  })

  const leaderboard = persons.map(person => {
    const bank = person.personTournaments[0]?.bank ? Number(person.personTournaments[0].bank) : 0
    const totalWon = person.bets
      .filter(bet => bet.result === 'Win')
      .reduce((sum, bet) => sum + Number(bet.potentialPayout), 0)
    const netProfit = person.bets.reduce((sum, bet) => sum + Number(bet.profitLoss), 0)
    const currentBalance = bank // Bank now includes all wagers/payouts automatically
    const winCount = person.bets.filter(bet => bet.result === 'Win').length
    const lossCount = person.bets.filter(bet => bet.result === 'Loss').length
    const pendingCount = person.bets.filter(bet => bet.result === 'Pending').length
    const settledCount = winCount + lossCount
    const winRate = settledCount > 0 ? winCount / settledCount : 0

    return {
      personId: person.id,
      personName: person.name,
      bank,
      currentBalance,
      totalWon,
      netProfit,
      winCount,
      lossCount,
      pendingCount,
      winRate,
    }
  })

  return leaderboard.sort((a, b) => {
    // Primary sort: Win percentage (descending)
    if (b.winRate !== a.winRate) {
      return b.winRate - a.winRate
    }
    // Secondary sort: Total wins (descending)
    if (b.winCount !== a.winCount) {
      return b.winCount - a.winCount
    }
    // Tertiary sort: Net profit (descending) as final tiebreaker
    return b.netProfit - a.netProfit
  })
}

export async function updateBetResult(betId: string, result: BetResult) {
  const bet = await prisma.bet.findUnique({ where: { id: betId } })
  if (!bet) throw new Error('Bet not found')

  const oldResult = bet.result
  let profitLoss = 0
  
  // Handle bank updates based on result transitions
  if (oldResult === 'Pending' && result === 'Win') {
    // Bet won: add full payout to bank
    await updatePersonBank(bet.personId, Number(bet.potentialPayout))
    profitLoss = Number(bet.potentialPayout) - Number(bet.wager)
  } else if (oldResult === 'Pending' && result === 'Loss') {
    // Bet lost: wager was already deducted, no bank change
    profitLoss = -Number(bet.wager)
  } else if (oldResult === 'Win' && result === 'Pending') {
    // Reverting win to pending: remove payout from bank
    await updatePersonBank(bet.personId, -Number(bet.potentialPayout))
    profitLoss = 0
  } else if (oldResult === 'Loss' && result === 'Pending') {
    // Reverting loss to pending: no bank change (wager still deducted)
    profitLoss = 0
  } else if (oldResult === 'Win' && result === 'Loss') {
    // Changing from win to loss: remove payout from bank
    await updatePersonBank(bet.personId, -Number(bet.potentialPayout))
    profitLoss = -Number(bet.wager)
  } else if (oldResult === 'Loss' && result === 'Win') {
    // Changing from loss to win: add payout to bank
    await updatePersonBank(bet.personId, Number(bet.potentialPayout))
    profitLoss = Number(bet.potentialPayout) - Number(bet.wager)
  }

  return await prisma.bet.update({
    where: { id: betId },
    data: {
      result,
      profitLoss,
    },
  })
}

export async function bulkUpdateBetResults(betIds: string[], result: BetResult) {
  const bets = await prisma.bet.findMany({
    where: { id: { in: betIds } },
  })

  // Handle bank updates for each bet
  for (const bet of bets) {
    const oldResult = bet.result
    
    if (oldResult === 'Pending' && result === 'Win') {
      // Bet won: add full payout to bank
      await updatePersonBank(bet.personId, Number(bet.potentialPayout))
    } else if (oldResult === 'Win' && result === 'Pending') {
      // Reverting win to pending: remove payout from bank
      await updatePersonBank(bet.personId, -Number(bet.potentialPayout))
    } else if (oldResult === 'Win' && result === 'Loss') {
      // Changing from win to loss: remove payout from bank
      await updatePersonBank(bet.personId, -Number(bet.potentialPayout))
    } else if (oldResult === 'Loss' && result === 'Win') {
      // Changing from loss to win: add payout to bank
      await updatePersonBank(bet.personId, Number(bet.potentialPayout))
    }
    // Note: Pending->Loss and Loss->Pending don't change bank (wager already deducted)
  }

  const updates = bets.map(bet => {
    let profitLoss = 0
    if (result === 'Win') {
      profitLoss = Number(bet.potentialPayout) - Number(bet.wager)
    } else if (result === 'Loss') {
      profitLoss = -Number(bet.wager)
    }

    return prisma.bet.update({
      where: { id: bet.id },
      data: {
        result,
        profitLoss,
      },
    })
  })

  await prisma.$transaction(updates)
  return updates.length
}

export async function createBet(data: {
  personId: string
  type: 'Straight' | 'Parlay'
  gameDateTime?: Date
  description: string
  matchup: string
  betType: string
  odds: string
  wager: number
  potentialPayout: number
  parlayLegs?: Array<{
    description: string
    matchup: string
    odds: string
  }>
}) {
  const defaultTournament = await getDefaultTournament()
  
  // Deduct wager from bank when bet is placed
  await updatePersonBank(data.personId, -data.wager)
  
  return await prisma.bet.create({
    data: {
      personId: data.personId,
      tournamentId: defaultTournament.id,
      type: data.type,
      gameDateTime: data.gameDateTime,
      description: data.description,
      matchup: data.matchup,
      betType: data.betType,
      odds: data.odds,
      wager: data.wager,
      potentialPayout: data.potentialPayout,
      parlayLegs: data.parlayLegs
        ? {
            create: data.parlayLegs,
          }
        : undefined,
    },
    include: {
      parlayLegs: true,
    },
  })
}

export async function updateBet(
  betId: string,
  data: Partial<{
    gameDateTime: Date
    description: string
    matchup: string
    betType: string
    odds: string
    wager: number
    potentialPayout: number
  }>
) {
  return await prisma.bet.update({
    where: { id: betId },
    data,
  })
}

export async function deleteBet(betId: string) {
  // Get the bet details before deleting
  const bet = await prisma.bet.findUnique({ 
    where: { id: betId },
  })
  
  if (!bet) {
    throw new Error('Bet not found')
  }

  // Refund based on bet result:
  // - Pending: refund wager (it was deducted when bet was placed)
  // - Win: remove payout from bank (it was added when marked as win)
  // - Loss: refund wager (it was deducted when bet was placed, nothing was added back)
  
  if (bet.result === 'Pending') {
    // Refund the wager that was deducted when bet was placed
    await updatePersonBank(bet.personId, Number(bet.wager))
  } else if (bet.result === 'Win') {
    // Remove the payout that was added when bet won
    await updatePersonBank(bet.personId, -Number(bet.potentialPayout))
  } else if (bet.result === 'Loss') {
    // Refund the wager that was deducted (nothing was added back for loss)
    await updatePersonBank(bet.personId, Number(bet.wager))
  }

  return await prisma.bet.delete({
    where: { id: betId },
  })
}

export async function getAllPersons() {
  return await prisma.person.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

export async function getOrCreatePerson(name: string) {
  const defaultTournament = await getDefaultTournament()
  
  let person = await prisma.person.findUnique({
    where: { name },
  })

  if (!person) {
    person = await prisma.person.create({
      data: { 
        name,
        personTournaments: {
          create: {
            tournamentId: defaultTournament.id,
            bank: 0,
          },
        },
      },
    })
  } else {
    const personTournament = await prisma.personTournament.findUnique({
      where: {
        personId_tournamentId: {
          personId: person.id,
          tournamentId: defaultTournament.id,
        },
      },
    })
    
    if (!personTournament) {
      await prisma.personTournament.create({
        data: {
          personId: person.id,
          tournamentId: defaultTournament.id,
          bank: 0,
        },
      })
    }
  }

  return person
}
