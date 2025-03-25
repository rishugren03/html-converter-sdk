const axios = require("axios");
const WebSocket = require("ws");

class Web2DocxClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    this.apiKey = apiKey;
    this.baseURL = "http://localhost:5001/pdf"; // ✅ Updated to queue service
    this.wsURL = "ws://localhost:5001"; // ✅ WebSocket URL

    // ✅ Initialize WebSocket connection
    this.ws = new WebSocket(this.wsURL);
    this.ws.on("open", () => console.log("✅ WebSocket connected to server"));
    this.ws.on("close", () => console.log("❌ WebSocket connection closed"));
  }

  async htmlToPdf(html) {
    return this._makeRequest("/add", { html });
  }

  async urlToPdf(url) {
    return this._makeRequest("/url-pdf", { url });
  }

  async htmlToImage(html) {
    return this._makeRequest("/html-image", { html });
  }

  async urlToImage(url) {
    return this._makeRequest("/url-image", { url });
  }

  async htmlToDocx(html) {
    return this._makeRequest("/html-docx", { html });
  }

  async htmlToSvg(html) {
    return this._makeRequest("/html-svg", { html });
  }

  async _makeRequest(endpoint, data) {
    try {
      const response = await axios.post(this.baseURL + endpoint, data, {
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      console.log("📩 Job added to queue:", response.data);
      const { jobId } = response.data; // ✅ Get jobId

      return new Promise((resolve, reject) => {
        // ✅ Listen for WebSocket message
        this.ws.on("message", (msg) => {
          const message = JSON.parse(msg);
          if (message.jobId === jobId && message.status === "completed") {
            console.log(`🎉 Job ${jobId} completed!`);
            resolve(Buffer.from(message.pdf, "base64")); // ✅ Return PDF Buffer
          }
        });

        // ✅ Timeout if job takes too long
        setTimeout(() => reject(new Error("Job timed out")), 60000);
      });
    } catch (error) {
      console.error(error.response);
      throw new Error(error.response?.data?.error || "API request failed");
    }
  }
}

module.exports = Web2DocxClient;
