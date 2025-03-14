const axios = require("axios");

class Web2DocxClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error("API Key is required");
    this.apiKey = apiKey;
    this.baseURL = "http://localhost:7000/api/v1/convert";
  }

  async htmlToPdf(html) {
    return this._makeRequest("/html-pdf", { html });
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
        responseType: "arraybuffer",
      });
      return response.data;
    } catch (error) {
      console.log(error.response);
      throw new Error(error.response?.data?.error || "API request failed");
    }
  }
}

module.exports = Web2DocxClient;
