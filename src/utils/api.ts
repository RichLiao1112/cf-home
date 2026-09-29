import { ProfileData, SnapshotMeta, NetworkContext, AuthSession } from '../types';

export async function fetchSession(): Promise<AuthSession> {
  const res = await fetch('/api/auth/session', { cache: 'no-store' });
  if (!res.ok) return { authenticated: false, isZeroTrust: false };
  return (await res.json()) as AuthSession;
}

export async function fetchNetworkContext(): Promise<NetworkContext> {
  try {
    const res = await fetch('/api/network-context', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed');
    return (await res.json()) as NetworkContext;
  } catch {
    return { clientIP: 'unknown', isPrivate: false, networkType: 'wan' };
  }
}

export async function fetchProfile(key?: string): Promise<{
  key: string;
  keys: string[];
  data: ProfileData;
} | null> {
  const query = key ? `?key=${encodeURIComponent(key)}` : '';
  const res = await fetch(`/api/home${query}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = (await res.json()) as any;
  return json?.success ? json : null;
}

export async function saveProfile(key: string, data: ProfileData): Promise<boolean> {
  const res = await fetch('/api/home', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, data }),
  });
  return res.ok;
}

export async function createConfigKey(key: string): Promise<any> {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  return res.json();
}

export async function deleteConfigKey(key: string): Promise<any> {
  const res = await fetch('/api/config', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  return res.json();
}

export async function fetchSnapshots(key: string): Promise<SnapshotMeta[]> {
  const res = await fetch(`/api/snapshots?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const json = (await res.json()) as any;
  return json?.snapshots || [];
}

export async function createSnapshot(key: string, note?: string): Promise<any> {
  const res = await fetch('/api/snapshots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', key, note, reason: 'manual' }),
  });
  return res.json();
}

export async function restoreSnapshot(key: string, snapshotId: string): Promise<any> {
  const res = await fetch('/api/snapshots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore', key, snapshotId }),
  });
  return res.json();
}

export async function fetchSiteMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  favicon?: string;
  url?: string;
} | null> {
  try {
    const res = await fetch('/api/meta-fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    return (await res.json()) as any;
  } catch {
    return null;
  }
}

export async function exportAllData(): Promise<any> {
  const res = await fetch('/api/migration/export');
  return res.json();
}

export async function importAllData(data: any): Promise<any> {
  const res = await fetch('/api/migration/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
