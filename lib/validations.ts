import { z } from 'zod'

export const betImportSchema = z.object({
  '#': z.union([z.number(), z.string()]).optional(),
  'Type': z.string().transform((val) => {
    if (val.toLowerCase().includes('parlay')) return 'Parlay'
    if (val.toLowerCase().includes('straight')) return 'Straight'
    return val
  }),
  'Game Date/Time': z.union([z.string(), z.number(), z.date()]).nullable().optional(),
  'Bet Description': z.string(),
  'Matchup': z.string().optional().default(''),
  'Bet Type': z.string(),
  'Odds': z.string(),
  'Wager': z.number(),
  'Potential Payout': z.number(),
  'Result': z.enum(['Pending', 'Win', 'Loss', 'pending', 'win', 'loss']).optional(),
  'Profit/Loss': z.number().optional(),
  'Person': z.string().optional(),
})

export type BetImportRow = z.infer<typeof betImportSchema>

export const createBetSchema = z.object({
  personId: z.string().uuid(),
  type: z.enum(['Straight', 'Parlay']),
  gameDateTime: z.string().datetime().optional(),
  description: z.string().min(1),
  matchup: z.string().min(1),
  betType: z.string().min(1),
  odds: z.string().min(1),
  wager: z.number().positive(),
  potentialPayout: z.number().positive(),
  parlayLegs: z.array(z.object({
    description: z.string(),
    matchup: z.string(),
    odds: z.string(),
  })).optional(),
})

export const updateBetResultSchema = z.object({
  result: z.enum(['Pending', 'Win', 'Loss']),
})

export const bulkUpdateResultSchema = z.object({
  betIds: z.array(z.string().uuid()),
  result: z.enum(['Pending', 'Win', 'Loss']),
})
