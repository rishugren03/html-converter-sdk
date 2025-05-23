const axios = require("axios");
const WebSocket = require("ws");

class Web2DocxClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    this.apiKey = apiKey;
    this.baseURL = `https://queue.web2docx.com/queue/job/`;
    this.wsURL = `wss://queue.web2docx.com/queue`;

    // ✅ Initialize WebSocket connection
    this.ws = new WebSocket(this.wsURL);
    this.ws.on("open", () => console.log("✅ WebSocket connected to server"));
    this.ws.on("close", () => console.log("❌ WebSocket connection closed"));
  }

  // TODO: add pdf options like grayscale, orientation etc..

  async htmlToPdf(html) {
    const type = "html-pdf";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  // batch processing (html-pdf)
  async htmlBatchToPdf(htmlList) {
    const type = "html-pdf-batch";

    const batchLimit = 10;

    if (htmlList.length > batchLimit) {
      throw new Error(
        `Batch limit of ${batchLimit} exceeded. Please reduce the number of HTML files.`
      );
    }

    const jobId = await this._queueJob("html", { htmlList, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  async htmlToDocx(html) {
    const type = "html-docx";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(jobId, (message) => {
      // return Uint8Array.from(message.data.split(",").map(Number));
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  // batch html to docx
  async htmlBatchToDocx(htmlList) {
    const type = "html-docx-batch";

    const batchLimit = 10;

    if (htmlList.length > batchLimit) {
      throw new Error(
        `Batch limit of ${batchLimit} exceeded. Please reduce the number of HTML files.`
      );
    }

    const jobId = await this._queueJob("html", { htmlList, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  async htmlToImage(html) {
    const type = "html-image";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  // // batch processing(html-image)
  async htmlBatchToImage(htmlList) {
    const type = "html-image-batch";
    const batchLimit = 10;

    if (htmlList.length > batchLimit) {
      throw new Error(
        `Batch limit of ${batchLimit} exceeded. Please reduce the number of HTML files.`
      );
    }
    const jobId = await this._queueJob("html", { htmlList, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
    });
  }

  async _queueJob(endpoint, data) {
    try {
      const response = await axios.post(this.baseURL + endpoint, data, {
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (response.data.queueType === "pro_max") {
        console.log("🚀 Job added to high priority queue!");
      } else if (response.data.queueType === "pro") {
        console.log("🚄 Job added to priority queue!");
      } else {
        console.log("📄 Job added to standard free queue!");
      }

      return response.data.jobId;
    } catch (error) {
      console.error(error.response);
      throw new Error(error.response?.data?.error || "API request failed");
    }
  }

  _waitForJob(jobId, processOutput) {
    return new Promise((resolve, reject) => {
      this.ws.on("message", (msg) => {
        const message = JSON.parse(msg);
        if (message.jobId === jobId && message.status === "completed") {
          console.log(`🎉 Job ${jobId} completed!`);
          resolve(processOutput(message));
        }
      });

      // ✅ Timeout if job takes too long
      setTimeout(() => reject(new Error("Job timed out")), 60000);
    });
  }
}

module.exports = Web2DocxClient;
