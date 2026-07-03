"use client";

import { useRtdbValue } from "@/hooks/useRtdbValue";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button } from "./ui";
import type { StatusData } from "@/lib/rtdb";

function timeAgo(unixSeconds?: number): string {
  if (!unixSeconds) return "never";
  const secs = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function StatusHeader() {
  const { data: status } = useRtdbValue<StatusData>("/neuro105/status");
  const { user, logout } = useAuth();

  const online = status?.online && status?.lastSeen && Date.now() / 1000 - status.lastSeen < 15;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--panel)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Neuro 105</div>
        <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>Remote Dashboard</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Badge tone={online ? "good" : "bad"}>{online ? "GATEWAY ONLINE" : "GATEWAY OFFLINE"}</Badge>
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          last seen {timeAgo(status?.lastSeen)}
          {typeof status?.rssi === "number" && ` · RSSI ${status.rssi} dBm`}
        </span>
        {user && (
          <>
            <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{user.email}</span>
            <Button small variant="ghost" onClick={logout}>
              Sign out
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
