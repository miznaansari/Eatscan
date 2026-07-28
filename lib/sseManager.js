import { EventEmitter } from "events";

const globalForSSE = globalThis;

if (!globalForSSE.orderEvents) {
  globalForSSE.orderEvents = new EventEmitter();
  globalForSSE.orderEvents.setMaxListeners(100);
}

export const orderEvents = globalForSSE.orderEvents;
