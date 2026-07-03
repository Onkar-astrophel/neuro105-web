"use client";

import { useEffect, useState } from "react";
import { useRtdbValue } from "@/hooks/useRtdbValue";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button } from "./ui";
import type { StatusData } from "@/lib/rtdb";

// The gateway stamps lastSeen with millis()/1000 (seconds since ESP32 boot),
// not a Unix timestamp, since the device has no RTC. So "online" can't be
// judged by comparing lastSeen to wall-clock time - instead we track when
// *this browser* last observed lastSeen change, and call it offline if that
// hasn't happened recently (gateway pushes a heartbeat every STATUS_PUSH_MS).
const STALE_MS = 15000;

function timeAgo(ms: number | null): string {
  if (ms === null) return "never";
  const secs = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export function StatusHeader() {
  const { data: status } = useRtdbValue<StatusData>("/neuro105/status");
  const { user, logout } = useAuth();

  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status?.lastSeen !== undefined) setLastSeenAt(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.lastSeen]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const online = !!status?.online && lastSeenAt !== null && now - lastSeenAt < STALE_MS;

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
          last seen {timeAgo(lastSeenAt)}
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
