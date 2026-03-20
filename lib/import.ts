import * as XLSX from 'xlsx'
import { prisma } from './db'
import { betImportSchema, type BetImportRow } from './validations'
import { getDefaultTournament } from './queries'

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  skipped: number
  errors: string[]
}

export async function importBetsFromFile(
  fileBuffer: Buffer,
  personName?: string
): Promise<ImportResult> {
  const errors: string[] = []
  let imported = 0
  let skipped = 0

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet)

    if (rawData.length === 0) {
      return {
        success: false,
        message: 'Spreadsheet is empty',
        imported: 0,
        skipped: 0,
        errors: ['No data found in spreadsheet'],
      }
    }

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      const rowNum = i + 2

      // Skip completely empty rows
      const hasData = Object.values(row).some(val => val !== undefined && val !== null && val !== '')
      if (!hasData) {
        continue
      }

      try {
        const validated = betImportSchema.parse(row)
        
        const betPersonName = validated.Person || personName
        if (!betPersonName) {
          errors.push(`Row ${rowNum}: No person name provided`)
          skipped++
          continue
        }

        let person = await prisma.person.findUnique({
          where: { name: betPersonName },
        })

        if (!person) {
          person = await prisma.person.create({
            data: { name: betPersonName },
          })
        }

        const isDuplicate = await prisma.bet.findFirst({
          where: {
            personId: person.id,
            description: validated['Bet Description'],
            matchup: validated.Matchup,
          },
        })

        if (isDuplicate) {
          skipped++
          continue
        }

        const result = validated.Result 
          ? (validated.Result.charAt(0).toUpperCase() + validated.Result.slice(1).toLowerCase()) as 'Pending' | 'Win' | 'Loss'
          : 'Pending'

        let profitLoss = 0
        if (result === 'Win') {
          profitLoss = validated['Potential Payout'] - validated.Wager
        } else if (result === 'Loss') {
          profitLoss = -validated.Wager
        }

        let gameDateTime: Date | null = null
        if (validated['Game Date/Time']) {
          const dateValue = validated['Game Date/Time']
          
          // Handle Excel date numbers (days since 1900-01-01)
          if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1899, 11, 30) // Excel's epoch
            gameDateTime = new Date(excelEpoch.getTime() + dateValue * 86400000)
          } else if (typeof dateValue === 'string') {
            const parsedDate = new Date(dateValue)
            if (!isNaN(parsedDate.getTime())) {
              gameDateTime = parsedDate
            }
          } else if (dateValue instanceof Date) {
            gameDateTime = dateValue
          }
        }

        const defaultTournament = await getDefaultTournament()
        const { updatePersonBank } = await import('./queries')
        
        // Handle bank updates based on bet result
        // Deduct wager for all bets (pending, win, or loss)
        await updatePersonBank(person.id, -validated.Wager)
        
        // If bet already won, add the payout back
        if (result === 'Win') {
          await updatePersonBank(person.id, validated['Potential Payout'])
        }
        
        await prisma.bet.create({
          data: {
            personId: person.id,
            tournamentId: defaultTournament.id,
            type: validated.Type as 'Straight' | 'Parlay',
            gameDateTime,
            description: validated['Bet Description'],
            matchup: validated.Matchup,
            betType: validated['Bet Type'],
            odds: validated.Odds,
            wager: validated.Wager,
            potentialPayout: validated['Potential Payout'],
            result,
            profitLoss,
          },
        })

        imported++
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Row ${rowNum}: ${error.message}`)
        } else {
          errors.push(`Row ${rowNum}: Unknown error`)
        }
        skipped++
      }
    }

    return {
      success: imported > 0,
      message: `Successfully imported ${imported} bets, skipped ${skipped}`,
      imported,
      skipped,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to parse spreadsheet',
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}
