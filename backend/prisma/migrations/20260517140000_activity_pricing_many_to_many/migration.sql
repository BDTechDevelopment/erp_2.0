-- Drop old FK and column from Activity
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_pricingId_fkey";
ALTER TABLE "Activity" DROP COLUMN IF EXISTS "pricingId";

-- Create junction table ActivityPricing
CREATE TABLE "ActivityPricing" (
    "activityId" TEXT NOT NULL,
    "pricingId"  TEXT NOT NULL,
    CONSTRAINT "ActivityPricing_pkey" PRIMARY KEY ("activityId", "pricingId")
);

ALTER TABLE "ActivityPricing" ADD CONSTRAINT "ActivityPricing_activityId_fkey"
    FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ActivityPricing" ADD CONSTRAINT "ActivityPricing_pricingId_fkey"
    FOREIGN KEY ("pricingId") REFERENCES "Pricing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
