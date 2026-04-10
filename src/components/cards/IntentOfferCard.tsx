import { View, Text, Pressable } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'
import { TrustBadge } from './TrustBadge'

interface IntentOffer {
  id: string
  protocolName: string
  iconUrl?: string
  actionType: string
  title: string
  rewardPoints: number
  rank: number
  eligibility: 'eligible' | 'ineligible' | 'unknown'
}

interface IntentOfferCardProps {
  offer: IntentOffer
  onPress?: () => void
  onRunAction?: () => void
}

export function IntentOfferCard({ offer, onPress, onRunAction }: IntentOfferCardProps) {
  const rewardPointsLabel = `${offer.rewardPoints.toLocaleString('en-US')} points`
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Offer: ${offer.title}. ${offer.protocolName}. Reward ${rewardPointsLabel}.`}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii['2xl'],
        padding: 16,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Rank badge */}
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.surface,
              fontFamily: fonts.button,
              fontSize: 12,
            }}
          >
            {offer.rank}
          </Text>
        </View>

        {/* Protocol icon placeholder */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.label,
              fontSize: 13,
            }}
          >
            {offer.protocolName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontFamily: fonts.headline,
              fontSize: 15,
              lineHeight: 20,
            }}
            numberOfLines={1}
          >
            {offer.title}
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.body,
              fontSize: 12,
              lineHeight: 16,
            }}
          >
            {offer.protocolName}
          </Text>
        </View>

        <Text
          style={{
            color: colors.primary,
            fontFamily: fonts.button,
            fontSize: 16,
            lineHeight: 22,
          }}
        >
          +{offer.rewardPoints.toLocaleString('en-US')}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 14,
        }}
      >
        <TrustBadge score={offer.eligibility === 'eligible' ? 8000 : 5000} />

        <Pressable
          onPress={onRunAction}
          accessibilityRole="button"
          accessibilityLabel={`Run action for ${offer.title}`}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.primaryContainer : colors.primary,
            borderRadius: 9999,
            paddingHorizontal: 16,
            paddingVertical: 8,
          })}
        >
          <Text
            style={{
              color: colors.surface,
              fontFamily: fonts.button,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            Run Action
          </Text>
        </Pressable>
      </View>
    </Pressable>
  )
}
