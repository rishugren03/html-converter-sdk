# Web2Docx SDK

Convert HTML to PDF and Images using WebSocket-powered real-time API.

---

## 🚀 Features

- Convert **HTML to PDF** (single)
- Convert **multiple HTMLs to PDFs** (batch, returns ZIP)
- Convert **HTML to Image**
- Real-time WebSocket updates for job completion
- Priority queueing (Free / Pro / Pro Max)

---

## 📦 Installation

```bash
npm i @web2docx/web2docx-sdk
```

or

```bash
yarn add @web2docx/web2docx-sdk
```

---

## 🔑 Get Your API Key

To use this SDK, you need an API key.

👉 **[Sign up at web2docx.com](https://web2docx.com)** and generate your key from the dashboard.  
Free and paid plans are available based on usage.

---

## ⚡ Usage

### 1. Import and Initialize

```javascript
const { Web2DocxClient } = require("@web2docx/web2docx-sdk");

const client = new Web2DocxClient("YOUR_API_KEY");
```

---

### 2. HTML to PDF

```javascript
const fs = require("fs");

async function htmlToPdfExample() {
  const html = "<h1>Hello World</h1>";
  const pdfBuffer = await client.htmlToPdf(html);

  fs.writeFileSync("output.pdf", pdfBuffer);
}

htmlToPdfExample();
```

---

### 3. HTML Batch to PDF (ZIP)

```javascript
async function htmlBatchToPdfExample() {
  const htmlList = ["<h1>First Document</h1>", "<h1>Second Document</h1>"];
  const zipBuffer = await client.htmlBatchToPdf(htmlList);

  fs.writeFileSync("batch-output.zip", zipBuffer);
}

htmlBatchToPdfExample();
```

> **Note:** Maximum 10 HTML documents per batch.

---

### 4. HTML to Image

```javascript
async function htmlToImageExample() {
  const html = "<h1>Hello Image</h1>";
  const imageBuffer = await client.htmlToImage(html);

  fs.writeFileSync("output.png", imageBuffer);
}

htmlToImageExample();
```

---

### 5. HTML Batch to IMAGE (ZIP)

```javascript
async function htmlBatchToImageExample() {
  const htmlList = ["<h1>First Document</h1>", "<h1>Second Document</h1>"];
  const zipBuffer = await client.htmlBatchToImage(htmlList);

  fs.writeFileSync("batch-output.zip", zipBuffer);
}

htmlBatchToImageExample();
```

> **Note:** Maximum 10 HTML documents per batch.

---

### 6. HTML to Docx

```javascript
async function htmlToDocxExample() {
  const html = "<h1>Hello Docx</h1>";
  const docxBuffer = await client.htmlToDocx(html);

  fs.writeFileSync("output.docx", docxBuffer);
}

htmlToDocxExample();
```

---

### 7. HTML Batch to DOCX (ZIP)

```javascript
async function htmlBatchToDocxExample() {
  const htmlList = ["<h1>First Document</h1>", "<h1>Second Document</h1>"];
  const zipBuffer = await client.htmlBatchToDocx(htmlList);

  fs.writeFileSync("batch-output.zip", zipBuffer);
}

htmlBatchToDocxExample();
```

> **Note:** Maximum 10 HTML documents per batch.

---

## ⚙️ API Reference

| Method                                 | Description                                                      |
| :------------------------------------- | :--------------------------------------------------------------- |
| `htmlToPdf(html: string)`              | Convert single HTML to PDF (returns Buffer)                      |
| `htmlBatchToPdf(htmlList: string[])`   | Convert multiple HTMLs into a ZIP of PDFs (returns Buffer)       |
| `htmlToImage(html: string)`            | Convert single HTML to Image (returns Buffer)                    |
| `htmlBatchToImage(htmlList: string[])` | Convert multiple HTMLs into a ZIP of Images (returns Buffer)     |
| `htmlToDocx(html: string)`             | Convert single HTML to DOCX (returns Buffer)                     |
| `htmlBatchToDocx(htmlList: string[])`  | Convert multiple HTMLs into a ZIP of DOCX files (returns Buffer) |

---

## 📡 How it Works

- The SDK sends your request to the Web2Docx server.
- WebSocket connection is used to listen for **job completion events**.
- Once the server finishes conversion, your promise resolves automatically.
- Queues: Free users are slower; Pro and Pro Max users get faster processing.

---

## 🧹 Notes

- If a job takes more than 60 seconds, it **times out** and throws an error.
- Make sure your API Key is correct and active.
- Currently supports **HTML input only** (URL input coming soon).

---

## 🧾 License

MIT License

---

## ⭐️ Support Us

If you find **Web2Docx** useful, please consider [giving us a star on GitHub](https://github.com/your-username/web2docx) — it helps us reach more developers and motivates us to keep improving. Thank you! 💜

> **Made with ❤️ by the Web2Docx team**
