// Neuro 105 Modbus parameter map, mirrored from the Python Tkinter dashboard
// (neuro105_dashboard.py) so the web UI and the ESP32 gateway agree on
// addressing, scaling and labels. Datasheet (1-based) addressing throughout.

export type Enum = Record<number, string>;

export interface RegSpec {
  addr: number;
  name: string;
  ro?: boolean;
  signed?: boolean;
  factor?: number | "res";
  enum?: Enum;
  range?: string;
  note?: string;
}

export interface CoilSpec {
  addr: number;
  name: string;
  writable: boolean;
  labels: [string, string];
  note?: string;
}

export const COILS: CoilSpec[] = [
  { addr: 1, name: "Parameter Modified", writable: false, labels: ["No", "Yes"], note: "Yes = any parameter modified from controller end; resets on read" },
  { addr: 2, name: "Control Action", writable: false, labels: ["PID", "ON-OFF"] },
  { addr: 3, name: "Alarm-1 Status", writable: false, labels: ["OFF", "ON"], note: "Only if Alarm-1 is set to other than None" },
  { addr: 4, name: "Alarm-2 Status", writable: false, labels: ["OFF", "ON"], note: "Only if Alarm-2 is set to other than None" },
  { addr: 5, name: "Serial Write Permission", writable: false, labels: ["Enable", "Disable"] },
  { addr: 6, name: "Output-1 Status", writable: false, labels: ["OFF", "ON"], note: "Only if OP1 is Relay or SSR" },
  { addr: 7, name: "Output-2 Status", writable: false, labels: ["OFF", "ON"], note: "Only if OP2 is Cool Control / Event Output with Relay or SSR" },
  { addr: 8, name: "Output-3 Status", writable: false, labels: ["OFF", "ON"], note: "Only if OP3 Function is Event Output" },
  { addr: 9, name: "Alarm-1 Logic", writable: true, labels: ["Direct", "Reverse"], note: "For Process High/Low, Deviation or Window Band alarm types" },
  { addr: 10, name: "Alarm-1 Inhibit", writable: true, labels: ["No", "Yes"], note: "For Process High/Low, Deviation or Window Band alarm types" },
  { addr: 11, name: "Self-Tune Command", writable: true, labels: ["No", "Yes"], note: "Only if Control Action is PID" },
  { addr: 12, name: "Output-1 Control Logic", writable: true, labels: ["Direct", "Reverse"], note: "Not applicable if OP-2 Function is Cool Control" },
  { addr: 13, name: "Auto/Manual Operation Mode", writable: true, labels: ["Enable", "Disable"] },
  { addr: 14, name: "Auto/Manual Mode Selection", writable: true, labels: ["Auto", "Manual"], note: "Only if Auto/Manual Mode operation is Enabled" },
  { addr: 15, name: "Quick Adjustment Of Setpoint", writable: true, labels: ["Enable", "Disable"] },
  { addr: 16, name: "Overshoot Inhibit", writable: true, labels: ["Enable", "Disable"], note: "Only if Control Action is PID" },
  { addr: 17, name: "Alarm-2 Logic", writable: true, labels: ["Direct", "Reverse"], note: "For Process High/Low, Deviation or Window Band alarm types" },
  { addr: 18, name: "Alarm-2 Inhibit", writable: true, labels: ["Yes", "No"], note: "For Process High/Low, Deviation or Window Band alarm types" },
  { addr: 19, name: "Master Locking", writable: true, labels: ["Unlock", "Lock"], note: "Front keypad parameter setting disabled when Locked" },
  { addr: 20, name: "Heater OFF", writable: true, labels: ["No", "Yes"] },
  { addr: 21, name: "Profile Operation Mode", writable: true, labels: ["Disable", "Enable"] },
  { addr: 22, name: "Profile Cycle Abort", writable: true, labels: ["No", "Yes"] },
  { addr: 23, name: "Profile Cycle Hold", writable: true, labels: ["No", "Yes"] },
  { addr: 24, name: "Profile Segment Advance", writable: true, labels: ["No", "Yes"] },
  { addr: 25, name: "Standby", writable: true, labels: ["No", "Yes"] },
];

