import { NextRequest, NextResponse } from 'next/server'
import { deleteBet, updateBet } from '@/lib/queries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const betId = params.id
    const body = await request.json()

    if (!betId) {
      return NextResponse.json(
        { error: 'Bet ID is required' },
        { status: 400 }
      )
    }

    const { gameDateTime } = body

    if (!gameDateTime) {
      return NextResponse.json(
        { error: 'gameDateTime is required' },
        { status: 400 }
      )
    }

    // Parse datetime preserving local timezone
    let parsedDateTime: Date
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(gameDateTime)) {
      // datetime-local format - treat as local time
      const [datePart, timePart] = gameDateTime.split('T')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hours, minutes] = timePart.split(':').map(Number)
      parsedDateTime = new Date(year, month - 1, day, hours, minutes)
    } else {
      parsedDateTime = new Date(gameDateTime)
    }

    const updatedBet = await updateBet(betId, {
      gameDateTime: parsedDateTime
    })

    return NextResponse.json(updatedBet)
  } catch (error) {
    console.error('Update bet error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update bet', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const betId = params.id

    if (!betId) {
      return NextResponse.json(
        { error: 'Bet ID is required' },
        { status: 400 }
      )
    }

    await deleteBet(betId)

    return NextResponse.json({ 
      success: true, 
      message: 'Bet deleted successfully'
    })
  } catch (error) {
    console.error('Delete bet error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete bet', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
