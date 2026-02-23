// [1]
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// IST dates
const USER_ENTRY_DATE = new Date("2026-01-16T16:00:00+05:30");
const JANUARY_CLOSE_DATE = new Date("2026-01-31T16:00:00+05:30");

// ================= MARKET DATA =================
// [11]

const marketData = [
    {symbol: "^NSEI",janOpen: 26173.3,janClose: 25320.65,high: 26373.2,low: 24571.75},
    {symbol: "^BSESN",janOpen: 85255.55,janClose: 82269.78,high: 85883.5,low: 79899.42},
    {symbol: "^CNXSC",janOpen: 17745.8,janClose: 16879.1,high: 18000.65,low: 16136.9},
    {symbol: "^NSMIDCP",janOpen: 69823.65,janClose: 67839.85,high: 70833.65,low: 65300.05},
    {symbol: "NIFTY_MID_SELECT.NS",janOpen: 13809.85,janClose: 13400.05,high: 14080.25,low: 12795.55},
    {symbol: "BTC-USD",janOpen: 87508.05,janClose: 84128.66,high: 97860.6,low: 60074.8},
// [21]
    {symbol: "RACLGEAR.NS",janOpen: 1121,janClose: 1012.4,high: 1190,low: 921.8},
    {symbol: "LGEINDIA.NS",janOpen: 1523.9,janClose: 1462.6,high: 1534,low: 1325.5},
    {symbol: "PRIVISCL.NS",janOpen: 2811.9,janClose: 2812.7,high: 2915,low: 2570.8},
    {symbol: "PFC.NS",janOpen: 358.9,janClose: 379.35,high: 420.4,low: 351.4},
    {symbol: "VPRPL.NS",janOpen: 52.9,janClose: 44.35,high: 54.4,low: 42.6},
    {symbol: "MANORAMA.NS",janOpen: 1325.1,janClose: 1350.7,high: 1438.9,low: 1060.6},
    {symbol: "HINDCOPPER.NS",janOpen: 521.5,janClose: 685.9,high: 760.05,low: 511.3},
// [31]
    {symbol: "RELIABLE.NS",janOpen: 152,janClose: 162.49,high: 175,low: 139},
    {symbol: "AUTOAXLES.NS",janOpen: 1892.3,janClose: 1873.7,high: 2115,low: 1818.1},
    {symbol: "IDEA.NS",janOpen: 11.2,janClose: 11.17,high: 12.52,low: 9.68},
    {symbol: "ICICIAMC.NS",janOpen: 2660,janClose: 2972.6,high: 3131,low: 2587},
    {symbol: "KAYNES.NS",janOpen: 4023.5,janClose: 3475.4,high: 4107.4,low: 3294.9},
    {symbol: "PANCARBON.BO",janOpen: 491.85,janClose: 476.9,high: 525.6,low: 468.55},
    {symbol: "TATASTEEL.NS",janOpen: 180.6,janClose: 193.13,high: 202.99,low: 177.33},
// [41]
    {symbol: "POLYCAB.NS",janOpen: 7615,janClose: 7013.5,high: 7948,low: 6663},
    {symbol: "GEECEE.NS",janOpen: 321.1,janClose: 308.55,high: 327,low: 297.9},
    {symbol: "DRREDDY.NS",janOpen: 1270,janClose: 1218.1,high: 1270,low: 1148.4},
    {symbol: "NMDC.NS",janOpen: 83.17,janClose: 81.21,high: 86.72,low: 76.05},
    {symbol: "NATIONALUM.NS",janOpen: 315.5,janClose: 385.45,high: 431.5,low: 312.1},
    {symbol: "JAMNAAUTO.NS",janOpen: 127,janClose: 124.36,high: 138.5,low: 113.72},
    {symbol: "MCX.NS",janOpen: 2232,janClose: 2528,high: 2705,low: 2125.5},
// [51]
    {symbol: "ADANIENT.NS",janOpen: 2249,janClose: 2020.4,high: 2303.9,low: 1848},
    {symbol: "SBIN.NS",janOpen: 983.2,janClose: 1077.15,high: 1089.8,low: 980.35},
    {symbol: "HINDALCO.NS",janOpen: 888.1,janClose: 962.6,high: 1029.8,low: 882.45},
    {symbol: "APOLLO.NS",janOpen: 271.9,janClose: 260.75,high: 280,low: 218},
    {symbol: "INTERARCH.NS",janOpen: 2333.2,janClose: 1969.8,high: 2345.5,low: 1850.6},
    {symbol: "ZENTEC.NS",janOpen: 1372.6,janClose: 1415.6,high: 1420,low: 1223},
    {symbol: "BHEL.NS",janOpen: 288.5,janClose: 262.7,high: 305.9,low: 240.5},
// [61]
    {symbol: "SUMMITSEC.NS",janOpen: 1933,janClose: 1768.3,high: 1961.5,low: 1641.2},
    {symbol: "LALPATHLAB.NS",janOpen: 1483.3,janClose: 1409.5,high: 1520,low: 1345.2},
    {symbol: "SAKAR.NS",janOpen: 409.7,janClose: 391.1,high: 465,low: 361},
    {symbol: "VEDL.NS",janOpen: 603,janClose: 681.55,high: 769.8,low: 595},
    {symbol: "LUPIN.NS",janOpen: 2114,janClose: 2152.8,high: 2244.5,low: 2073.6},
    {symbol: "CONCOR.NS",janOpen: 527.55,janClose: 502.25,high: 538.95,low: 472.75},
    {symbol: "WOCKPHARMA.NS",janOpen: 1438,janClose: 1382.2,high: 1529,low: 1275},
// [71]
    {symbol: "RELIANCE.NS",janOpen: 1573.7,janClose: 1395.4,high: 1611.8,low: 1335.5},
    {symbol: "EICHERMOT.NS",janOpen: 7317,janClose: 7122.5,high: 7613.5,low: 6738},
    {symbol: "PTCIL.NS",janOpen: 18566,janClose: 18058,high: 18600,low: 17062},
    {symbol: "RBLBANK.NS",janOpen: 313.95,janClose: 298.75,high: 328.45,low: 287.2},
    {symbol: "VALIANTORG.NS",janOpen: 277.3,janClose: 240.9,high: 285.4,low: 226},
    {symbol: "TARIL.NS",janOpen: 288,janClose: 236.15,high: 343.7,low: 224.05},
    {symbol: "ERIS.NS",janOpen: 1517,janClose: 1375.5,high: 1563,low: 1301.2},
// [81]
    {symbol: "TEGA.NS",janOpen: 1953,janClose: 1702.5,high: 1977.5,low: 1646.7},
    {symbol: "360ONE.NS",janOpen: 1198,janClose: 1134.3,high: 1236.2,low: 1025.1},
    {symbol: "ZAGGLE.NS",janOpen: 353,janClose: 283.4,high: 357.8,low: 265.8},
    {symbol: "GUJTLRM.BO",janOpen: 0.75,janClose: 0.63,high: 0.76,low: 0.59},
    {symbol: "FORCEMOT.NS",janOpen: 20695,janClose: 19195,high: 22200,low: 18130},
    {symbol: "AURUM.NS",janOpen: 185.1,janClose: 177.59,high: 209.8,low: 171.72},
    {symbol: "IOB.NS",janOpen: 36,janClose: 35.63,high: 38.02,low: 33.53},
// [91]
    {symbol: "PATELENG.NS",janOpen: 28.9,janClose: 28.53,high: 31.11,low: 26.2},
    {symbol: "MCL.NS",janOpen: 74.5,janClose: 85.94,high: 93.2,low: 67.5},
    {symbol: "JAIBALAJI.NS",janOpen: 72.49,janClose: 67.83,high: 79.79,low: 64},
    {symbol: "EMMVEE.NS",janOpen: 192,janClose: 191.67,high: 229.3,low: 181.35},
    {symbol: "TATACONSUM.NS",janOpen: 1192,janClose: 1133.9,high: 1220.9,low: 1084},
    {symbol: "MANKIND.NS",janOpen: 2202,janClose: 2124,high: 2320.9,low: 2033},
    {symbol: "JIOFIN.NS",janOpen: 295.4,janClose: 254.5,high: 306,low: 237},
// [101]
    {symbol: "ITC.NS",janOpen: 402.7,janClose: 322.15,high: 402.7,low: 302},
    {symbol: "CIPLA.NS",janOpen: 1512,janClose: 1324,high: 1539.7,low: 1281.7},
    {symbol: "GROWW.NS",janOpen: 156.23,janClose: 177.04,high: 184.5,low: 152.62},
    {symbol: "ADVAIT.NS",janOpen: 1472.4,janClose: 1504.3,high: 1685,low: 1351},
    {symbol: "CMSINFO.NS",janOpen: 342.4,janClose: 315.35,high: 365,low: 311.7},
    {symbol: "SHAILY.NS",janOpen: 2320,janClose: 1913.7,high: 2344.5,low: 1784},
    {symbol: "SARDAEN.NS",janOpen: 520.95,janClose: 489.8,high: 538,low: 453.1},
// [111]
    {symbol: "SYRMA.NS",janOpen: 733,janClose: 761,high: 877.2,low: 634.5},
    {symbol: "HONAUT.NS",janOpen: 32990,janClose: 33375,high: 34995,low: 30590},
    {symbol: "PENIND.NS",janOpen: 205.5,janClose: 170.84,high: 206.88,low: 153.71},
    {symbol: "MODINSU.BO",janOpen: 225,janClose: 200.8,high: 239.3,low: 169.55},
    {symbol: "ASHOKLEY.NS",janOpen: 179.19,janClose: 196.69,high: 205.19,low: 176.83},
    {symbol: "ABDL.NS",janOpen: 616.15,janClose: 486.15,high: 622,low: 429.5},
    {symbol: "DECNGOLD.BO",janOpen: 90.9,janClose: 132.04,high: 155.8,low: 90.1},
// [121]
    {symbol: "BSE.NS",janOpen: 2640.9,janClose: 2797,high: 2929.2,low: 2530},
    {symbol: "POCL.NS",janOpen: 1454.7,janClose: 1192,high: 1578,low: 1151.5},
    {symbol: "SKMEGGPROD.NS",janOpen: 214.95,janClose: 197.6,high: 215,low: 154.6},
    {symbol: "BATAINDIA.NS",janOpen: 945,janClose: 860.1,high: 958.75,low: 838.95},
    {symbol: "SONATSOFTW.NS",janOpen: 362.95,janClose: 317.3,high: 374.5,low: 299.95},
    {symbol: "CUPID.NS",janOpen: 521.55,janClose: 401,high: 526.95,low: 337.1},
    {symbol: "PHOENIXLTD.NS",janOpen: 1853.5,janClose: 1670.7,high: 1993,low: 1600},
// [131]
    {symbol: "BSOFT.NS",janOpen: 434.05,janClose: 418.05,high: 465,low: 387.5},
    {symbol: "KEC.NS",janOpen: 738.65,janClose: 667.15,high: 759,low: 603.3},
    {symbol: "ASHAPURMIN.NS",janOpen: 880.9,janClose: 654.75,high: 924.9,low: 596.3},
    {symbol: "STALLION.NS",janOpen: 230,janClose: 185,high: 259.15,low: 169.26},
    {symbol: "TCS.NS",janOpen: 3215,janClose: 3123.9,high: 3350,low: 2916},
    {symbol: "GODFRYPHLP.NS",janOpen: 2750,janClose: 2035.5,high: 2753.7,low: 1877.3},
    {symbol: "CIANAGRO.BO",janOpen: 1360,janClose: 1196.6,high: 1431,low: 1101.6},
// [141]
    {symbol: "AGI.NS",janOpen: 748.2,janClose: 624.95,high: 774.5,low: 585.25},
    {symbol: "SAGILITY.NS",janOpen: 52.4,janClose: 49.93,high: 54.3,low: 47.14},
    {symbol: "BLUEJET.NS",janOpen: 532,janClose: 417.75,high: 541.15,low: 392},
    {symbol: "ENGINERSIN.NS",janOpen: 202,janClose: 172.47,high: 209.89,low: 163.55},
    {symbol: "SABTNL.NS",janOpen: 1595.5,janClose: 1650.4,high: 2247,low: 1494.5},
    {symbol: "INDIGOPNTS.NS",janOpen: 1138.6,janClose: 1044.4,high: 1250,low: 992},
    {symbol: "NETWEB.NS",janOpen: 3120,janClose: 3144.7,high: 3753,low: 3006.1},
// [151]
    {symbol: "EPIGRAL.NS",janOpen: 1232.7,janClose: 1043.1,high: 1270.3,low: 904.6},
    {symbol: "GODREJPROP.NS",janOpen: 2010,janClose: 1576.8,high: 2166.2,low: 1476.2},
    {symbol: "REGANTO.BO",janOpen: 13.01,janClose: 11.49,high: 14.92,low: 10.1},
    {symbol: "RMDRIP.NS",janOpen: 83.71,janClose: 105.33,high: 111.49,low: 83.6},
    {symbol: "KALYANKJIL.NS",janOpen: 486.9,janClose: 361.65,high: 535,low: 347.5},
    {symbol: "INFOBEAN.NS",janOpen: 816.4,janClose: 807.6,high: 1030,low: 729},
    {symbol: "UFBL.NS",janOpen: 210.01,janClose: 181.2,high: 264.9,low: 172.34},
// [161]
    {symbol: "CSBBANK.NS",janOpen: 459.1,janClose: 438.05,high: 574.4,low: 386.5},
    {symbol: "MAZDOCK.NS",janOpen: 2500,janClose: 2572.9,high: 2607,low: 2283.3},
    {symbol: "HINDZINC.NS",janOpen: 610.55,janClose: 628.5,high: 733,low: 560.35}
];

