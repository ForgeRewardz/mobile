import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import { SafeScreen } from '@/components/layout/SafeScreen'
import { TopAppBar } from '@/components/navigation/TopAppBar'
import { SearchBar } from '@/components/navigation/SearchBar'
import { IntentOfferCard, MissionCard, PointsBadge } from '@/components/cards'
import type { QuestType } from '@/components/cards'
import { QuickActionChips } from '@/components/inputs'
import { EmptyStateBlock, LoadingSkeleton } from '@/components/feedback'

import { useFeaturedOffers } from '@/hooks/use-featured-offers'
import { usePointsBalance } from '@/hooks/use-points-balance'
import { useWallet } from '@/hooks/useWallet'

import { colors, radii, spacing, typography } from '@/theme/tokens'
import type { IntentOffer } from '@/types/api'

const CAROUSEL_CARD_WIDTH = 280

/**
 * Maps an offer's free-form `actionType` to a launch-ready {@link QuestType}.
 * Post-launch quest types are excluded because `MissionCard` refuses to
 * render them.
 */
function mapActionTypeToQuestType(actionType: string): QuestType {
  const normalized = actionType.toLowerCase()
  if (normalized.includes('hold') || normalized.includes('stake')) return 'hold'
  if (normalized.includes('new') || normalized.includes('onboard')) return 'newcomer'
  return 'engagement'
}

export default function HomeScreen() {
  const router = useRouter()
  const { publicKey } = useWallet()

  const [query, setQuery] = useState('')

  const pointsBalanceQuery = usePointsBalance()
  const featuredOffersQuery = useFeaturedOffers({ limit: 5 })

  const usablePoints = pointsBalanceQuery.data?.usable ?? 0
  const offers = useMemo<IntentOffer[]>(() => featuredOffersQuery.data ?? [], [featuredOffersQuery.data])

  // Reuse featured offers as a stand-in for missions until the real endpoint
  // lands. We only show a handful so the home feed stays scannable.
  const trendingMissions = useMemo(() => offers.slice(0, 4), [offers])

  const handleSubmitSearch = () => {
    router.push({ pathname: '/(tabs)/home/search', params: { q: query } })
  }

  const handleQuickAction = (chip: string) => {
    router.push({ pathname: '/(tabs)/home/search', params: { q: chip.toLowerCase() } })
  }

  const handleOfferPress = (offer: IntentOffer) => {
    router.push({ pathname: '/(tabs)/home/offer/[id]', params: { id: offer.id } })
  }

  const handleMissionPress = (offer: IntentOffer) => {
    router.push({
      pathname: '/(tabs)/home/results',
      params: { q: mapActionTypeToQuestType(offer.actionType) },
    })
  }

  const handleSubmitTweet = () => {
    router.push('/(tabs)/home/submit-tweet')
  }

  return (
    <SafeScreen noPadding>
      <TopAppBar
        greeting="Welcome back"
        walletAddress={publicKey ?? undefined}
        rightContent={<PointsBadge points={usablePoints} size="md" />}
        onNotificationPress={() => {
          /* TODO: wire to notifications screen once available */
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: spacing['3xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intent search */}
        <View style={{ marginTop: spacing.sm }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSubmitSearch}
            placeholder="What do you want to do?"
          />
        </View>

        {/* Quick actions */}
        <QuickActionChips onSelect={handleQuickAction} />

        {/* Featured offers carousel */}
        <Section title="Featured Offers">
          <FeaturedOffersCarousel
            offers={offers}
            isLoading={featuredOffersQuery.isPending}
            isError={featuredOffersQuery.isError}
            onPressOffer={handleOfferPress}
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

        {/* Submit Tweet CTA */}
        <SubmitTweetCard onPress={handleSubmitTweet} />

        {/* Pending verifications — placeholder until Task #28 */}
        <Section title="Pending Verifications">
          <EmptyStateBlock
            icon="⏳"
            title="No pending verifications"
            message="Completed actions waiting on confirmation will appear here."
          />
        </Section>
      </ScrollView>
    </SafeScreen>
  )
}

// ---------------------------------------------------------------------------
//  Sub-components (kept local to this file — only used by the home screen)
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

interface FeaturedOffersCarouselProps {
  offers: IntentOffer[]
  isLoading: boolean
  isError: boolean
  onPressOffer: (offer: IntentOffer) => void
}

function FeaturedOffersCarousel({ offers, isLoading, isError, onPressOffer }: FeaturedOffersCarouselProps) {
  if (isLoading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.base }}
      >
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: CAROUSEL_CARD_WIDTH }}>
            <LoadingSkeleton variant="card" height={140} />
          </View>
        ))}
      </ScrollView>
    )
  }

  if (isError) {
    return <InlineError message="Couldn’t load featured offers. Pull to refresh." />
  }

  if (offers.length === 0) {
    return (
      <EmptyStateBlock
        icon="✨"
        title="No featured offers yet"
        message="Check back soon — new rewarded actions drop every day."
      />
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.base }}
    >
      {offers.map((offer) => (
        <View key={offer.id} style={{ width: CAROUSEL_CARD_WIDTH }}>
          <IntentOfferCard offer={offer} onPress={() => onPressOffer(offer)} />
        </View>
      ))}
    </ScrollView>
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
    return <InlineError message="Couldn’t load missions right now." />
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

interface SubmitTweetCardProps {
  onPress: () => void
}

function SubmitTweetCard({ onPress }: SubmitTweetCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Submit tweet for rewards"
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
