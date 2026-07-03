"use client";

import { useEffect, useState } from "react";
import { useRtdbValue } from "@/hooks/useRtdbValue";
import { requestReadProfile, writeRegister, writeRegisters } from "@/lib/rtdb";
import { ARRAYS, RW_PROFILE_GLOBALS, toSigned, toUnsigned } from "@/lib/paramMap";
import { Button, Card, Input } from "./ui";
import { ParamTable } from "./ParamTable";

interface ProfileBlob {
  ts?: number;
  [arrayKey: string]: unknown;
}

const COLS: Array<[key: string, label: string]> = [
  ["ramp_rate", "Ramp Rate (units/min)"],
  ["target_sp", "Target Setpoint"],
  ["soak_time", "Soak Time (min)"],
  ["ev2_status", "OP-2 Event (b0=R b1=S)"],
  ["ev2_ramp", "OP-2 Ev.Time Ramp (min)"],
  ["ev2_soak", "OP-2 Ev.Time Soak (min)"],
  ["ev3_status", "OP-3 Event (b0=R b1=S)"],
  ["ev3_ramp", "OP-3 Ev.Time Ramp (min)"],
  ["ev3_soak", "OP-3 Ev.Time Soak (min)"],
];

function arrFactor(key: string, resFactor: number): number {
  const f = ARRAYS[key].factor;
  return f === "res" ? resFactor : (f as number) ?? 1;
}

export function ProfileEditor() {
  const [profileNo, setProfileNo] = useState("1");
  const { data: live } = useRtdbValue<{ resFactor?: number }>("/neuro105/live");
  const resFactor = live?.resFactor ?? 1;
  const p = Math.min(16, Math.max(1, parseInt(profileNo, 10) || 1));

  const { data: profile } = useRtdbValue<ProfileBlob>(`/neuro105/profile/${p}`);

  const [scalars, setScalars] = useState<Record<string, string>>({});
  const [cells, setCells] = useState<Record<string, string[]>>(
    () => Object.fromEntries(COLS.map(([k]) => [k, Array(8).fill("")]))
  );
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const nextScalars: Record<string, string> = {};
    for (const key of ["sets", "ramp_band", "soak_band"]) {
      const arr = profile[key] as Record<string, number> | undefined;
      if (arr) nextScalars[key] = String(arr["0"]);
    }
    setScalars(nextScalars);

    const nextCells: Record<string, string[]> = {};
    for (const [key] of COLS) {
      const arr = profile[key] as Record<string, number> | undefined;
      const f = arrFactor(key, resFactor);
      const signed = ARRAYS[key].signed;
      const vals = Array.from({ length: 8 }, (_, i) => {
        const raw = arr?.[String(i)];
        if (raw === undefined) return "";
        const v = signed ? toSigned(raw) : raw;
        return f !== 1 ? String(v / f) : String(v);
      });
      nextCells[key] = vals;
    }
    setCells(nextCells);
  }, [profile, resFactor]);

  async function readProfile() {
    setReading(true);
    await requestReadProfile(p);
    setTimeout(() => setReading(false), 2500);
  }

  async function writeProfile() {
    if (!confirm(`Write all filled-in values of this table to Profile ${p} on the controller?`)) return;
    setWriting(true);
    try {
      for (const key of ["sets", "ramp_band", "soak_band"]) {
        const txt = scalars[key]?.trim();
        if (txt) {
          const addr = ARRAYS[key].base + (p - 1) * ARRAYS[key].per;
          await writeRegister(addr, toUnsigned(Math.round(parseFloat(txt))));
        }
      }
      for (const [key] of COLS) {
        const a = ARRAYS[key];
        const f = arrFactor(key, resFactor);
        const addr = a.base + (p - 1) * a.per;
        const vals: number[] = [];
        for (const txt of cells[key] ?? []) {
          if (!txt || txt.trim() === "") break;
          vals.push(toUnsigned(Math.round(parseFloat(txt) * f)));
        }
        if (vals.length) {
          if (vals.length === 1) await writeRegister(addr, vals[0]);
          else await writeRegisters(addr, vals);
        }
      }
    } finally {
      setWriting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Profile Selection">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>Profile No. (1-16):</span>
          <Input value={profileNo} onChange={setProfileNo} width={70} />
          <Button onClick={readProfile} disabled={reading}>
            {reading ? "Reading…" : "Read Profile"}
          </Button>
          <Button variant="primary" onClick={writeProfile} disabled={writing}>
            {writing ? "Writing…" : "Write Profile"}
          </Button>
        </div>
      </Card>

      <ParamTable title="Profile / Program Globals (registers 50-52)" specs={RW_PROFILE_GLOBALS} />

      <Card title="Per-Profile Settings">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {(["sets", "ramp_band", "soak_band"] as const).map((key) => (
            <label key={key} style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
              {ARRAYS[key].name} [{ARRAYS[key].rng}]
              <div style={{ marginTop: 4 }}>
                <Input
                  value={scalars[key] ?? ""}
                  onChange={(v) => setScalars((s) => ({ ...s, [key]: v }))}
                  width={90}
                />
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card title="Segment Sets (8 sets = up to 16 segments: each set is one Ramp + one Soak)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, width: "100%" }}>
            <thead>
              <tr style={{ color: "var(--fg-muted)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                <th style={{ padding: "4px 6px", textAlign: "left" }}>Set #</th>
                {COLS.map(([key, label]) => (
                  <th key={key} style={{ padding: "4px 6px", textAlign: "left", minWidth: 110 }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, s) => (
                <tr key={s} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="tabular" style={{ padding: "4px 6px", color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 700 }}>
                    {s + 1}
                  </td>
                  {COLS.map(([key]) => (
                    <td key={key} style={{ padding: "4px 6px" }}>
                      <Input
                        value={cells[key]?.[s] ?? ""}
                        onChange={(v) =>
                          setCells((c) => {
                            const arr = [...(c[key] ?? Array(8).fill(""))];
                            arr[s] = v;
                            return { ...c, [key]: arr };
                          })
                        }
                        width={100}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--fg-muted)" }}>
          Read Profile pulls all arrays for the selected profile via the gateway; Write Profile pushes every
          non-empty cell back (multi-register writes, max 64/frame).
        </div>
      </Card>
    </div>
  );
}
