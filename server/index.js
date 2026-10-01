import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const port = process.env.PORT || 8787;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim()) : true,
}));
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/claude", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: "ANTHROPIC_API_KEY is not configured on the server." } });
  }

  const { model, max_tokens, messages, tools, system, temperature, ...rest } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: "messages must be an array." } });
  }

  try {
    const request = {
      model: model || "claude-sonnet-4-6",
      max_tokens: max_tokens || 1000,
      messages,
      ...rest,
    };
    if (tools) request.tools = tools;
    if (system) request.system = system;
    if (temperature !== undefined) request.temperature = temperature;

    const response = await client.messages.create(request);
    res.json(response);
  } catch (error) {
    const status = error?.status && Number.isInteger(error.status) ? error.status : 502;
    res.status(status).json({
      error: {
        message: error?.message || "Anthropic request failed.",
        type: error?.error?.type || error?.type || "api_error",
      },
    });
  }
});

app.listen(port, () => {
  console.log(`My Study Notebook API listening on http://localhost:${port}`);
});