export const RO_REGS: RegSpec[] = [
  { addr: 1, name: "Device Identity", ro: true, note: "MSB = 105 model number, LSB = 0" },
  { addr: 2, name: "Ambient Temperature (°C)", ro: true, factor: 10, signed: true, note: "Built-in ambient sensor, 0.1°C resolution" },
  { addr: 3, name: "PV Resolution", ro: true, enum: { 0: "1", 1: "0.1", 2: "0.01", 3: "0.001" } },
  { addr: 4, name: "PV Error Indication", ro: true, enum: { 0: "None", 1: "Open", 2: "Over-Range", 3: "Under-Range" } },
  { addr: 5, name: "Process Value (PV)", ro: true, signed: true, factor: "res", note: "16-bit signed integer" },
  { addr: 6, name: "% Output Power", ro: true, signed: true, factor: 10, note: "Always in 0.1 % resolution" },
  { addr: 7, name: "Profile Segment Status", ro: true, note: "MSB=segment no. (even=Ramp, odd=Soak); LSB bit6=HOLD, bit7=Running" },
  { addr: 8, name: "Profile-Program Number", ro: true, note: "MSB=Program no. (1-16), LSB=Profile no. (1-16)" },
  { addr: 9, name: "Balance Event Time OP-2", ro: true, note: "Only if Output-2 is Event Output" },
  { addr: 10, name: "Balance Event Time OP-3", ro: true, note: "Only if Output-3 is Event Output" },
  { addr: 11, name: "Ramping Setpoint (°C)", ro: true, signed: true, factor: "res", note: "Of currently running Ramp segment" },
  { addr: 12, name: "Balance Soak Time (min)", ro: true, note: "Of currently running Soak segment" },
  { addr: 13, name: "Cycle Number", ro: true, note: "Only if Program not set for indefinite cycling" },
];

export const RW_CONTROL: RegSpec[] = [
  { addr: 14, name: "% Output Power (Manual)", range: "0 to 100 %", note: "Applicable in Manual mode only" },
  { addr: 15, name: "Control Setpoint (SP)", signed: true, factor: "res", range: "SP Low to SP High" },
  { addr: 16, name: "Hysteresis", factor: "res", range: "1 to 999", note: "ON-OFF control mode only" },
  { addr: 17, name: "Proportional Band", factor: "res", range: "0 to 9999", note: "0 = ON-OFF control" },
  { addr: 18, name: "Integral Time (s)", range: "0 to 1000", note: "0 = cut-off; PID mode only" },
  { addr: 19, name: "Derivative Time (s)", range: "0 to 250", note: "0 = cut-off; PID mode only" },
  { addr: 20, name: "Cycle Time (s)", factor: 10, range: "0.5 to 120.0", note: "Steps of 0.5 s; not for DC-linear OP-1" },
  { addr: 21, name: "Power Low Limit (%)", range: "0 % to Power High", note: "Not applicable if OP-2 is Cool Control" },
  { addr: 22, name: "Power High Limit (%)", range: "Power Low to 100 %", note: "Not applicable if OP-2 is Cool Control" },
];

export const RW_ALARMS: RegSpec[] = [
  { addr: 28, name: "Alarm-1 Type", enum: { 0: "None", 1: "Process Low", 2: "Process High", 3: "Deviation Band", 4: "Window Band", 5: "End Of Profile" } },
  { addr: 29, name: "Alarm-1 Setpoint", signed: true, factor: "res", range: "Range Low to Range High", note: "Only for Process Low / Process High" },
  { addr: 30, name: "Alarm-1 Deviation", signed: true, factor: "res", range: "-999 to +999", note: "Only for Deviation Band" },
  { addr: 31, name: "Alarm-1 Band", factor: "res", range: "3 to 999", note: "Only for Window Band" },
  { addr: 32, name: "Alarm-1 Hysteresis", factor: "res", range: "1 to 999", note: "Not for None / End Of Profile" },
  { addr: 33, name: "Alarm-2 Type", enum: { 0: "None", 1: "Process Low", 2: "Process High", 3: "Deviation Band", 4: "Window Band", 5: "End Of Profile" } },
  { addr: 34, name: "Alarm-2 Setpoint", signed: true, factor: "res", range: "Range Low to Range High", note: "Only for Process Low / Process High" },
  { addr: 35, name: "Alarm-2 Deviation", signed: true, factor: "res", range: "-999 to +999", note: "Only for Deviation Band" },
  { addr: 36, name: "Alarm-2 Band", factor: "res", range: "3 to 999", note: "Only for Window Band" },
  { addr: 37, name: "Alarm-2 Hysteresis", factor: "res", range: "1 to 999", note: "Not for None / End Of Profile" },
];

export const INPUT_TYPES: Enum = {
  0: "J Thermocouple", 1: "K Thermocouple", 2: "R Thermocouple", 3: "S Thermocouple",
  4: "T Thermocouple", 5: "B Thermocouple", 6: "N Thermocouple", 7: "Reserved",
  8: "RTD Pt100", 9: "0-20 mA", 10: "4-20 mA", 11: "0-50 mV", 12: "0-200 mV",
  13: "0-1.25 V", 14: "0-5 V", 15: "0-10 V",
};

export const OUT_TYPES: Enum = { 0: "Relay", 1: "SSR", 2: "0-20 mA", 3: "4-20 mA" };

