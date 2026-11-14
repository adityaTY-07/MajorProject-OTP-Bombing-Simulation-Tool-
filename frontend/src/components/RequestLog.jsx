import React from "react";

export function RequestLog({ events }) {
  const formatTime = (ts) => {
    if (!ts) return "00:00:00";
    try {
      const d = new Date(ts);
      return d.toTimeString().split(" ")[0];
    } catch {
      return ts;
    }
  };

  return (
    <>
      <div className="log-heading">
        <strong>Request Log</strong>
        <small>{events.length} Recorded</small>
      </div>

      <div className="logs" aria-live="polite">
        {events.length === 0 ? (
          <div className="empty">No requests logged yet. Use the simulator to send traffic.</div>
        ) : (
          events.map((evt, idx) => {
            const isAccepted = evt.status === 202;
            const isWarn = evt.status === 429;
            const isDanger = evt.status === 403;
            const statusClass = isAccepted
              ? "status"
              : isWarn
              ? "status warn"
              : "status danger";

            return (
              <div key={idx} className="log">
                <time>{formatTime(evt.timestamp)}</time>
                <div>
                  <span className={statusClass}>{evt.status ?? "---"}</span>
                </div>
                <div className="event" title={evt.label || evt.event}>
                  {evt.label || `[${evt.source || "traffic"}] ${evt.event}`}
                </div>
                <div className="latency">{evt.latencyMs != null ? `${evt.latencyMs}ms` : "-"}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

