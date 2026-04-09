import { View, Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'

interface TrustBadgeProps {
  /** Trust score in basis points (0-10000) */
  score: number
}

function getBadgeColor(score: number): string {
  if (score >= 7000) return colors.tertiary
  if (score >= 4000) return colors.warning
  return colors.error
}

export function TrustBadge({ score }: TrustBadgeProps) {
  const color = getBadgeColor(score)
  const displayScore = (score / 100).toFixed(0)

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${color}1a`,
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 12, color }}>&#x1F6E1;</Text>
      <Text
        style={{
          color,
          fontFamily: fonts.label,
          fontSize: 11,
          lineHeight: 16,
        }}
      >
        {displayScore}
      </Text>
    </View>
  )
}
