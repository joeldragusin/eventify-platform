-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_ticketId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "ticketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
