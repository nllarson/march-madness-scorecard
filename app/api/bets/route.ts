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
    // datetime-local format is YYYY-MM-DDTHH:mm which needs to be treated as local time
    let gameDateTime: Date | undefined = undefined
    if (data.gameDateTime) {
      // If it's in datetime-local format (no timezone), append local timezone offset
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.gameDateTime)) {
        // Treat as local time by creating Date from components
        const [datePart, timePart] = data.gameDateTime.split('T')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)
        gameDateTime = new Date(year, month - 1, day, hours, minutes)
      } else {
        gameDateTime = new Date(data.gameDateTime)
      }
    }

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
