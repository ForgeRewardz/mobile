import { Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'
import { formatPoints } from '@/utils/format'

interface PointsBadgeProps {
  points: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { fontFamily: fonts.label, fontSize: 12, lineHeight: 16 },
  md: { fontFamily: fonts.button, fontSize: 14, lineHeight: 20 },
  lg: { fontFamily: fonts.headline, fontSize: 20, lineHeight: 28 },
} as const

export function PointsBadge({ points, size = 'md' }: PointsBadgeProps) {
  const config = sizeConfig[size]

  return (
    <Text
      style={{
        color: colors.primary,
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        lineHeight: config.lineHeight,
      }}
    >
      {formatPoints(points)} pts
    </Text>
  )
}
