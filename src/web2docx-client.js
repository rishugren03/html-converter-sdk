const axios = require("axios");
const WebSocket = require("ws");

class Web2DocxClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    this.apiKey = apiKey;
    this.baseURL = "http://localhost:5001/job/";
    this.wsURL = "ws://localhost:5001";

    // ✅ Initialize WebSocket connection
    this.ws = new WebSocket(this.wsURL);
    this.ws.on("open", () => console.log("✅ WebSocket connected to server"));
    this.ws.on("close", () => console.log("❌ WebSocket connection closed"));
  }

  async htmlToPdf(html) {
    const type = "html-pdf";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(message.data.split(",").map(Number));
    });
  }

  async htmlToImage(html) {
    const type = "html-image";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(message.data.split(",").map(Number));
    });
  }

  // async htmlToSvg(html) {
  //   const type = "html-svg";
  //   const jobId = await this._queueJob("html", { html, type });
  //   return this._waitForJob(jobId, (message) => {
  //     console.log(message);
  //     return message.data;
  //   });
  // }

  async urlToPdf(url) {
    const type = "url-pdf";
    const jobId = await this._queueJob("url", { url, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(message.data.split(",").map(Number));
    });
  }

  async urlToImage(url) {
    const type = "url-image";
    const jobId = await this._queueJob("url", { url, type });
    return this._waitForJob(jobId, (message) => {
      return Uint8Array.from(message.data.split(",").map(Number));
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
      console.log("📩 Job added to queue:", response.data);
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
