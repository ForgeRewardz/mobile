import { View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { RejectionStatePanel } from '@/components/feedback'
import { spacing } from '@/theme/tokens'

/**
 * Not Eligible / Rejected — terminal screen when a completion fails to earn
 * points. Can be reached from two upstream flows:
 *
 *  1. `pending` → when the on-chain transaction itself fails or expires
 *     (passes `reason: 'transaction_failed'`).
 *  2. `verifying` → when the completion is confirmed but rejected by the
 *     reward policy (passes `reason` from the completion status, typically
 *     `'confirmed_not_eligible'`, `'rejected'`, or a server-provided key).
 *
 * Known reason keys are mapped to human-readable copy. Unknown keys pass
 * through as-is so the server can surface custom reasons without a mobile
 * release.
 */

const REASON_COPY: Record<string, string> = {
  transaction_failed: 'Your transaction failed on-chain before it could be verified.',
  confirmed_not_eligible: "Your transaction was confirmed, but didn't meet the reward criteria.",
  rejected: 'Your transaction did not meet the reward criteria.',
  expired: 'This reward expired before your transaction could be verified.',
}

const DEFAULT_REASON = 'Your transaction did not meet the reward criteria'

function resolveReason(raw: string | undefined): string {
  if (!raw) return DEFAULT_REASON
  return REASON_COPY[raw] ?? raw
}

export default function RejectedScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ reason?: string; completionId?: string }>()
  const reason = resolveReason(params.reason)

  return (
    <SafeScreen>
      {/* Header with back button — mirrors the verifying screen layout so
          users always have a familiar way out of the flow. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
        }}
      >
        <BackButton />
      </View>

      <View className="flex-1 items-center justify-center">
        <RejectionStatePanel
          title="Not Eligible"
          reason={reason}
          conditions={[
            { label: 'Wallet signed transaction', passed: true },
            { label: 'Met reward policy', passed: false },
          ]}
          ctaText="Back to Offers"
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </SafeScreen>
  )
}
