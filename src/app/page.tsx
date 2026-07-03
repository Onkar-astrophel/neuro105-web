"use client";

export const dynamic = "force-dynamic";

import { LoginGate } from "@/components/LoginGate";
import { StatusHeader } from "@/components/StatusHeader";
import { Tabs } from "@/components/Tabs";
import { LiveMonitor } from "@/components/LiveMonitor";
import { ParamTable } from "@/components/ParamTable";
import { CoilsTable } from "@/components/CoilsTable";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProgramEditor } from "@/components/ProgramEditor";
import { Console } from "@/components/Console";
import { RO_REGS, RW_ALARMS, RW_CONTROL, RW_IO } from "@/lib/paramMap";

export default function Home() {
  return (
    <LoginGate>
      <StatusHeader />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 60px" }}>
        <Tabs
          tabs={[
            { label: "Live Monitor", content: <LiveMonitor /> },
            {
              label: "Control & Tuning",
              content: <ParamTable title="Control & Tuning" specs={[...RO_REGS.slice(4, 6), ...RW_CONTROL]} />,
            },
            { label: "Alarms", content: <ParamTable title="Alarms" specs={RW_ALARMS} /> },
            { label: "Input / Output Config", content: <ParamTable title="Input / Output Config" specs={RW_IO} /> },
            { label: "Coils / Commands", content: <CoilsTable /> },
            { label: "Profile Editor", content: <ProfileEditor /> },
            { label: "Program Editor", content: <ProgramEditor /> },
            { label: "Console / Raw", content: <Console /> },
          ]}
        />
      </main>
    </LoginGate>
  );
}
 