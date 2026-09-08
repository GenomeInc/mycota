import type { ConnectionHealth, SocialPlatform } from './ports.js';

/**
 * OAuth products, not campaign destinations.
 *
 * Meta is not one SDK for every account type:
 * - Facebook Login for Business — this connector. One dialog, then Graph
 *   `/me/accounts` yields Facebook Pages and linked Instagram professional
 *   accounts. Same user token; Page tokens for Page publish.
 * - Business Login for Instagram — separate Instagram-credential OAuth
 *   (`graph.instagram.com`). No Facebook Page. Do not mix with this connector.
 * - Threads API — separate OAuth (`graph.threads.net`). Add as its own
 *   connector when we publish there; a Facebook Login token cannot call it.
 *
 * Campaign posts still target `instagram` | `facebook` | `tiktok` | `x`.
 */
export type SocialConnector = 'meta' | 'tiktok' | 'x';

export const CONNECTOR_PLATFORMS: Record<SocialConnector, SocialPlatform[]> = {
  meta: ['instagram', 'facebook'],
  tiktok: ['tiktok'],
  x: ['x'],
};

export const CONNECTOR_LABELS: Record<SocialConnector, string> = {
  meta: 'Meta',
  tiktok: 'TikTok',
  x: 'X',
};

export const SOCIAL_CONNECTORS = Object.keys(CONNECTOR_PLATFORMS) as SocialConnector[];

export function connectorForPlatform(platform: SocialPlatform): SocialConnector {
  if (platform === 'instagram' || platform === 'facebook') return 'meta';
  return platform;
}

/** Destinations to enable for a Connect/Reconnect click. `meta` lists both; each destination is opted in on its own. */
export function platformsForConnector(id: string): SocialPlatform[] {
  if (id === 'meta') return [...CONNECTOR_PLATFORMS.meta];
  if (id === 'instagram' || id === 'facebook' || id === 'tiktok' || id === 'x') return [id];
  throw new Error(`unknown social connector ${id}`);
}

/** Connector is connected if any destination is. Reauth only when nothing is live. */
export function rollupConnectorHealth(healths: ConnectionHealth[]): ConnectionHealth {
  if (healths.includes('ok')) return 'ok';
  if (healths.includes('degraded')) return 'degraded';
  return 'needs_reauth';
}

export function worstConnectionHealth(healths: ConnectionHealth[]): ConnectionHealth {
  return rollupConnectorHealth(healths);
}
