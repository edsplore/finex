import type { Express } from "express";

export function registerRoutes(app: Express) {
  app.post("/api/register-call", async (req, res) => {
    const { agentId } = req.body;
    const apiKey = process.env.RETELL_API_KEY;
    const sampleRate = parseInt(process.env.RETELL_SAMPLE_RATE || "16000", 10);

    if (!apiKey) {
      return res.status(500).json({ error: "RETELL_API_KEY not configured" });
    }

    try {
      const response = await fetch("https://api.retellai.com/v2/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          stream_voice: true,
          enable_update: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      res.status(200).json({
        callId: data.call_id,
        accessToken: data.access_token,
        sampleRate: sampleRate,
      });
    } catch (error) {
      console.error("Error registering call:", error);
      res.status(500).json({ error: "Failed to register call" });
    }
  });
}