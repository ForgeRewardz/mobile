import { useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { SafeScreen } from '@/components/layout/SafeScreen'
import { TopAppBar } from '@/components/navigation/TopAppBar'
import { SearchBar } from '@/components/navigation/SearchBar'
import { QuickActionChips } from '@/components/inputs'
import { FeaturedBadge, MissionCard, TrustBadge } from '@/components/cards'
import type { QuestType } from '@/components/cards'
import { EmptyStateBlock, LoadingSkeleton } from '@/components/feedback'

import { useFeaturedOffers } from '@/hooks/use-featured-offers'

import { colors, radii, spacing, typography } from '@/theme/tokens'
import type { IntentOffer } from '@/types/api'

const PROTOCOL_CARD_WIDTH = 220
const DEFAULT_TRUST_SCORE = 5000

/**
 * Minimal protocol summary derived from the featured offers feed. Until the
 * protocol catalog endpoint ships we synthesise these by grouping offers on
 * `protocolName` and collecting the distinct action types each one supports.
 */
interface ProtocolSummary {
  id: string
  name: string
  icon?: string
  trustScore: number
  supportedActions: string[]
  muted: boolean
  isFeatured: boolean
}

/**
 * Maps an offer's free-form `actionType` to a launch-ready {@link QuestType}.
 * Keeps this file self-contained — the home screen uses the same mapping.
 */
function mapActionTypeToQuestType(actionType: string): QuestType {
  const normalized = actionType.toLowerCase()
  if (normalized.includes('hold') || normalized.includes('stake')) return 'hold'
  if (normalized.includes('new') || normalized.includes('onboard')) return 'newcomer'
  return 'engagement'
}

/**
 * Collapses a list of offers into unique protocols. Trust score is taken from
 * the best-scoring offer for that protocol so the catalog shows the protocol's
 * strongest signal rather than an arbitrary one.
 */
function buildProtocolCatalog(offers: IntentOffer[]): ProtocolSummary[] {
  const byName = new Map<string, ProtocolSummary & { _allAtRisk: boolean }>()
  for (const offer of offers) {
    const existing = byName.get(offer.protocolName)
    const actionLabel = humanizeActionType(offer.actionType)
    const isAtRisk = offer.visibility === 'at_risk'
    if (existing) {
      if (!existing.supportedActions.includes(actionLabel)) {
        existing.supportedActions.push(actionLabel)
      }
      if ((offer.trustScore ?? 0) > existing.trustScore) {
        existing.trustScore = offer.trustScore ?? existing.trustScore
      }
      if (!existing.icon && offer.protocolIcon) {
        existing.icon = offer.protocolIcon
      }
      if (!isAtRisk) {
        existing._allAtRisk = false
      }
      if (offer.isFeatured) {
        existing.isFeatured = true
      }
    } else {
      byName.set(offer.protocolName, {
        id: offer.protocolName,
        name: offer.protocolName,
        icon: offer.protocolIcon,
        trustScore: offer.trustScore ?? DEFAULT_TRUST_SCORE,
        supportedActions: [actionLabel],
        muted: false,
        isFeatured: offer.isFeatured ?? false,
        _allAtRisk: isAtRisk,
      })
    }
  }
  return Array.from(byName.values()).map(({ _allAtRisk, ...proto }) => ({
    ...proto,
    muted: _allAtRisk,
  }))
}

/**
 * Normalises an offer's `actionType` into one of the canonical action labels
 * used by {@link QuickActionChips}. Falls back to a title-cased version of the
 * raw value so unknown action types still render legibly.
 */
function humanizeActionType(actionType: string): string {
  const normalized = actionType.toLowerCase()
  if (normalized.includes('swap')) return 'Swap'
  if (normalized.includes('stake')) return 'Stake'
  if (normalized.includes('mint')) return 'Mint'
  if (normalized.includes('vote') || normalized.includes('govern')) return 'Vote'
  if (normalized.includes('pay') || normalized.includes('send') || normalized.includes('transfer')) return 'Pay'
  if (actionType.length === 0) return 'Other'
  return actionType.charAt(0).toUpperCase() + actionType.slice(1).toLowerCase()
}

export default function ExploreScreen() {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<string | undefined>()

  const featuredOffersQuery = useFeaturedOffers({ limit: 20 })
  const allOffers = useMemo<IntentOffer[]>(() => featuredOffersQuery.data ?? [], [featuredOffersQuery.data])

  // Filter offers by the selected action type chip. Also applies the free-text
  // search query across protocol name and offer title so the catalog feels
  // responsive while the real search endpoint is wired up.
  const visibleOffers = useMemo<IntentOffer[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return allOffers.filter((offer) => {
      if (offer.visibility === 'hidden') return false
      const matchesAction = selectedAction ? humanizeActionType(offer.actionType) === selectedAction : true
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : offer.protocolName.toLowerCase().includes(normalizedQuery) ||
            offer.title.toLowerCase().includes(normalizedQuery)
      return matchesAction && matchesQuery
    })
  }, [allOffers, selectedAction, query])

  const protocols = useMemo<ProtocolSummary[]>(() => buildProtocolCatalog(visibleOffers), [visibleOffers])
  const trendingMissions = useMemo(() => visibleOffers.slice(0, 4), [visibleOffers])

  const handleSubmitSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    router.push({ pathname: '/(tabs)/home/results', params: { q: trimmed } })
  }

  const handleSelectAction = (chip: string) => {
    // Tapping the already-active chip clears the filter, so the catalog always
    // has an obvious path back to "show everything".
    setSelectedAction((current) => (current === chip ? undefined : chip))
  }

  const handleProtocolPress = (protocol: ProtocolSummary) => {
    const actionHint = protocol.supportedActions[0]?.toLowerCase() ?? 'swap'
    router.push({
      pathname: '/(tabs)/home/results',
      params: { q: `${protocol.name} ${actionHint}` },
    })
  }

  const handleMissionPress = (offer: IntentOffer) => {
    router.push({ pathname: '/(tabs)/explore/mission/[id]', params: { id: offer.id } })
  }

  const handleSubmitTweet = () => {
    router.push('/(tabs)/home/submit-tweet')
  }

  return (
    <SafeScreen noPadding>
      <TopAppBar greeting="Explore" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing['3xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Protocol search */}
        <View style={{ marginTop: spacing.sm }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSubmitSearch}
            placeholder="Search protocols"
          />
        </View>

        {/* Action type filter */}
        <QuickActionChips selected={selectedAction} onSelect={handleSelectAction} />

        {/* Protocol catalog */}
        <Section title="Protocols">
          <ProtocolCatalog
            protocols={protocols}
            isLoading={featuredOffersQuery.isPending}
            isError={featuredOffersQuery.isError}
            onPressProtocol={handleProtocolPress}
          />
        </Section>

        {/* Trending missions */}
        <Section title="Trending Missions">
          <TrendingMissionsList
            offers={trendingMissions}
            isLoading={featuredOffersQuery.isPending}
            isError={featuredOffersQuery.isError}
            onPressMission={handleMissionPress}
          />
        </Section>

        {/* Tweet to Earn CTA */}
        <Section title="Tweet to Earn">
          <TweetToEarnCard onPress={handleSubmitTweet} />
        </Section>
      </ScrollView>
    </SafeScreen>
  )
}

