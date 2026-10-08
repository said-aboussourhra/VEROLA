"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, Button, Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

/* ============================================================
   VEROLA — Print Editor
   Real canvas engine (Fabric.js v6), loaded on demand so pages
   that do not use the editor never pay for it.

   The canvas IS the print area. The mockup is rendered behind it,
   so every coordinate the customer sees is a real print coordinate.
   ============================================================ */

export interface PrintArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MockupProduct {
  id: string;
  name: string;
  view: string;
  image: string;
  area: PrintArea;
  maxWidthCm: number;
  maxHeightCm: number;
  minWidthDpi: number;
  formats: string;
}

type Fab = typeof import("fabric");

const FONTS = [
  { id: "Syne", label: "Syne Display" },
  { id: "Inter", label: "Inter" },
  { id: "IBM Plex Sans Arabic", label: "Plex Arabic" },
  { id: "Georgia", label: "Georgia Serif" },
  { id: "Courier New", label: "Mono" },
];

const BRAND_COLORS = ["#0B63D6", "#22C1F0", "#FF2E93", "#FFC400", "#101828", "#FFFFFF"];

interface LayerRow {
  id: string;
  name: string;
  type: string;
  locked: boolean;
  hidden: boolean;
}

export function PrintEditor({
  product,
  onState,
}: {
  product: MockupProduct;
  onState?: (s: {
    layers: LayerRow[];
    selected: string | null;
    canvasJson: string | null;
    preview: string | null;
  }) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabRef = useRef<Fab | null>(null);
  const canvasRef = useRef<InstanceType<Fab["Canvas"]> | null>(null);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const snapshotLock = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState<LayerRow[]>([]);
  const [sel, setSel] = useState<{ id: string; name: string; type: string } | null>(null);
  const [form, setForm] = useState({ x: 0, y: 0, w: 0, h: 0, angle: 0, text: "", font: "Syne", size: 48, color: "#101828" });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [warning, setWarning] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ v: number | null; h: number | null }>({ v: null, h: null });
  const [preview, setPreview] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { L } = useI18n();

  /* ---------------- bootstrap fabric ---------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const f = (await import("fabric")) as unknown as Fab;
      if (cancelled || !canvasElRef.current) return;
      fabRef.current = f;

      const rect = wrapRef.current?.getBoundingClientRect();
      const W = Math.max(320, Math.round(rect?.width ?? 640));
      const H = Math.round(W * 0.82);

      const c = new f.Canvas(canvasElRef.current, {
        width: W,
        height: H,
        preserveObjectStacking: true,
        backgroundColor: "transparent",
        selection: true,
      });
      canvasRef.current = c;

      // NOTE: the print-area boundary is drawn as a DOM overlay so the canvas
      // stays a clean, serialisable design surface.
      c.on("selection:created", () => syncSel());
      c.on("selection:updated", () => syncSel());
      c.on("selection:cleared", () => setSel(null));
      c.on("object:moving", (e) => onMove(e));
      c.on("object:modified", () => {
        syncSel();
        snapshot();
      });
      c.on("object:scaling", () => syncSel());
      c.on("object:rotating", () => syncSel());

      setReady(true);
      snapshot(true);
    })();
    return () => {
      cancelled = true;
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* resize canvas to the stage width */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const c = canvasRef.current;
      if (!c) return;
      const w = Math.max(320, el.clientWidth);
      const h = Math.round(w * 0.82);
      c.setDimensions({ width: w, height: h });
      c.getObjects().forEach((o) => {
        if (o.excludeFromExport) {
          o.set({ width: w, height: h, scaleX: 1, scaleY: 1, left: 0, top: 0 });
          o.setCoords();
        }
      });
      c.renderAll();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  /* ---------------- helpers ---------------- */

  const isBorder = (o: { excludeFromExport?: boolean }) => !!o.excludeFromExport;

  const snapshot = useCallback((initial = false) => {
    const c = canvasRef.current;
    if (!c || snapshotLock.current) return;
    const json = JSON.stringify(c.toJSON());
    if (!initial && undoStack.current[undoStack.current.length - 1] === json) return;
    undoStack.current.push(json);
    if (undoStack.current.length > 60) undoStack.current.shift();
    redoStack.current = [];
    refreshLayers();
    setSaved("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved("saved"), 900);
    onState?.({
      layers: [],
      selected: null,
      canvasJson: json,
      preview: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshLayers = () => {
    const c = canvasRef.current;
    if (!c) return;
    const rows: LayerRow[] = c
      .getObjects()
      .filter((o) => !isBorder(o))
      .map((o, i) => ({
        id: String(i),
        name: (o as unknown as { name?: string }).name ?? (o.type === "textbox" ? "Text" : "Image"),
        type: o.type ?? "object",
        locked: !o.selectable,
        hidden: !o.visible,
      }))
      .reverse();
    setLayers(rows);
  };

  const active = () => canvasRef.current?.getActiveObject() as
    | (InstanceType<Fab["FabricObject"]> & { name?: string })
    | undefined;

  const syncSel = () => {
    const o = active();
    if (!o || isBorder(o)) {
      setSel(null);
      return;
    }
    setSel({ id: "x", name: (o.name as string) ?? (o.type === "textbox" ? "Text" : "Image"), type: o.type ?? "obj" });
    setForm((f) => ({
      ...f,
      x: Math.round(o.left ?? 0),
      y: Math.round(o.top ?? 0),
      w: Math.round((o.width ?? 0) * (o.scaleX ?? 1)),
      h: Math.round((o.height ?? 0) * (o.scaleY ?? 1)),
      angle: Math.round(o.angle ?? 0),
      text: o.type === "textbox" ? String((o as unknown as { text?: string }).text ?? "") : f.text,
      font: o.type === "textbox" ? String((o as unknown as { fontFamily?: string }).fontFamily ?? f.font) : f.font,
      size: o.type === "textbox" ? Math.round(Number((o as unknown as { fontSize?: number }).fontSize ?? f.size)) : f.size,
      color: String((o as unknown as { fill?: string }).fill ?? f.color),
    }));
  };

  const onMove = (e: { target?: { left?: number; top?: number; width?: number; height?: number; scaleX?: number; scaleY?: number } }) => {
    const c = canvasRef.current;
    const t = e.target;
    if (!c || !t) return;
    const W = c.getWidth();
    const H = c.getHeight();
    const tw = (t.width ?? 0) * (t.scaleX ?? 1);
    const th = (t.height ?? 0) * (t.scaleY ?? 1);
    const cx = (t.left ?? 0) + tw / 2;
    const cy = (t.top ?? 0) + th / 2;
    const T = 9;
    const g = { v: null as number | null, h: null as number | null };

    if (Math.abs(cx - W / 2) < T) {
      t.left = W / 2 - tw / 2;
      g.v = W / 2;
    }
    if (Math.abs(cy - H / 2) < T) {
      t.top = H / 2 - th / 2;
      g.h = H / 2;
    }
    setGuides(g);
    if (g.v !== null || g.h !== null) setTimeout(() => setGuides({ v: null, h: null }), 380);
  };

  /* ---------------- history ---------------- */

  const restore = (json: string) => {
    const c = canvasRef.current;
    const f = fabRef.current;
    if (!c || !f) return;
    snapshotLock.current = true;
    c.loadFromJSON(json).then(() => {
      c.renderAll();
      snapshotLock.current = false;
      refreshLayers();
    });
  };

  const undo = () => {
    if (undoStack.current.length < 2) return;
    const cur = undoStack.current.pop()!;
    redoStack.current.push(cur);
    restore(undoStack.current[undoStack.current.length - 1]);
  };
  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(next);
    restore(next);
  };

  /* ---------------- object ops ---------------- */

  const addImage = async (url: string, name: string) => {
    const f = fabRef.current;
    const c = canvasRef.current;
    if (!f || !c) return;
    const img = await f.Image.fromURL(url, { crossOrigin: "anonymous" });
    const maxW = c.getWidth() * 0.62;
    const maxH = c.getHeight() * 0.62;
    const s = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1);
    img.set({
      left: (c.getWidth() - (img.width || 0) * s) / 2,
      top: (c.getHeight() - (img.height || 0) * s) / 2,
      scaleX: s,
      scaleY: s,
      cornerStyle: "circle",
      cornerColor: "#0B63D6",
      cornerStrokeColor: "#fff",
      borderColor: "#0B63D6",
      transparentCorners: false,
      cornerSize: 11,
      padding: 4,
    } as never);
    (img as unknown as { name?: string }).name = name;
    c.add(img);
    c.setActiveObject(img);
    c.renderAll();
    snapshot();
    syncSel();
  };

  const addText = () => {
    const f = fabRef.current;
    const c = canvasRef.current;
    if (!f || !c) return;
    const tb = new f.Textbox("VEROLA", {
      left: c.getWidth() / 2 - 90,
      top: c.getHeight() / 2 - 26,
      width: 180,
      fontSize: 48,
      fontFamily: form.font,
      fill: form.color,
      textAlign: "center",
      cornerStyle: "circle",
      cornerColor: "#0B63D6",
      borderColor: "#0B63D6",
      transparentCorners: false,
      cornerSize: 11,
    } as never);
    (tb as unknown as { name?: string }).name = "Text";
    c.add(tb);
    c.setActiveObject(tb);
    c.renderAll();
    snapshot();
    syncSel();
  };

  const removeActive = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o || isBorder(o)) return;
    c.remove(o);
    c.discardActiveObject();
    c.renderAll();
    snapshot();
    setSel(null);
  };

  const duplicate = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o || isBorder(o)) return;
    o.clone().then((copy: unknown) => {
      const cc = copy as InstanceType<Fab["FabricObject"]>;
      cc.set({ left: (o.left ?? 0) + 22, top: (o.top ?? 0) + 22 });
      (cc as unknown as { name?: string }).name = ((o as unknown as { name?: string }).name ?? "Object") + " 2";
      c.add(cc);
      c.setActiveObject(cc);
      c.renderAll();
      snapshot();
    });
  };

  const apply = (patch: Partial<{ x: number; y: number; w: number; h: number; angle: number }>) => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o) return;
    const base = { left: o.left, top: o.top, angle: o.angle } as Record<string, number>;
    if (patch.x !== undefined) base.left = patch.x;
    if (patch.y !== undefined) base.top = patch.y;
    if (patch.angle !== undefined) base.angle = patch.angle;
    if (patch.w !== undefined && o.width) base.scaleX = patch.w / o.width;
    if (patch.h !== undefined && o.height) base.scaleY = patch.h / o.height;
    o.set(base as never);
    o.setCoords();
    c.renderAll();
    syncSel();
    snapshot();
  };

  const centerH = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o) return;
    o.set({ left: c.getWidth() / 2 - ((o.width ?? 0) * (o.scaleX ?? 1)) / 2 });
    o.setCoords();
    c.renderAll();
    snapshot();
    syncSel();
  };
  const centerV = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o) return;
    o.set({ top: c.getHeight() / 2 - ((o.height ?? 0) * (o.scaleY ?? 1)) / 2 });
    o.setCoords();
    c.renderAll();
    snapshot();
    syncSel();
  };
  const fitArea = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o) return;
    const w = o.width ?? 1;
    const h = o.height ?? 1;
    const s = Math.min((c.getWidth() * 0.9) / w, (c.getHeight() * 0.9) / h);
    o.set({ scaleX: s, scaleY: s, left: (c.getWidth() - w * s) / 2, top: (c.getHeight() - h * s) / 2 });
    o.setCoords();
    c.renderAll();
    snapshot();
    syncSel();
  };
  const resetObj = () => {
    const c = canvasRef.current;
    const o = active();
    if (!c || !o) return;
    o.set({ scaleX: 1, scaleY: 1, angle: 0 });
    o.setCoords();
    c.renderAll();
    snapshot();
    syncSel();
  };

  const layerOp = (indexFromTop: number, op: "up" | "down" | "lock" | "hide" | "delete") => {
    const c = canvasRef.current;
    if (!c) return;
    const objs = c.getObjects().filter((o) => !isBorder(o));
    const o = objs[objs.length - 1 - indexFromTop];
    if (!o) return;
    if (op === "up") c.bringObjectForward(o);
    else if (op === "down") c.sendObjectBackwards(o);
    else if (op === "lock") o.set({ selectable: !o.selectable, evented: !o.evented });
    else if (op === "hide") o.set({ visible: !o.visible });
    else if (op === "delete") c.remove(o);
    c.renderAll();
    refreshLayers();
    snapshot();
  };

  /* ---------------- upload + quality check ---------------- */

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    const allowed = product.formats.split(",").map((s) => s.trim());
    if (!allowed.includes(ext)) {
      setWarning(`“.${ext}” — this file format is not supported. Use ${product.formats}.`);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setWarning("The file is too large. Maximum 50MB.");
      return;
    }
    setWarning(null);
    setOk(null);

    const url = URL.createObjectURL(file);
    try {
      if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") {
        const meta = await new Promise<{ w: number; h: number }>((res) => {
          const im = new Image();
          im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight });
          im.onerror = () => res({ w: 0, h: 0 });
          im.src = url;
        });
        const c = canvasRef.current;
        const stageW = c?.getWidth() ?? 600;
        const printWidthCm = product.maxWidthCm;
        const pxPerCm = meta.w / (printWidthCm / 2.54 / 2.54 || 1);
        const dpiAtPrint = meta.w / (printWidthCm / 2.54);
        if (meta.w > 0 && dpiAtPrint < product.minWidthDpi) {
          setWarning(
            `⚠️ Low resolution — ${meta.w}×${meta.h}px is about ${Math.round(dpiAtPrint)} DPI at ${printWidthCm}cm. Your image may appear blurry when printed at this size.`,
          );
        } else {
          setOk(`✓ Print quality looks good — ${meta.w}×${meta.h}px at ${Math.round(dpiAtPrint)} DPI.`);
        }
        void pxPerCm;
        void stageW;
      }

      // push the original to the server (kept untouched)
      const fd = new FormData();
      fd.append("file", file);
      let serverUrl = url;
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const d = await res.json();
        if (res.ok && d.ok) serverUrl = url; // keep local blob for canvas (CORS-safe)
      } catch {
        /* offline: continue with the local object URL */
      }

      await addImage(serverUrl, file.name);
    } catch {
      setWarning("We could not read that file. Please try again.");
    }
  };

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const meta = e.ctrlKey || e.metaKey;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeActive();
      } else if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (meta && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        redo();
      } else if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSaved("saved");
      } else if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* zoom */
  useEffect(() => {
    canvasRef.current?.setZoom(zoom);
    canvasRef.current?.renderAll();
  }, [zoom]);

  /* pan mode */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.defaultCursor = pan ? "grab" : "default";
    (c as unknown as { selection: boolean }).selection = !pan;
    c.getObjects().forEach((o) => {
      if (isBorder(o)) return;
      o.set({ selectable: !pan, evented: !pan });
    });
    c.renderAll();
  }, [pan, ready]);

  /* ---------------- render ---------------- */

  return (
    <div className="w-full">
      {/* stage */}
      <div className="relative rounded-[26px] overflow-hidden border border-[#0b63d6]/12 bg-[#eef3fa]">
        <div
          ref={wrapRef}
          className="relative w-full"
          style={{ aspectRatio: "1 / 0.82" }}
        >
          {/* mockup behind the print area */}
          <img
            src={product.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            draggable={false}
            style={{ transform: `scale(${zoom})`, transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}
          />
          <div
            className="absolute"
            style={{
              left: `${product.area.x}%`,
              top: `${product.area.y}%`,
              width: `${product.area.w}%`,
              height: `${product.area.h}%`,
              transform: `scale(${zoom})`,
              transition: "transform .35s cubic-bezier(.16,1,.3,1)",
            }}
          >
            <canvas ref={canvasElRef} className="absolute inset-0 w-full h-full" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: "2px dashed rgba(11,99,214,0.55)",
                background: "rgba(11,99,214,0.035)",
              }}
              aria-hidden
            />
          </div>

          {/* alignment guides */}
          {guides.v !== null && (
            <div
              className="absolute top-0 bottom-0 w-[1.5px] bg-[#FF2E93] pointer-events-none"
              style={{ left: `${product.area.x + (guides.v / (canvasRef.current?.getWidth() || 1)) * product.area.w}%` }}
            />
          )}
          {guides.h !== null && (
            <div
              className="absolute start-0 end-0 h-[1.5px] bg-[#FF2E93] pointer-events-none"
              style={{ top: `${product.area.y + (guides.h / (canvasRef.current?.getHeight() || 1)) * product.area.h}%` }}
            />
          )}

          {/* print-area caption */}
          <div className="absolute top-3 start-3 flex items-center gap-2">
            <Badge className="!bg-white/85 !text-[#0b4fb0] !border-white/60 backdrop-blur">
              <Icon name="layers" className="w-3 h-3" /> PRINT AREA
            </Badge>
            <Badge className="!bg-white/85 !text-[#5b6779] !border-white/60 backdrop-blur">
              {product.maxWidthCm} × {product.maxHeightCm} cm
            </Badge>
          </div>

          {preview && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center px-6">
                <p className="font-display font-extrabold text-2xl text-[#0d1b32]">PRINT PROOF</p>
                <p className="text-sm text-[#5b6779] mt-2">
                  {L({
                    en: "This is a digital preview of your order.",
                    fr: "Ceci est un aperçu numérique de votre commande.",
                    ar: "هذه معاينة رقمية لطلبك.",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* zoom / pan bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white border-t border-[#0b63d6]/10">
          <Icon name="zoom" className="w-4 h-4 text-[#5b6779]" />
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-28 accent-[#0b63d6]"
            aria-label="Zoom"
          />
          <span className="text-xs tabular-nums text-[#5b6779] w-10">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(1)}
            className="text-xs font-semibold text-[#0b63d6] hover:underline cursor-pointer"
          >
            Fit
          </button>
          <span className="mx-1 w-px h-5 bg-[#0b63d6]/15" />
          <button
            onClick={() => setPan(!pan)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              pan ? "bg-[#0b63d6] text-white border-[#0b63d6]" : "text-[#5b6779] border-[#0b63d6]/20"
            }`}
            aria-pressed={pan}
          >
            Pan
          </button>
          <span className="ms-auto flex items-center gap-1.5 text-xs">
            {saved === "saving" ? (
              <span className="text-[#98a2b3]">Saving…</span>
            ) : saved === "saved" ? (
              <span className="text-[#0b63d6] flex items-center gap-1">
                <Icon name="check" className="w-3.5 h-3.5" /> Saved
              </span>
            ) : null}
          </span>
        </div>
      </div>

      {/* quality feedback */}
      {warning && (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-[#FF2E93]/25 bg-[#FF2E93]/[0.06] px-4 py-3 text-sm text-[#b4236a]">
          <Icon name="sparkle" className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
      {ok && (
        <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-[#0b63d6]/25 bg-[#0b63d6]/[0.06] px-4 py-3 text-sm text-[#0b4fb0]">
          <Icon name="check" className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      {/* tools */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={product.formats.split(",").map((f) => `.${f.trim()}`).join(",")}
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <Button variant="glass" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" className="w-4 h-4" /> Upload
        </Button>
        <Button variant="glass" onClick={addText}>
          <Icon name="plus" className="w-4 h-4" /> Add Text
        </Button>
        <Button variant="glass" onClick={duplicate}>
          <Icon name="layers" className="w-4 h-4" /> Duplicate
        </Button>
        <Button variant="ghost" onClick={removeActive}>
          <Icon name="x" className="w-4 h-4" /> Delete
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        <Button variant="ghost" size="sm" onClick={undo}>
          <Icon name="flip" className="w-4 h-4" /> Undo
        </Button>
        <Button variant="ghost" size="sm" onClick={redo}>
          <Icon name="flip" className="w-4 h-4 rtl-flip" /> Redo
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { centerH(); centerV(); }}>
          <Icon name="check" className="w-4 h-4" /> Center
        </Button>
        <Button variant="ghost" size="sm" onClick={fitArea}>
          <Icon name="zoom" className="w-4 h-4" /> Fit
        </Button>
      </div>

      {/* position panel */}
      <div className="mt-5 rounded-2xl border border-[#0b63d6]/12 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-[#0d1b32]">Position</p>
          {!sel && <span className="text-xs text-[#98a2b3]">Select an object</span>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {([
            ["x", "X"],
            ["y", "Y"],
            ["w", "Width"],
            ["h", "Height"],
            ["angle", "Rotation °"],
          ] as const).map(([k, label]) => (
            <label key={k} className="block">
              <span className="block text-[0.68rem] uppercase tracking-wider text-[#98a2b3] mb-1">{label}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-[#0b63d6]/15 px-2.5 py-1.5 text-sm tabular-nums focus:border-[#0b63d6] focus:outline-none"
                value={form[k]}
                disabled={!sel}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setForm((f) => ({ ...f, [k]: v }));
                  apply({ [k]: v } as never);
                }}
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={centerH}>Center Horizontally</Button>
          <Button variant="ghost" size="sm" onClick={centerV}>Center Vertically</Button>
          <Button variant="ghost" size="sm" onClick={fitArea}>Fit to Print Area</Button>
          <Button variant="ghost" size="sm" onClick={resetObj}>Reset</Button>
        </div>
      </div>

      {/* text + colour */}
      <div className="mt-4 rounded-2xl border border-[#0b63d6]/12 bg-white p-4">
        <p className="font-semibold text-sm text-[#0d1b32]">Text & Colour</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <label className="block col-span-2">
            <span className="block text-[0.68rem] uppercase tracking-wider text-[#98a2b3] mb-1">Content</span>
            <input
              className="w-full rounded-lg border border-[#0b63d6]/15 px-2.5 py-1.5 text-sm focus:border-[#0b63d6] focus:outline-none"
              value={form.text}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, text: v }));
                const o = active();
                if (o && o.type === "textbox") {
                  (o as unknown as { set: (x: unknown) => void; setCoords: () => void }).set({ text: v } as never);
                  (o as unknown as { setCoords: () => void }).setCoords();
                  canvasRef.current?.renderAll();
                }
              }}
            />
          </label>
          <label className="block">
            <span className="block text-[0.68rem] uppercase tracking-wider text-[#98a2b3] mb-1">Font</span>
            <select
              className="w-full rounded-lg border border-[#0b63d6]/15 px-2.5 py-1.5 text-sm bg-white focus:border-[#0b63d6] focus:outline-none"
              value={form.font}
              onChange={(e) => {
                const v = e.target.value;
                setForm((f) => ({ ...f, font: v }));
                const o = active();
                if (o && o.type === "textbox") {
                  (o as unknown as { set: (x: unknown) => void }).set({ fontFamily: v } as never);
                  canvasRef.current?.renderAll();
                }
              }}
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[0.68rem] uppercase tracking-wider text-[#98a2b3] mb-1">Size</span>
            <input
              type="number"
              className="w-full rounded-lg border border-[#0b63d6]/15 px-2.5 py-1.5 text-sm tabular-nums focus:border-[#0b63d6] focus:outline-none"
              value={form.size}
              onChange={(e) => {
                const v = Number(e.target.value);
                setForm((f) => ({ ...f, size: v }));
                const o = active();
                if (o && o.type === "textbox") {
                  (o as unknown as { set: (x: unknown) => void }).set({ fontSize: v } as never);
                  canvasRef.current?.renderAll();
                }
              }}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {BRAND_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setForm((f) => ({ ...f, color: c }));
                setRecentColors((r) => [c, ...r.filter((x) => x !== c)].slice(0, 6));
                const o = active();
                if (o) {
                  (o as unknown as { set: (x: unknown) => void }).set({ fill: c } as never);
                  canvasRef.current?.renderAll();
                }
              }}
              className="w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
              style={{ background: c, borderColor: form.color === c ? "#0b63d6" : "rgba(11,99,214,0.18)" }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, color: v }));
              const o = active();
              if (o) {
                (o as unknown as { set: (x: unknown) => void }).set({ fill: v } as never);
                canvasRef.current?.renderAll();
              }
            }}
            className="w-9 h-9 rounded-lg border border-[#0b63d6]/20 cursor-pointer"
            aria-label="Custom colour"
          />
          <input
            dir="ltr"
            className="w-24 rounded-lg border border-[#0b63d6]/15 px-2.5 py-1.5 text-xs font-mono uppercase focus:border-[#0b63d6] focus:outline-none"
            value={form.color}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, color: v }));
            }}
          />
        </div>
        {recentColors.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="text-[0.68rem] uppercase tracking-wider text-[#98a2b3] me-1">Recent</span>
            {recentColors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setForm((f) => ({ ...f, color: c }));
                  const o = active();
                  if (o) {
                    (o as unknown as { set: (x: unknown) => void }).set({ fill: c } as never);
                    canvasRef.current?.renderAll();
                  }
                }}
                className="w-6 h-6 rounded-full border border-[#0b63d6]/15 cursor-pointer"
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>
        )}
        <p className="mt-3 text-[0.72rem] text-[#98a2b3] leading-relaxed">
          Screen colours may differ slightly from final printed colours.
        </p>
      </div>

      {/* layers */}
      <div className="mt-4 rounded-2xl border border-[#0b63d6]/12 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm text-[#0d1b32] flex items-center gap-2">
            <Icon name="layers" className="w-4 h-4 text-[#0b63d6]" /> Layers
          </p>
          <span className="text-xs text-[#98a2b3] tabular-nums">{layers.length}</span>
        </div>
        {layers.length === 0 ? (
          <p className="mt-3 text-xs text-[#98a2b3]">Upload a design or add text to begin.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {layers.map((l, i) => (
              <li
                key={`${l.name}-${i}`}
                className="flex items-center gap-2 rounded-xl border border-[#0b63d6]/10 px-3 py-2"
              >
                <span className="text-[0.68rem] tabular-nums text-[#98a2b3] w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon
                  name={l.type === "textbox" ? "file" : "sparkle"}
                  className="w-3.5 h-3.5 text-[#0b63d6]"
                />
                <span className={`text-sm flex-1 truncate ${l.hidden ? "line-through opacity-50" : ""}`}>
                  {l.name}
                </span>
                <button onClick={() => layerOp(i, "up")} className="w-6 h-6 rounded-md text-[#98a2b3] hover:text-[#0b63d6] cursor-pointer" aria-label="Move up">
                  <Icon name="arrow" className="w-3.5 h-3.5 -rotate-90 rtl-flip" />
                </button>
                <button onClick={() => layerOp(i, "down")} className="w-6 h-6 rounded-md text-[#98a2b3] hover:text-[#0b63d6] cursor-pointer" aria-label="Move down">
                  <Icon name="arrow" className="w-3.5 h-3.5 rotate-90 rtl-flip" />
                </button>
                <button onClick={() => layerOp(i, "lock")} className={`w-6 h-6 rounded-md cursor-pointer ${l.locked ? "text-[#d98b00]" : "text-[#98a2b3] hover:text-[#0b63d6]"}`} aria-label="Lock">
                  <Icon name="shield" className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => layerOp(i, "hide")} className={`w-6 h-6 rounded-md cursor-pointer ${l.hidden ? "text-[#e11d48]" : "text-[#98a2b3] hover:text-[#0b63d6]"}`} aria-label="Hide">
                  <Icon name={l.hidden ? "x" : "sun"} className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => layerOp(i, "delete")} className="w-6 h-6 rounded-md text-[#98a2b3] hover:text-[#e11d48] cursor-pointer" aria-label="Delete">
                  <Icon name="x" className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
