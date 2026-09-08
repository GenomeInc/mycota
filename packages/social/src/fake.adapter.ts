import { PLATFORM_CAPABILITIES } from './capabilities.js';
import type {
  PlatformPost,
  PostInsights,
  PublishResult,
  SocialCapability,
  SocialPlatform,
  SocialPublisher,
} from './ports.js';

function fakeInsights(remoteId: string): PostInsights {
  let n = 0;
  for (const char of remoteId) n = (n * 31 + char.charCodeAt(0)) >>> 0;
  return {
    impressions: 400 + (n % 2000),
    reach: 300 + (n % 1500),
    likes: 20 + (n % 200),
    comments: n % 40,
    shares: n % 25,
    fetchedAt: new Date().toISOString(),
  };
}

export class FakeSocialPublisher implements SocialPublisher {
  readonly published: PlatformPost[] = [];

  constructor(readonly platform: SocialPlatform) {}

  capabilities(): SocialCapability[] {
    return PLATFORM_CAPABILITIES[this.platform];
  }

  async publish(post: PlatformPost): Promise<PublishResult> {
    this.published.push(post);
    const draft = post.kind === 'draft_only' || this.platform === 'tiktok';
    return {
      platform: this.platform,
      status: draft ? 'draft' : 'published',
      remoteId: `${this.platform}_${this.published.length}`,
    };
  }

  async insights(remoteId: string): Promise<PostInsights | undefined> {
    if (!remoteId) return undefined;
    return fakeInsights(remoteId);
  }
}
