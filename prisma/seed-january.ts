import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const results: any[] = [];
  
  // 1. Read the CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(__dirname, "../data/jan_data.csv"))
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found ${results.length} entries to process...`);

  console.log("🧹 Clearing previous legacy picks to avoid duplicates...");
  // 1. Find all legacy users first (optional, but good for logging)
  // 2. Delete all picks associated with IDs starting with "legacy_"
  // Note: We can't filter deleteMany on a relation easily in some Prisma versions,
  // so we delete based on the userId string pattern if your DB supports it, 
  // or we just rely on the specific legacy IDs we are about to process.
  
  const legacyIds = results
    .map(row => row.username ? `legacy_${row.username.trim()}` : null)
    .filter(Boolean);

  await prisma.pick.deleteMany({
    where: {
      userId: { in: legacyIds as string[] }
    }
  });
  console.log("✅ Cleaned up old picks. Starting fresh import...");
  // ---------------------

  const ENTRY_DATE = new Date("2026-01-18T09:15:00.000Z");

  for (const row of results) {
    const username = row.username?.trim();
    const rawSymbol = row.symbol?.trim().toUpperCase(); // e.g. "TATAMOTORS"
    const price = parseFloat(row.price);

    if (!username || !rawSymbol || isNaN(price)) {
      console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
      continue;
    }

    // 2. Generate a Temporary "Legacy" ID
    // We prefix it so we can easily identify these users later
    const legacyId = `legacy_${username}`;

    // 3. Create/Ensure the User exists (Lazy Create)
    // We use the username as the ID for now
    await prisma.user.upsert({
      where: { id: legacyId },
      update: {},
      create: {
        id: legacyId,
        username: username,
        // Mark these so we know they are imports
        avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png", 
      },
    });

    // 4. Resolve the Symbol (Assuming NSE preference)
    // You might need smarter logic here if you have mixed BSE/NSE in the sheet
    const symbolRecord = await prisma.symbol.findFirst({
        where: { baseSymbol: rawSymbol, active: true }
    });

    if (!symbolRecord) {
        console.error(`❌ Symbol not found for ${username}: ${rawSymbol}`);
        continue;
    }

    // 5. Create the Pick
    // We use upsert to prevent duplicates if you run this script twice
    await prisma.pick.create({
        data: {
            userId: legacyId,
            baseSymbol: symbolRecord.baseSymbol,
            exchange: symbolRecord.exchange,
            entryPrice: price,
            entryDate: ENTRY_DATE,
            active: true, // "Assume live"
        }
    });

    console.log(`✅ Imported: ${username} picked ${rawSymbol} @ ${price}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });