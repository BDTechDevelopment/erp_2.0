CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "companyName" TEXT NOT NULL DEFAULT 'ERP System',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0d6efd',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