// ================= USERS =================

const legacyUsers = [
    {username:"_the_strangler_",symbol:"UFBL",price:191.15},
// [171]
    {username:".rathi",symbol:"DECNGOLD",price:113},
    {username:"bruhaspathi",symbol:"SKMEGGPROD",price:160.25},
    {username:"dukemyboy",symbol:"SYRMA",price:708},
    {username:"abhishek260898",symbol:"RMDRIP",price:94.82},
    {username:"Zoom",symbol:"ADVAIT",price:1365},
    {username:"stumbledcorn",symbol:"PFC",price:374},
    {username:"rama.krishna",symbol:"ASHOKLEY",price:183.1},
    {username:"noobgamer_911",symbol:"LGEINDIA",price:1387},
    {username:"noisyboy2066",symbol:"INFOBEAN",price:789.7},
// [181]
    {username:"madmaxpunkyt",symbol:"MODINSU",price:201.6},
    {username:"dhruvehe",symbol:"MANORAMA",price:1280},
    {username:"neo_was_here",symbol:"ABDL",price:473},
    {username:"alex.io",symbol:"RELIABLE",price:153.99},
    {username:"sam_322",symbol:"PRIVISCL",price:2635.05},
    {username:"_.j0jo._",symbol:"AUTOAXLES",price:1964},
    {username:"haanmehihu",symbol:"PANCARBON",price:485.4},
    {username:"shamelesssteel",symbol:"HINDCOPPER",price:570},
    {username:"oldtimer6674",symbol:"SARDAEN",price:488.2},
// [191]
    {username:"mr_noob.111",symbol:"RACLGEAR",price:1015},
    {username:"Koru",symbol:"VPRPL",price:45.95},
    {username:"dilsepaneer.",symbol:"PENIND",price:173.25},
    {username:"demiii",symbol:"POLYCAB",price:7182.5},
    {username:"toplesstrader",symbol:"DRREDDY",price:1170},
    {username:"bran.24",symbol:"IDEA",price:10.82},
    {username:"911326",symbol:"KAYNES",price:3612},
    {username:"pika_1608",symbol:"TATASTEEL",price:187.1},
    {username:"sentoph_poli",symbol:"ICICIAMC",price:2937},
// [201]
    {username:"prashanths",symbol:"MCX",price:2455},
    {username:"thatbtctrader",symbol:"NMDC",price:82.74},
    {username:"batman_30775",symbol:"BSE",price:2800},
    {username:"dividerprime",symbol:"HINDALCO",price:938.5},
    {username:"spice_01",symbol:"NATIONALUM",price:363},
    {username:"finvasiauser",symbol:"GEECEE",price:306.1},
    {username:"hamstero.",symbol:"ADANIENT",price:2155},
    {username:"Billu_sanda",symbol:"SBIN",price:1035},
    {username:"wuod",symbol:"JAMNAAUTO",price:126.61},
// [211]
    {username:"flamingnostrils",symbol:"INTERARCH",price:2045},
    {username:"_.KRYPTON._",symbol:"BHEL",price:265.4},
    {username:"fuzzyog",symbol:"BSOFT",price:430.95},
    {username:"hashcrack",symbol:"APOLLO",price:244.65},
    {username:"maythydelusionschipandshatter",symbol:"CONCOR",price:518},
    {username:"humanstupidityuniverse",symbol:"SUMMITSEC",price:1774},
    {username:"navalravikantfan",symbol:"ZENTEC",price:1327.9},
    {username:"rot_12",symbol:"VEDL",price:684.95},
    {username:"butter0973",symbol:"LALPATHLAB",price:1397.9},
// [221]
    {username:"kr0nik",symbol:"RELIANCE",price:1450.6},
    {username:"turncoat_.",symbol:"SAKAR",price:408.9},
    {username:"tehelca_omlet",symbol:"MAZDOCK",price:2431},
    {username:"scig",symbol:"LUPIN",price:2205},
    {username:"brownbobdowney",symbol:"EICHERMOT",price:7300},
    {username:"dirigible1796",symbol:"WOCKPHARMA",price:1419.2},
    {username:"shockabsorber",symbol:"RBLBANK",price:309},
    {username:"keshgawd",symbol:"VALIANTORG",price:248.1},
    {username:"jassi_oye",symbol:"PTCIL",price:17968},
// [231]
    {username:"utpalluthra",symbol:"GUJTLRM",price:0.71},
    {username:"rahulshrivastav0223",symbol:"HINDZINC",price:650},
    {username:"schnitzeldinger",symbol:"ERIS",price:1447},
    {username:"trader3156",symbol:"TEGA",price:1860},
    {username:"sudden_sax",symbol:"TARIL",price:260.3},
    {username:"fraywolfcandy",symbol:"FORCEMOT",price:20500},
    {username:"gallactus0934",symbol:"PATELENG",price:30},
    {username:"eren0001000",symbol:"360ONE",price:1193.9},
    {username:"slacktalk",symbol:"TATACONSUM",price:1180.2},
// [241]
    {username:"sarge_q3",symbol:"JAIBALAJI",price:72},
    {username:"red_is_here",symbol:"IOB",price:36.05},
    {username:"ybsyour",symbol:"AURUM",price:189},
    {username:"ron.cho",symbol:"GROWW",price:173.2},
    {username:"tessractism",symbol:"HONAUT",price:33965},
    {username:"lidi_ok",symbol:"ZAGGLE",price:309},
    {username:"chonky",symbol:"EMMVEE",price:214.31},
    {username:"confused_cloud_0051",symbol:"MCL",price:82.23},
    {username:"warrenbuffett7601",symbol:"MANKIND",price:2170},
// [251]
    {username:"AdaniHodler",symbol:"JIOFIN",price:279.4},
    {username:"takeshicastlenoton",symbol:"SHAILY",price:2156.8},
    {username:"krazy9964",symbol:"CMSINFO",price:331},
    {username:"el_tiburon_vbvc",symbol:"BATAINDIA",price:902},
    {username:"bmcfsu",symbol:"CIPLA",price:1396.5},
    {username:"harbenand",symbol:"ITC",price:330},
    {username:"stovegodcookz",symbol:"TCS",price:3188},
    {username:"clayface",symbol:"POCL",price:1394.1},
    {username:"Sidart",symbol:"CUPID",price:459.95},
// [261]
    {username:"adorable_moose_23545",symbol:"SONATSOFTW",price:339.05},
    {username:"wintermonkey2",symbol:"KEC",price:681},
    {username:"responsibilityrepellant",symbol:"ENGINERSIN",price:191.01},
    {username:"ms.hello_kitty",symbol:"PHOENIXLTD",price:1848.8},
    {username:"gammaneutral",symbol:"ASHAPURMIN",price:801.2},
    {username:"thepapaelon",symbol:"CIANAGRO",price:1400.35},
    {username:"Boombust",symbol:"GODFRYPHLP",price:2240},
    {username:"jonnycash9689",symbol:"AGI",price:670},
    {username:"moonrays1",symbol:"SAGILITY",price:53.09},
// [271]
    {username:"Saxx",symbol:"GODREJPROP",price:1889},
    {username:"oungabunga",symbol:"STALLION",price:210.01},
    {username:"boombust_jr.",symbol:"SABTNL",price:2045},
    {username:"c.men.",symbol:"EPIGRAL",price:1158.3},
    {username:"mero__vingian",symbol:"NETWEB",price:3710},
    {username:"robustwarrbotics",symbol:"BLUEJET",price:479},
    {username:"dippamdappam",symbol:"INDIGOPNTS",price:1216.2},
    {username:"pasha6969",symbol:"CSBBANK",price:503},
    {username:"supereconomics",symbol:"KALYANKJIL",price:468},
// [281]
    {username:"ram_bhakt_respect",symbol:"REGANTO",price:14.92}
];

