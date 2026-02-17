-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isExcluded" BOOLEAN NOT NULL DEFAULT false,
    "currentSeasonReturn" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentMonthlyReturn" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "previousMonthClose" DOUBLE PRECISION,

    CONSTRAINT "Pick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "openingPriceJan1" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LatestPrice" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seasonHigh" DOUBLE PRECISION,
    "seasonLow" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyClose" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MonthlyClose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemState" (
    "key" TEXT NOT NULL DEFAULT 'global',
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemState_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pick_userId_key" ON "Pick"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Benchmark_ticker_key" ON "Benchmark"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "LatestPrice_symbol_key" ON "LatestPrice"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyClose_symbol_date_key" ON "MonthlyClose"("symbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PriceHistory_symbol_date_key" ON "PriceHistory"("symbol", "date");

-- AddForeignKey
ALTER TABLE "Pick" ADD CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