// ---------------------------------------------------------------------------
//  Sub-components (kept local — only used by the explore screen)
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ gap: spacing.md }}>
      <Text
        style={{
          color: colors.onSurface,
          fontFamily: typography.headlineSmall,
          fontSize: 18,
          lineHeight: 24,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  )
}

interface ProtocolCatalogProps {
  protocols: ProtocolSummary[]
  isLoading: boolean
  isError: boolean
  onPressProtocol: (protocol: ProtocolSummary) => void
}

function ProtocolCatalog({ protocols, isLoading, isError, onPressProtocol }: ProtocolCatalogProps) {
  if (isLoading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.base }}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: PROTOCOL_CARD_WIDTH }}>
            <LoadingSkeleton variant="card" height={132} />
          </View>
        ))}
      </ScrollView>
    )
  }

  if (isError) {
    return <InlineError message="Couldn’t load the protocol catalog. Pull to refresh." />
  }

  if (protocols.length === 0) {
    return (
      <EmptyStateBlock icon="🧪" title="No protocols yet" message="Protocols matching your filter will appear here." />
    )
  }

  return (
    <FlatList
      data={protocols}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.base }}
      renderItem={({ item }) => <ProtocolCard protocol={item} onPress={() => onPressProtocol(item)} />}
    />
  )
}

