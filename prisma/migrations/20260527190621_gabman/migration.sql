-- CreateEnum
CREATE TYPE "QuestionRound" AS ENUM ('QUALIFS', 'COMPET', 'FINALE');

-- CreateEnum
CREATE TYPE "AnswerMode" AS ENUM ('CASH', 'DUO', 'CARRE');

-- CreateEnum
CREATE TYPE "GameRound" AS ENUM ('QUALIFS', 'COMPET', 'FINALE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SETUP', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "CompetWave" AS ENUM ('DUO', 'CARRE', 'CASH', 'INDIVIDUAL');

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "round" "QuestionRound" NOT NULL,
    "answerMode" "AnswerMode" NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "options" TEXT[],
    "theme" TEXT,
    "qualifSlot" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SETUP',
    "currentRound" "GameRound" NOT NULL DEFAULT 'QUALIFS',
    "championName" TEXT,
    "competTheme" TEXT,
    "currentQuestionId" TEXT,
    "displayMode" "AnswerMode",
    "revealAnswer" BOOLEAN NOT NULL DEFAULT false,
    "qualifQuestionSlot" INTEGER,
    "competWave" "CompetWave",
    "finaleHidden" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "orderIndex" INTEGER NOT NULL,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "isChampion" BOOLEAN NOT NULL DEFAULT false,
    "eliminated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerResponse" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "questionId" TEXT,
    "round" "GameRound" NOT NULL,
    "answerMode" "AnswerMode" NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GamePlayer" ADD CONSTRAINT "GamePlayer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResponse" ADD CONSTRAINT "PlayerResponse_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerResponse" ADD CONSTRAINT "PlayerResponse_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
