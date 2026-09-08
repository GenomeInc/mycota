import { describe, expect, it } from 'vitest';
import {
  CONNECTOR_PLATFORMS,
  connectorForPlatform,
  platformsForConnector,
  worstConnectionHealth,
} from './connectors.js';

describe('social connectors', () => {
  it('groups Instagram and Facebook Page under Meta OAuth, not Threads', () => {
    expect(CONNECTOR_PLATFORMS.meta).toEqual(['instagram', 'facebook']);
    expect(connectorForPlatform('instagram')).toBe('meta');
    expect(connectorForPlatform('facebook')).toBe('meta');
    expect(connectorForPlatform('tiktok')).toBe('tiktok');
    expect(platformsForConnector('instagram')).toEqual(['instagram']);
    expect(platformsForConnector('meta')).toEqual(['instagram', 'facebook']);
  });

  it('treats a connector as connected when any destination is live', () => {
    expect(worstConnectionHealth(['ok', 'needs_reauth'])).toBe('ok');
    expect(worstConnectionHealth(['ok', 'degraded'])).toBe('ok');
    expect(worstConnectionHealth(['needs_reauth'])).toBe('needs_reauth');
    expect(worstConnectionHealth(['ok'])).toBe('ok');
  });
});
