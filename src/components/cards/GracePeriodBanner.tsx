import { View, Text, Pressable } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'

interface GracePeriodBannerProps {
  daysRemaining?: number
  onPress?: () => void
}

export function GracePeriodBanner({ daysRemaining, onPress }: GracePeriodBannerProps) {
  const daysText = daysRemaining !== undefined ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining` : ''

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: `${colors.warning}26`,
        borderRadius: radii.lg,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        opacity: pressed && onPress ? 0.85 : 1,
        width: '100%',
      })}
    >
      {/* Warning icon */}
      <Text style={{ fontSize: 18 }}>&#x26A0;&#xFE0F;</Text>

      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: colors.warning,
            fontFamily: fonts.label,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          Stake lapsing
        </Text>
        {daysText !== '' && (
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.body,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {daysText}
          </Text>
        )}
      </View>

      {onPress && (
        <Text
          style={{
            color: colors.warning,
            fontFamily: fonts.button,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          Renew
        </Text>
      )}
    </Pressable>
  )
}
