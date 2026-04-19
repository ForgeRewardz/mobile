import { View, Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'

/**
 * Small pill badge indicating a protocol is featured.
 * Mirrors the shape/sizing of {@link TrustBadge} for visual consistency.
 */
export function FeaturedBadge() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryContainer,
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 12 }}>{'\u2B50'}</Text>
      <Text
        style={{
          color: colors.surface,
          fontFamily: fonts.label,
          fontSize: 11,
          lineHeight: 16,
        }}
      >
        Featured
      </Text>
    </View>
  )
}
