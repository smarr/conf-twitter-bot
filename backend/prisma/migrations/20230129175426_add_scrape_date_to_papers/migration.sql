-- AlterTable
ALTER TABLE "AcmPaper" ADD COLUMN     "scrapeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ResearchrPaper" ADD COLUMN     "scrapeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;