import { NextRequest, NextResponse } from 'next/server'
import { deleteBet } from '@/lib/queries'

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
