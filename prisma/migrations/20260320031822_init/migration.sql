-- CreateEnum
CREATE TYPE "BetType" AS ENUM ('Straight', 'Parlay');

-- CreateEnum
CREATE TYPE "BetResult" AS ENUM ('Pending', 'Win', 'Loss');

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tournaments" (
    "person_id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "bank" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "person_tournaments_pkey" PRIMARY KEY ("person_id","tournament_id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "type" "BetType" NOT NULL,
    "game_datetime" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "matchup" TEXT NOT NULL,
    "bet_type" TEXT NOT NULL,
    "odds" TEXT NOT NULL,
    "wager" DECIMAL(10,2) NOT NULL,
    "potential_payout" DECIMAL(10,2) NOT NULL,
    "result" "BetResult" NOT NULL DEFAULT 'Pending',
    "profit_loss" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parlay_legs" (
    "id" TEXT NOT NULL,
    "bet_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "matchup" TEXT NOT NULL,
    "odds" TEXT NOT NULL,
    "result" "BetResult" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "parlay_legs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "persons_name_key" ON "persons"("name");

-- CreateIndex
CREATE INDEX "person_tournaments_person_id_idx" ON "person_tournaments"("person_id");

-- CreateIndex
CREATE INDEX "person_tournaments_tournament_id_idx" ON "person_tournaments"("tournament_id");

-- CreateIndex
CREATE INDEX "bets_person_id_idx" ON "bets"("person_id");

-- CreateIndex
CREATE INDEX "bets_tournament_id_idx" ON "bets"("tournament_id");

-- CreateIndex
CREATE INDEX "bets_result_idx" ON "bets"("result");

-- CreateIndex
CREATE INDEX "bets_type_idx" ON "bets"("type");

-- CreateIndex
CREATE INDEX "parlay_legs_bet_id_idx" ON "parlay_legs"("bet_id");

-- AddForeignKey
ALTER TABLE "person_tournaments" ADD CONSTRAINT "person_tournaments_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_tournaments" ADD CONSTRAINT "person_tournaments_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parlay_legs" ADD CONSTRAINT "parlay_legs_bet_id_fkey" FOREIGN KEY ("bet_id") REFERENCES "bets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
