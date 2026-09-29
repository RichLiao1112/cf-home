const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const distDir = path.resolve(__dirname, "../dist");
const token = JSON.parse(fs.readFileSync("/home/xl/.config/cloudflare/config/default.json")).oauth_token;
const kvRaw = execSync(`CLOUDFLARE_API_TOKEN=${token} npx wrangler kv:key get --binding HOME_KV "home_data" --preview false`, { encoding: "utf8" });
const storeData = JSON.parse(kvRaw);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8998");
  if (url.pathname === "/api/home") {
    const key = url.searchParams.get("key") || "default";
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, key, keys: Object.keys(storeData), data: storeData[key] }));
    return;
  }
  if (url.pathname === "/api/auth/session") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ authenticated: true, userEmail: "test@example.com", isZeroTrust: false }));
    return;
  }
  if (url.pathname === "/api/network-context") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ clientIP: "1.2.3.4", isPrivate: false, networkType: "wan" }));
    return;
  }
  
  let filePath = path.join(distDir, url.pathname === "/" ? "index.html" : url.pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, "index.html");
  }
  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff"
  };
  res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
  res.end(fs.readFileSync(filePath));
});

server.listen(8998, "127.0.0.1", () => {
  console.log("Preview server ready on http://127.0.0.1:8998");
});
