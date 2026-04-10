import { useEffect, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { IntentOfferCard } from '@/components/cards'
import { FilterChips } from '@/components/inputs'
import { EmptyStateBlock, LoadingSkeleton } from '@/components/feedback'
import { useIntentResolve } from '@/hooks/use-intent-resolve'
import { colors, spacing, typography } from '@/theme/tokens'
import type { IntentOffer } from '@/types/api'

/**
 * Intent Results screen.
 *
 * Reads a user's natural-language intent query from the URL (`q` param), calls
 * `useIntentResolve` on mount, and renders the ranked offers list along with
 * loading / empty / error states.
 *
 * Pressing an offer navigates to the Offer Detail screen with the `id` param.
 */
export default function ResultsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ q?: string; query?: string }>()
  // Primary param is `q` (per task spec), but callers still pass `query`, so
  // fall back to it to keep the legacy placeholder navigation working.
  const rawQuery = params.q ?? params.query ?? ''
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : ''

  const resolve = useIntentResolve()
  const [filters, setFilters] = useState<string[]>([])

  // Kick off the mutation once we have a query. Re-run if the query changes.
  useEffect(() => {
    if (!query) return
    resolve.mutate(query)
    // We intentionally omit `resolve` from deps — React Query mutation objects
    // are stable for the lifetime of the component, and including them would
    // cause an infinite re-resolve loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const offers = resolve.data?.offers ?? []
  const sortedOffers = [...offers].sort((a, b) => a.rank - b.rank)

  const isWeakMatch =
    resolve.data?.resolverConfidence !== undefined && resolve.data.resolverConfidence < 0.6 && sortedOffers.length > 0

  const handleOfferPress = (offer: IntentOffer) => {
    router.push({ pathname: '/(tabs)/home/offer/[id]', params: { id: offer.id } })
  }

  const handleEditQuery = () => {
    router.push('/(tabs)/home/search')
  }

  const handleRetry = () => {
    if (query) resolve.mutate(query)
  }

  // ---------------------------------------------------------------------
  //  Header (back button + editable query summary)
  // ---------------------------------------------------------------------
  const renderHeader = () => (
    <View style={{ gap: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.base }}>
      <BackButton />

      <Pressable
        onPress={handleEditQuery}
        accessibilityRole="button"
        accessibilityLabel="Edit query"
        style={({ pressed }) => ({
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: 16,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.md,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: typography.labelMedium,
            fontSize: 11,
            color: colors.onSurfaceVariant,
            marginBottom: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Query — tap to edit
        </Text>
        <Text
          style={{
            fontFamily: typography.headlineMedium,
            fontSize: 18,
            lineHeight: 24,
            color: colors.onSurface,
          }}
          numberOfLines={2}
        >
          {query || 'No query'}
        </Text>
      </Pressable>

      {/* Filter/sort row — empty for now, populated in a follow-up task. */}
      <FilterChips options={[]} selected={filters} onChange={setFilters} />
    </View>
  )

  // ---------------------------------------------------------------------
  //  State: missing query
  // ---------------------------------------------------------------------
  if (!query) {
    return (
      <SafeScreen>
        {renderHeader()}
        <EmptyStateBlock
          icon="?"
          title="No query provided"
          message="Head back to search and tell us what you want to do."
          ctaText="Go to search"
          onPress={handleEditQuery}
        />
      </SafeScreen>
    )
  }

  // ---------------------------------------------------------------------
  //  State: loading — show 3 skeleton card variants
  // ---------------------------------------------------------------------
  if (resolve.isPending) {
    return (
      <SafeScreen>
        {renderHeader()}
        <View style={{ gap: spacing.md, paddingTop: spacing.sm }}>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeScreen>
    )
  }

  // ---------------------------------------------------------------------
  //  State: error — inline error + retry button
  // ---------------------------------------------------------------------
  if (resolve.isError) {
    return (
      <SafeScreen>
        {renderHeader()}
        <View
          style={{
            backgroundColor: colors.errorContainer,
            borderRadius: 16,
            padding: spacing.base,
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.headlineSmall,
              fontSize: 16,
              color: colors.onSurface,
            }}
          >
            Couldn&apos;t resolve intent
          </Text>
          <Text
            style={{
              fontFamily: typography.bodyRegular,
              fontSize: 13,
              lineHeight: 18,
              color: colors.onSurfaceVariant,
            }}
          >
            {resolve.error?.message ?? 'An unknown error occurred while resolving your intent.'}
          </Text>
          <Pressable
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              backgroundColor: pressed ? colors.primaryContainer : colors.primary,
              borderRadius: 9999,
              paddingHorizontal: spacing.base,
              paddingVertical: spacing.sm,
              marginTop: spacing.xs,
            })}
          >
            <Text
              style={{
                fontFamily: typography.buttonFont,
                fontSize: 13,
                color: colors.surface,
              }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeScreen>
    )
  }

  // ---------------------------------------------------------------------
  //  State: no matches — empty state with CTA back to search
  // ---------------------------------------------------------------------
  if (sortedOffers.length === 0) {
    return (
      <SafeScreen>
        {renderHeader()}
        <EmptyStateBlock
          icon="~"
          title="No offers found"
          message="We couldn't find any rewarded actions for that query."
          ctaText="Try a different query"
          onPress={handleEditQuery}
        />
      </SafeScreen>
    )
  }

  // ---------------------------------------------------------------------
  //  State: results — ranked list (FlatList)
  // ---------------------------------------------------------------------
  return (
    <SafeScreen>
      <FlatList<IntentOffer>
        data={sortedOffers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {renderHeader()}
            {isWeakMatch && (
              <Text
                style={{
                  fontFamily: typography.headlineSmall,
                  fontSize: 14,
                  color: colors.onSurfaceVariant,
                  paddingTop: spacing.sm,
                  paddingBottom: spacing.md,
                }}
              >
                No exact match — similar offers:
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingBottom: spacing.md }}>
            <IntentOfferCard
              offer={item}
              onPress={() => handleOfferPress(item)}
              onRunAction={() => handleOfferPress(item)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        showsVerticalScrollIndicator={false}
      />
    </SafeScreen>
  )
}
