/**
 * SDK re-export facade.
 *
 * The inline RewardzApiClient has been replaced by @rewardz/sdk RewardzClient.
 * This file re-exports SDK types for backward compatibility.
 * New code should import directly from @rewardz/sdk/client.
 */
export { RewardzClient } from '@rewardz/sdk/client'
export type { RewardzClientConfig } from '@rewardz/sdk/client'
