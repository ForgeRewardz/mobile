import { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useStakeStatus } from '@/hooks/use-stake-status'
import { useStakeMutation } from '@/hooks/use-stake-mutation'
import { StakeSummaryCard } from '@/components/cards/StakeSummaryCard'
import { AmountInput } from '@/components/inputs/AmountInput'
import { StickyBottomCTA } from '@/components/feedback/StickyBottomCTA'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { colors, typography, spacing, radii } from '@/theme/tokens'

type ActiveAction = 'add' | 'unstake' | null

export default function StakeManagementScreen() {
  const { data: stakeStatus, isLoading } = useStakeStatus()
  const { stake, addStake, unstake } = useStakeMutation()

  const [addAmount, setAddAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)
  const [error, setError] = useState<string | null>(null)

  const isActive = stakeStatus?.isActive ?? false

  const parsedAddAmount = parseFloat(addAmount)
  const isValidAdd = !isNaN(parsedAddAmount) && parsedAddAmount > 0

  const parsedUnstakeAmount = parseFloat(unstakeAmount)
  const isValidUnstake = !isNaN(parsedUnstakeAmount) && parsedUnstakeAmount > 0

  const handleInitialStake = () => {
    if (!isValidAdd) return
    setError(null)
    stake.mutate(parsedAddAmount, {
      onSuccess: () => {
        setAddAmount('')
        setActiveAction(null)
      },
      onError: (err) => setError(err.message),
    })
  }

  const handleAddStake = () => {
    if (!isValidAdd) return
    setError(null)
    addStake.mutate(parsedAddAmount, {
      onSuccess: () => {
        setAddAmount('')
        setActiveAction(null)
      },
      onError: (err) => setError(err.message),
    })
  }

  const handleUnstake = () => {
    if (!isValidUnstake) return
    setError(null)
    unstake.mutate(parsedUnstakeAmount, {
      onSuccess: () => {
        setUnstakeAmount('')
        setActiveAction(null)
      },
      onError: (err) => setError(err.message),
    })
  }

  // Determine which CTA to show based on active action
  const renderBottomCTA = () => {
    if (!isActive && !isLoading) {
      return (
        <StickyBottomCTA
          label="Stake Now"
          onPress={handleInitialStake}
          disabled={!isValidAdd}
          loading={stake.isPending}
        />
      )
    }

    if (activeAction === 'add') {
      return (
        <StickyBottomCTA
          label="Confirm Add Stake"
          onPress={handleAddStake}
          disabled={!isValidAdd}
          loading={addStake.isPending}
        />
      )
    }

    if (activeAction === 'unstake') {
      return (
        <StickyBottomCTA
          label="Confirm Unstake"
          onPress={handleUnstake}
          disabled={!isValidUnstake}
          loading={unstake.isPending}
        />
      )
    }

    return null
  }

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
          Stake Management
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 120,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state */}
        {isLoading && (
          <View style={{ gap: spacing.md }}>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="row" />
            <LoadingSkeleton variant="row" />
          </View>
        )}

        {/* Not staked state */}
        {!isLoading && !isActive && (
          <View style={{ gap: spacing.xl }}>
            <View
              style={{
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radii['2xl'],
                padding: spacing.xl,
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.headlineFont,
                  fontSize: 22,
                  color: colors.onSurface,
                  textAlign: 'center',
                }}
              >
                Not Staked
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 14,
                  color: colors.onSurfaceVariant,
                  textAlign: 'center',
                  lineHeight: 22,
                }}
              >
                Staking Token X unlocks full access to rewarded actions, point earning, and protocol eligibility. Your
                stake also becomes available for rental, generating passive yield.
              </Text>
            </View>

            <AmountInput
              value={addAmount}
              onChangeText={(text) => {
                setAddAmount(text)
                if (error) setError(null)
              }}
              tokenSymbol="TOKEN X"
              label="Amount to stake"
            />

            {error && (
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 13,
                  color: colors.error,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            )}
          </View>
        )}

        {/* Staked state */}
        {!isLoading && isActive && stakeStatus && (
          <View style={{ gap: spacing.xl }}>
            <StakeSummaryCard
              stakedAmount={stakeStatus.stakedAmount}
              availableForRental={stakeStatus.availableForRental}
              isActive={stakeStatus.isActive}
            />

            {/* Add Stake section */}
            <View style={{ gap: spacing.md }}>
              <Text
                style={{
                  fontFamily: typography.headlineMdFont,
                  fontSize: 18,
                  color: colors.onSurface,
                }}
              >
                Add Stake
              </Text>
              <AmountInput
                value={addAmount}
                onChangeText={(text) => {
                  setAddAmount(text)
                  setActiveAction('add')
                  if (error) setError(null)
                }}
                tokenSymbol="TOKEN X"
                label="Additional amount"
              />
            </View>

            {/* Unstake section */}
            <View style={{ gap: spacing.md }}>
              <Text
                style={{
                  fontFamily: typography.headlineMdFont,
                  fontSize: 18,
                  color: colors.onSurface,
                }}
              >
                Unstake
              </Text>
              <AmountInput
                value={unstakeAmount}
                onChangeText={(text) => {
                  setUnstakeAmount(text)
                  setActiveAction('unstake')
                  if (error) setError(null)
                }}
                tokenSymbol="TOKEN X"
                label="Amount to unstake"
                maxAmount={stakeStatus.availableForRental}
              />
              {stakeStatus.totalRentedOut > 0 && (
                <Text
                  style={{
                    fontFamily: typography.bodyFont,
                    fontSize: 13,
                    color: colors.warning,
                    lineHeight: 18,
                  }}
                >
                  {stakeStatus.totalRentedOut.toLocaleString('en-US')} tokens are currently rented out and cannot be
                  unstaked until the rental period ends.
                </Text>
              )}
            </View>

            {error && (
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 13,
                  color: colors.error,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {renderBottomCTA()}
    </SafeScreen>
  )
}
