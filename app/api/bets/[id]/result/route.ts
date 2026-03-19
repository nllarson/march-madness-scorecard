import { NextRequest, NextResponse } from 'next/server'
import { updateBetResult } from '@/lib/queries'
import { updateBetResultSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateBetResultSchema.parse(body)

    const updatedBet = await updateBetResult(params.id, validated.result)

    return NextResponse.json(updatedBet)
  } catch (error) {
    console.error('Update bet result error:', error)
    return NextResponse.json(
      { error: 'Failed to update bet result', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
