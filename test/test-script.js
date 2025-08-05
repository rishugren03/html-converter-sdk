// const { Web2DocxClient } = require("@web2docx/web2docx-sdk");
const { Web2DocxClient } = require("../index");

const client = new Web2DocxClient(
  "sk_c004eca650f74a4e9514516dfed8031e_534e7622"
);

async function htmlToPdfExample() {
  const html = "<h1>Hello World</h1>";
  const pdfBuffer = await client.htmlToPdf(html);
  require("fs").writeFileSync("output.pdf", pdfBuffer);
}

htmlToPdfExample();
