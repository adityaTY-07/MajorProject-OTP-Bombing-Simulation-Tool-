import React from "react";

export function TelemetryChart({ events }) {
  // Take last 24 events for chart columns
  const recentEvents = events.slice(0, 24).reverse();
  const hasEvents = recentEvents.length > 0;

  return (
    <div className="chart" aria-label="Real-time request telemetry">
      <div className="chart-title">
        <span>LIVE REQUEST STREAM</span>
        <small>LAST {recentEvents.length} CALLS</small>
      </div>

      <div className="bars">
        {!hasEvents && (
          <div className="empty-chart">Make a manual request to begin.</div>
        )}

        {recentEvents.map((evt, idx) => {
          const isAccepted = evt.status === 202;
          const isLimited = evt.status === 429;
          const isBlocked = evt.status === 403;
          const barClass = isAccepted
            ? "accepted"
            : isLimited
            ? "limited"
            : "limited"; // default to limited or warn style

          // Height based on latency or fixed visual height
          const height = Math.min(100, Math.max(20, (evt.latencyMs ?? 15) * 3));

          return (
            <div key={idx} className="bar-track" title={`${evt.status}: ${evt.latencyMs ?? 0}ms`}>
              <span
                className={`bar ${barClass}`}
                style={{
                  height: `${height}%`,
                  background: isBlocked
                    ? "linear-gradient(180deg, #f87171 0%, #dc2626 100%)"
                    : undefined
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="legend">
        <span>
          <i className="green-dot" /> Accepted (202)
        </span>
        <span>
          <i className="amber-dot" /> Limited (429)
        </span>
      </div>
    </div>
  );
}

