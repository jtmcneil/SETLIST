-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "caption" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "media" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[];
