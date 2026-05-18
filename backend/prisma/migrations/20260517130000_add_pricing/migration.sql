-- CreateTable Pricing
CREATE TABLE "Pricing" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey Pricing -> User
ALTER TABLE "Pricing" ADD CONSTRAINT "Pricing_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Activity: add price and pricingId
ALTER TABLE "Activity" ADD COLUMN "price" DOUBLE PRECISION;
ALTER TABLE "Activity" ADD COLUMN "pricingId" TEXT;

-- AddForeignKey Activity -> Pricing
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_pricingId_fkey"
    FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
