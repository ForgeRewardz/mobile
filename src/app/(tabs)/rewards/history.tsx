import { useState, useMemo, useCallback } from 'react'
import { View, Text, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { RewardHistoryRow } from '@/components/cards'
import type { StatusValue } from '@/components/cards'
import { SegmentedControl } from '@/components/inputs'
import { EmptyStateBlock, LoadingSkeleton } from '@/components/feedback'
import { usePointsActivity } from '@/hooks/use-points-activity'
import { colors, typography, spacing } from '@/theme/tokens'
import type { PointEvent, PointEventType } from '@/types/api'

const SEGMENTS = ['All', 'Awarded', 'Pending', 'Rejected']
const STATUS_MAP = ['all', 'awarded', 'pending', 'rejected'] as const
type FilterStatus = (typeof STATUS_MAP)[number]

/**
 * Map PointEvent.type to the StatusValue accepted by RewardHistoryRow.
 * 'reserved' is surfaced as 'pending' since StatusPill does not have a
 * dedicated reserved state yet.
 */
function pointEventStatus(type: PointEventType): StatusValue {
  switch (type) {
    case 'awarded':
      return 'awarded'
    case 'rejected':
      return 'rejected'
    case 'pending':
    case 'reserved':
    default:
      return 'pending'
  }
}

function InitialLoadingState() {
  return (
    <View style={{ gap: spacing.sm, paddingHorizontal: spacing.base, paddingTop: spacing.md }}>
      <LoadingSkeleton variant="row" />
      <LoadingSkeleton variant="row" />
      <LoadingSkeleton variant="row" />
    </View>
  )
}

function FooterLoadingIndicator() {
  return (
    <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.md }}>
      <LoadingSkeleton variant="row" />
    </View>
  )
}

export default function RewardsHistoryScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const status: FilterStatus = STATUS_MAP[selectedIndex] ?? 'all'

  // usePointsActivity accepts `PointEventType | 'all'` which matches FilterStatus.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = usePointsActivity({
    status,
  })

  const events = useMemo<PointEvent[]>(() => data?.pages.flatMap((page) => page.events) ?? [], [data])

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const renderItem = useCallback(
    ({ item }: { item: PointEvent }) => (
      <RewardHistoryRow
        event={{
          protocolName: item.protocolName ?? 'Rewardz',
          actionType: item.reason ?? item.protocolName ?? 'Points update',
          amount: item.amount,
          status: pointEventStatus(item.type),
          createdAt: item.createdAt,
        }}
      />
    ),
    [],
  )

  const keyExtractor = useCallback((item: PointEvent) => item.id, [])

  const emptyComponent = isLoading ? (
    <InitialLoadingState />
  ) : (
    <EmptyStateBlock title="No activity" message="Your reward history will appear here" />
  )

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
          gap: spacing.md,
        }}
      >
        <BackButton />
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 20,
            color: colors.onSurface,
          }}
        >
          Rewards History
        </Text>
      </View>

      {/* Filter segmented control */}
      <View style={{ paddingBottom: spacing.md }}>
        <SegmentedControl segments={SEGMENTS} selectedIndex={selectedIndex} onChange={setSelectedIndex} />
      </View>

      {/* Paginated history list */}
      <FlashList
        data={events}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={isFetchingNextPage ? <FooterLoadingIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      />
    </SafeScreen>
  )
}
