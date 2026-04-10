import { useState } from 'react'
import { View, Text, Pressable, Linking, ScrollView } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { SafeScreen } from '@/components/layout/SafeScreen'
import { BackButton } from '@/components/navigation/BackButton'
import { colors, typography, spacing, radii } from '@/theme/tokens'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is REWARDZ?',
    answer:
      'REWARDZ is a Solana-based rewards platform where you earn points by completing missions on connected protocols.',
  },
  {
    question: 'How do I earn points?',
    answer:
      'Complete missions from the Explore tab. Points are awarded after your on-chain action is verified by the keeper.',
  },
  {
    question: 'When can I claim my rewards?',
    answer:
      'Rewards settle every 8 hours when the keeper publishes a new Merkle root. You can claim ahead of that via a signed receipt.',
  },
  {
    question: 'What happens if my wallet disconnects?',
    answer:
      'Your progress is tied to your wallet address. Reconnect the same wallet and your pending points will reappear.',
  },
  {
    question: 'Which networks are supported?',
    answer: 'REWARDZ runs on Solana. Currently the mobile app targets devnet; mainnet rollout is coming soon.',
  },
]

const SUPPORT_EMAIL = 'support@rewardz.xyz'
const DISCORD_URL = 'https://discord.gg/rewardz'

export default function HelpScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {})
  }

  const handleDiscord = () => {
    WebBrowser.openBrowserAsync(DISCORD_URL).catch(() => {})
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
          Help
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing['2xl'], gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ section */}
        <View style={{ gap: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.headlineMdFont,
              fontSize: 18,
              color: colors.onSurface,
            }}
          >
            Frequently asked
          </Text>

          <View style={{ gap: spacing.sm }}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <Pressable
                  key={item.question}
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: colors.surfaceContainerLow,
                    borderRadius: radii.lg,
                    padding: spacing.base,
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: typography.labelBold,
                        fontSize: 15,
                        color: colors.onSurface,
                      }}
                    >
                      {item.question}
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.labelFont,
                        fontSize: 18,
                        color: colors.onSurfaceVariant,
                      }}
                    >
                      {isOpen ? '-' : '+'}
                    </Text>
                  </View>
                  {isOpen && (
                    <Text
                      style={{
                        fontFamily: typography.bodyFont,
                        fontSize: 14,
                        lineHeight: 20,
                        color: colors.onSurfaceVariant,
                      }}
                    >
                      {item.answer}
                    </Text>
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Support section */}
        <View style={{ gap: spacing.md }}>
          <Text
            style={{
              fontFamily: typography.headlineMdFont,
              fontSize: 18,
              color: colors.onSurface,
            }}
          >
            Still need help?
          </Text>

          <Pressable
            onPress={handleContactSupport}
            accessibilityRole="link"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii.lg,
              padding: spacing.base,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMdFont,
                fontSize: 15,
                color: colors.onSurface,
              }}
            >
              Contact Support
            </Text>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 18,
                color: colors.onSurfaceVariant,
              }}
            >
              {'\u203A'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDiscord}
            accessibilityRole="link"
            style={{
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radii.lg,
              padding: spacing.base,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMdFont,
                fontSize: 15,
                color: colors.onSurface,
              }}
            >
              Join our Discord
            </Text>
            <Text
              style={{
                fontFamily: typography.labelFont,
                fontSize: 18,
                color: colors.onSurfaceVariant,
              }}
            >
              {'\u203A'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeScreen>
  )
}
