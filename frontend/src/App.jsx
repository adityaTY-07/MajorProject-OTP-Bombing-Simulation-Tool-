import React, { useState, useEffect, useRef, useCallback } from "react";
import { Topbar } from "./components/Topbar.jsx";
import { MetricsGrid } from "./components/MetricsGrid.jsx";
import { DefensiveControls, ControlList } from "./components/DefensiveControls.jsx";
import { Simulator } from "./components/Simulator.jsx";
import { TelemetryChart } from "./components/TelemetryChart.jsx";
import { RequestLog } from "./components/RequestLog.jsx";

const API_BASE = window.location.origin.includes(":5173")
  ? "http://127.0.0.1:8080"
  : window.location.origin;

const WS_BASE = API_BASE.replace(/^http/i, "ws");

export default function App() {
  const [config, setConfig] = useState({
    rateLimiting: true,
    exponentialBackoff: true,
    ipBlacklisting: true
  });
  const [metrics, setMetrics] = useState({
    total: 0,
    accepted: 0,
    limited: 0,
    blocked: 0,
    totalLatencyMs: 0,
    simulatedCostUsd: 0,
    averageLatencyMs: 0,
    memoryRssMb: 35,
    uptimeSeconds: 0
  });
  const [demoStatus, setDemoStatus] = useState({ running: false, generated: 0 });
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000);

  // Fetch initial security configuration
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load security configuration.");
        return res.json();
      })
      .then((data) => setConfig(data))
      .catch((err) => setErrorMessage(err.message));
  }, []);

  // Establish resilient WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    try {
      const socket = new WebSocket(`${WS_BASE}/ws`);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        setErrorMessage("");
        reconnectDelayRef.current = 1000;
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.event === "snapshot") {
            if (payload.config) setConfig(payload.config);
            if (payload.metrics) setMetrics(payload.metrics);
            if (payload.demo) setDemoStatus(payload.demo);
            if (Array.isArray(payload.history)) {
              setEvents(payload.history.slice(0, 50));
            }
          } else if (payload.event === "telemetry") {
            if (payload.metrics) setMetrics(payload.metrics);
            if (payload.demo) setDemoStatus(payload.demo);
          } else {
            // New request or demo event
            if (payload.metrics) setMetrics(payload.metrics);
            if (payload.demo) setDemoStatus(payload.demo);
            setEvents((prev) => [payload, ...prev].slice(0, 50));
          }
        } catch (e) {
          console.error("Telemetry parse error:", e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 1.5, 15000);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (e) {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectWebSocket]);

  // Toggle defensive config
  const handleToggle = async (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    setIsUpdating(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error("Failed to save security configuration.");
      const saved = await res.json();
      setConfig(saved);
    } catch (err) {
      setErrorMessage(err.message);
      // Revert on error
      setConfig(config);
    } finally {
      setIsUpdating(false);
    }
  };

  // Trigger manual mock request
  const handleRequestOtp = async (recipient) => {
    setIsRequesting(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE}/api/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient })
      });
      const data = await res.json();
      if (!res.ok && res.status !== 429 && res.status !== 403) {
        setErrorMessage(data.error || "Request failed.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  // Start synthetic demo burst
  const handleStartDemo = async (durationSeconds = 5, eventsPerSecond = 2) => {
    try {
      const res = await fetch(`${API_BASE}/api/demo/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds, eventsPerSecond })
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || "Could not start demo.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Stop synthetic demo burst
  const handleStopDemo = async () => {
    try {
      await fetch(`${API_BASE}/api/demo/stop`, { method: "POST" });
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="shell">
      <Topbar isConnected={isConnected} />

      {errorMessage && (
        <div className="error" role="alert">
          <strong>Alert:</strong> {errorMessage}
        </div>
      )}

      <MetricsGrid metrics={metrics} />

      <main className="columns">
        <section className="panel controls">
          <DefensiveControls config={config} onToggle={handleToggle} isUpdating={isUpdating} />
          <ControlList config={config} onToggle={handleToggle} isUpdating={isUpdating} />

          <Simulator
            memoryRssMb={metrics.memoryRssMb}
            onRequestOtp={handleRequestOtp}
            onStartDemo={handleStartDemo}
            onStopDemo={handleStopDemo}
            demoStatus={demoStatus}
            isLoading={isRequesting}
          />
        </section>

        <section className="panel telemetry">
          <div className="panel-heading">
            <div className="eyebrow">EVENT STREAM</div>
            <span className="stream-label">WEBSOCKET</span>
          </div>

          <TelemetryChart events={events} />
          <RequestLog events={events} />
        </section>
      </main>

      <footer>
        Educational sandbox only. Requests are simulated locally; no external SMS/OTP deliveries or carriers contacted.
      </footer>
    </div>
  );
}

