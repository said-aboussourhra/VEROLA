import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductId, FinishId } from "./pricing";

export interface DesignSpec {
  headline: string;
  subline: string;
  accent: string;
}

export interface ConfigState {
  step: number;
  product: ProductId;
  sizeId: string;
  paperId: string;
  finishId: FinishId;
  qty: number;
  express: boolean;
  zoneId: string;
  artworkName: string | null;
  artworkUrl: string | null;
  artworkSource: "file" | "designer" | null;
  autofixed: boolean;
  design: DesignSpec;
  set: (p: Partial<
    Pick<
      ConfigState,
      | "step"
      | "product"
      | "sizeId"
      | "paperId"
      | "finishId"
      | "qty"
      | "express"
      | "zoneId"
      | "artworkName"
      | "artworkUrl"
      | "artworkSource"
      | "autofixed"
      | "design"
    >
  >) => void;
  reset: () => void;
}

const initial = {
  step: 0,
  product: "business-cards" as ProductId,
  sizeId: "std",
  paperId: "std300",
  finishId: "matte" as FinishId,
  qty: 100,
  express: false,
  zoneId: "a",
  artworkName: null,
  artworkUrl: null,
  artworkSource: null as ConfigState["artworkSource"],
  autofixed: false,
  design: { headline: "VÉLORA", subline: "Print the unimaginable", accent: "#7B2FF7" },
};

export const useConfig = create<ConfigState>((set) => ({
  ...initial,
  set: (p) => set(p),
  reset: () => set({ ...initial }),
}));

/* ================= CART ================= */

export interface CartItem {
  id: string;
  product: ProductId;
  sizeId: string;
  paperId: string;
  finishId: FinishId;
  qty: number;
  express: boolean;
  zoneId: string;
  artworkName: string | null;
  addedAt: number;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "id" | "addedAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...item, id: `ci_${Date.now()}_${Math.floor(Math.random() * 1e5)}`, addedAt: Date.now() },
          ],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "velora-cart" },
  ),
);

/* device order codes (for /account) */
export function pushDeviceCode(code: string) {
  try {
    const raw = localStorage.getItem("velora-codes");
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(code)) {
      list.unshift(code);
      localStorage.setItem("velora-codes", JSON.stringify(list.slice(0, 20)));
    }
  } catch {
    /* storage unavailable */
  }
}

export function deviceCodes(): string[] {
  try {
    const raw = localStorage.getItem("velora-codes");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
