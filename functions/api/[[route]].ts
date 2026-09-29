import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

interface HeadLayout {
  name: string;
  subtitle?: string;
  siteImage?: string;
  backgroundImage?: string;
  backgroundBlur: number;
  unsplashCollectionId?: string;
  desktopColumns: number;
  navOpacity: number;
  overlayOpacity: number;
  categoryOpacity: number;
  cardOpacity: number;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  coverColor?: string;
  wanLink?: string;
  lanLink?: string;
  openInNewWindow: boolean;
  position: number;
  categoryId: string;
}

interface Category {
  id: string;
  title: string;
  color?: string;
  position: number;
  cards: Card[];
}

interface ProfileData {
  layout: {
    head: HeadLayout;
  };
  categories: Category[];
  recycleBin: {
    categories: any[];
    cards: any[];
  };
  updatedAt?: string;
}

interface SnapshotItem {
  id: string;
  key: string;
  createdAt: string;
  reason: string;
  note?: string;
  hash: string;
  data: ProfileData;
}

type StoreData = Record<string, ProfileData>;
type SnapshotStore = Record<string, SnapshotItem[]>;

type Bindings = {
  HOME_KV?: KVNamespace;
  HOME_R2?: any;
  DISABLE_AUTH?: string;
};

const defaultProfile = (): ProfileData => ({
  layout: {
    head: {
      name: 'Home',
      subtitle: '',
      siteImage: '',
      backgroundBlur: 0,
      unsplashCollectionId: '',
      desktopColumns: 4,
      navOpacity: 62,
      overlayOpacity: 70,
      categoryOpacity: 5,
      cardOpacity: 5,
    },
  },
  categories: [
    {
      id: 'default-category',
      title: '常用',
      color: '#3B82F6',
      position: 0,
      cards: [],
    },
  ],
  recycleBin: {
    categories: [],
    cards: [],
  },
  updatedAt: new Date().toISOString(),
});

// 内存回退存储（顶层保持纯静态声明，避免 workerd 顶层随机数限制）
const memoryStore: { data: StoreData; snapshots: SnapshotStore } = {
  data: {},
  snapshots: {},
};

async function getStore(kv?: KVNamespace): Promise<StoreData> {
  if (kv) {
    const val = await kv.get('home_data', 'json');
    if (val && typeof val === 'object' && Object.keys(val).length > 0) {
      return val as StoreData;
    }
  }
  if (!memoryStore.data['168']) {
    memoryStore.data['168'] = defaultProfile();
  }
  return memoryStore.data;
}

async function saveStore(data: StoreData, kv?: KVNamespace): Promise<void> {
  if (kv) {
    await kv.put('home_data', JSON.stringify(data));
  } else {
    memoryStore.data = data;
  }
}

async function getSnapshots(kv?: KVNamespace): Promise<SnapshotStore> {
  if (kv) {
    const val = await kv.get('home_snapshots', 'json');
    if (val && typeof val === 'object') {
      return val as SnapshotStore;
    }
  }
  return memoryStore.snapshots;
}

async function saveSnapshots(snapshots: SnapshotStore, kv?: KVNamespace): Promise<void> {
  if (kv) {
    await kv.put('home_snapshots', JSON.stringify(snapshots));
  } else {
    memoryStore.snapshots = snapshots;
  }
}

async function hashData(obj: any): Promise<string> {
  const str = JSON.stringify(obj);
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// 1. Session & Auth 状态检查
app.get('/auth/session', (c) => {
  const cfUserEmail = c.req.header('cf-access-authenticated-user-email');
  const cfJwt = c.req.header('cf-access-jwt-assertion');
  const disableAuth = c.env?.DISABLE_AUTH !== 'false';

  const isZeroTrust = Boolean(cfUserEmail || cfJwt);
  const authenticated = isZeroTrust || disableAuth;

  return c.json({
    authenticated,
    userEmail: cfUserEmail || (isZeroTrust ? 'cf-access-user' : 'guest'),
    isZeroTrust,
  });
});

// 2. 网络上下文探测（智能判断访问来源是局域网还是公网）
app.get('/network-context', (c) => {
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ];

  const isPrivate = privatePatterns.some((pattern) => pattern.test(ip));

  return c.json({
    clientIP: ip,
    isPrivate,
    networkType: isPrivate ? 'lan' : 'wan',
    timestamp: Date.now(),
  });
});

