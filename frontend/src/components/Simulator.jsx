import React, { useState } from "react";

export function Simulator({ memoryRssMb, onRequestOtp, onStartDemo, onStopDemo, demoStatus, isLoading }) {
  const [recipient, setRecipient] = useState("+1-555-0199");
  const [demoDuration, setDemoDuration] = useState(5);
  const [demoRate, setDemoRate] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipient.trim() || isLoading) return;
    onRequestOtp(recipient.trim());
  };

  const handleDemoToggle = () => {
    if (demoStatus?.running) {
      onStopDemo();
    } else {
      onStartDemo(Number(demoDuration), Number(demoRate));
    }
  };

  const memPercent = Math.min(100, Math.max(10, ((memoryRssMb ?? 30) / 120) * 100));

  return (
    <div className="simulator">
      <h2>Interactive Simulation Sandbox</h2>
      <p>
        Trigger manual requests or synthetic bursts. Requests are evaluated locally against active defenses;
        no real SMS or external network calls are performed.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="recipient">Target Identifier (Mock Phone / IP)</label>
        <div className="request-row">
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="+1-555-0199"
            maxLength={32}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Testing..." : "Test Request"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ margin: 0 }}>Synthetic Demo Burst</label>
          <span style={{ fontSize: "11px", color: demoStatus?.running ? "#34d399" : "#64748b" }}>
            {demoStatus?.running ? `Running: ${demoStatus.generated} events` : "Idle"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleDemoToggle}
            style={{
              flex: 1,
              background: demoStatus?.running
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              boxShadow: demoStatus?.running
                ? "0 4px 14px rgba(239, 68, 68, 0.3)"
                : "0 4px 14px rgba(14, 165, 233, 0.3)"
            }}
          >
            {demoStatus?.running ? "Stop Demo" : "Start Synthetic Burst (5s)"}
          </button>
        </div>
      </div>

      <div className="resource" aria-label="Backend memory usage">
        <div>
          <span>Node.js Memory (RSS)</span>
          <span>{memoryRssMb ?? 0} MB</span>
        </div>
        <div className="resource-track">
          <i style={{ width: `${memPercent}%` }} />
        </div>
      </div>
    </div>
  );
}

