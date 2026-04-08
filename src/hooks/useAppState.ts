import { useAppStore } from '@/store'
import { useWallet } from './useWallet'

/**
 * Determines app navigation state based on onboarding + wallet + unlock status.
 * Used by the root index.tsx to decide which flow to show.
 */
export function useAppState() {
  const { isOnboarded, isUnlocked, onboardingStep } = useAppStore()
  const { connected } = useWallet()

  return {
    isOnboarded,
    isUnlocked,
    isConnected: connected,
    onboardingStep,
    /** User should see onboarding */
    needsOnboarding: !isOnboarded || !connected,
    /** User passed onboarding but hasn't staked X */
    needsUnlock: isOnboarded && connected && !isUnlocked,
    /** User is fully set up */
    isReady: isOnboarded && connected && isUnlocked,
  }
}
