const { execSync } = require('child_process');
require('dotenv').config();

const isLive = process.env.TESTONLIVE === "1";
const target = isLive ? "PRODUCTION (NEON)" : "LOCAL POSTGRES";

console.log(`\n⚠️  WARNING: Resetting ${target} Database...`);

try {
  // Push schema (wipes data)
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  // Re-seed
  console.log("🌱 Seeding baseline data...");
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  
  console.log(`\n✅ ${target} reset successfully.\n`);
} catch (e) {
  console.error("\n❌ Reset failed:", e.message);
}