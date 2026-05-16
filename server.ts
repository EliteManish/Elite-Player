import axios from "axios";
import express from "express";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[Server] Starting in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Basic middlewares
  app.use(cors());
  app.use(express.json());

  // API Proxy Route
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    console.log(`[PROXY_INVOKED] Target: ${targetUrl}`);
    
    if (!targetUrl) {
      console.warn("[Proxy] Rejecting: No URL provided");
      return res.status(400).send("URL parameter is required");
    }

    try {
      console.log(`[Proxy] Fetching: ${targetUrl}`);
      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.google.com/",
          "Connection": "keep-alive"
        },
        timeout: 30000,
        maxRedirects: 10,
        responseType: 'text',
        validateStatus: () => true
      });

      console.log(`[Proxy] Upstream status: ${response.status} for ${targetUrl}`);

      if (response.status >= 400) {
        return res.status(response.status).send(`Upstream Error ${response.status}: ${typeof response.data === 'string' ? response.data.substring(0, 200) : 'Access Denied'}`);
      }

      // Check if we accidentally got HTML when we expected m3u
      if (typeof response.data === 'string' && (response.data.includes('<!doctype html>') || response.data.includes('<html'))) {
        console.warn(`[Proxy] Warning: Upstream returned HTML for ${targetUrl}`);
      }

      res.setHeader("Content-Type", (response.headers["content-type"] as string) || "text/plain");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(response.data);
    } catch (error: any) {
      console.error(`[Proxy Failure] ${targetUrl}:`, error.message);
      res.status(500).send(`Proxy connection error: ${error.message}`);
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.5", time: new Date().toISOString() });
  });

  // Static files and SPA fallback
  const distPath = path.join(process.cwd(), "dist");
  
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Using Vite middleware (Development)");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[Server] Serving static files from: ${distPath} (Production)`);
    app.use(express.static(distPath));
    
    // SPA Fallback - ONLY for non-API routes
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api/')) {
        console.warn(`[Server] API 404: ${req.path}`);
        return res.status(404).send(`API route not found: ${req.path}`);
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("[Server] Startup Crash:", err);
  process.exit(1);
});

