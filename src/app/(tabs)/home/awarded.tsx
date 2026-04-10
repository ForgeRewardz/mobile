import { View } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { SuccessStatePanel } from '@/components/feedback'

/**
 * Points Awarded (celebration) — terminal screen in the reward completion flow.
 *
 * Reached via `router.replace` from the verifying screen once the completion
 * status flips to `awarded`. No back button: the previous screens (pending,
 * verifying) are one-shot and should not be revisited.
 *
 * Composition of `SuccessStatePanel`, which owns the celebration visuals and
 * success haptic on mount. This screen's only job is to forward params and
 * route the CTAs.
 */
export default function AwardedScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ points?: string; completionId?: string }>()
  const points = Number(params.points ?? 0)

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <SuccessStatePanel
          title="Points Awarded!"
          points={Number.isFinite(points) ? points : 0}
          subtitle="Your reward action was completed successfully"
          primaryCta={{
            label: 'See Rewards',
            onPress: () => router.replace('/(tabs)/rewards'),
          }}
          secondaryCta={{
            label: 'Do Another Action',
            onPress: () => router.replace('/(tabs)/home'),
          }}
        />
      </View>
    </SafeScreen>
  )
}
