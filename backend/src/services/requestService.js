export function createRequestService({ state, telemetry }) {
  function submit({ client }) {
    const startedAt = performance.now();
    const now = Date.now();

    function record(status, event, cost = 0) {
      const latencyMs = Number((performance.now() - startedAt).toFixed(1));
      telemetry.recordRequest({ status, latencyMs, event, cost });
    }

    if (
      state.getSecurityConfig().ipBlacklisting &&
      state.isBlacklisted(client, now)
    ) {
      record(429, "blocked");
      return { type: "blocked", message: "Sandbox client is temporarily blocked." };
    }

    const backoffUntil = state.getBackoffUntil(client);
    if (state.getSecurityConfig().exponentialBackoff && backoffUntil > now) {
      record(429, "rate-limited");
      return {
        type: "rate-limited",
        message: "Retry delay is active. Wait before trying again.",
        retryAfterSeconds: Math.ceil((backoffUntil - now) / 1000)
      };
    }

    if (state.getSecurityConfig().rateLimiting) {
      const result = state.consumeToken(client, now);
      if (!result.allowed) {
        const defense = state.recordDeniedAttempt(client, now);
        const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
        record(429, defense.blocked ? "blocked" : "rate-limited");
        return {
          type: "rate-limited",
          message: defense.reason,
          retryAfterSeconds
        };
      }
    }

    const simulatedCost = 0.007;
    record(202, "otp-simulated", simulatedCost);
    return { type: "accepted", simulatedCost };
  }

  return { submit };
}
