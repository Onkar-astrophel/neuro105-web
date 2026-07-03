"use client";

import { useEffect, useState } from "react";
import { useRtdbValue } from "@/hooks/useRtdbValue";
import { requestReadAll, writeRegister } from "@/lib/rtdb";
import { rawToDisplay, displayToRaw, type RegSpec } from "@/lib/paramMap";
import { Button, Card, Input } from "./ui";

interface ParamsBlob {
  ts?: number;
  [addr: string]: number | undefined;
}

export function ParamTable({ title, specs }: { title: string; specs: RegSpec[] }) {
  const { data: params } = useRtdbValue<ParamsBlob>("/neuro105/params");
  const { data: live } = useRtdbValue<{ resFactor?: number }>("/neuro105/live");
  const [edits, setEdits] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const resFactor = live?.resFactor ?? 1;

  useEffect(() => {
    // seed the edit boxes from the last known param values whenever a fresh
    // read_all lands, but don't clobber a value the user is mid-typing.
    if (!params) return;
    setEdits((prev) => {
      const next = { ...prev };
      for (const spec of specs) {
        if (next[spec.addr] === undefined) {
          const raw = params[String(spec.addr)];
          if (raw !== undefined) next[spec.addr] = rawToDisplay(spec, raw, resFactor);
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function readAll() {
    setRefreshing(true);
    await requestReadAll();
    setTimeout(() => setRefreshing(false), 2000);
  }

  async function writeOne(spec: RegSpec) {
    const text = edits[spec.addr];
    if (text === undefined || text.trim() === "") return;
    setPending((p) => ({ ...p, [spec.addr]: true }));
    try {
      const raw = displayToRaw(spec, text, resFactor);
      await writeRegister(spec.addr, raw);
    } finally {
      setPending((p) => ({ ...p, [spec.addr]: false }));
    }
  }

  return (
    <Card
      title={title}
      right={
        <Button small onClick={readAll} disabled={refreshing}>
          {refreshing ? "Reading…" : `Read All (${specs.length})`}
        </Button>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--fg-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <th style={{ padding: "6px 8px", width: 56 }}>Addr</th>
              <th style={{ padding: "6px 8px" }}>Parameter</th>
              <th style={{ padding: "6px 8px", width: 160 }}>Value</th>
              <th style={{ padding: "6px 8px", width: 70 }} />
              <th style={{ padding: "6px 8px" }}>Range / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.addr} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="tabular" style={{ padding: "6px 8px", color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 700 }}>
                  {spec.addr}
                </td>
                <td style={{ padding: "6px 8px" }}>{spec.name}</td>
                <td style={{ padding: "6px 8px" }}>
                  {spec.enum ? (
                    <select
                      value={edits[spec.addr]?.split(":")[0]?.trim() ?? ""}
                      onChange={(e) =>
                        setEdits((p) => ({
                          ...p,
                          [spec.addr]: `${e.target.value} : ${spec.enum![Number(e.target.value)]}`,
                        }))
                      }
                      style={{
                        width: "100%",
                        background: "var(--panel)",
                        color: "var(--fg)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: "5px 6px",
                        fontSize: 12.5,
                      }}
                    >
                      <option value="" disabled>
                        select…
                      </option>
                      {Object.entries(spec.enum).map(([k, v]) => (
                        <option key={k} value={k}>
                          {k} : {v}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={edits[spec.addr] ?? ""}
                      onChange={(v) => setEdits((p) => ({ ...p, [spec.addr]: v }))}
                      readOnly={spec.ro}
                    />
                  )}
                </td>
                <td style={{ padding: "6px 8px" }}>
                  {!spec.ro && (
                    <Button small onClick={() => writeOne(spec)} disabled={pending[spec.addr]}>
                      {pending[spec.addr] ? "…" : "Write"}
                    </Button>
                  )}
                </td>
                <td style={{ padding: "6px 8px", color: "var(--fg-muted)", fontSize: 12 }}>
                  {[spec.range, spec.note].filter(Boolean).join("  |  ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
