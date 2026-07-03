"use client";

import { useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { writeCoil, writeRegister, writeRegisters } from "@/lib/rtdb";
import { Button, Card, Input } from "./ui";

type Table = "holding" | "input" | "coils";

export function Console() {
  const [table, setTable] = useState<Table>("holding");
  const [addr, setAddr] = useState("1");
  const [count, setCount] = useState("1");
  const [writeVals, setWriteVals] = useState("");
  const [log, setLog] = useState<string[]>([]);

  function appendLog(line: string) {
    const ts = new Date().toLocaleTimeString();
    setLog((l) => [...l.slice(-500), `[${ts}] ${line}`]);
  }

  async function doRead() {
    const a = parseInt(addr, 10);
    const c = Math.max(1, parseInt(count, 10) || 1);
    // For reads we just show whatever's currently cached in /neuro105/params
    // or /neuro105/live coils - live reads are gateway-driven, not on-demand
    // per-address, so this reflects the most recent poll instead of issuing
    // a fresh transaction (see README for the on-demand read_all/read_profile
    // commands used elsewhere in the dashboard).
    if (table === "coils") {
      onValue(
        ref(db, "/neuro105/live/coils"),
        (snap) => {
          const coils = snap.val() ?? {};
          const vals = Array.from({ length: c }, (_, i) => coils[String(a + i)]);
          appendLog(`READ coils @${a} x${c} -> ${vals.map((v) => (v ? 1 : 0)).join(", ")}`);
        },
        { onlyOnce: true }
      );
      return;
    }
    const path = table === "input" ? "/neuro105/live" : "/neuro105/params";
    onValue(
      ref(db, path),
      (snap) => {
        const data = snap.val() ?? {};
        appendLog(`READ ${table} @${addr} x${count} -> (see /neuro105${table === "input" ? "/live" : "/params"} snapshot: ${JSON.stringify(data).slice(0, 200)})`);
      },
      { onlyOnce: true }
    );
  }

  async function doWrite() {
    const a = parseInt(addr, 10);
    const vals = writeVals
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map((v) => parseInt(v, 10));
    if (!vals.length) return;
    if (table === "coils") {
      for (let i = 0; i < vals.length; i++) {
        await writeCoil(a + i, !!vals[i]);
      }
    } else if (vals.length === 1) {
      await writeRegister(a, vals[0] & 0xffff);
    } else {
      await writeRegisters(a, vals.map((v) => v & 0xffff));
    }
    appendLog(`WRITE ${table} @${a} <- ${vals.join(", ")} (command queued)`);
    setWriteVals("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card title="Custom Modbus Transaction (datasheet addressing)">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
            Table
            <div style={{ marginTop: 4 }}>
              <select
                value={table}
                onChange={(e) => setTable(e.target.value as Table)}
                style={{
                  background: "var(--panel)",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "6px 8px",
                  fontSize: 13,
                }}
              >
                <option value="holding">Holding (R/W regs)</option>
                <option value="input">Input (Read-Only regs)</option>
                <option value="coils">Coils</option>
              </select>
            </div>
          </label>
          <label style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
            Address
            <div style={{ marginTop: 4 }}>
              <Input value={addr} onChange={setAddr} width={80} />
            </div>
          </label>
          <label style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
            Count
            <div style={{ marginTop: 4 }}>
              <Input value={count} onChange={setCount} width={60} />
            </div>
          </label>
          <Button onClick={doRead}>Read</Button>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12.5, color: "var(--fg-muted)", flex: 1 }}>
            Write value(s), comma separated
            <div style={{ marginTop: 4 }}>
              <Input value={writeVals} onChange={setWriteVals} placeholder="e.g. 850 or 1,2,3" />
            </div>
          </label>
          <Button variant="primary" onClick={doWrite} disabled={!writeVals.trim()}>
            Write
          </Button>
        </div>
      </Card>

      <Card
        title="Log"
        right={
          <Button small variant="ghost" onClick={() => setLog([])}>
            Clear
          </Button>
        }
      >
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: 10,
            height: 300,
            overflowY: "auto",
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--good)",
            whiteSpace: "pre-wrap",
          }}
        >
          {log.length === 0 ? (
            <span style={{ color: "var(--fg-muted)" }}>No activity yet.</span>
          ) : (
            log.map((line, i) => <div key={i}>{line}</div>)
          )}
        </div>
      </Card>
    </div>
  );
}
