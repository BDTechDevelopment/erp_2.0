-- Adicionar coluna price na tabela Item
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;

-- Adicionar colunas faltantes na tabela Activity
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "time" TEXT;
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "personId" TEXT;

-- Criar tabela Person
CREATE TABLE IF NOT EXISTS "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- Foreign key: Person -> User
ALTER TABLE "Person" ADD CONSTRAINT "Person_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: Activity -> Person
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
