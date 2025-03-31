const fs = require("fs");
const path = require("path");
const Web2DocxClient = require("../src/web2docx-client");
require("dotenv").config();

const client = new Web2DocxClient(process.env.WEB2DOCX_API_KEY);
const outputDir = path.resolve(__dirname, "output");

const sampleHTML = "<h1>Load Test</h1><p>Testing queue performance.</p>";
const validUrl = "https://bawse.life";
const NUM_REQUESTS = 100; // Number of test requests

let results = {
  totalRequests: NUM_REQUESTS,
  successCount: 0,
  failureCount: 0,
  totalTime: 0,
  responseTimes: [],
};

// Helper function to save files
function saveFile(fileName, buffer) {
  fs.writeFileSync(path.join(outputDir, fileName), buffer);
}

// Function to test a single conversion and measure response time
async function testConversion(testFn, name) {
  const startTime = Date.now();
  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.successCount++;
    results.totalTime += duration;
    results.responseTimes.push(duration);
    console.log(`✅ ${name} - Success (${duration}ms)`);
  } catch (err) {
    results.failureCount++;
    console.error(`❌ ${name} - Failed: ${err.message}`);
  }
}

// Stress Test Multiple Requests
async function stressTest() {
  console.log(`🚀 Starting Load Test with ${NUM_REQUESTS} requests...`);

  const promises = [];
  for (let i = 0; i < NUM_REQUESTS; i++) {
    const testFn = async () => {
      const pdfBuffer = await client.htmlToPdf(sampleHTML);
      saveFile(`test-${i}.pdf`, pdfBuffer);
    };
    promises.push(testConversion(testFn, `Test #${i + 1}`));
  }

  await Promise.all(promises);

  // Compute Efficiency Stats
  const avgTime = results.totalTime / results.successCount || 0;
  console.log("\n📊 Load Test Results:");
  console.log(`✅ Successful Requests: ${results.successCount}`);
  console.log(`❌ Failed Requests: ${results.failureCount}`);
  console.log(`📈 Average Response Time: ${avgTime.toFixed(2)}ms`);
}

// Run Stress Test
stressTest();
