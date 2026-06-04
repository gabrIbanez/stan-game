-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN "registrationsOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "GameSession" ADD COLUMN "showJoinQrOnScreen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GamePlayer" ADD COLUMN "joinedViaQr" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN "sessionId" TEXT;
ALTER TABLE "Question" ADD COLUMN "contributorPlayerId" TEXT;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_contributorPlayerId_fkey" FOREIGN KEY ("contributorPlayerId") REFERENCES "GamePlayer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
