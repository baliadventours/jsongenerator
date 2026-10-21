import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { DEFAULT_TENANT_CONFIG, TenantDefaults } from "./src/types/tour";
import { processTourExtraction } from "./api/extract-tour";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  app.post("/api/extract-tour", async (req, res) => {
    try {
      const {
        input,
        tenantDefaults = DEFAULT_TENANT_CONFIG
      }: {
        input?: string;
        tenantDefaults?: TenantDefaults;
      } = req.body || {};

      if (!input || !input.trim()) {
        return res.status(400).json({
          error:
            "Please provide an OTA URL (Viator, GetYourGuide, Klook, etc.) or a tour description prompt."
        });
      }

      const result = await processTourExtraction(input, tenantDefaults);
      return res.json(result);
    } catch (error: any) {
      console.error("Error in /api/extract-tour:", error);
      const status = error?.status || 500;
      const message =
        error instanceof Error
          ? error.message
          : "Failed to extract tour JSON from the provided source.";
      return res.status(status).json({
        error: message
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TourJSON Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
