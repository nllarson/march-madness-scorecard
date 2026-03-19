# PRD: March Madness Bet Tracker

## 1. Problem Statement

Tracking sports bets across a tournament like March Madness is painful. Bet slips live as screenshots scattered across a phone, and there's no easy way to see total exposure, running profit/loss, or compare results with friends. Spreadsheets work for one person on one device, but they don't support sharing, searching, or real-time leaderboards.

Nick and his friends place bets throughout the NCAA tournament and want a single place to view all wagers, track results as games finish, and compete on a shared scoreboard — accessible from any device via a URL.

## 2. Goals

- **Centralized tracking**: All bets (straight and parlay) for all participants visible in one place, replacing screenshots and spreadsheets.
- **Accessible anywhere**: A deployed web app reachable by URL from any device — no installs or logins required for viewers.
- **Competitive element**: A leaderboard ranked by profit that makes the tournament more fun among friends.
- **Fast data entry**: Import bets directly from the existing `NCAA_Bets_Tracker.xlsx` format rather than re-typing everything.
- **Easy result tracking**: Quickly update bet outcomes (Win/Loss) and see totals recalculate instantly.

## 3. Non-Goals

- **Live score integration / auto-settling bets**: Results are updated manually. Integrating a sports data API adds significant complexity and cost for a short-lived tournament app. *(too complex for v1)*
- **User authentication / accounts**: No login system. Nick manages all data; friends view via shareable link. *(premature — revisit if this becomes a multi-season tool)*
- **Support for other sports or seasons**: This is scoped to the 2026 NCAA March Madness tournament only. *(separate initiative if there's demand)*
- **Bet placement or odds comparison**: This is a tracker, not a sportsbook. It does not connect to any betting platform. *(out of scope entirely)*
- **Bracket visualization**: No visual bracket or tournament tree. Bets are displayed as a searchable, filterable list. *(not enough impact for v1)*

## 4. User Stories

### Nick (Admin / Primary User)
- As Nick, I want to import my existing bet tracker spreadsheet so that I don't have to re-enter all my bets manually.
- As Nick, I want to import spreadsheets for my friends' bets with a "Person" column so that everyone's wagers appear on the shared board.
- As Nick, I want to update a bet's result to "Win" or "Loss" so that profit/loss totals recalculate automatically.
- As Nick, I want to add a new bet via a form so that I can enter wagers placed after the initial import.
- As Nick, I want to edit or delete an existing bet so that I can fix mistakes in the data.
- As Nick, I want to filter bets by person, bet type, result status, or matchup so that I can quickly find what I'm looking for.
- As Nick, I want to sort the bet list by any column (date/time, wager, payout, profit) so that I can analyze the data different ways.
- As Nick, I want to see a summary dashboard with total wagered, total won, net profit/loss, and win rate — per person and overall.

### Friends (Viewers)
- As a friend, I want to open a shared link and see the full scoreboard without needing to log in or create an account.
- As a friend, I want to see where I rank on the leaderboard by profit so I know who's winning.
- As a friend, I want to search for my own bets by name so I can see my personal results.
- As a friend, I want the page to load quickly and be readable on my phone if I check it on the go, even though it's designed for desktop.

### Edge Cases
- As Nick, I want to see an error message if I upload a spreadsheet that doesn't match the expected format, so I know what to fix.
- As Nick, I want parlay bets to display clearly as a single entry with their legs visible, rather than being split into individual bets.
- As a viewer, I want to see "Pending" bets clearly distinguished from settled ones, so I know which games haven't finished yet.

## 5. Requirements

### Must-Have (P0)

**5.1 Spreadsheet Import**
- Accept `.xlsx` files matching the `NCAA_Bets_Tracker.xlsx` column format: `#, Type, Game Date/Time, Bet Description, Matchup, Bet Type, Odds, Wager, Potential Payout, Result, Profit/Loss`.
- A "Person" column must be supported (either present in the file or assignable during upload via a text field: "Who do these bets belong to?").
- Import should create or update bet records in the database. Duplicate detection based on Person + Bet Description + Matchup to avoid re-importing the same bets.
- Display clear validation errors if the file format is wrong (missing columns, bad data types).
- *Acceptance criteria*:
  - [ ] Upload an `.xlsx` file and see bets appear in the bet list within 5 seconds
  - [ ] Upload with a "Person" field and see all imported bets tagged to that person
  - [ ] Upload a malformed file and see a human-readable error explaining what's wrong
  - [ ] Re-upload the same file and see no duplicate bets created

**5.2 Bet List View**
- Display all bets in a table with columns: Person, Game Date/Time, Bet Description, Matchup, Bet Type, Odds, Wager, Potential Payout, Result, Profit/Loss.
- Sortable by any column (click column header to sort ascending/descending).
- Text search bar that filters across Person, Bet Description, and Matchup fields.
- Dropdown filters for: Person (multi-select), Type (Straight / Parlay), Result (Win / Loss / Pending).
- Parlay bets should display as a single row with an expandable section showing individual legs.
- Color-code or badge rows by result: green for Win, red for Loss, amber/neutral for Pending.
- *Acceptance criteria*:
  - [ ] All imported bets are visible in the table
  - [ ] Clicking a column header sorts the table by that column
  - [ ] Typing "Louisville" in search filters to only bets mentioning Louisville
  - [ ] Selecting "Pending" in the result filter shows only unsettled bets
  - [ ] Parlay rows expand to show leg details on click

**5.3 Result Management (Admin)**
- A way to update a bet's Result to "Win" or "Loss" (e.g., inline dropdown or quick-action button).
- Profit/Loss recalculates automatically: Win = Potential Payout − Wager; Loss = −Wager.
- Bulk update: select multiple bets and mark them all as Win or Loss at once (useful when several games in a round finish together).
- Admin actions should be available at a `/admin` route (no auth, but not linked from the public scoreboard — security through obscurity is acceptable for a friends-only app).
- *Acceptance criteria*:
  - [ ] Change a bet from Pending to Win and see Profit/Loss update immediately
  - [ ] Change a bet from Pending to Loss and see Profit/Loss show a negative amount
  - [ ] Select 5 bets, bulk-mark as Win, and see all 5 update
  - [ ] Scoreboard totals reflect the changes without a page refresh

**5.4 Leaderboard / Scoreboard**
- A leaderboard view ranked by net profit (descending).
- Each row shows: Rank, Person, Total Wagered, Total Won, Net Profit/Loss, Win Count, Loss Count, Pending Count, Win %.
- Visual distinction for the top 3 (e.g., gold/silver/bronze accent or larger font).
- Summary card at the top showing group-wide totals: total bets placed, total money in play, total settled, biggest single win.
- *Acceptance criteria*:
  - [ ] Leaderboard correctly ranks all participants by net profit
  - [ ] A person with no settled bets shows $0 profit and appears on the board
  - [ ] Win % is calculated as Wins / (Wins + Losses), excluding Pending
  - [ ] Summary card values match the sum of all individual data

**5.5 Shareable Link**
- The scoreboard is the default public view at the root URL (`/`).
- No authentication required to view — anyone with the link can see the leaderboard and bet list.
- *Acceptance criteria*:
  - [ ] Opening the root URL in an incognito browser shows the scoreboard
  - [ ] No login prompt, cookie banner, or gate of any kind

### Nice-to-Have (P1)

**5.6 Add Bet via Form**
- A form on the admin page to manually add a single bet: Person, Game Date/Time, Bet Description, Matchup, Bet Type, Odds, Wager, Potential Payout.
- Result defaults to "Pending". Profit/Loss auto-calculates on settle.
- *Acceptance criteria*:
  - [ ] Fill out the form, submit, and see the bet appear in the bet list
  - [ ] Submitting with missing required fields shows validation errors

**5.7 Edit / Delete Bets**
- Inline edit or edit-modal for any bet field from the admin view.
- Delete with confirmation dialog.
- *Acceptance criteria*:
  - [ ] Edit a bet's wager amount and see the change reflected in the list and scoreboard
  - [ ] Delete a bet and confirm it no longer appears anywhere

**5.8 Per-Person Detail View**
- Click a person's name on the leaderboard to see only their bets, with personal stats (total wagered, profit, win rate, best/worst bet).
- *Acceptance criteria*:
  - [ ] Clicking a name navigates to a filtered view showing only that person's bets
  - [ ] Personal stats at the top are accurate

**5.9 Responsive Mobile Layout**
- The table should be horizontally scrollable on small screens.
- The leaderboard should stack into card layout on mobile.
- Touch-friendly tap targets.

### Future Considerations (P2)

**5.10 Multiple Groups / Pools** — Create separate scoreboards with unique shareable links (e.g., `/pool/work-friends`). Design the database schema with a `group_id` or `pool_id` foreign key from the start so this is easy to add later.

**5.11 Live Score API Integration** — Connect to a sports data API (e.g., ESPN, The Odds API) to auto-settle bets. The bet model should include a `game_id` or `event_id` field (nullable) to support future matching.

**5.12 Image Upload / OCR Import** — Upload bet slip screenshots and extract bet details automatically using AI/OCR. Would eliminate manual data entry entirely.

**5.13 Historical Stats Across Seasons** — Track lifetime records, season-over-season trends, and all-time leaderboards. Requires adding a `season` or `event` field to the data model.

## 6. Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Import success rate | 100% of correctly-formatted files import without error | Manual testing during tournament |
| Time from spreadsheet to live scoreboard | < 2 minutes (upload + assign person + verify) | Timed during first real import |
| Friends actively checking the scoreboard | 3+ unique visitors per day during tournament | Vercel Analytics (free) |
| Bets settled within 1 hour of game ending | > 90% | Spot check Pending count vs. completed games |
| Nick's satisfaction | "I'd use this again next year" | Ask Nick after the Final Four |

## 7. Technical Constraints & Architecture

- **Framework**: Next.js (App Router) with TypeScript
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL via Supabase (free tier: 500MB, 2 projects)
- **ORM**: Prisma or Drizzle (pair well with Next.js + Supabase)
- **Hosting**: Vercel free tier
- **Spreadsheet parsing**: `xlsx` (SheetJS) npm package for parsing `.xlsx` uploads
- **No auth**: Admin routes at `/admin/*` are unlinked but accessible. Acceptable risk for a small friends-only app.

### Suggested Data Model

```
Person
  - id: uuid (PK)
  - name: string (unique)
  - created_at: timestamp

Bet
  - id: uuid (PK)
  - person_id: uuid (FK → Person)
  - type: enum (Straight, Parlay)
  - game_datetime: timestamp (nullable for futures)
  - description: string
  - matchup: string
  - bet_type: string (Game Spread, Moneyline, Total Points, etc.)
  - odds: string
  - wager: decimal
  - potential_payout: decimal
  - result: enum (Pending, Win, Loss)
  - profit_loss: decimal (computed: Win → payout - wager, Loss → -wager, Pending → 0)
  - created_at: timestamp
  - updated_at: timestamp
  - pool_id: uuid (FK → Pool, nullable) // P2: for future group support
  - event_id: string (nullable) // P2: for future live score matching

ParlayLeg (optional, for expandable parlay details)
  - id: uuid (PK)
  - bet_id: uuid (FK → Bet)
  - description: string
  - matchup: string
  - odds: string
  - result: enum (Pending, Win, Loss)
```

## 8. Open Questions

| # | Question | Owner | Blocking? |
|---|---|---|---|
| 1 | Should `profit_loss` be a computed column in the DB or calculated at query time? Computed is simpler; query-time is more flexible. | Engineering | No |
| 2 | Do we want Vercel Analytics (free) enabled from day one for tracking visitor counts? | Nick | No |
| 3 | Should the admin URL be something obscure (e.g., `/admin/[random-slug]`) or just `/admin`? | Nick | No |
| 4 | ~~How should parlay results work?~~ **RESOLVED**: Parlays are marked Win/Loss as a whole bet, not per-leg. This matches sportsbook behavior (all-or-nothing payout). The `ParlayLeg` table is display-only for the expandable UI — leg `result` field is informational, not used for settlement logic. | Nick | ~~Yes~~ Resolved |
| 5 | Do friends need to submit their own spreadsheets, or will Nick always handle imports? | Nick | No — affects whether an upload UI exists on the public side |

## 9. Timeline Considerations

- **Hard deadline**: The tournament starts March 19, 2026 (today). First Four games are already in progress.
- **Realistic target**: Get P0 features live within 1-2 days. The first weekend of games (March 20-21) is the ideal debut for the shared scoreboard.
- **Suggested phasing**:
  - **Day 1**: Database schema, spreadsheet import, bet list view, basic scoreboard. Deploy to Vercel.
  - **Day 2**: Filters/search/sort, result management (admin), leaderboard polish, share with friends.
  - **Week 1-2**: P1 features (add/edit/delete forms, per-person views, mobile polish) as the tournament progresses.
