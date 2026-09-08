import { describe, expect, it, vi } from 'vitest';
import { listMetaDestinations } from './meta-accounts.js';

describe('listMetaDestinations', () => {
  it('expands Facebook Pages and linked Instagram professional accounts', async () => {
    const fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'page_1',
              name: 'The Lot',
              instagram_business_account: { id: '1784', username: 'thelot' },
            },
            { id: 'page_2', name: 'Lot Afters' },
          ],
        }),
        { status: 200 },
      ),
    );

    const destinations = await listMetaDestinations({
      accessToken: 'user_tok',
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    expect(destinations).toEqual([
      { platform: 'facebook', accountId: 'page_1', displayName: 'The Lot', pageId: 'page_1' },
      { platform: 'instagram', accountId: '1784', displayName: '@thelot', pageId: 'page_1' },
      { platform: 'facebook', accountId: 'page_2', displayName: 'Lot Afters', pageId: 'page_2' },
    ]);
  });
});
