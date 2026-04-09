import { View, Text } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'

interface StakeSummaryCardProps {
  stakedAmount: number
  availableForRental: number
  isActive: boolean
}

export function StakeSummaryCard({ stakedAmount, availableForRental, isActive }: StakeSummaryCardProps) {
  const statusColor = isActive ? colors.tertiary : colors.warning
  const rentedAmount = stakedAmount - availableForRental

  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii['2xl'],
        padding: 16,
        flexDirection: 'row',
      }}
    >
      {/* Status indicator bar */}
      <View
        style={{
          width: 4,
          borderRadius: 2,
          backgroundColor: statusColor,
          marginRight: 14,
        }}
      />

      <View style={{ flex: 1, gap: 12 }}>
        {/* Staked amount */}
        <View>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.label,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            Total Staked
          </Text>
          <Text
            style={{
              color: colors.onSurface,
              fontFamily: fonts.displayBold,
              fontSize: 28,
              lineHeight: 36,
            }}
          >
            {stakedAmount.toLocaleString('en-US')}
          </Text>
        </View>

        {/* Breakdown row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 2 }}>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              Available
            </Text>
            <Text
              style={{
                color: colors.onSurface,
                fontFamily: fonts.label,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {availableForRental.toLocaleString('en-US')}
            </Text>
          </View>

          <View style={{ gap: 2, alignItems: 'flex-end' }}>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: fonts.body,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              Rented
            </Text>
            <Text
              style={{
                color: colors.onSurface,
                fontFamily: fonts.label,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {rentedAmount.toLocaleString('en-US')}
            </Text>
          </View>
        </View>

        {/* Status line */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
            }}
          />
          <Text
            style={{
              color: statusColor,
              fontFamily: fonts.label,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  )
}
