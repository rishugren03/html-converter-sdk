const fs = require("fs");
const path = require("path");
const { Web2DocxClient } = require("../index");
require("dotenv").config();

const client = new Web2DocxClient(
  "sk_1bfba7958ed74afd98161b8473c7140b_9f950ff4"
);
const outputDir = path.resolve(__dirname, "output");

// Make sure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read sample HTML
// const sampleHTML = fs.readFileSync(path.join(__dirname, "hello.html"), "utf8");
const sampleHTML = "<h1>Hello Batch Docx</h1>";

// Configuration
const NUM_HTMLS = 5;
const NUM_BATCHES = 2;
const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second delay

let results = {
  totalRequests: NUM_BATCHES,
  successCount: 0,
  failureCount: 0,
  totalTime: 0,
  responseTimes: [],
};

// Helper to save files
function saveFile(fileName, buffer) {
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, buffer);
  console.log(`💾 Saved ${filePath}`);
}

// Improved test function with validation
async function testBatchConversion(testFn, name) {
  const startTime = Date.now();
  try {
    const zipBuffer = await testFn();

    // Basic validation of the zip file
    if (!zipBuffer || zipBuffer.length < 100) {
      // Minimum reasonable zip size
      throw new Error("Invalid ZIP file received");
    }

    const duration = Date.now() - startTime;
    results.successCount++;
    results.totalTime += duration;
    results.responseTimes.push(duration);
    console.log(`✅ ${name} - Success (${duration}ms)`);
    return true;
  } catch (err) {
    results.failureCount++;
    console.error(`❌ ${name} - Failed: ${err.message}`);
    return false;
  }
}

// Add delay between operations
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Validate ZIP contents (simple check)
function validateZipContents(buffer) {
  // Very basic check - first 4 bytes should be ZIP magic number
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

// Main stress tester with controlled concurrency
async function stressTest() {
  console.log(`🚀 Starting Batch Test with ${NUM_BATCHES} batch requests...`);

  for (let i = 0; i < NUM_BATCHES; i++) {
    const htmlList = Array(NUM_HTMLS).fill(sampleHTML);

    const testFn = async () => {
      const zipBuffer = await client.htmlBatchToDocx(htmlList);
      if (!validateZipContents(zipBuffer)) {
        throw new Error("Invalid ZIP file format");
      }
      saveFile(`batch-test-${i + 1}.zip`, zipBuffer);
      return zipBuffer;
    };

    await testBatchConversion(testFn, `Batch Test #${i + 1}`);

    // Add delay between batches unless it's the last one
    if (i < NUM_BATCHES - 1) {
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // Stats
  const avgTime =
    results.successCount > 0 ? results.totalTime / results.successCount : 0;
  console.log("\n📊 Batch Test Results:");
  console.log(`✅ Successful Batches: ${results.successCount}`);
  console.log(`❌ Failed Batches: ${results.failureCount}`);
  console.log(`📈 Average Response Time: ${avgTime.toFixed(2)}ms`);
  console.log(`⏱️ Response Times: [${results.responseTimes.join(", ")}]ms`);
}

// Run test with error handling
stressTest().catch((err) => {
  console.error("🔥 Top-level test error:", err);
  process.exit(1);
});
