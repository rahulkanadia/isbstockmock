import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DATA_DIR = path.resolve(__dirname, "../data");

type Row = Record<string, string>;

async function readCSV(file: string): Promise<Row[]> {
  const rows: Row[] = [];
  const fullPath = path.join(DATA_DIR, file);

  if (!fs.existsSync(fullPath)) {
    console.warn(`CSV not found: ${fullPath}`);
    return [];
  }

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(fullPath)
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
        })
      )
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  return rows;
}

async function seedBSE() {
  const rows = await readCSV("bse.csv");
  console.log(`Parsed BSE: ${rows.length} rows`);

  const data = rows
    .map((r) => {
      const baseSymbol = r["security id"]?.trim().toUpperCase();
      const name = r["security name"]?.trim();
      if (!baseSymbol || !name) return null;

      return {
        baseSymbol,
        exchange: "BSE",
        name,
        active: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (data.length > 0) {
    // createMany is much faster than upsert in loop
    await prisma.symbol.createMany({
      data,
      skipDuplicates: true,
    });
  }

  console.log(`BSE: Inserted/Checked ${data.length} symbols`);
}

async function seedNSE() {
  const rows = await readCSV("nse.csv");
  console.log(`Parsed NSE: ${rows.length} rows`);

  const data = rows
    .map((r) => {
      const baseSymbol = r["scrip id"]?.trim().toUpperCase();
      const name = r["scrip name"]?.trim();
      if (!baseSymbol || !name) return null;

      return {
        baseSymbol,
        exchange: "NSE",
        name,
        active: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (data.length > 0) {
    await prisma.symbol.createMany({
      data,
      skipDuplicates: true,
    });
  }

  console.log(`NSE: Inserted/Checked ${data.length} symbols`);
}

async function seedSME() {
  const rows = await readCSV("sme.csv");
  console.log(`Parsed SME: ${rows.length} rows`);

  const data = rows
    .map((r) => {
      const baseSymbol = r["scrip id"]?.trim().toUpperCase();
      const name = r["scrip name"]?.trim();
      if (!baseSymbol || !name) return null;

      return {
        baseSymbol,
        exchange: "NSE_SME",
        name,
        active: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (data.length > 0) {
    await prisma.symbol.createMany({
      data,
      skipDuplicates: true,
    });
  }

  console.log(`NSE_SME: Inserted/Checked ${data.length} symbols`);
}

async function main() {
  console.log("Starting Optimized Seed...");
  
  await seedBSE();
  await seedNSE();
  await seedSME();

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });