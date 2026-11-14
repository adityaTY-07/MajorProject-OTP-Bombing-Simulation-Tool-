import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { errorHandler } from "./middleware/errorHandler.js";
import { createSandboxState } from "./models/sandboxState.js";
import { createApiRoutes } from "./routes/apiRoutes.js";
import { createDemoService } from "./services/demoService.js";
import { createRequestService } from "./services/requestService.js";
import { createTelemetryService } from "./services/telemetryService.js";

const allowedOrigins = new Set(["http://127.0.0.1:5173", "http://localhost:5173"]);
const frontendDist = fileURLToPath(new URL("../../frontend/dist/", import.meta.url));
const frontendIndex = fileURLToPath(new URL("../../frontend/dist/index.html", import.meta.url));

export function createApplication() {
  const state = createSandboxState();
  const app = express();
  const httpServer = createServer(app);
  const sockets = new WebSocketServer({ server: httpServer, path: "/ws" });
  const telemetry = createTelemetryService({ state, sockets });
  const demoService = createDemoService({ state, telemetry });
  const requestService = createRequestService({ state, telemetry });

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(express.json({ limit: "4kb" }));
  const corsMiddleware = cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) callback(null, true);
      else callback(new Error("CORS_ORIGIN_DENIED"));
    },
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  });
  app.use((req, res, next) => {
    const origin = req.get("origin");
    const host = req.get("host");
    const isSameHost = origin === `http://${host}` || origin === `https://${host}`;
    if (origin && isSameHost) return next();
    corsMiddleware(req, res, next);
  });
  app.get("/healthz", (_req, res) => res.json({ status: "ok", storage: "in-memory" }));
  app.use("/api", createApiRoutes({ state, telemetry, demoService, requestService }));
  // Serve the frontend build
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path === "/healthz") {
      return next();
    }
    res.sendFile(frontendIndex, (error) => {
      if (error) next(error);
    });
  });
  app.use(errorHandler);

  sockets.on("connection", (socket, request) => {
    const origin = request.headers.origin;
    const isSameHost =
      origin === `http://${request.headers.host}` || origin === `https://${request.headers.host}`;
    if (origin && !isSameHost && !allowedOrigins.has(origin)) {
      socket.close(1008, "Origin is not allowed");
      return;
    }
    telemetry.sendSnapshot(socket);
  });

  return { app, httpServer, sockets, state, telemetry, demoService, requestService };
}
