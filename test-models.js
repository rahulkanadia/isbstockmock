
// Load the .env or .env.local file
require('dotenv').config({ path: ['.env.local', '.env'] });
const fs = require('fs');

// Check both variable names just in case
const apiKey = process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY || process.env.POLLINATIONS_API_KEY;

if (!apiKey) {
  console.error(":x: Error: API key is missing from your .env file!");
  process.exit(1);
}

const prompt = "2d anime fighting scene, character 1 modelled after 'brownbobdowney' character 2 modelled after 'boombust', pop art manga style, cinematic action scene, pop art background";

// The list of models we want to verify
const modelsToTest = [
  "flux",
  "zimage",
  "klein",
  "klein-large",
];

async function testModels() {
  console.log(`Starting test for ${modelsToTest.length} models...\n`);

  for (const model of modelsToTest) {
    console.log(`:hourglass_flowing_sand: Testing model: [${model}]...`);
    const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${model}&width=800&height=500&nologo=true`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/jpeg, image/png, application/json'
        }
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let errorMsg = `HTTP ${res.status} ${res.statusText}`;
        
        // Extract the exact reason for failure
        if (contentType.includes('application/json')) {
          const errData = await res.json();
          errorMsg = errData.error?.message || JSON.stringify(errData);
        } else {
          errorMsg = await res.text();
        }
        
        console.error(`:x: [${model}] Failed:`, errorMsg, "\n");
        continue; // Skip to the next model
      }

      // Save successful images with the model name attached
      const buffer = await res.arrayBuffer();
      const filename = `test-clash-${model}.jpg`;
      fs.writeFileSync(filename, Buffer.from(buffer));
      console.log(`:white_check_mark: [${model}] Success! Saved as '${filename}'\n`);

    } catch (err) {
      console.error(`:x: [${model}] Request Error:`, err.message, "\n");
    }
    
    // 2-second cooldown to avoid getting IP banned or rate limited
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(":checkered_flag: Testing complete!");
}

testModels();