export const RW_IO: RegSpec[] = [
  { addr: 23, name: "OP-1 Control Output Type", enum: OUT_TYPES },
  { addr: 24, name: "OP-2 Function", enum: { 0: "Alarm", 1: "Cool Control", 2: "Event Output" } },
  { addr: 25, name: "OP-2 Type", enum: OUT_TYPES, note: "mA types not applicable if OP-2 is Alarm/Event" },
  { addr: 26, name: "OP-3 Function", enum: { 0: "Alarm", 1: "Recorder Output", 2: "Event Output" } },
  { addr: 27, name: "OP-3 Type", enum: OUT_TYPES, note: "mA types not applicable if OP-3 is Alarm/Event" },
  { addr: 38, name: "Analog Input Type", enum: INPUT_TYPES },
  { addr: 39, name: "Resolution (write)", enum: { 0: "1 °C", 1: "0.1 °C", 2: "0.01 °C" }, note: "TC inputs fixed to 0; RTD 0-1; DC linear 0-2" },
  { addr: 40, name: "Zero Offset for PV", signed: true, range: "-1999 to +9999", note: "Calibration offset added to PV" },
  { addr: 41, name: "Digital Filter for PV (s)", factor: 10, range: "0.5 to 25.0", note: "Steps of 0.5 s" },
  { addr: 42, name: "Cool Cycle Time (s)", factor: 10, range: "0.5 to 120.0", note: "Only if OP-2 is Cool Control with Relay/SSR" },
  { addr: 43, name: "Relative Cool Gain", factor: 10, range: "0.1 to 10.0", note: "Only if OP-2 is Cool Control" },
  { addr: 44, name: "Range Low", signed: true, factor: "res", range: "-9999 to Range High", note: "DC-linear input types only" },
  { addr: 45, name: "Range High", signed: true, factor: "res", range: "Range Low to +9999", note: "DC-linear input types only" },
  { addr: 46, name: "Setpoint Low", signed: true, factor: "res", range: "Range Low to Setpoint High" },
  { addr: 47, name: "Setpoint High", signed: true, factor: "res", range: "Setpoint Low to Range High" },
  { addr: 48, name: "Recorder Low", signed: true, factor: "res", range: "Range Low to Recorder High", note: "Only if OP-3 is Recorder Output" },
  { addr: 49, name: "Recorder High", signed: true, factor: "res", range: "Range Low to Recorder High", note: "Only if OP-3 is Recorder Output" },
];

export const RW_PROFILE_GLOBALS: RegSpec[] = [
  { addr: 50, name: "Number Of Profiles", range: "1 to 16", note: "Each profile contains max. 16 segments" },
  { addr: 51, name: "Number Of Programs", range: "1 to 16", note: "Each program contains max. 30 profiles" },
  { addr: 52, name: "Start Profile Cycle of Program No.", range: "1 to 16", note: "Selected program starts upon issuing Start command" },
];

export interface ArraySpec {
  base: number;
  per: number;
  name: string;
  rng: string;
  factor?: number | "res";
  signed?: boolean;
}

export const ARRAYS: Record<string, ArraySpec> = {
  sets: { base: 100, per: 1, name: "Number Of Sets", rng: "0 to 8" },
  ramp_band: { base: 116, per: 1, name: "Ramp Band", rng: "0 to 250" },
  soak_band: { base: 132, per: 1, name: "Soak Band", rng: "0 to 250" },
  ramp_rate: { base: 148, per: 8, name: "Ramp Rate (units/min)", rng: "00.00 to 99.99", factor: 100 },
  target_sp: { base: 276, per: 8, name: "Target Setpoint", rng: "Range Low to Range High", factor: "res", signed: true },
  soak_time: { base: 404, per: 8, name: "Soak Time (min)", rng: "0 to 9999" },
  ev2_status: { base: 532, per: 8, name: "OP-2 Event Status", rng: "0/1 (bit0=Ramp ON, bit1=Soak ON)" },
  ev2_ramp: { base: 660, per: 8, name: "OP-2 Event Time - Ramp (min)", rng: "0 to 9999" },
  ev2_soak: { base: 788, per: 8, name: "OP-2 Event Time - Soak (min)", rng: "0 to 9999" },
  ev3_status: { base: 916, per: 8, name: "OP-3 Event Status", rng: "0/1 (bit0=Ramp ON, bit1=Soak ON)" },
  ev3_ramp: { base: 1044, per: 8, name: "OP-3 Event Time - Ramp (min)", rng: "0 to 9999" },
  ev3_soak: { base: 1172, per: 8, name: "OP-3 Event Time - Soak (min)", rng: "0 to 9999" },
};

export function toSigned(v: number): number {
  return v & 0x8000 ? v - 0x10000 : v;
}

export function toUnsigned(v: number): number {
  return v & 0xffff;
}

export function rawToDisplay(spec: RegSpec, raw: number, resFactor: number): string {
  let value = raw;
  if (spec.signed) value = toSigned(value);
  if (spec.enum) return `${raw} : ${spec.enum[raw] ?? "?"}`;
  const f = spec.factor === "res" ? resFactor : spec.factor ?? 1;
  return f !== 1 ? String(value / f) : String(value);
}

export function displayToRaw(spec: RegSpec, text: string, resFactor: number): number {
  const trimmed = text.trim();
  if (spec.enum) {
    const raw = parseInt(trimmed.split(":")[0].trim(), 10);
    return toUnsigned(raw);
  }
  const f = spec.factor === "res" ? resFactor : spec.factor ?? 1;
  const raw = Math.round(parseFloat(trimmed) * f);
  return toUnsigned(raw);
}
