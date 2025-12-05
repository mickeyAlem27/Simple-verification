// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Verification route
app.post("/api/verify", (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 9);
  
  const log = (...args) => {
    console.log(`[${new Date().toISOString()}] [${requestId}]`, ...args);
  };
  
  const error = (...args) => {
    console.error(`[${new Date().toISOString()}] [${requestId}]`, ...args);
  };
  
  try {
    log("Request headers:", req.headers);
    log("Request body:", req.body);
    
    if (!req.body) {
      error("No request body received");
      return res.status(400).json({ 
        status: "error",
        error: "Request body is required",
        requestId
      });
    }

    const { success, evidence = [], sessionId = 'none' } = req.body;
    
    if (typeof success === 'undefined') {
      error("Missing 'success' field in request body");
      return res.status(400).json({ 
        status: "error",
        error: "Missing 'success' field in request body",
        requestId
      });
    }

    log("Verification received:", { 
      success, 
      evidenceCount: evidence.length,
      sessionId
    });

    // Validate evidence array
    if (!Array.isArray(evidence)) {
      error("Evidence must be an array");
      return res.status(400).json({
        status: "error",
        error: "Evidence must be an array",
        requestId
      });
    }

    // Log evidence details
    if (evidence.length > 0) {
      log("Processing evidence:", evidence.length, "items");
      evidence.forEach((item, index) => {
        try {
          log(`Evidence ${index + 1}:`, JSON.stringify(item, null, 2));
        } catch (e) {
          error(`Failed to stringify evidence item ${index}:`, e);
        }
      });
    }

    // Process the request
    const result = {
      status: "success",
      success: Boolean(success),
      timestamp: new Date().toISOString(),
      requestId,
      received: {
        success: Boolean(success),
        evidenceCount: evidence.length,
        sessionId
      }
    };

    log("Sending response:", result);
    res.json(result);
    
  } catch (err) {
    error("Unexpected error:", err);
    res.status(500).json({ 
      status: "error",
      error: "Internal server error",
      message: err.message,
      requestId,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
