import { View, Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'

export type StatusValue =
  | 'awarded'
  | 'awaiting_signature'
  | 'awaiting_chain_verification'
  | 'confirmed_not_eligible'
  | 'rejected'
  | 'expired'
  | 'active'
  | 'pending'

interface StatusPillProps {
  status: StatusValue
}

const statusColorMap: Record<StatusValue, string> = {
  awarded: colors.tertiary,
  active: colors.tertiary,
  pending: colors.pending,
  awaiting_signature: colors.pending,
  awaiting_chain_verification: colors.pending,
  rejected: colors.error,
  confirmed_not_eligible: colors.error,
  expired: colors.onSurfaceVariant,
}

function formatLabel(status: StatusValue): string {
  const words = status.replace(/_/g, ' ').split(' ')
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ')
}

export function StatusPill({ status }: StatusPillProps) {
  const color = statusColorMap[status]

  return (
    <View
      style={{
        backgroundColor: `${color}33`,
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontFamily: fonts.label,
          fontSize: 11,
          lineHeight: 16,
        }}
      >
        {formatLabel(status)}
      </Text>
    </View>
  )
}
