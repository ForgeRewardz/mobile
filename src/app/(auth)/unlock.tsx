import { useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useWallet } from '@/hooks/useWallet'
import { useStakeMutation } from '@/hooks/use-stake-mutation'
import { truncateAddress } from '@/utils/format'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { AmountInput } from '@/components/inputs/AmountInput'
import { StickyBottomCTA } from '@/components/feedback/StickyBottomCTA'
import { colors, typography, spacing } from '@/theme/tokens'

export default function UnlockScreen() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const { stake } = useStakeMutation()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const parsedAmount = parseFloat(amount)
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0

  const handleStake = () => {
    if (!isValidAmount) return
    setError(null)

    stake.mutate(parsedAmount, {
      onSuccess: () => {
        router.push('/(auth)/success')
      },
      onError: (err) => {
        setError(err.message)
      },
    })
  }

  const handleSkip = () => {
    router.push('/(auth)/success')
  }

  return (
    <SafeScreen>
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 28,
            color: colors.onSurface,
            textAlign: 'center',
            marginBottom: spacing.sm,
          }}
        >
          Unlock Access
        </Text>

        {publicKey && (
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 14,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}
          >
            Wallet: {truncateAddress(publicKey)}
          </Text>
        )}

        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 16,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginBottom: spacing['2xl'],
            lineHeight: 24,
          }}
        >
          Stake Token X to unlock full access to Rewardz. Your stake grants eligibility for rewarded actions and points.
        </Text>

        <AmountInput
          value={amount}
          onChangeText={(text) => {
            setAmount(text)
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
              marginTop: spacing.md,
            }}
          >
            {error}
          </Text>
        )}
      </View>

      <StickyBottomCTA
        label="Stake to Unlock"
        onPress={handleStake}
        disabled={!isValidAmount}
        loading={stake.isPending}
        secondaryLabel="Skip for now"
        onSecondaryPress={handleSkip}
      />
    </SafeScreen>
  )
}
