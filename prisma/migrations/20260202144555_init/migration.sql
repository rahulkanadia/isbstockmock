-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Symbol" (
    "id" TEXT NOT NULL,
    "baseSymbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Symbol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseSymbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitDate" TIMESTAMP(3),
    "exitPrice" DOUBLE PRECISION,
    "pnlPercent" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MonthlyChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyPrice" (
    "id" TEXT NOT NULL,
    "baseSymbol" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DailyPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_baseSymbol_exchange_key" ON "public"."Symbol"("baseSymbol", "exchange");

-- CreateIndex
CREATE INDEX "Pick_baseSymbol_exchange_idx" ON "public"."Pick"("baseSymbol", "exchange");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyChange_userId_yearMonth_key" ON "public"."MonthlyChange"("userId", "yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPrice_baseSymbol_exchange_date_key" ON "public"."DailyPrice"("baseSymbol", "exchange", "date");

-- AddForeignKey
ALTER TABLE "public"."Pick" ADD CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
