import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { SearchBar } from '@/components/navigation/SearchBar'
import { colors, radii, spacing, typography } from '@/theme/tokens'

const RECENT_SEARCHES_KEY = 'rewardz:recent-searches'
const MAX_RECENT_SEARCHES = 10

const QUICK_FILL_EXAMPLES: readonly string[] = [
  'swap 100 USDC to SOL',
  'stake 5 SOL on Kamino',
  'mint NFT from Magic Eden',
  'vote on governance proposal',
]

/**
 * Persist a normalised list of recent searches.
 * Accepts the raw array, de-duplicates, and trims to MAX_RECENT_SEARCHES.
 */
async function persistRecentSearches(list: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list))
  } catch {
    // Swallow storage errors — recent searches are a nice-to-have, not critical.
  }
}

/** Load recent searches from AsyncStorage, tolerating missing/corrupt data. */
async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is string => typeof entry === 'string')
  } catch {
    return []
  }
}

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ q?: string }>()
  const inputRef = useRef<TextInput | null>(null)

  const [query, setQuery] = useState<string>(params.q ?? '')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Hydrate recent searches from AsyncStorage once on mount.
  useEffect(() => {
    let cancelled = false
    loadRecentSearches().then((list) => {
      if (!cancelled) setRecentSearches(list)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Auto-focus the search input on mount using the TextInput ref.
  useEffect(() => {
    const handle = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(handle)
  }, [])

  const submitQuery = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim()
      if (trimmed.length === 0) return

      // Most-recent-first, de-duplicated, capped.
      setRecentSearches((previous) => {
        const next = [trimmed, ...previous.filter((entry) => entry !== trimmed)].slice(0, MAX_RECENT_SEARCHES)
        void persistRecentSearches(next)
        return next
      })

      router.push({ pathname: '/(tabs)/home/results', params: { q: trimmed } })
    },
    [router],
  )

  const handleSubmit = useCallback(() => {
    submitQuery(query)
  }, [submitQuery, query])

  const handleRecentPress = useCallback(
    (entry: string) => {
      setQuery(entry)
      submitQuery(entry)
    },
    [submitQuery],
  )

  const handleExamplePress = useCallback(
    (example: string) => {
      setQuery(example)
      submitQuery(example)
    },
    [submitQuery],
  )

  const handleClearRecent = useCallback(() => {
    setRecentSearches([])
    void persistRecentSearches([])
  }, [])

  const hasRecent = recentSearches.length > 0

  const headerStyle = useMemo(
    () => ({
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.md,
      gap: spacing.md,
    }),
    [],
  )

  return (
    <SafeScreen>
      {/* Header */}
      <View style={headerStyle}>
        <BackButton />
        <Text
          style={{
            fontFamily: typography.headlineFont,
            fontSize: 20,
            color: colors.onSurface,
          }}
        >
          Search
        </Text>
      </View>

      {/* Search input */}
      <View style={{ paddingBottom: spacing.base }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={handleSubmit}
          placeholder="What do you want to do?"
          inputRef={inputRef}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Recent searches */}
        {hasRecent && (
          <View style={{ marginBottom: spacing.xl }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.labelSemiBold,
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Recent searches
              </Text>
              <Pressable
                onPress={handleClearRecent}
                accessibilityRole="button"
                accessibilityLabel="Clear recent searches"
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: typography.labelBold,
                    fontSize: 13,
                    color: colors.primary,
                  }}
                >
                  Clear
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: colors.surfaceContainer,
                borderRadius: radii.lg,
                overflow: 'hidden',
              }}
            >
              {recentSearches.map((entry, index) => (
                <Pressable
                  key={`${entry}-${index}`}
                  onPress={() => handleRecentPress(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search for ${entry}`}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.md,
                    backgroundColor: pressed ? colors.surfaceContainerHighest : 'transparent',
                  })}
                >
                  <Text style={{ fontSize: 16, marginRight: spacing.md }}>{'\u23F1'}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: typography.bodyRegular,
                      fontSize: 15,
                      color: colors.onSurface,
                    }}
                    numberOfLines={1}
                  >
                    {entry}
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.bodyRegular,
                      fontSize: 18,
                      color: colors.onSurfaceVariant,
                    }}
                  >
                    {'\u2197'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Quick fill examples */}
        <View>
          <Text
            style={{
              fontFamily: typography.labelSemiBold,
              fontSize: 13,
              color: colors.onSurfaceVariant,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              marginBottom: spacing.sm,
            }}
          >
            Try an intent
          </Text>

          <View style={{ gap: spacing.sm }}>
            {QUICK_FILL_EXAMPLES.map((example) => (
              <Pressable
                key={example}
                onPress={() => handleExamplePress(example)}
                accessibilityRole="button"
                accessibilityLabel={`Use example: ${example}`}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: pressed ? colors.surfaceContainerHighest : colors.surfaceContainer,
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing.base,
                  paddingVertical: spacing.md,
                })}
              >
                <Text style={{ fontSize: 16, marginRight: spacing.md }}>{'\u26A1'}</Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: typography.bodyRegular,
                    fontSize: 15,
                    color: colors.onSurface,
                  }}
                >
                  {example}
                </Text>
                <Text
                  style={{
                    fontFamily: typography.labelBold,
                    fontSize: 13,
                    color: colors.primary,
                  }}
                >
                  {'Use \u2192'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  )
}