interface ProtocolCardProps {
  protocol: ProtocolSummary
  onPress: () => void
}

function ProtocolCard({ protocol, onPress }: ProtocolCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${protocol.name}`}
      style={({ pressed }) => ({
        width: PROTOCOL_CARD_WIDTH,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii['2xl'],
        padding: spacing.base,
        gap: spacing.md,
        opacity: protocol.muted ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {/* Icon placeholder — mirrors MissionCard avatar treatment */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.full,
            backgroundColor: colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: typography.labelFont,
              fontSize: 14,
            }}
          >
            {protocol.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text
              style={{
                color: colors.onSurface,
                fontFamily: typography.headlineSmall,
                fontSize: 15,
                lineHeight: 20,
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {protocol.name}
            </Text>
            {protocol.isFeatured && <FeaturedBadge />}
          </View>
          <TrustBadge score={protocol.trustScore} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {protocol.supportedActions.slice(0, 3).map((action) => (
          <View
            key={action}
            style={{
              backgroundColor: colors.surfaceContainerHighest,
              borderRadius: radii.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
            }}
          >
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: typography.labelSmall,
                fontSize: 11,
                lineHeight: 16,
              }}
            >
              {action}
            </Text>
          </View>
        ))}
      </View>
    </Pressable>
  )
}

interface TrendingMissionsListProps {
  offers: IntentOffer[]
  isLoading: boolean
  isError: boolean
  onPressMission: (offer: IntentOffer) => void
}

function TrendingMissionsList({ offers, isLoading, isError, onPressMission }: TrendingMissionsListProps) {
  if (isLoading) {
    return (
      <View style={{ gap: spacing.md }}>
        {[0, 1].map((i) => (
          <LoadingSkeleton key={i} variant="card" height={110} />
        ))}
      </View>
    )
  }

  if (isError) {
    return <InlineError message="Couldn’t load trending missions right now." />
  }

  if (offers.length === 0) {
    return (
      <EmptyStateBlock
        icon="🧭"
        title="No trending missions"
        message="Trending missions will appear here once they’re live."
      />
    )
  }

  return (
    <View style={{ gap: spacing.md }}>
      {offers.map((offer) => (
        <MissionCard
          key={offer.id}
          quest={{
            id: offer.id,
            title: offer.title,
            description: offer.description,
            questType: mapActionTypeToQuestType(offer.actionType),
            rewardPoints: offer.rewardPoints,
            protocolName: offer.protocolName,
            protocolIcon: offer.protocolIcon,
          }}
          onPress={() => onPressMission(offer)}
        />
      ))}
    </View>
  )
}

interface TweetToEarnCardProps {
  onPress: () => void
}

function TweetToEarnCard({ onPress }: TweetToEarnCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Submit a tweet to earn points"
      style={({ pressed }) => ({
        backgroundColor: colors.primaryContainer,
        borderRadius: radii['2xl'],
        padding: spacing.lg,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.base }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radii.full,
            backgroundColor: colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>{'\uD83D\uDC26'}</Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              color: colors.surface,
              fontFamily: typography.headlineSmall,
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            Submit a tweet
          </Text>
          <Text
            style={{
              color: colors.surface,
              fontFamily: typography.bodyRegular,
              fontSize: 13,
              lineHeight: 18,
              opacity: 0.85,
            }}
          >
            Share your action on X and earn bonus points when it matches an active campaign.
          </Text>
        </View>

        <Text
          style={{
            color: colors.surface,
            fontFamily: typography.buttonFont,
            fontSize: 20,
          }}
        >
          →
        </Text>
      </View>
    </Pressable>
  )
}

interface InlineErrorProps {
  message: string
}

function InlineError({ message }: InlineErrorProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii.lg,
        padding: spacing.base,
      }}
    >
      <Text
        style={{
          color: colors.error,
          fontFamily: typography.bodyRegular,
          fontSize: 13,
          lineHeight: 18,
        }}
      >
        {message}
      </Text>
    </View>
  )
}
