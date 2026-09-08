export type {
  ConnectionHealth,
  FetchLike,
  MediaAsset,
  OAuthAppConfig,
  PlatformPost,
  PublishFailure,
  PostInsights,
  PublishResult,
  SocialAccount,
  SocialAuth,
  SocialCapability,
  SocialPlatform,
  SocialPublisher,
  TokenSet,
} from './ports.js';
export type { SocialConnector } from './connectors.js';
export {
  CONNECTOR_LABELS,
  CONNECTOR_PLATFORMS,
  SOCIAL_CONNECTORS,
  connectorForPlatform,
  platformsForConnector,
  rollupConnectorHealth,
  worstConnectionHealth,
} from './connectors.js';
export {
  INSTAGRAM_DAILY_PUBLISH_LIMIT,
  PLATFORM_CAPABILITIES,
  assertSupported,
} from './capabilities.js';
export { SocialPublisherRegistry, UnsupportedPlatformError } from './registry.js';
export { FakeSocialPublisher } from './fake.adapter.js';
export {
  META_FACEBOOK_LOGIN_SCOPES,
  MetaSocialPublisher,
  metaAuthorizationUrl,
  type MetaPublisherOptions,
} from './meta.adapter.js';
export { listMetaDestinations, type MetaDestination } from './meta-accounts.js';
export {
  TikTokSocialPublisher,
  tiktokAuthorizationUrl,
  type TikTokPublisherOptions,
} from './tiktok.adapter.js';
export { XSocialPublisher, xAuthorizationUrl, type XPublisherOptions } from './x.adapter.js';
