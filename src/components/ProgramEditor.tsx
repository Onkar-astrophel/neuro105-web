"use client";

import { useEffect, useState } from "react";
import { useRtdbValue } from "@/hooks/useRtdbValue";
import { requestReadProgram, writeRegister, writeRegisters } from "@/lib/rtdb";
import { Button, Card, Input } from "./ui";

interface ProgramBlob {
  repeat?: number;
  links?: Record<string, number>;
  ts?: number;
}

export function ProgramEditor() {
  const [programNo, setProgramNo] = useState("1");
  const p = Math.min(16, Math.max(1, parseInt(programNo, 10) || 1));
  const { data: program } = useRtdbValue<ProgramBlob>(`/neuro105/program/${p}`);

  const [repeat, setRepeat] = useState("");
  const [links, setLinks] = useState<string[]>(Array(32).fill(""));
  const [reading, setReading] = useState(false);
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    if (!program) return;
    if (program.repeat !== undefined) setRepeat(String(program.repeat));
    if (program.links) {
      setLinks(Array.from({ length: 32 }, (_, i) => String(program.links?.[String(i)] ?? "")));
    }
  }, [program]);

  async function readProgram() {
    setReading(true);
    await requestReadProgram(p);
    setTimeout(() => setReading(false), 2500);
  }

  async function writeProgram() {
    if (!confirm(`Write these values to Program ${p}?`)) return;
    setWriting(true);
    try {
      if (repeat.trim() !== "") {
        await writeRegister(1300 + (p - 1), parseInt(repeat, 10) & 0xffff);
      }
      const filled: number[] = [];
      for (const txt of links) {
        if (txt.trim() === "") break;
        filled.push(parseInt(txt, 10) & 0xffff);
      }
      if (filled.length) {
        await writeRegisters(1316 + (p - 1) * 32, filled);
      }
    } finally {
      setWriting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Program Selection">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>Program No. (1-16):</span>
          <Input value={programNo} onChange={setProgramNo} width={70} />
          <Button onClick={readProgram} disabled={reading}>
            {reading ? "Reading…" : "Read Program"}
          </Button>
          <Button variant="primary" onClick={writeProgram} disabled={writing}>
            {writing ? "Writing…" : "Write Program"}
          </Button>
        </div>
      </Card>

      <Card title="Repeat Cycles (register 1300 + program-1)">
        <label style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
          Repeat Cycle for this Program [0 = run indefinitely, 1-99 = no. of cycles]:
          <div style={{ marginTop: 6 }}>
            <Input value={repeat} onChange={setRepeat} width={100} />
          </div>
        </label>
      </Card>

      <Card title="Linked Profile Numbers (registers 1316-1827, 32 entries per program, 0-30)">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 8,
          }}
        >
          {links.map((v, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span className="tabular" style={{ color: "var(--accent)", fontFamily: "var(--mono)", width: 20, textAlign: "right" }}>
                {i + 1}
              </span>
              <Input
                value={v}
                onChange={(nv) =>
                  setLinks((arr) => {
                    const next = [...arr];
                    next[i] = nv;
                    return next;
                  })
                }
                width={54}
              />
            </label>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--fg-muted)" }}>
          Start a program: set register 52 to the program number (Profile tab), enable coil 21 (Profile
          Operation Mode), then use coils 22-24 for Abort / Hold / Segment Advance from the Coils tab.
        </div>
      </Card>
    </div>
  );
}
