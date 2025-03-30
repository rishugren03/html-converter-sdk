const fs = require("fs");
const path = require("path");
const Web2DocxClient = require("../src/web2docx-client");
require("dotenv").config();

const client = new Web2DocxClient(process.env.WEB2DOCX_API_KEY);

// Ensure output directory exists
const outputDir = path.resolve(__dirname, "output");

// Paths
const filePath = path.resolve(__dirname, "hello.html");
const htmlFile = fs.readFileSync(filePath, "utf-8");

// Sample HTML & URLs
const sampleHTML = "<h1>Hello, Web2Docx!</h1><p>This is a test conversion.</p>";
const validUrl = "https://bawse.life";
const invalidUrl = "invalid-url";

// Helper function to save files
function saveFile(fileName, buffer) {
  fs.writeFileSync(path.join(outputDir, fileName), buffer);
}

// Convert Direct HTML String
async function testDirectHTMLToPdf() {
  try {
    console.log("Testing Direct HTML to PDF...");
    const pdfBuffer = await client.htmlToPdf(sampleHTML);
    console.log(pdfBuffer);
    // saveFile("direct-html.pdf", pdfBuffer);
    console.log("✅ Direct HTML to PDF - Success");
  } catch (err) {
    console.error("❌ Error in Direct HTML to PDF:", err.message);
  }
}

async function testHTMLToPdf() {
  try {
    console.log("Testing Direct HTML to PDF...");
    const pdfBuffer = await client.htmlToPdf(sampleHTML);
    saveFile("direct-html.pdf", pdfBuffer);
    console.log("✅ Direct HTML to PDF - Success");
  } catch (err) {
    console.error("❌ Error in Direct HTML to PDF:", err.message);
  }
}

// Convert HTML File
async function testHTMLFileToPdf() {
  try {
    console.log("Testing HTML File to PDF...");
    const pdfBuffer = await client.htmlToPdf(htmlFile);
    // console.log("pdf-buffer: ", pdfBuffer);
    saveFile("file-html.pdf", pdfBuffer);
    console.log("✅ HTML File to PDF - Success");
  } catch (err) {
    console.error("❌ Error in HTML File to PDF:", err.message);
  }
}

// Convert URL to PDF
async function testUrlToPdf() {
  try {
    console.log("Testing URL to PDF...");
    const pdfBuffer = await client.urlToPdf(validUrl);
    saveFile("url.pdf", pdfBuffer);
    console.log("✅ URL to PDF - Success");
  } catch (err) {
    console.error("❌ Error in URL to PDF:", err.message);
  }
}

// Convert Direct HTML to Image
async function testDirectHTMLToImage() {
  try {
    console.log("Testing Direct HTML to Image...");
    const imageBuffer = await client.htmlToImage(sampleHTML);
    saveFile("direct-html.png", imageBuffer);
    console.log("✅ Direct HTML to Image - Success");
  } catch (err) {
    console.error("❌ Error in Direct HTML to Image:", err.message);
  }
}

// Convert URL to Image
async function testUrlToImage() {
  try {
    console.log("Testing URL to Image...");
    const imageBuffer = await client.urlToImage(validUrl);
    saveFile("url.png", imageBuffer);
    console.log("✅ URL to Image - Success");
  } catch (err) {
    console.error("❌ Error in URL to Image:", err.message);
  }
}

// Convert HTML to DOCX
async function testHTMLToDocx() {
  try {
    console.log("Testing HTML to DOCX...");
    const docxBuffer = await client.htmlToDocx(sampleHTML);
    console.log(docxBuffer);
    saveFile("doc3.docx", docxBuffer);
    // fs.writeFileSync("docs.docx", docxBuffer);
    console.log("✅ HTML to DOCX - Success");
  } catch (err) {
    console.error("❌ Error in HTML to DOCX:", err.message);
  }
}

// Convert HTML to SVG
async function testHTMLToSvg() {
  try {
    console.log("Testing HTML to SVG...");
    const svgBuffer = await client.htmlToSvg(htmlFile);
    saveFile("image.svg", svgBuffer);
    console.log("✅ HTML to SVG - Success");
  } catch (err) {
    console.error("❌ Error in HTML to SVG:", err.message);
  }
}

// ❌ Negative Tests
async function testInvalidUrlToPdf() {
  try {
    console.log("Testing Invalid URL to PDF...");
    await client.urlToPdf(invalidUrl);
  } catch (err) {
    console.log("✅ Invalid URL to PDF - Test Passed");
  }
}

async function testEmptyHtmlToPdf() {
  try {
    console.log("Testing Empty HTML to PDF...");
    await client.htmlToPdf("");
  } catch (err) {
    console.log("✅ Empty HTML to PDF - Test Passed");
  }
}

async function testWithoutApiKey() {
  try {
    console.log("Testing Without API Key...");
    const invalidClient = new Web2DocxClient("");
    await invalidClient.htmlToPdf(sampleHTML);
  } catch (err) {
    console.log("✅ API Key Missing - Test Passed");
  }
}

// Run Tests
(async () => {
  await testDirectHTMLToPdf();
  await testHTMLFileToPdf();
  await testHTMLToPdf();
  await testUrlToPdf();
  await testDirectHTMLToImage();
  await testUrlToImage();
  await testHTMLToDocx();
  await testHTMLToSvg();
  await testInvalidUrlToPdf();
  await testEmptyHtmlToPdf();
  await testWithoutApiKey();
})();
