import { PrismaClient } from "@prisma/client";
import YahooFinance from "yahoo-finance2";
import * as fs from "fs/promises";
import * as path from "path";

const prisma = new PrismaClient();

// Why: The crucial v3 fix. Properly instantiating the class.
const yahooFinance = new YahooFinance();
// [11]

const BATCH_SIZE = 1; 
const DELAY_MS = 2000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function isValidSymbol(symbol: string): Promise<boolean> {
  try {
    const quote = await yahooFinance.quote(symbol) as any;
// [21]
    return quote && typeof quote.regularMarketPrice === 'number';
  } catch (error: any) {
    const errorMsg = error.message || String(error);

    if (errorMsg.includes("429") || errorMsg.includes("Too Many Requests")) {
       console.error(`\n:rotating_light: FATAL: Rate Limited by Yahoo Finance (HTTP 429).`);
       process.exit(1); 
    }
    if (errorMsg.includes("crumb")) {
// [31]
       console.error(`\n:rotating_light: FATAL: Yahoo Finance Crumb/Cookie Auth Error.`);
       process.exit(1);
    }

    console.log(`:warning: API Error for ${symbol}: ${errorMsg.split('\n')[0]}`);
    return false;
  }
}

// [41]
async function runSanitization() {
  console.log(":rocket: Starting Throttled Symbol Validation (v3 Engine)...");

  const outputPath = path.join(process.cwd(), "validated-symbols.txt");

  try {
    await fs.unlink(outputPath);
    console.log(":broom: Cleared old validated-symbols.txt file.");
  } catch (error: any) {
// [51]
    if (error.code !== 'ENOENT') {
      console.error("Notice: Could not delete old file.");
    }
  }

  const picks = await prisma.pick.findMany({
    select: { symbol: true },
    distinct: ['symbol'],
  });
// [61]

  const uniqueSymbols = picks.map((p) => p.symbol);
  console.log(`:bar_chart: Validating ${uniqueSymbols.length} symbols...`);

  const results: string[] = [];
  results.push("--- VALIDATED SYMBOL MAPPINGS ---");
  results.push(`Generated: ${new Date().toISOString()}\n`);

  for (let i = 0; i < uniqueSymbols.length; i += BATCH_SIZE) {
// [71]
    const batch = uniqueSymbols.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (originalSymbol) => {
      const baseSymbol = originalSymbol.split('.')[0].toUpperCase();
      let finalSymbol: string | null = null;

      if (await isValidSymbol(`${baseSymbol}.NS`)) {
        finalSymbol = `${baseSymbol}.NS`;
      } else if (await isValidSymbol(`${baseSymbol}.BO`)) {
// [81]
        finalSymbol = `${baseSymbol}.BO`;
      }

      if (finalSymbol) {
        console.log(`:white_check_mark: MATCH: ${originalSymbol} -> ${finalSymbol}`);
        return `${originalSymbol},${finalSymbol},${baseSymbol}`;
      } else {
        console.log(`:x: FAILED: ${originalSymbol} (No data found)`);
        return `${originalSymbol},UNKNOWN,${baseSymbol}`;
// [91]
      }
    });

    const resolvedBatch = await Promise.all(batchPromises);
    results.push(...resolvedBatch);

    if (i + BATCH_SIZE < uniqueSymbols.length) {
      await delay(DELAY_MS);
    }
// [101]
  }

  await fs.writeFile(outputPath, results.join("\n"), "utf-8");

  console.log(`\n🎉 Validation complete! Output saved to: ${outputPath}`);
  await prisma.$disconnect();
}

runSanitization().catch((e) => {
// [111]
  console.error("Fatal Script Error:", e);
  prisma.$disconnect();
  process.exit(1);
});