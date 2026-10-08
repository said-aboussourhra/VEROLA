import { floorSnapshot } from "@/lib/floor/engine";

export const dynamic = "force-dynamic";

/** Server-Sent Events: live floor telemetry every 2s. */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let stopped = false;
      const stop = () => {
        if (stopped) return;
        stopped = true;
        clearInterval(iv);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      const send = async () => {
        try {
          const snap = await floorSnapshot();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(snap)}\n\n`));
        } catch {
          stop();
        }
      };

      const iv = setInterval(send, 2000);
      await send();
      request.signal.addEventListener("abort", stop);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
