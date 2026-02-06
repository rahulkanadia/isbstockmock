import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// 1. BENCHMARK DATA
// ------------------------------------------------------------------
const benchmarks = [
  { ticker: '^NSEI', name: 'Nifty50', openingPriceJan1: 26173.30 },
  { ticker: '^BSESN', name: 'Sensex', openingPriceJan1: 85255.55 },
  { ticker: '^NSMIDCP', name: 'NiftyNext50', openingPriceJan1: 69523.15 },
  { ticker: 'NIFTY_MID_SELECT.NS', name: 'NiftyMidCap', openingPriceJan1: 13809.85 },
  { ticker: '^CNXSC', name: 'NiftySmallCap100', openingPriceJan1: 17745.8 },
  { ticker: 'BTC-USD', name: 'BTC', openingPriceJan1: 87508.05 },
];

// ------------------------------------------------------------------
// 2. USER DATA (Legacy)
// ------------------------------------------------------------------
const legacyData = [
  { username: "_the_strangler_", symbol: "UFBL.NS", price: 191.15 },
  { username: ".rathi", symbol: "DECNGOLD.BO", price: 113.00 },
  { username: "bruhaspathi", symbol: "SKMEGGPROD.NS", price: 160.25 },
  { username: "dukemyboy", symbol: "SYRMA.NS", price: 708.00 },
  { username: "abhishek260898", symbol: "RMDRIP.NS", price: 94.82 },
  { username: "Zoom", symbol: "ADVAIT.NS", price: 1365.00 },
  { username: "stumbledcorn", symbol: "PFC.NS", price: 374.00 },
  { username: "rama.krishna", symbol: "ASHOKLEY.NS", price: 183.10 },
  { username: "noobgamer_911", symbol: "LGEINDIA.NS", price: 1387.00 },
  { username: "noisyboy2066", symbol: "INFOBEAN.NS", price: 789.70 },
  { username: "madmaxpunkyt", symbol: "MODINSU.BO", price: 201.60 },
  { username: "dhruvehe", symbol: "MANORAMA.NS", price: 1280.00 },
  { username: "neo_was_here", symbol: "ABDL.NS", price: 473.00 },
  { username: "alex.io", symbol: "RELIABLE.NS", price: 153.99 },
  { username: "sam_322", symbol: "PRIVISCL.NS", price: 2635.05 },
  { username: "_.j0jo._", symbol: "AUTOAXLES.NS", price: 1964.00 },
  { username: "haanmehihu", symbol: "PANCARBON.BO", price: 485.40 },
  { username: "shamelesssteel", symbol: "HINDCOPPER.NS", price: 570.00 },
  { username: "oldtimer6674", symbol: "SARDAEN.NS", price: 488.20 },
  { username: "mr_noob.111", symbol: "RACLGEAR.NS", price: 1015.00 },
  { username: "Koru", symbol: "VPRPL.NS", price: 45.95 },
  { username: "dilsepaneer.", symbol: "PENIND.NS", price: 173.25 },
  { username: "demiii", symbol: "POLYCAB.NS", price: 7182.50 },
  { username: "toplesstrader", symbol: "DRREDDY.NS", price: 1170.00 },
  { username: "bran.24", symbol: "IDEA.NS", price: 10.82 },
  { username: "911326", symbol: "KAYNES.NS", price: 3612.00 },
  { username: "pika_1608", symbol: "TATASTEEL.NS", price: 187.10 },
  { username: "sentoph_poli", symbol: "ICICIAMC.NS", price: 2937.00 },
  { username: "prashanths", symbol: "MCX.NS", price: 2455.00 },
  { username: "thatbtctrader", symbol: "NMDC.NS", price: 82.74 },
  { username: "batman_30775", symbol: "BSE.NS", price: 2800.00 },
  { username: "dividerprime", symbol: "HINDALCO.NS", price: 938.50 },
  { username: "spice_01", symbol: "NATIONALUM.NS", price: 363.00 },
  { username: "finvasiauser", symbol: "GEECEE.NS", price: 306.10 },
  { username: "hamstero.", symbol: "ADANIENT.NS", price: 2155.00 },
  { username: "Billu_sanda", symbol: "SBIN.NS", price: 1035.00 },
  { username: "wuod", symbol: "JAMNAAUTO.NS", price: 126.61 },
  { username: "flamingnostrils", symbol: "INTERARCH.NS", price: 2045.00 },
  { username: "_.KRYPTON._", symbol: "BHEL.NS", price: 265.40 },
  { username: "fuzzyog", symbol: "BSOFT.NS", price: 430.95 },
  { username: "hashcrack", symbol: "APOLLO.NS", price: 244.65 },
  { username: "maythydelusionschipandshatter", symbol: "CONCOR.NS", price: 518.00 },
  { username: "humanstupidityuniverse", symbol: "SUMMITSEC.NS", price: 1774.00 },
  { username: "navalravikantfan", symbol: "ZENTEC.NS", price: 1327.90 },
  { username: "rot_12", symbol: "VEDL.NS", price: 684.95 },
  { username: "butter0973", symbol: "LALPATHLAB.NS", price: 1397.90 },
  { username: "kr0nik", symbol: "RELIANCE.NS", price: 1450.60 },
  { username: "turncoat_.", symbol: "SAKAR.NS", price: 408.90 },
  { username: "tehelca_omlet", symbol: "MAZDOCK.NS", price: 2431.00 },
  { username: "scig", symbol: "LUPIN.NS", price: 2205.00 },
  { username: "brownbobdowney", symbol: "EICHERMOT.NS", price: 7300.00 },
  { username: "dirigible1796", symbol: "WOCKPHARMA.NS", price: 1419.20 },
  { username: "shockabsorber", symbol: "RBLBANK.NS", price: 309.00 },
  { username: "keshgawd", symbol: "VALIANTORG.NS", price: 248.10 },
  { username: "jassi_oye", symbol: "PTCIL.NS", price: 17968.00 },
  { username: "utpalluthra", symbol: "GUJTLRM.BO", price: 0.71 },
  { username: "rahulshrivastav0223", symbol: "HINDZINC.NS", price: 650.00 },
  { username: "schnitzeldinger", symbol: "ERIS.NS", price: 1447.00 },
  { username: "trader3156", symbol: "TEGA.NS", price: 1860.00 },
  { username: "sudden_sax", symbol: "TARIL.NS", price: 260.30 },
  { username: "fraywolfcandy", symbol: "FORCEMOT.NS", price: 20500.00 },
  { username: "gallactus0934", symbol: "PATELENG.NS", price: 30.00 },
  { username: "eren0001000", symbol: "360ONE.NS", price: 1193.90 },
  { username: "slacktalk", symbol: "TATACONSUM.NS", price: 1180.20 },
  { username: "sarge_q3", symbol: "JAIBALAJI.NS", price: 72.00 },
  { username: "red_is_here", symbol: "IOB.NS", price: 36.05 },
  { username: "ybsyour", symbol: "AURUM.NS", price: 189.00 },
  { username: "ron.cho", symbol: "GROWW.NS", price: 173.20 },
  { username: "tessractism", symbol: "HONAUT.NS", price: 33965.00 },
  { username: "lidi_ok", symbol: "ZAGGLE.NS", price: 309.00 },
  { username: "chonky", symbol: "EMMVEE.NS", price: 214.31 },
  { username: "confused_cloud_0051", symbol: "MCL.NS", price: 82.23 },
  { username: "warrenbuffett7601", symbol: "MANKIND.NS", price: 2170.00 },
  { username: "AdaniHodler", symbol: "JIOFIN.NS", price: 279.40 },
  { username: "takeshicastlenoton", symbol: "SHAILY.NS", price: 2156.80 },
  { username: "krazy9964", symbol: "CMSINFO.NS", price: 331.00 },
  { username: "el_tiburon_vbvc", symbol: "BATAINDIA.NS", price: 902.00 },
  { username: "bmcfsu", symbol: "CIPLA.NS", price: 1396.50 },
  { username: "harbenand", symbol: "ITC.NS", price: 330.00 },
  { username: "stovegodcookz", symbol: "TCS.NS", price: 3188.00 },
  { username: "clayface", symbol: "POCL.NS", price: 1394.10 },
  { username: "Sidart", symbol: "CUPID.NS", price: 459.95 },
  { username: "adorable_moose_23545", symbol: "SONATSOFTW.NS", price: 339.05 },
  { username: "wintermonkey2", symbol: "KEC.NS", price: 681.00 },
  { username: "responsibilityrepellant", symbol: "ENGINERSIN.NS", price: 191.01 },
  { username: "ms.hello_kitty", symbol: "PHOENIXLTD.NS", price: 1848.80 },
  { username: "gammaneutral", symbol: "ASHAPURMIN.NS", price: 801.20 },
  { username: "thepapaelon", symbol: "CIANAGRO.BO", price: 1400.35 },
  { username: "Boombust", symbol: "GODFRYPHLP.NS", price: 2240.00 },
  { username: "jonnycash9689", symbol: "AGI.NS", price: 670.00 },
  { username: "moonrays1", symbol: "SAGILITY.NS", price: 53.09 },
  { username: "Saxx", symbol: "GODREJPROP.NS", price: 1889.00 },
  { username: "oungabunga", symbol: "STALLION.NS", price: 210.01 },
  { username: "boombust_jr.", symbol: "SABTNL.NS", price: 2045.00 },
  { username: "c.men.", symbol: "EPIGRAL.NS", price: 1158.30 },
  { username: "mero__vingian", symbol: "NETWEB.NS", price: 3710.00 },
  { username: "robustwarrbotics", symbol: "BLUEJET.NS", price: 479.00 },
  { username: "dippamdappam", symbol: "INDIGOPNTS.NS", price: 1216.20 },
  { username: "pasha6969", symbol: "CSBBANK.NS", price: 503.00 },
  { username: "supereconomics", symbol: "KALYANKJIL.NS", price: 468.00 },
  { username: "ram_bhakt_respect", symbol: "REGANTO.BO", price: 14.92 },
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Seed Benchmarks
  for (const b of benchmarks) {
    await prisma.benchmark.upsert({
      where: { ticker: b.ticker },
      update: { 
        openingPriceJan1: b.openingPriceJan1,
        name: b.name
      },
      create: b,
    });
    console.log(`Updated Benchmark: ${b.name}`);
  }

  // 2. Seed Legacy Users
  console.log(`Processing ${legacyData.length} legacy users...`);
  const ENTRY_DATE = new Date('2026-01-18T00:00:00Z');

  for (const u of legacyData) {
    const legacyId = `legacy_${u.username.toLowerCase().trim()}`;
    
    await prisma.user.upsert({
      where: { id: legacyId },
      update: {}, 
      create: {
        id: legacyId,
        username: u.username.trim(), 
        avatarUrl: '/avatars/default.png',
        isExcluded: false,
      },
    });

    // We assume current price is Entry Price for the initial seed
    // We also set 'previousMonthClose' to Entry Price so Monthly % starts at 0
    await prisma.pick.upsert({
      where: { userId: legacyId },
      update: {
        symbol: u.symbol.trim(),
        entryPrice: u.price,
        entryDate: ENTRY_DATE,
        previousMonthClose: u.price, // Initialize as entry price
      },
      create: {
        userId: legacyId,
        symbol: u.symbol.trim(),
        entryPrice: u.price,
        entryDate: ENTRY_DATE,
        previousMonthClose: u.price,
      },
    });
    
    // Seed LatestPrice with High/Low values (initialized to entry price)
    await prisma.latestPrice.upsert({
        where: { symbol: u.symbol.trim() },
        update: {
            price: u.price,
            seasonHigh: u.price,
            seasonLow: u.price
        },
        create: {
            symbol: u.symbol.trim(),
            price: u.price,
            seasonHigh: u.price,
            seasonLow: u.price
        }
    });
  }
  
  // Seed LatestPrice for Benchmarks too
  for (const b of benchmarks) {
      await prisma.latestPrice.upsert({
        where: { symbol: b.ticker },
        update: {
            price: b.openingPriceJan1,
            seasonHigh: b.openingPriceJan1,
            seasonLow: b.openingPriceJan1
        },
        create: {
            symbol: b.ticker,
            price: b.openingPriceJan1,
            seasonHigh: b.openingPriceJan1,
            seasonLow: b.openingPriceJan1
        }
      });
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });