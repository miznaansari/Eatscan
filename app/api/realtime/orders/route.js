import { orderEvents } from "@/lib/sseManager";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial heartbeat
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTED", message: "SSE connected to EatScan" })}\n\n`)
      );

      const onNewOrder = (data) => {
        if (!restaurantId || data.restaurantId === restaurantId) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "NEW_ORDER", order: data.order })}\n\n`)
          );
        }
      };

      orderEvents.on("new-order", onNewOrder);

      // Keep-alive ping every 15s to keep mobile connection active
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        orderEvents.off("new-order", onNewOrder);
        clearInterval(interval);
      });
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
