-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM (
    'TRIAL',
    'ACTIVE',
    'EXPIRED',
    'CANCELED',
    'UNLIMITED'
);

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "email" TEXT,
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "trialStartedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");