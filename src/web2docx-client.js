const axios = require("axios");
const WebSocket = require("ws");

class Web2DocxClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new Error("API Key is required");
    this.apiKey = apiKey;

    // Allow configurable URLs for different environments
    this.baseURL =
      options.baseURL ||
      process.env.WEB2DOCX_API_URL ||
      `https://queue.web2docx.com/queue/job/`;
    this.wsURL =
      options.wsURL ||
      process.env.WEB2DOCX_WS_URL ||
      `wss://queue.web2docx.com`;

    // Production fixes for WebSocket path
    if (!this.wsURL.includes("/queue") && !options.wsURL) {
      this.wsURL += this.wsURL.endsWith("/") ? "queue" : "/queue";
    }

    this.isConnected = false;
    this.connectionPromise = null;
    this.messageHandlers = new Map(); // Store job-specific handlers
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = Infinity; // Keep trying indefinitely for persistent connection

    // Add debug logging for production troubleshooting
    this.debug = options.debug || process.env.NODE_ENV === "development";

    if (this.debug) {
      console.log(`🔧 Web2DocxClient initialized:`);
      console.log(`   API URL: ${this.baseURL}`);
      console.log(`   WebSocket URL: ${this.wsURL}`);
    }

    this._initializeWebSocket();
  }

  _initializeWebSocket() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsURL);

      this.ws.on("open", () => {
        console.log("✅ WebSocket connected to server");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._setupHeartbeat();
        resolve();
      });

      this.ws.on("message", (msg) => {
        try {
          const message = JSON.parse(msg);

          // Handle connection confirmation
          if (message.type === "connection") {
            this.clientId = message.clientId;
            console.log(`🆔 Assigned client ID: ${this.clientId}`);
            return;
          }

          // Handle heartbeat
          if (message.type === "pong") {
            this.lastPong = Date.now();
            return;
          }

          // Handle job-specific messages
          if (message.jobId) {
            const handler = this.messageHandlers.get(message.jobId);
            if (handler) {
              handler(message);
            }
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      });

      this.ws.on("close", () => {
        console.log(
          "❌ WebSocket connection closed - attempting to maintain persistent connection"
        );
        this.isConnected = false;
        this._clearHeartbeat();
        // Always attempt to reconnect to maintain persistent connection
        this._handleReconnection();
      });

      this.ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
        this.isConnected = false;
        reject(error);
      });

      // Connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error("WebSocket connection timeout"));
        }
      }, 10000);
    });
  }

  async _handleReconnection() {
    // Keep trying to reconnect indefinitely to maintain persistent connection
    this.reconnectAttempts++;
    const delay = Math.min(
      1000 * Math.pow(2, Math.min(this.reconnectAttempts, 6)),
      30000
    );

    console.log(
      `🔄 Maintaining persistent connection - reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      this._initializeWebSocket().catch(() => {
        // Will retry again through the close event
      });
    }, delay);
  }

  async _ensureConnected() {
    if (this.isConnected) return;

    if (!this.connectionPromise) {
      this.connectionPromise = this._initializeWebSocket();
    }

    try {
      await this.connectionPromise;
    } catch (error) {
      this.connectionPromise = null;
      throw new Error("Failed to establish WebSocket connection");
    }
  }

  _setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws.readyState === this.ws.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    }, 30000); // Ping every 30 seconds
  }

  _clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Optional manual shutdown method (connection stays open by default)
  close() {
    console.log("📋 Manually closing WebSocket connection");
    this._clearHeartbeat();
    this.messageHandlers.clear();
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.close();
    }
  }

  // TODO: add pdf options like grayscale, orientation etc..

  async htmlToPdf(html) {
    const type = "html-pdf";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      90000
    ); // 90 second timeout for single conversions
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
    // Longer timeout for batch jobs - 2 minutes + 15 seconds per file
    const timeoutMs = 120000 + htmlList.length * 15000;
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      timeoutMs
    );
  }

  async htmlToDocx(html) {
    const type = "html-docx";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      90000
    ); // 90 second timeout for single conversions
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
    // Longer timeout for batch jobs - 2 minutes + 15 seconds per file
    const timeoutMs = 120000 + htmlList.length * 15000;
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      timeoutMs
    );
  }

  async htmlToImage(html) {
    const type = "html-image";
    const jobId = await this._queueJob("html", { html, type });
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      60000
    ); // 60 second timeout for image conversions (faster)
  }

  // batch processing(html-image)
  async htmlBatchToImage(htmlList) {
    const type = "html-image-batch";
    const batchLimit = 10;

    if (htmlList.length > batchLimit) {
      throw new Error(
        `Batch limit of ${batchLimit} exceeded. Please reduce the number of HTML files.`
      );
    }
    const jobId = await this._queueJob("html", { htmlList, type });
    // Image batch jobs - 90 seconds + 10 seconds per file (images are faster)
    const timeoutMs = 90000 + htmlList.length * 10000;
    return this._waitForJob(
      jobId,
      (message) => {
        return Uint8Array.from(atob(message.data), (c) => c.charCodeAt(0));
      },
      timeoutMs
    );
  }

  async _queueJob(endpoint, data) {
    // Ensure WebSocket is connected BEFORE queuing the job
    await this._ensureConnected();

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

  async _waitForJob(jobId, processOutput, timeoutMs = 120000) {
    await this._ensureConnected();

    return new Promise((resolve, reject) => {
      let isResolved = false;

      const cleanup = () => {
        this.messageHandlers.delete(jobId);
        if (timeoutHandle) clearTimeout(timeoutHandle);
      };

      const messageHandler = (message) => {
        if (isResolved) return;

        try {
          if (message.status === "completed") {
            isResolved = true;
            cleanup();
            console.log(`🎉 Job ${jobId} completed!`);

            if (!message.data) {
              reject(new Error("Job completed but no data received"));
              return;
            }

            resolve(processOutput(message));
          } else if (message.status === "failed") {
            isResolved = true;
            cleanup();
            console.error(`❌ Job ${jobId} failed: ${message.error}`);
            reject(new Error(message.error || "Job failed"));
          } else if (message.status === "processing") {
            console.log(`⏳ Job ${jobId} is processing...`);
            if (message.progress) {
              console.log(`📊 Progress: ${message.progress}%`);
            }
          }
        } catch (error) {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(new Error(`Error processing job result: ${error.message}`));
          }
        }
      };

      // Store the handler for this specific job
      this.messageHandlers.set(jobId, messageHandler);

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(new Error(`Job ${jobId} timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      // Handle WebSocket disconnection during job wait - but don't fail immediately
      const originalClose = this.ws.onclose;
      this.ws.onclose = (event) => {
        if (!isResolved) {
          console.log(
            "⚠️ WebSocket disconnected during job wait - attempting to maintain connection"
          );
          // Don't immediately fail - the reconnection logic will handle this
          // The job will timeout if it can't reconnect in time
        }
        if (originalClose) originalClose(event);
      };
    });
  }
}

module.exports = Web2DocxClient;
