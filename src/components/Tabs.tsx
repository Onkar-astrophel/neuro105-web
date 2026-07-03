"use client";

import { useState, type ReactNode } from "react";

export function Tabs({ tabs }: { tabs: Array<{ label: string; content: ReactNode }> }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          marginBottom: 18,
          overflowX: "auto",
        }}
      >
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              background: "transparent",
              border: "none",
              borderBottom: i === active ? "2px solid var(--accent)" : "2px solid transparent",
              color: i === active ? "var(--fg)" : "var(--fg-muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs[active].content}
    </div>
  );
}
