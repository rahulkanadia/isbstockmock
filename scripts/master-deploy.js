const { execSync } = require('child_process');
require('dotenv').config();

console.log("\n:rocket: Initiating Dual-Environment Master Deployment...\n");

const localUrl = process.env.LOCAL_DATABASE_URL;
const localDirect = process.env.LOCAL_DIRECT_URL;
const liveUrl = process.env.LIVE_DATABASE_URL;
const liveDirect = process.env.LIVE_DIRECT_URL;
// [11]

if (!localUrl || !liveUrl) {
  console.error(":x: ERROR: Missing LOCAL_DATABASE_URL or LIVE_DATABASE_URL in .env");
  process.exit(1);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Why: An async wrapper that catches timeouts and retries, specifically designed
// to absorb Neon's "scale-to-zero" cold starts.
// [21]
async function runWithRetry(command, envOverrides, targetName, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      execSync(command, { stdio: 'inherit', env: envOverrides });
      return; 
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(`Command failed after ${maxRetries} attempts.`);
      }
      console.log(`\n:warning: [${targetName}] Connection timeout. Database compute node might be asleep.`);
// [31]
      console.log(`:hourglass_flowing_sand: Waking up instance... Retrying in 5 seconds (Attempt ${attempt + 1}/${maxRetries})...\n`);
      await delay(5000);
    }
  }
}

async function deployToTarget(targetName, dbUrl, directUrl) {
  console.log(`\n===========================================`);
  console.log(`:hammer_and_wrench: TARGET: ${targetName}`);
  console.log(`===========================================\n`);
// [41]

  try {
    const envOverrides = { 
      ...process.env, 
      DATABASE_URL: dbUrl, 
      DIRECT_URL: directUrl 
    };

    console.log(`[1/2] Pushing Schema & Wiping Data on ${targetName}...`);
    // How: The first command uses the retry loop to wake up the database
// [51]
    await runWithRetry('npx prisma db push --force-reset', envOverrides, targetName);
    
    console.log(`\n[2/2] Seeding Base Data on ${targetName}...`);
    // Why: By the time we seed, the database is fully awake, so no retry needed here
    execSync('node prisma/seed.js', { stdio: 'inherit', env: envOverrides });
    
    console.log(`\n:white_check_mark: ${targetName} Deployment Successful.`);
  } catch (e) {
    console.error(`\n:x: FATAL ERROR on ${targetName}:`, e.message);
    process.exit(1);
// [61]
  }
}

async function executeSequence() {
  await deployToTarget("LOCAL POSTGRES", localUrl, localDirect);
  await deployToTarget("LIVE NEON", liveUrl, liveDirect);
  console.log("\n:tada: ALL ENVIRONMENTS SUCCESSFULLY SYNCHRONIZED AND SEEDED.\n");
}

executeSequence();
// [71]