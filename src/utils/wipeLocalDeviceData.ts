import { supabase } from '../config/supabase';

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function deleteAllIndexedDBs() {
  // Preferred API (Chromium/modern)
  const dbs = await safe(() => (indexedDB as any).databases?.() as Promise<Array<{ name?: string }>>);
  if (dbs && Array.isArray(dbs)) {
    await Promise.all(
      dbs
        .map((d) => d?.name)
        .filter(Boolean)
        .map((name) => new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name as string);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        }))
    );
    return;
  }

  // Fallback: delete known DB names (Dexie defaults + app-ish names)
  const fallbackNames = ['DocuTrackr', 'docutrack', 'docutrackr', 'doctrack', 'Dexie', 'dexie'];
  await Promise.all(
    fallbackNames.map(
      (name) =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        })
    )
  );
}

async function clearAllCaches() {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
}

async function unregisterServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister().catch(() => false)));
}

export async function wipeLocalDeviceData() {
  // 1) Clear web storage
  try {
    localStorage.clear();
  } catch {}
  try {
    sessionStorage.clear();
  } catch {}

  // 2) Clear IndexedDB
  await safe(async () => {
    await deleteAllIndexedDBs();
    return true;
  });

  // 3) Clear caches & SW
  await safe(async () => {
    await clearAllCaches();
    return true;
  });
  await safe(async () => {
    await unregisterServiceWorkers();
    return true;
  });

  // 4) Invalidate Supabase session
  await safe(async () => {
    await supabase.auth.signOut();
    return true;
  });

  // 5) Redirect (full reload)
  window.location.href = '/login?reason=data_wiped';
}

