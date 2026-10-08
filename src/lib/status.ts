/** Shared order-status math (mirrors /track timeline thresholds). */

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3.6e6;
}

export function statusIndex(hours: number): number {
  return hours < 1 ? 0 : hours < 4 ? 1 : hours < 20 ? 2 : hours < 26 ? 3 : hours < 30 ? 4 : hours < 40 ? 5 : 6;
}

export function etaDate(createdAt: string, express: boolean): Date {
  return new Date(new Date(createdAt).getTime() + (express ? 1 : 2) * 864e5);
}
