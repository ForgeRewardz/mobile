import { View, Text } from 'react-native'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { EmptyStateBlock } from '@/components/feedback'
import { colors, typography, spacing } from '@/theme/tokens'

export default function NotificationsScreen() {
  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          gap: spacing.md,
        }}
      >
        <BackButton />
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 20,
            color: colors.onSurface,
          }}
        >
          Notifications
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <EmptyStateBlock icon="🔔" title="No notifications yet" message="We'll let you know when rewards arrive" />
      </View>
    </SafeScreen>
  )
}