// ================= SEED =================

async function main() {
  console.log("🧹 Wiping all existing data...");
  
  await prisma.systemState.deleteMany();
// [291]
  await prisma.priceHistory.deleteMany();
  await prisma.monthlyClose.deleteMany();
  await prisma.latestPrice.deleteMany();
  await prisma.pick.deleteMany();
  await prisma.user.deleteMany();
  await prisma.benchmark.deleteMany();

  console.log("📊 Seeding Market Prices & Monthly Closes...");
  const symbolMap = new Map();
  const baseToExtMap = new Map();
// [301]

  for (const s of marketData) {
    symbolMap.set(s.symbol, s);
    
    // Why: Creates a lookup dictionary (e.g., 'RELIANCE' -> 'RELIANCE.NS') 
    // to automatically fix legacy user symbols during iteration.
    const base = s.symbol.split('.')[0].toUpperCase();
    baseToExtMap.set(base, s.symbol);

    await prisma.latestPrice.create({
// [311]
      data: {
        symbol: s.symbol,
        price: s.janClose,
        seasonHigh: s.high,
        seasonLow: s.low,
        dayHigh: s.high, // Initializing Phase 2 compiler fields
        dayLow: s.low,
      },
    });

// [321]
    await prisma.monthlyClose.create({
      data: {
        symbol: s.symbol,
        date: JANUARY_CLOSE_DATE,
        close: s.janClose,
      },
    });
  }

  console.log("🏛 Seeding Benchmarks...");
// [331]
  const benchmarkTickers = ["^BSESN", "^NSEI", "^NSMIDCP", "^CNXSC", "NIFTY_MID_SELECT.NS"];

  for (const t of benchmarkTickers) {
    const row = symbolMap.get(t);
    if (!row) continue;
    await prisma.benchmark.create({
      data: {
        ticker: t,
        name: t === "^NSEI" ? "Nifty 50" : t === "^BSESN" ? "Sensex" : t,
        openingPriceJan1: row.janOpen,
// [341]
      },
    });
  }

  console.log("👥 Seeding Users & Calculating Baseline Returns...");
  
  for (const u of legacyUsers) {
    // How: We intercept the raw symbol and upgrade it to the fully qualified Yahoo ticker
    const rawSymbol = u.symbol.toUpperCase();
    const correctSymbol = baseToExtMap.get(rawSymbol) || rawSymbol;
// [351]
    
    // Extrapolate the internal data structures required by our new schema
    const baseSymbol = correctSymbol.split('.')[0];
    const exchange = correctSymbol.includes('.') ? correctSymbol.split('.')[1] : 'UNKNOWN';

    const market = symbolMap.get(correctSymbol);
    const currentPrice = market?.janClose ?? u.price;
    const prevMonthClose = market?.janClose ?? u.price;

    const seasonReturn = ((currentPrice - u.price) / (u.price || 1)) * 100;
// [361]
    const monthlyReturn = ((currentPrice - prevMonthClose) / (prevMonthClose || 1)) * 100;

    // Why: We seed Admin Level natively. If it matches DEV_USERNAME, set to Level 4 Superadmin.
    const adminLevel = u.username.toLowerCase() === process.env.DEV_USERNAME?.toLowerCase() ? 4 : 0;

    await prisma.user.create({
      data: {
        id: `legacy_${u.username}`,
        username: u.username,
        currentSeasonReturn: seasonReturn,
// [371]
        currentMonthlyReturn: monthlyReturn,
        adminLevel: adminLevel,
        pick: {
          create: {
            symbol: correctSymbol, 
            baseSymbol: baseSymbol, 
            exchange: exchange, 
            entryPrice: u.price,
            entryDate: USER_ENTRY_DATE,
            previousMonthClose: prevMonthClose,
// [381]
          },
        },
      },
    });
  }

  console.log("✅ Seed complete. 100+ Users synchronized with validated benchmarks and extensions.");
}

// [391]
main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// [399]