// 3. 获取配置
app.get('/home', async (c) => {
  const reqKey = c.req.query('key');
  const store = await getStore(c.env?.HOME_KV);
  const keys = Object.keys(store);

  const activeKey = reqKey && store[reqKey] ? reqKey : keys[0] || '168';
  if (!store[activeKey]) {
    store[activeKey] = defaultProfile();
    await saveStore(store, c.env?.HOME_KV);
  }

  return c.json({
    success: true,
    key: activeKey,
    keys: Object.keys(store),
    data: store[activeKey],
  });
});

// 4. 保存配置
app.put('/home', async (c) => {
  try {
    const body = await c.req.json<{ key: string; data: ProfileData }>();
    if (!body || !body.key || !body.data) {
      return c.json({ success: false, message: 'Invalid payload' }, 400);
    }

    const store = await getStore(c.env?.HOME_KV);
    store[body.key] = {
      ...body.data,
      updatedAt: new Date().toISOString(),
    };

    await saveStore(store, c.env?.HOME_KV);

    return c.json({
      success: true,
      key: body.key,
      keys: Object.keys(store),
      data: store[body.key],
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// 5. 配置空间管理 (新建 / 删除 Key)
app.post('/config', async (c) => {
  const { key } = await c.req.json<{ key: string }>();
  if (!key || typeof key !== 'string') {
    return c.json({ success: false, message: 'Invalid key' }, 400);
  }

  const store = await getStore(c.env?.HOME_KV);
  if (store[key]) {
    return c.json({ success: false, message: 'Key already exists' }, 400);
  }

  store[key] = defaultProfile();
  await saveStore(store, c.env?.HOME_KV);

  return c.json({
    success: true,
    key,
    keys: Object.keys(store),
    data: store[key],
  });
});

app.delete('/config', async (c) => {
  const { key } = await c.req.json<{ key: string }>();
  const store = await getStore(c.env?.HOME_KV);

  if (!store[key]) {
    return c.json({ success: false, message: 'Key does not exist' }, 404);
  }

  const keys = Object.keys(store);
  if (keys.length <= 1) {
    return c.json({ success: false, message: 'Cannot delete the only profile' }, 400);
  }

  delete store[key];
  await saveStore(store, c.env?.HOME_KV);

  const fallbackKey = Object.keys(store)[0];
  return c.json({
    success: true,
    key: fallbackKey,
    keys: Object.keys(store),
    data: store[fallbackKey],
  });
});

// 6. 版本快照 (Snapshots)
app.get('/snapshots', async (c) => {
  const key = c.req.query('key') || '168';
  const snapshots = await getSnapshots(c.env?.HOME_KV);
  const list = (snapshots[key] || []).map(({ id, key, createdAt, reason, note }) => ({
    id,
    key,
    createdAt,
    reason,
    note,
  }));

  return c.json({
    success: true,
    key,
    snapshots: list,
  });
});

app.post('/snapshots', async (c) => {
  const body = await c.req.json<{
    action: 'create' | 'restore';
    key: string;
    note?: string;
    reason?: 'manual' | 'auto';
    snapshotId?: string;
  }>();

  const store = await getStore(c.env?.HOME_KV);
  const snapshots = await getSnapshots(c.env?.HOME_KV);
  const key = body.key || Object.keys(store)[0] || '168';

  if (!store[key]) {
    return c.json({ success: false, message: 'Profile not found' }, 404);
  }

  if (body.action === 'create') {
    const data = store[key];
    const hash = await hashData(data);
    const existing = snapshots[key] || [];

    if (existing[0]?.hash === hash) {
      return c.json({ success: true, created: false, snapshot: existing[0] });
    }

    const item: SnapshotItem = {
      id: crypto.randomUUID(),
      key,
      createdAt: new Date().toISOString(),
      reason: body.reason || 'manual',
      note: body.note?.trim() || undefined,
      hash,
      data,
    };

    snapshots[key] = [item, ...existing].slice(0, 50);
    await saveSnapshots(snapshots, c.env?.HOME_KV);

    return c.json({ success: true, created: true, snapshot: item });
  }

  if (body.action === 'restore') {
    if (!body.snapshotId) {
      return c.json({ success: false, message: 'Missing snapshotId' }, 400);
    }

    const target = (snapshots[key] || []).find((s) => s.id === body.snapshotId);
    if (!target) {
      return c.json({ success: false, message: 'Snapshot not found' }, 404);
    }

    // 恢复前自动创建保护快照
    const currHash = await hashData(store[key]);
    const autoProtect: SnapshotItem = {
      id: crypto.randomUUID(),
      key,
      createdAt: new Date().toISOString(),
      reason: 'before_restore',
      note: `恢复前自动备份 (${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })})`,
      hash: currHash,
      data: store[key],
    };

    snapshots[key] = [autoProtect, ...(snapshots[key] || [])].slice(0, 50);
    await saveSnapshots(snapshots, c.env?.HOME_KV);

    // 恢复数据
    store[key] = target.data;
    await saveStore(store, c.env?.HOME_KV);

    return c.json({ success: true, key, data: store[key] });
  }

  return c.json({ success: false, message: 'Unknown action' }, 400);
});

app.delete('/snapshots', async (c) => {
  const { key, snapshotId } = await c.req.json<{ key: string; snapshotId: string }>();
  const snapshots = await getSnapshots(c.env?.HOME_KV);

  if (!snapshots[key]) {
    return c.json({ success: false, message: 'No snapshots for this key' }, 404);
  }

  snapshots[key] = snapshots[key].filter((s) => s.id !== snapshotId);
  await saveSnapshots(snapshots, c.env?.HOME_KV);

  return c.json({ success: true, key });
});

// 7. 外部网页元数据智能抓取 (Title, Favicon, Description)
app.post('/meta-fetch', async (c) => {
  try {
    const { url } = await c.req.json<{ url: string }>();
    if (!url) {
      return c.json({ success: false, error: 'URL is required' }, 400);
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return c.json({ success: false, error: 'Invalid URL' }, 400);
    }

    const res = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return c.json({ success: false, error: `HTTP ${res.status}` }, 502);
    }

    const html = await res.text();
    let title = '';
    let description = '';
    let favicon = '';

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1].trim();

    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (descMatch) description = descMatch[1].trim();

    const iconMatch =
      html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["'][^>]*>/i);

    if (iconMatch) {
      try {
        favicon = new URL(iconMatch[1], targetUrl.toString()).href;
      } catch {
        favicon = `${targetUrl.origin}/favicon.ico`;
      }
    } else {
      favicon = `${targetUrl.origin}/favicon.ico`;
    }

    return c.json({
      success: true,
      title: title.slice(0, 100),
      description: description.slice(0, 200),
      favicon,
      url: targetUrl.toString(),
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Fetch failed' }, 500);
  }
});

// 8. 导入与导出现有 home.json 数据
app.get('/migration/export', async (c) => {
  const store = await getStore(c.env?.HOME_KV);
  return c.json(store);
});

app.post('/migration/import', async (c) => {
  try {
    const raw = await c.req.json<StoreData>();
    if (!raw || typeof raw !== 'object') {
      return c.json({ success: false, message: 'Invalid JSON data' }, 400);
    }

    const store: StoreData = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v && typeof v === 'object' && Array.isArray((v as any).categories)) {
        store[k] = v as ProfileData;
      }
    }

    if (Object.keys(store).length === 0) {
      return c.json({ success: false, message: 'No valid categories found in payload' }, 400);
    }

    await saveStore(store, c.env?.HOME_KV);
    const activeKey = Object.keys(store)[0];

    return c.json({
      success: true,
      key: activeKey,
      keys: Object.keys(store),
      data: store[activeKey],
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

export const onRequest = handle(app);
