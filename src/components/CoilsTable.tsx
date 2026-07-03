"use client";

import { useRtdbValue } from "@/hooks/useRtdbValue";
import type { LiveData } from "@/lib/rtdb";
import { writeCoil } from "@/lib/rtdb";
import { COILS } from "@/lib/paramMap";
import { Badge, Button, Card } from "./ui";

export function CoilsTable() {
  const { data: live } = useRtdbValue<LiveData>("/neuro105/live");
  const coils = live?.coils ?? {};

  return (
    <Card title="Coils / Commands (1-25)">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--fg-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <th style={{ padding: "6px 8px", width: 56 }}>Addr</th>
              <th style={{ padding: "6px 8px" }}>Coil</th>
              <th style={{ padding: "6px 8px", width: 100 }}>State</th>
              <th style={{ padding: "6px 8px", width: 220 }} />
              <th style={{ padding: "6px 8px" }}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {COILS.map((coil) => {
              const bit = coils[String(coil.addr)];
              return (
                <tr key={coil.addr} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="tabular" style={{ padding: "6px 8px", color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 700 }}>
                    {coil.addr}
                  </td>
                  <td style={{ padding: "6px 8px" }}>{coil.name}</td>
                  <td style={{ padding: "6px 8px" }}>
                    {coil.addr <= 8 ? (
                      <Badge tone={bit ? "good" : "default"}>{bit ? coil.labels[1] : coil.labels[0]}</Badge>
                    ) : (
                      <Badge tone={bit === undefined ? "default" : bit ? "good" : "default"}>
                        {bit === undefined ? "--" : bit ? coil.labels[1] : coil.labels[0]}
                      </Badge>
                    )}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {coil.writable && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button small onClick={() => writeCoil(coil.addr, false)}>
                          Set {coil.labels[0]}
                        </Button>
                        <Button small variant="primary" onClick={() => writeCoil(coil.addr, true)}>
                          Set {coil.labels[1]}
                        </Button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "6px 8px", color: "var(--fg-muted)", fontSize: 12 }}>{coil.note}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
