export function createRequestController({ requestService }) {
  return {
    create(req, res) {
      const recipient = req.body?.recipient;
      if (typeof recipient !== "string" || recipient.length < 3 || recipient.length > 64) {
        return res.status(400).json({ error: "recipient must be between 3 and 64 characters." });
      }

      const client = req.ip ?? "unknown";
      const result = requestService.submit({ client });
      if (result.type === "blocked") {
        return res.status(429).json({ error: result.message });
      }
      if (result.type === "rate-limited") {
        res.setHeader("Retry-After", String(result.retryAfterSeconds));
        return res.status(429).json({ error: result.message });
      }

      res.status(202).json({
        message: "Mock OTP request accepted; no message was sent.",
        simulatedCostUsd: result.simulatedCost
      });
    }
  };
}
