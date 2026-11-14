import React from "react";

export function DefensiveControls({ config, onToggle, isUpdating }) {
  const controls = [
    {
      key: "rateLimiting",
      title: "Token Bucket Rate Limiting",
      description: "Restricts clients to 5 tokens burst capacity, refilling smoothly at 5 tokens/min."
    },
    {
      key: "exponentialBackoff",
      title: "Exponential Backoff",
      description: "Progressively increases Retry-After penalty delays for repeated unthrottled requests."
    },
    {
      key: "ipBlacklisting",
      title: "Autonomous IP Blacklisting",
      description: "Temporarily blacklists IPs that trigger excessive defensive denials within TTL windows."
    }
  ];

  const activeCount = Object.values(config).filter(Boolean).length;

  return (
    <div className="panel-heading">
      <h2>Defensive Controls</h2>
      <span className="enabled">{activeCount} / 3 Active</span>
    </div>
  );
}

export function ControlList({ config, onToggle, isUpdating }) {
  const controls = [
    {
      key: "rateLimiting",
      title: "Token Bucket Rate Limiting",
      description: "Restricts clients to 5 tokens burst capacity, refilling at 5 tokens/minute."
    },
    {
      key: "exponentialBackoff",
      title: "Exponential Backoff",
      description: "Progressively increases Retry-After penalty delays for continuous abusive requests."
    },
    {
      key: "ipBlacklisting",
      title: "Autonomous IP Blacklisting",
      description: "Temporarily rejects requests from IPs exceeding sustained denial thresholds."
    }
  ];

  return (
    <div className="control-list">
      {controls.map((control) => (
        <label key={control.key} className="control">
          <div>
            <strong>{control.title}</strong>
            <small>{control.description}</small>
          </div>
          <input
            type="checkbox"
            checked={!!config[control.key]}
            disabled={isUpdating}
            onChange={(e) => onToggle(control.key, e.target.checked)}
          />
        </label>
      ))}
    </div>
  );
}

