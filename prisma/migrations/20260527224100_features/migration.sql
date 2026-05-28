-- AlterTable: historique des réponses
ALTER TABLE "PlayerResponse" ADD COLUMN IF NOT EXISTS "competIndividual" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum: questions musicales
DO $$ BEGIN
  CREATE TYPE "QuestionKind" AS ENUM ('TEXT', 'MUSICAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: questions musicales
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "kind" "QuestionKind" NOT NULL DEFAULT 'TEXT';
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "youtubeUrl" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "youtubeStartSeconds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: contrôle lecture YouTube
ALTER TABLE "GameSession" ADD COLUMN IF NOT EXISTS "musicPlayNonce" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "GameSession" ADD COLUMN IF NOT EXISTS "musicStopNonce" INTEGER NOT NULL DEFAULT 0;
