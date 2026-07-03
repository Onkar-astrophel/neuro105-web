"use client";

import { useState } from "react";
import { useRtdbValue } from "@/hooks/useRtdbValue";
import type { LiveData } from "@/lib/rtdb";
import { writeRegister } from "@/lib/rtdb";
import { COILS } from "@/lib/paramMap";
import { Card, StatPill, Lamp, Badge, Button, Input } from "./ui";

function fmt(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "--";
  return n.toFixed(Math.abs(n) < 10 ? digits : digits);
}

export function LiveMonitor() {
  const { data: live } = useRtdbValue<LiveData>("/neuro105/live");
  const [quickSp, setQuickSp] = useState("");
  const [writing, setWriting] = useState(false);

  const resFactor = live?.resFactor ?? 1;
  const errLabel = ["None", "OPEN", "OVER-RANGE", "UNDER-RANGE"][live?.pvError ?? 0] ?? "?";
  const hasErr = (live?.pvError ?? 0) !== 0;

  async function submitQuickSp() {
    const num = parseFloat(quickSp);
    if (Number.isNaN(num)) return;
    setWriting(true);
    try {
      await writeRegister(15, Math.round(num * resFactor));
      setQuickSp("");
    } finally {
      setWriting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatPill
          label="Process Value (PV)"
          value={hasErr ? "ERR" : fmt(live?.pv)}
          unit={hasErr ? undefined : "°C"}
          tone={hasErr ? "bad" : "default"}
        />
        <StatPill label="Control Setpoint" value={fmt(live?.sp)} unit="°C" />
        <StatPill label="% Output Power" value={fmt(live?.power)} unit="%" />
        <StatPill label="Ambient °C" value={fmt(live?.ambient)} unit="°C" size="md" />
        <StatPill
          label="PV Error"
          value={errLabel}
          tone={hasErr ? "bad" : "good"}
          size="md"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 12,
        }}
      >
        <Card title="Status (coils 1-8)">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            {COILS.slice(0, 8).map((c) => (
              <Lamp key={c.addr} on={!!live?.coils?.[String(c.addr)]} label={c.name} />
            ))}
          </div>
        </Card>

        <Card title="Profile Status">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge tone={live?.hold ? "warn" : live?.running ? "good" : "default"}>
                {live?.hold ? "HOLD" : live?.running ? "RUNNING" : "IDLE"}
              </Badge>
            </div>
            <div className="tabular" style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              Segment {live?.segNo ?? "--"} ({live?.segKind ?? "--"})
            </div>
            <div className="tabular" style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              Program {live?.program ?? "--"} · Profile {live?.profile ?? "--"}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Quick Setpoint">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Input value={quickSp} onChange={setQuickSp} placeholder="e.g. 850" width={140} />
          <Button variant="primary" onClick={submitQuickSp} disabled={writing || !quickSp}>
            {writing ? "Writing…" : "Write SP"}
          </Button>
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
            Sends a write_reg command to register 15; the gateway applies it on the next command poll (~300ms).
          </span>
        </div>
      </Card>
    </div>
  );
}
