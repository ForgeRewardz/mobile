import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { DropdownSelector } from '@/components/inputs'
import { StickyBottomCTA, SuccessStatePanel } from '@/components/feedback'
import { useSubmitTweet } from '@/hooks/use-submit-tweet'
import { useTweetRules } from '@/hooks/use-tweet-rules'
import { colors, radii, spacing, typography } from '@/theme/tokens'
import type { TweetRule } from '@/types/api'

/** Validate a tweet URL — accepts x.com and twitter.com status links. */
function isValidTweetUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return false
  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./i, '').toLowerCase()
    if (host !== 'x.com' && host !== 'twitter.com') return false
    // Expect /{user}/status/{id}
    return /\/[^/]+\/status\/\d+/.test(url.pathname)
  } catch {
    return false
  }
}

export default function SubmitTweetScreen() {
  const router = useRouter()
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | undefined>(undefined)
  const [tweetUrl, setTweetUrl] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)

  const rulesQuery = useTweetRules()
  const submitMutation = useSubmitTweet()

  const rules: TweetRule[] = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data])

  // Build dropdown options from distinct active protocols in rules.
  const protocolOptions = useMemo(() => {
    const seen = new Map<string, { label: string; value: string }>()
    for (const rule of rules) {
      if (!rule.isActive) continue
      if (!seen.has(rule.protocolId)) {
        seen.set(rule.protocolId, { label: rule.protocolName, value: rule.protocolId })
      }
    }
    return Array.from(seen.values())
  }, [rules])

  const selectedRule = useMemo(
    () => rules.find((rule) => rule.protocolId === selectedProtocolId && rule.isActive),
    [rules, selectedProtocolId],
  )

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync()
      if (text) {
        setTweetUrl(text)
        setLocalError(null)
      }
    } catch {
      setLocalError('Could not read clipboard')
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = tweetUrl.trim()
    if (!isValidTweetUrl(trimmed)) {
      setLocalError('Enter a valid tweet URL (x.com or twitter.com)')
      return
    }
    setLocalError(null)
    submitMutation.mutate({ tweetUrl: trimmed, protocolId: selectedProtocolId })
  }, [tweetUrl, selectedProtocolId, submitMutation])

  const handleViewRewards = useCallback(() => {
    router.replace('/(tabs)/rewards')
  }, [router])

  const isSubmitDisabled = tweetUrl.trim().length === 0 || submitMutation.isPending
  const submissionError =
    submitMutation.error instanceof Error
      ? submitMutation.error.message
      : submitMutation.error
        ? String(submitMutation.error)
        : null
  const errorText = localError ?? submissionError

  // Success state — show dedicated panel.
  if (submitMutation.isSuccess && submitMutation.data) {
    return (
      <SafeScreen>
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
            Submit Tweet
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <SuccessStatePanel
            title="Submission received"
            points={submitMutation.data.pointsAwarded ?? 0}
            subtitle="We'll verify your tweet and award points once it matches the rules."
            primaryCta={{ label: 'View Rewards', onPress: handleViewRewards }}
            secondaryCta={{ label: 'Submit another', onPress: () => submitMutation.reset() }}
          />
        </View>
      </SafeScreen>
    )
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
          Submit Tweet
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro copy */}
        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 14,
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}
        >
          Share a tweet that mentions a supported protocol to earn points. Pick the protocol you tweeted about, paste
          the link, and we&apos;ll take it from there.
        </Text>

        {/* Protocol picker */}
        <View style={{ marginBottom: spacing.lg }}>
          {rulesQuery.isLoading ? (
            <View
              style={{
                backgroundColor: colors.surfaceContainerHighest,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <ActivityIndicator size="small" color={colors.onSurfaceVariant} />
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  color: colors.onSurfaceVariant,
                }}
              >
                Loading protocols…
              </Text>
            </View>
          ) : protocolOptions.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surfaceContainer,
                borderRadius: radii.lg,
                padding: spacing.base,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.labelFont,
                  color: colors.onSurface,
                  marginBottom: spacing.xs,
                }}
              >
                No protocols available
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                }}
              >
                Tweet rewards aren&apos;t active right now. You can still submit a tweet and we&apos;ll evaluate it
                against any rule.
              </Text>
            </View>
          ) : (
            <DropdownSelector
              label="Protocol"
              options={protocolOptions}
              selected={selectedProtocolId}
              onSelect={(value) => setSelectedProtocolId(value)}
              placeholder="Choose a protocol"
            />
          )}
        </View>

        {/* Rule hints */}
        {selectedRule && (
          <View
            style={{
              backgroundColor: colors.surfaceContainer,
              borderRadius: radii.lg,
              padding: spacing.base,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelSemiBold,
                fontSize: 12,
                color: colors.onSurfaceVariant,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: spacing.sm,
              }}
            >
              Tweet must include
            </Text>

            {selectedRule.requiredHashtags.length > 0 && (
              <View style={{ marginBottom: spacing.sm }}>
                <Text
                  style={{
                    fontFamily: typography.labelFont,
                    fontSize: 13,
                    color: colors.onSurface,
                    marginBottom: spacing.xs,
                  }}
                >
                  Hashtags
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {selectedRule.requiredHashtags.map((tag) => (
                    <View
                      key={`hashtag-${tag}`}
                      style={{
                        backgroundColor: colors.surfaceContainerHighest,
                        borderRadius: radii.full,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: typography.labelFont,
                          fontSize: 13,
                          color: colors.primary,
                        }}
                      >
                        #{tag.replace(/^#/, '')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedRule.requiredMentions.length > 0 && (
              <View style={{ marginBottom: spacing.sm }}>
                <Text
                  style={{
                    fontFamily: typography.labelFont,
                    fontSize: 13,
                    color: colors.onSurface,
                    marginBottom: spacing.xs,
                  }}
                >
                  Mentions
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                  {selectedRule.requiredMentions.map((mention) => (
                    <View
                      key={`mention-${mention}`}
                      style={{
                        backgroundColor: colors.surfaceContainerHighest,
                        borderRadius: radii.full,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: typography.labelFont,
                          fontSize: 13,
                          color: colors.primary,
                        }}
                      >
                        @{mention.replace(/^@/, '')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedRule.description.length > 0 && (
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                  marginTop: spacing.xs,
                }}
              >
                {selectedRule.description}
              </Text>
            )}

            <Text
              style={{
                fontFamily: typography.labelBold,
                fontSize: 13,
                color: colors.tertiary,
                marginTop: spacing.sm,
              }}
            >
              Reward: {selectedRule.baseReward.toLocaleString()} pts
            </Text>
          </View>
        )}

        {/* Tweet URL input */}
        <Text
          style={{
            fontFamily: typography.labelFont,
            color: colors.onSurfaceVariant,
            marginBottom: spacing.sm,
          }}
        >
          Tweet URL
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surfaceContainerHighest,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.base,
            paddingVertical: spacing.sm,
            gap: spacing.sm,
          }}
        >
          <TextInput
            value={tweetUrl}
            onChangeText={(value) => {
              setTweetUrl(value)
              if (localError) setLocalError(null)
            }}
            placeholder="https://x.com/user/status/..."
            placeholderTextColor={colors.onSurfaceVariant}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
            style={{
              flex: 1,
              fontFamily: typography.bodyFont,
              fontSize: 15,
              color: colors.onSurface,
              paddingVertical: spacing.sm,
            }}
          />
          <Pressable
            onPress={handlePaste}
            accessibilityRole="button"
            accessibilityLabel="Paste from clipboard"
            hitSlop={8}
            style={{
              backgroundColor: colors.surfaceContainer,
              borderRadius: radii.full,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
          >
            <Text
              style={{
                fontFamily: typography.labelBold,
                fontSize: 13,
                color: colors.primary,
              }}
            >
              Paste
            </Text>
          </Pressable>
        </View>

        {/* Error display */}
        {errorText && (
          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 13,
              color: colors.error,
              marginTop: spacing.sm,
            }}
          >
            {errorText}
          </Text>
        )}
      </ScrollView>

      <StickyBottomCTA
        label="Verify & Earn"
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
        loading={submitMutation.isPending}
      />
    </SafeScreen>
  )
}
