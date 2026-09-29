import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Vite 本地开发中间件：模拟 Cloudflare Pages Functions API，数据本地持久化保存在 .dev-data.json
function cfPagesDevApiPlugin(): Plugin {
  const dataFile = path.resolve(__dirname, '.dev-data.json');
  const snapshotsFile = path.resolve(__dirname, '.dev-snapshots.json');

  function getStore() {
    try {
      if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      }
    } catch {}
    return {
      '168': {
        layout: {
          head: {
            name: 'Home',
            subtitle: '',
            siteImage: '',
            backgroundBlur: 0,
            desktopColumns: 4,
            navOpacity: 62,
            overlayOpacity: 70,
            categoryOpacity: 5,
            cardOpacity: 5,
          },
        },
        categories: [
          {
            id: 'c-default',
            title: '常用',
            color: '#3B82F6',
            position: 0,
            cards: [],
          },
        ],
        recycleBin: { categories: [], cards: [] },
      },
    };
  }

  function saveStore(data: any) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  }

  return {
    name: 'cf-pages-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/auth/session') {
          res.end(JSON.stringify({ authenticated: true, userEmail: 'dev@localhost', isZeroTrust: true }));
          return;
        }

        if (pathname === '/api/network-context') {
          res.end(JSON.stringify({ clientIP: '127.0.0.1', isPrivate: true, networkType: 'lan', timestamp: Date.now() }));
          return;
        }

        if (pathname === '/api/home') {
          const store = getStore();
          const reqKey = url.searchParams.get('key');
          const keys = Object.keys(store);
          const activeKey = reqKey && store[reqKey] ? reqKey : keys[0] || '168';

          if (req.method === 'GET') {
            res.end(JSON.stringify({ success: true, key: activeKey, keys, data: store[activeKey] }));
            return;
          }

          if (req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                store[parsed.key] = parsed.data;
                saveStore(store);
                res.end(JSON.stringify({ success: true, key: parsed.key, keys: Object.keys(store), data: store[parsed.key] }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, message: e.message }));
              }
            });
            return;
          }
        }

        if (pathname === '/api/config') {
          const store = getStore();
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            const { key } = JSON.parse(body || '{}');
            if (req.method === 'POST') {
              store[key] = {
                layout: { head: { name: 'Home', desktopColumns: 4, navOpacity: 62, overlayOpacity: 70, categoryOpacity: 5, cardOpacity: 5, backgroundBlur: 0 } },
                categories: [{ id: 'c-1', title: '常用', color: '#3B82F6', position: 0, cards: [] }],
                recycleBin: { categories: [], cards: [] },
              };
              saveStore(store);
              res.end(JSON.stringify({ success: true, key, keys: Object.keys(store), data: store[key] }));
            } else if (req.method === 'DELETE') {
              delete store[key];
              saveStore(store);
              const fallback = Object.keys(store)[0];
              res.end(JSON.stringify({ success: true, key: fallback, keys: Object.keys(store), data: store[fallback] }));
            }
          });
          return;
        }

        if (pathname === '/api/meta-fetch' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', async () => {
            try {
              const { url: targetUrl } = JSON.parse(body);
              const u = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
              const resp = await fetch(u.toString(), {
                headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36' },
                signal: AbortSignal.timeout(4000),
              }).catch(() => null);

              let title = u.hostname;
              let description = '';
              let favicon = `${u.origin}/favicon.ico`;

              if (resp && resp.ok) {
                const text = await resp.text();
                const tm = text.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (tm) title = tm[1].trim();
                const dm = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
                if (dm) description = dm[1].trim();
                const im = text.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
                if (im) {
                  try { favicon = new URL(im[1], u.toString()).href; } catch {}
                }
              }

              res.end(JSON.stringify({ success: true, title, description, favicon, url: u.toString() }));
            } catch (e: any) {
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }

        if (pathname === '/api/snapshots') {
          let list: any[] = [];
          try {
            if (fs.existsSync(snapshotsFile)) list = JSON.parse(fs.readFileSync(snapshotsFile, 'utf8'));
          } catch {}

          if (req.method === 'GET') {
            res.end(JSON.stringify({ success: true, snapshots: list }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            const parsed = JSON.parse(body || '{}');
            if (parsed.action === 'create') {
              const store = getStore();
              const snap = {
                id: String(Date.now()),
                key: parsed.key,
                createdAt: new Date().toISOString(),
                reason: 'manual',
                note: parsed.note || '手动快照',
                data: store[parsed.key],
              };
              list.unshift(snap);
              fs.writeFileSync(snapshotsFile, JSON.stringify(list.slice(0, 30), null, 2), 'utf8');
              res.end(JSON.stringify({ success: true, created: true, snapshot: snap }));
            } else if (parsed.action === 'restore') {
              const target = list.find((s) => s.id === parsed.snapshotId);
              if (target) {
                const store = getStore();
                store[parsed.key] = target.data;
                saveStore(store);
                res.end(JSON.stringify({ success: true, key: parsed.key, data: store[parsed.key] }));
              } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ success: false, message: 'Snapshot not found' }));
              }
            }
          });
          return;
        }

        if (pathname === '/api/migration/export') {
          res.end(JSON.stringify(getStore()));
          return;
        }

        if (pathname === '/api/migration/import' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const imported = JSON.parse(body);
              saveStore(imported);
              const key = Object.keys(imported)[0] || '168';
              res.end(JSON.stringify({ success: true, key, keys: Object.keys(imported), data: imported[key] }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: e.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cfPagesDevApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3232,
    host: '0.0.0.0',
  },
});
