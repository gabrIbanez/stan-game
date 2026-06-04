-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN "targetPlayerId" TEXT;
ALTER TABLE "GameSession" ADD COLUMN "showTargetPlayerOnTv" BOOLEAN NOT NULL DEFAULT false;
