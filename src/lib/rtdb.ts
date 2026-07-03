import { push, ref, remove, set } from "firebase/database";
import { db } from "./firebase";

export interface LiveData {
  pv: number | null;
  pvError: number;
  sp: number;
  power: number;
  ambient: number;
  segNo: number;
  segKind: "Ramp" | "Soak";
  running: boolean;
  hold: boolean;
  program: number;
  profile: number;
  resFactor: number;
  ts: number;
  coils: Record<string, boolean>;
}

export interface StatusData {
  online?: boolean;
  lastSeen?: number;
  rssi?: number;
  bootAt?: number;
  lastPollOk?: boolean;
  lastReadAllOk?: boolean;
}

// ---- commands (dashboard -> gateway) ----

async function sendCommand(payload: Record<string, unknown>) {
  const cmdRef = push(ref(db, "/neuro105/commands"));
  await set(cmdRef, { ...payload, ts: Date.now() / 1000 });
  return cmdRef.key;
}

export function writeRegister(addr: number, value: number) {
  return sendCommand({ type: "write_reg", addr, value });
}

export function writeCoil(addr: number, value: boolean) {
  return sendCommand({ type: "write_coil", addr, value });
}

export function writeRegisters(addr: number, values: number[]) {
  return sendCommand({ type: "write_regs", addr, values });
}

export function requestReadAll() {
  return sendCommand({ type: "read_all" });
}

export function requestReadProfile(profile: number) {
  return sendCommand({ type: "read_profile", profile });
}

export function requestReadProgram(program: number) {
  return sendCommand({ type: "read_program", program });
}

export function clearCommand(key: string) {
  return remove(ref(db, `/neuro105/commands/${key}`));
}
