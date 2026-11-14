import React from "react";

export function Topbar({ isConnected }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">OTP SECURITY BENCHMARK</div>
        <h1>OTP Security Sandbox</h1>
        <p>
          Local educational environment simulating SMS/OTP high-frequency request bursts,
          token-bucket rate limiting, and defensive controls.
        </p>
      </div>
      <div className={`connection ${isConnected ? "online" : ""}`}>
        <i />
        <span>{isConnected ? "LIVE TELEMETRY" : "CONNECTING..."}</span>
      </div>
    </header>
  );
}

