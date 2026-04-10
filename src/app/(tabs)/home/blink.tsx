import { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { NativeBlinkCard } from '@/components/cards'
import { LoadingSkeleton, RejectionStatePanel } from '@/components/feedback'
import { fetchBlinkMetadata } from '@/services/blink-service'
import { executeBlink } from '@/services/blink-executor'
import { useMwaBlinkAdapter } from '@/hooks/use-mwa-blink-adapter'
import { useWallet } from '@/hooks/useWallet'
import { colors, spacing, typography } from '@/theme/tokens'
import type { BlinkMetadata } from '@/types/api'

/**
 * Execution state machine for the Blink screen.
 *
 * Each variant carries exactly the data needed for its render branch. The
 * discriminated union prevents rendering a card without metadata or a retry
 * panel without an error message.
 */
type ExecutionState =
  | { kind: 'loading_metadata' }
  | { kind: 'metadata_failed'; error: string }
  | { kind: 'parameter_entry'; metadata: BlinkMetadata; parameters: Record<string, string> }
  | { kind: 'preparing_tx'; metadata: BlinkMetadata; parameters: Record<string, string> }
  | { kind: 'awaiting_wallet'; metadata: BlinkMetadata; parameters: Record<string, string> }
  | { kind: 'user_rejected'; metadata: BlinkMetadata; parameters: Record<string, string>; error: string }
  | { kind: 'post_failed'; metadata: BlinkMetadata; parameters: Record<string, string>; error: string }
  | { kind: 'submitted'; signature: string }

/**
 * Heuristic for telling a wallet rejection apart from a server POST failure.
 *
 * Wallet adapters surface rejection as an exception with a message containing
 * "reject", "cancel", or "denied" across iOS and Android. Anything else we
 * treat as a POST / network / server error so the retry panel can show the
 * right copy and the right next step.
 */
function isUserRejection(message: string): boolean {
  return /reject|cancel|denied/i.test(message)
}

export default function BlinkExecutionScreen() {
  const router = useRouter()
  const { actionUrl, offerId } = useLocalSearchParams<{ actionUrl: string; offerId?: string }>()
  const { publicKey } = useWallet()
  const adapter = useMwaBlinkAdapter()

  const [state, setState] = useState<ExecutionState>({ kind: 'loading_metadata' })

  // Load metadata whenever the action URL changes. Wrapped in a cancellation
  // guard so a fast back-navigation doesn't land a stale setState on an
  // unmounted screen.
  const loadMetadata = useCallback(async () => {
    if (!actionUrl) {
      setState({ kind: 'metadata_failed', error: 'No action URL provided' })
      return
    }

    setState({ kind: 'loading_metadata' })
    try {
      const metadata = await fetchBlinkMetadata(actionUrl)
      setState({ kind: 'parameter_entry', metadata, parameters: {} })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load action'
      setState({ kind: 'metadata_failed', error: message })
    }
  }, [actionUrl])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!actionUrl) {
        if (!cancelled) setState({ kind: 'metadata_failed', error: 'No action URL provided' })
        return
      }
      if (!cancelled) setState({ kind: 'loading_metadata' })
      try {
        const metadata = await fetchBlinkMetadata(actionUrl)
        if (!cancelled) setState({ kind: 'parameter_entry', metadata, parameters: {} })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load action'
        if (!cancelled) setState({ kind: 'metadata_failed', error: message })
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [actionUrl])

  const handleParameterChange = useCallback((name: string, value: string) => {
    setState((prev) => {
      if (prev.kind !== 'parameter_entry') return prev
      return {
        kind: 'parameter_entry',
        metadata: prev.metadata,
        parameters: { ...prev.parameters, [name]: value },
      }
    })
  }, [])

  const handleSign = useCallback(async () => {
    if (state.kind !== 'parameter_entry') return
    if (!adapter || !publicKey) return

    const { metadata, parameters } = state
    setState({ kind: 'preparing_tx', metadata, parameters })

    try {
      // Flip to `awaiting_wallet` right before the MWA intent fires. We can't
      // observe the actual popup lifecycle from JS, so this is a best-effort
      // UI cue: POST is in-flight first, then the wallet handoff dominates.
      // In practice the POST usually completes in <500ms and the wallet
      // prompt is what the user sees for the bulk of the wait.
      setState({ kind: 'awaiting_wallet', metadata, parameters })

      const result = await executeBlink({
        actionUrl: actionUrl ?? '',
        walletAddress: publicKey.toString(),
        parameters,
        adapter,
      })

      setState({ kind: 'submitted', signature: result.signature })
      router.replace({
        pathname: '/(tabs)/home/pending',
        params: {
          signature: result.signature,
          completionId: offerId ?? '',
        },
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (isUserRejection(message)) {
        setState({ kind: 'user_rejected', metadata, parameters, error: message })
      } else {
        setState({ kind: 'post_failed', metadata, parameters, error: message })
      }
    }
  }, [state, adapter, publicKey, actionUrl, offerId, router])

  const handleRetryAfterRejection = useCallback(() => {
    setState((prev) => {
      if (prev.kind !== 'user_rejected' && prev.kind !== 'post_failed') return prev
      return {
        kind: 'parameter_entry',
        metadata: prev.metadata,
        parameters: prev.parameters,
      }
    })
  }, [])

  const walletMissing = !publicKey || !adapter

  return (
    <SafeScreen>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing.md,
        }}
      >
        <BackButton />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: spacing['2xl'],
          gap: spacing.base,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 24,
            color: colors.onSurface,
            marginBottom: spacing.sm,
          }}
        >
          Execute Action
        </Text>

        {/* Wallet-not-connected guard. Rendered above the state body so the
            user never reaches a Sign CTA that would immediately fail. */}
        {walletMissing ? (
          <View
            style={{
              backgroundColor: colors.surfaceContainer,
              borderRadius: 16,
              padding: spacing.base,
              gap: spacing.xs,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelBold,
                fontSize: 14,
                color: colors.warning,
              }}
            >
              Wallet not connected
            </Text>
            <Text
              style={{
                fontFamily: typography.bodyFont,
                fontSize: 13,
                color: colors.onSurfaceVariant,
                lineHeight: 18,
              }}
            >
              Connect your wallet from the Account tab to execute this action.
            </Text>
          </View>
        ) : null}

        {/* State-driven body */}
        {state.kind === 'loading_metadata' ? (
          <View style={{ gap: spacing.md }}>
            <LoadingSkeleton variant="card" />
            <LoadingSkeleton variant="row" />
            <LoadingSkeleton variant="row" />
          </View>
        ) : null}

        {state.kind === 'metadata_failed' ? (
          <RejectionStatePanel title="Action Unavailable" reason={state.error} ctaText="Retry" onPress={loadMetadata} />
        ) : null}

        {state.kind === 'parameter_entry' ? (
          <NativeBlinkCard
            metadata={state.metadata}
            parameters={state.parameters}
            onParameterChange={handleParameterChange}
            onSign={handleSign}
            isSigning={false}
          />
        ) : null}

        {state.kind === 'preparing_tx' ? (
          <NativeBlinkCard
            metadata={state.metadata}
            parameters={state.parameters}
            onParameterChange={handleParameterChange}
            onSign={handleSign}
            isSigning={true}
          />
        ) : null}

        {state.kind === 'awaiting_wallet' ? (
          <NativeBlinkCard
            metadata={state.metadata}
            parameters={state.parameters}
            onParameterChange={handleParameterChange}
            onSign={handleSign}
            isSigning={true}
          />
        ) : null}

        {state.kind === 'user_rejected' ? (
          <RejectionStatePanel
            title="Rejected in Wallet"
            reason="You cancelled the transaction. Tap retry to try again."
            ctaText="Retry"
            onPress={handleRetryAfterRejection}
          />
        ) : null}

        {state.kind === 'post_failed' ? (
          <RejectionStatePanel
            title="Action Failed"
            reason={state.error}
            ctaText="Retry"
            onPress={handleRetryAfterRejection}
          />
        ) : null}

        {state.kind === 'submitted' ? (
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: typography.bodyFont,
                fontSize: 14,
                color: colors.onSurfaceVariant,
              }}
            >
              Submitted. Redirecting...
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeScreen>
  )
}
