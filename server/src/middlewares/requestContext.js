import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { logger } from "../config/logger.js";

// AsyncLocalStorage lets any code running "inside" a request — deep in a
// controller, a service function, even a background job triggered by
// that request — access the same traceId, WITHOUT threading it through
// every function signature manually.
export const requestContext = new AsyncLocalStorage();

export const traceIdMiddleware = (req, res, next) => {
  // Reuse an incoming trace id (e.g. from a load balancer or another
  // service) if present, so a request can be followed across service
  // boundaries — otherwise mint a new one.
  const traceId = req.headers["x-trace-id"] || randomUUID();
  res.setHeader("x-trace-id", traceId);

  // req.log is what every controller/middleware should log through —
  // it's a pre-configured "child" logger that stamps every line with
  // this request's traceId automatically.
  req.log = logger.child({ traceId, path: req.path, method: req.method });

  requestContext.run({ traceId }, () => next());
};

// For code OUTSIDE the request lifecycle (background job workers, cron
// tasks) that still wants the current traceId if one is active
export const getCurrentTraceId = () => requestContext.getStore()?.traceId;
