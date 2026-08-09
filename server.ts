import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client lazily or gracefully
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Qadri Medical Agency Management System" });
});

// AI Chat & Action Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, contextData } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not configured
      return res.json({
        text: "AI Assistant is running in fallback mode (GEMINI_API_KEY environment variable is missing). You can still use standard ERP filters, search, and navigation buttons seamlessly!",
        action: null,
      });
    }

    const systemInstruction = `You are QMMS AI (Qadri Medical Agency ERP Assistant), an intelligent, highly skilled business copilot for a pharmaceutical agency/distributor.
You have real-time access to the business context (inventory summary, low stock items, expiring items, top customers, pending collections, today's sales).

Your goals:
1. Answer questions about sales, inventory, low stock, expiring medicines, customers, and business performance accurately.
2. Formulate direct actionable commands when the user asks you to perform an action.

If the user wants to perform an action, return a JSON response with structure:
{
  "text": "Human friendly explanation or response message",
  "action": {
    "type": "NAVIGATE" | "CREATE_INVOICE_PREFILL" | "SEARCH" | "SHOW_LOW_STOCK" | "SHOW_EXPIRING" | "ADD_PRODUCT_PREFILL" | "ADD_CUSTOMER_PREFILL" | "RECEIVE_PAYMENT_PREFILL" | "FILTER_REPORT",
    "payload": { ... }
  }
}
If no action is required, set action to null.

Keep responses concise, professional, clear, and focused on business value.`;

    const contents = `Business Context Data:
${JSON.stringify(contextData || {}, null, 2)}

User Question/Request:
${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch {
      return res.json({
        text: responseText,
        action: null,
      });
    }
  } catch (error: any) {
    console.error("Error in /api/ai/chat:", error);
    return res.status(500).json({
      text: "Unable to process AI request. Please try again or use direct interface buttons.",
      error: error.message,
    });
  }
});

// AI Plain Text or Image Bill Parser for Bulk Import
app.post("/api/ai/extract-products", async (req, res) => {
  try {
    const { rawText, imageBase64, mimeType } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is missing. Please configure key in Settings > Secrets.",
      });
    }

    const systemInstruction = `You are an expert medical inventory OCR and parsing engine.
Convert supplier invoices, scanned bills, handwritten/printed stock lists, images, or raw text into a structured JSON array of products.
Return a valid JSON object strictly with structure:
{
  "products": [
    {
      "name": "Product Brand/Name (e.g. Paracetamol 650mg)",
      "company": "Company Name (e.g. Cipla)",
      "category": "Tablet" | "Capsule" | "Syrup" | "Injection" | "Cream" | "Equipment" | "Other",
      "mrp": 120,
      "sellingRate": 95,
      "purchaseRate": 80,
      "stock": 100,
      "batchNumber": "B2026-01",
      "expiryDate": "2027-12-31",
      "gstPercent": 12,
      "packSize": "10's",
      "hsnCode": "3004"
    }
  ]
}`;

    let contents: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents = [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
        "Extract all medicine line items, batches, expiry dates, rates, MRPs, and quantities from this invoice image into JSON format.",
      ];
    } else {
      contents = [rawText || ""];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || '{"products":[]}');
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/extract-products:", error);
    return res.status(500).json({ error: error.message });
  }
});

// AI Business Forecast & Insights Endpoint
app.post("/api/ai/insights", async (req, res) => {
  try {
    const { salesHistory, inventoryValuation, topDebtors } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({
        insights: [
          "Sales trend is healthy across major brands.",
          "Consider following up with top pending customer balances.",
          "Keep safety stock levels for fast-moving antibiotics and analgesics."
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Analyze this pharmaceutical agency data and provide 4 strategic bullet points for the owner:
Sales History: ${JSON.stringify(salesHistory || [])}
Inventory Value: ${inventoryValuation}
Top Debtors: ${JSON.stringify(topDebtors || [])}`,
      config: {
        systemInstruction: "You are a senior pharmaceutical ERP consultant. Provide 4 actionable, practical business insights formatted as a JSON string array.",
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ insights: Array.isArray(parsed) ? parsed : [response.text] });
  } catch (error: any) {
    return res.json({ insights: ["Regularly review expiring products within 60 days.", "Optimize credit limits for high-turnover retail clients."] });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[QMMS] Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
