import React from 'react'
import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { colors, fonts } from '@/theme/tokens'
import { StatusPill } from './StatusPill'
import type { StatusValue } from './StatusPill'

interface RewardEvent {
  protocolName: string
  protocolIcon?: string
  actionType: string
  amount: number
  status: StatusValue
  createdAt: string
}

interface RewardHistoryRowProps {
  event: RewardEvent
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function RewardHistoryRowInner({ event }: RewardHistoryRowProps) {
  const isPositive = event.amount >= 0
  const amountColor = isPositive ? colors.tertiary : colors.error
  const prefix = isPositive ? '+' : ''

  return (
    <View
      style={{
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      {/* Protocol icon — expo-image when URL available, fallback to initial chip */}
      {event.protocolIcon ? (
        <Image
          source={{ uri: event.protocolIcon }}
          style={{ width: 24, height: 24, borderRadius: 12 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.label,
              fontSize: 10,
            }}
          >
            {event.protocolName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Action text */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: colors.onSurface,
            fontFamily: fonts.label,
            fontSize: 13,
            lineHeight: 18,
          }}
          numberOfLines={1}
        >
          {event.actionType}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StatusPill status={event.status} />
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.body,
              fontSize: 11,
              lineHeight: 16,
            }}
          >
            {getRelativeTime(event.createdAt)}
          </Text>
        </View>
      </View>

      {/* Points amount */}
      <Text
        style={{
          color: amountColor,
          fontFamily: fonts.button,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {prefix}
        {Math.abs(event.amount).toLocaleString('en-US')}
      </Text>
    </View>
  )
}

export const RewardHistoryRow = React.memo(RewardHistoryRowInner)
