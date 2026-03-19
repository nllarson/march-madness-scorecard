import { NextRequest, NextResponse } from 'next/server'
import { createBet, getOrCreatePerson } from '@/lib/queries'
import { createBetSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validationResult = createBetSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Convert datetime string to Date if provided
    const gameDateTime = data.gameDateTime ? new Date(data.gameDateTime) : undefined

    // Create the bet
    const bet = await createBet({
      personId: data.personId,
      type: data.type,
      gameDateTime,
      description: data.description,
      matchup: data.matchup,
      betType: data.betType,
      odds: data.odds,
      wager: data.wager,
      potentialPayout: data.potentialPayout,
      parlayLegs: data.parlayLegs,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Bet created successfully',
      bet 
    })
  } catch (error) {
    console.error('Create bet error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create bet', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
