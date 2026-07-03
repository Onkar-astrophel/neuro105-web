# Neuro 105 — Remote Dashboard

Web dashboard for the PPI Neuro 105 PID/Profile oven controller. An ESP32
gateway (`../firmware/neuro105_gateway`) talks Modbus RTU to the controller
over RS485 and syncs live data + commands through Firebase Realtime
Database. This Next.js app reads/writes that same database and deploys to
Vercel, so you can monitor and configure the oven from anywhere.

This mirrors the desktop tool (`../neuro105_dashboard.py`, a Tkinter app
that talks Modbus directly over a USB-RS485 adapter) — same parameter map,
same addressing, but over the internet instead of a serial cable.

## Architecture

```
Neuro 105  <--RS485 (Modbus RTU)-->  ESP32 gateway  <--WiFi-->  Firebase RTDB  <-->  Next.js dashboard (Vercel)
```

- **ESP32 gateway** polls live values every second and pushes them to
  `/neuro105/live`. It watches `/neuro105/commands` for writes/reads
  requested by the dashboard, executes them over Modbus, then deletes the
  command and writes a result to `/neuro105/ack/<id>`.
- **Dashboard** never talks Modbus directly — it only reads/writes Firebase.
  Full parameter tables and profile/program arrays are fetched on demand
  (via `read_all` / `read_profile` / `read_program` commands) rather than
  polled continuously, since they're mostly static configuration and the
  RS485 bus is slow (1200–9600 baud).

## 1. Firebase project setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and
   create a project (or use an existing one).
2. **Build → Realtime Database → Create Database.** Pick a region close to
   the oven (lower latency for the ESP32). Start in locked mode.
3. **Build → Authentication → Get started → Sign-in method → Email/Password
   → Enable.**
4. **Authentication → Users → Add user** — create two accounts:
   - One for yourself (or whoever should access the dashboard), e.g.
     `you@example.com`.
   - One dedicated **device account** for the ESP32, e.g.
     `gateway@neuro105.device` with a long random password. Don't reuse a
     human's login for the device.
5. **Project settings → General → Your apps → Add app → Web (`</>`).**
   Register it (no hosting needed) and copy the `firebaseConfig` values.
6. **Realtime Database → Rules** — paste the contents of
   [`database.rules.json`](./database.rules.json) in this folder and
   publish. This restricts all reads/writes to signed-in users (both your
   dashboard login and the ESP32's device account satisfy `auth != null`).

## 2. Configure the ESP32 gateway

Open `../firmware/neuro105_gateway/neuro105_gateway.ino` in the Arduino IDE
(or PlatformIO) and fill in the `USER SETTINGS` block at the top:

- `WIFI_SSID` / `WIFI_PASSWORD`
- `FIREBASE_API_KEY` — same `apiKey` from step 1.5 above
- `FIREBASE_DB_URL` — the Realtime Database URL, e.g.
  `https://your-project-default-rtdb.firebaseio.com`
- `FIREBASE_DEVICE_EMAIL` / `FIREBASE_DEVICE_PASSWORD` — the device account
  from step 1.4
- `MODBUS_SLAVE_ID` / `MODBUS_BAUD` — must match what's set on the
  controller itself (PAGE-13 utility parameters)

Install libraries via Arduino Library Manager: **Firebase ESP Client** (by
mobizt) and the **esp32** board package (Boards Manager, by Espressif
Systems). Select board "ESP32 Dev Module", pick the right COM port, and
upload.

Wiring (generic ESP32 DevKit + MAX485 module):

| ESP32 pin | MAX485 pin |
|-----------|------------|
| GPIO17 (TX2) | DI |
| GPIO16 (RX2) | RO |
| GPIO4  | DE + RE (tied together) |
| 5V | VCC |
| GND | GND |

MAX485 `A`/`B` → Neuro 105 terminals `15 (+)` / `14 (-)`.

Open the Serial Monitor at 115200 baud after upload — it prints WiFi/Firebase
connection status and any Modbus errors.

## 3. Run the dashboard locally

```bash
cd neuro105_web
npm install
cp .env.local.example .env.local
# fill in .env.local with the same firebaseConfig values from step 1.5
npm run dev
```

Visit `http://localhost:3000` and sign in with the human account you created
in step 1.4.

## 4. Deploy to Vercel

```bash
npm install -g vercel   # if you don't already have it
vercel login
vercel
```

Or via the Vercel dashboard: **New Project → Import** this `neuro105_web`
folder from your Git repo. Either way, add the same 7 `NEXT_PUBLIC_FIREBASE_*`
variables from `.env.local` under **Project Settings → Environment
Variables**, then redeploy.

The app is a static-ish client-rendered dashboard (all reads/writes happen
straight from the browser to Firebase via the client SDK), so no server
environment variables or API routes are needed.

## Firebase data model

```
/neuro105
  /live                 <- gateway writes every ~1s
     pv, sp, power, ambient, pvError, segNo, segKind,
     running, hold, program, profile, resFactor, ts
     coils: { "1": bool, ..., "8": bool }
  /params/<addr>         <- populated by a "read_all" command
  /profile/<n>/<array>/<i>  <- populated by a "read_profile" command
  /program/<n>            <- populated by a "read_program" command
  /commands/<pushId>      <- dashboard writes; gateway consumes + deletes
     { type: "write_reg" | "write_coil" | "write_regs"
            | "read_all" | "read_profile" | "read_program",
       addr?, value?, values?, profile?, program?, ts }
  /ack/<pushId>           <- gateway writes the result of a consumed command
     { ok: bool, error?, ts }
  /status
     online, lastSeen, rssi, bootAt, lastPollOk, lastReadAllOk
```

## Notes

- The "Console / Raw" tab reflects the most recently cached Firebase
  snapshot rather than issuing a fresh Modbus transaction per click — reads
  are gateway-driven (live poll + on-demand `read_all`/`read_profile`), not
  request/response per address like the desktop tool's direct serial
  connection.
- Writes are fire-and-forget from the dashboard's perspective: a command is
  queued, the gateway applies it on its next command-poll tick (~300 ms),
  and the resulting `/neuro105/live` or `/neuro105/params` update flows back
  automatically through the existing subscriptions — there's no dashboard
  UI for reading `/neuro105/ack` yet, but it's there if you want to surface
  write confirmations/errors.
