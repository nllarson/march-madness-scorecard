import { NextRequest, NextResponse } from 'next/server'
import { updatePersonBank, getPersonBank } from '@/lib/queries'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { amount } = await request.json()
    
    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const personTournament = await updatePersonBank(params.id, amount)
    
    return NextResponse.json({
      success: true,
      bank: Number(personTournament.bank),
    })
  } catch (error) {
    console.error('Error updating person bank:', error)
    return NextResponse.json(
      { error: 'Failed to update bank' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bank = await getPersonBank(params.id)
    
    return NextResponse.json({
      bank,
    })
  } catch (error) {
    console.error('Error fetching person bank:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bank' },
      { status: 500 }
    )
  }
}
