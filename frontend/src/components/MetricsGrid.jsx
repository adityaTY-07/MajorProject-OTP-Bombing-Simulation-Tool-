import React from "react";

export function MetricsGrid({ metrics }) {
  const cards = [
    { label: "Total Requests", value: metrics.total, color: "" },
    { label: "Accepted", value: metrics.accepted, color: "green" },
    { label: "Rate Limited", value: metrics.limited, color: "amber" },
    { label: "Blocked (Blacklist)", value: metrics.blocked, color: "red" },
    {
      label: "Avg Latency",
      value: `${metrics.averageLatencyMs ?? 0}ms`,
      color: ""
    },
    {
      label: "Simulated Cost",
      value: `$${(metrics.simulatedCostUsd ?? 0).toFixed(3)}`,
      color: ""
    }
  ];

  return (
    <section className="metrics" aria-label="System Metrics">
      {cards.map((card, idx) => (
        <article key={idx} className="metric">
          <span>{card.label}</span>
          <strong className={card.color}>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}

