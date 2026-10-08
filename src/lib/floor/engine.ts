/**
 * Machine gateway — floor engine.
 *
 * Architecture: the web app never talks to hardware directly. It talks to ONE
 * adapter interface. Today the adapter is a deterministic simulator seeded
 * from the real job queue in PostgreSQL (orders → jobs → press pipeline).
 * To go live, implement the same `floorSnapshot()` against the real protocols:
 *  - HP Indigo 12000  → Indigo Web Services (REST, job status + sheets)
 *  - Zünd G3          → Zünd Control API / OPC-UA
 *  - Müller Martini   → Modbus TCP
 * The dashboard, SSE stream and order flow stay untouched.
 */

import { db } from "@/db";
import { jobs } from "@/db/schema";
import { asc } from "drizzle-orm";

export interface MachineDef {
  id: "indigo" | "zund" | "martini";
  name: string;
  role: "print" | "cut" | "finish";
  rate: number; // sheets / hour
  setupMin: number;
  protocol: string;
}

export const MACHINES: MachineDef[] = [
  { id: "indigo", name: "HP Indigo 12000", role: "print", rate: 11000, setupMin: 18, protocol: "Indigo Web Services" },
  { id: "zund", name: "Zünd G3", role: "cut", rate: 5200, setupMin: 8, protocol: "OPC-UA" },
  { id: "martini", name: "Müller Martini", role: "finish", rate: 3800, setupMin: 6, protocol: "Modbus TCP" },
];

export type MachineStatus = "running" | "idle" | "maintenance";

export interface MachineState {
  id: string;
  name: string;
  role: string;
  protocol: string;
  status: MachineStatus;
  jobCode: string | null;
  product: string | null;
  sheets: number;
  sheetsDone: number;
  progress: number; // 0..1
  speed: number;
  ink: number; // %
  temp: number; // °C
  uptime: number; // %
}

export interface QueueItem {
  code: string;
  orderCode: string;
  product: string;
  sheets: number;
  stage: string;
  eta: number; // ms epoch
}

export interface FloorSnapshot {
  at: number;
  machines: MachineState[];
  queue: QueueItem[];
  done24: number;
  adapter: "SIM" | "LIVE";
}

const H = 3600e3;
const MIN = 60e3;

const dur = (setupMin: number, sheets: number, rate: number) =>
  setupMin * MIN + (sheets / rate) * H;

export async function floorSnapshot(): Promise<FloorSnapshot> {
  const rows = await db
    .select()
    .from(jobs)
    .orderBy(asc(jobs.createdAt))
    .limit(300);
  const now = Date.now();

  // floor assumed running for the past 6h
  let bi = now - 6 * H;
  let bz = now - 6 * H;
  let bm = now - 6 * H;

  const sim = rows.map((r) => {
    const t0 = r.createdAt.getTime();
    const pS = Math.max(t0, bi);
    const pE = pS + dur(18, r.sheets, 11000);
    const cS = Math.max(pE, bz);
    const cE = cS + dur(8, r.sheets, 5200);
    const fS = Math.max(cE, bm);
    const fE = fS + dur(6, r.sheets, 3800);
    bi = pE;
    bz = cE;
    bm = fE;
    return { r, pS, pE, cS, cE, fS, fE };
  });

  const machines: MachineState[] = MACHINES.map((m, idx) => {
    let S = 0;
    let E = 0;
    let curS = 0;
    let curE = 0;
    let cur: (typeof sim)[number] | undefined;
    for (const s of sim) {
      if (m.id === "indigo") [S, E] = [s.pS, s.pE];
      else if (m.id === "zund") [S, E] = [s.cS, s.cE];
      else [S, E] = [s.fS, s.fE];
      if (S <= now && now < E) {
        cur = s;
        curS = S;
        curE = E;
      }
    }

    const running = !!cur;
    const hour = new Date(now).getHours();
    const status: MachineStatus = running
      ? "running"
      : hour % 7 === 6 && new Date(now).getMinutes() < 30
        ? "maintenance"
        : "idle";

    const progress = cur ? Math.min(1, (now - curS) / (curE - curS)) : 0;
    const wave = 0.5 + 0.5 * Math.sin(now / 45000 + idx * 2);

    return {
      id: m.id,
      name: m.name,
      role: m.role,
      protocol: m.protocol,
      status,
      jobCode: cur ? cur.r.code : null,
      product: cur ? cur.r.product : null,
      sheets: cur ? cur.r.sheets : 0,
      sheetsDone: cur ? Math.floor(progress * cur.r.sheets) : 0,
      progress,
      speed: running ? Math.round(m.rate * (0.94 + 0.1 * wave)) : 0,
      ink: Math.round(96 - 42 * ((now % (24 * H)) / (24 * H))),
      temp: Math.round((41 + 2.6 * Math.sin(now / 90000 + idx) + (running ? 1.4 : 0)) * 10) / 10,
      uptime: Math.round((98.4 + idx * 0.5) * 10) / 10,
    };
  });

  const queue: QueueItem[] = sim
    .filter((s) => s.pS > now)
    .slice(0, 6)
    .map((s) => ({
      code: s.r.code,
      orderCode: s.r.orderCode,
      product: s.r.product,
      sheets: s.r.sheets,
      stage: "print",
      eta: s.pS,
    }));

  const done24 = sim.filter((s) => s.fE <= now && s.fE > now - 24 * H).length;

  return { at: now, machines, queue, done24, adapter: "SIM" };
}
