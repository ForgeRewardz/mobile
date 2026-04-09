import { View, Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'

export type QuestType = 'hold' | 'engagement' | 'newcomer' | 'composable' | 'streak' | 'subscription'

interface QuestTypePillProps {
  questType: QuestType
}

const questColorMap: Record<QuestType, string> = {
  hold: colors.questHold,
  engagement: colors.questEngagement,
  newcomer: colors.questNewcomer,
  composable: colors.onSurfaceVariant,
  streak: colors.onSurfaceVariant,
  subscription: colors.onSurfaceVariant,
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function QuestTypePill({ questType }: QuestTypePillProps) {
  const color = questColorMap[questType]

  return (
    <View
      style={{
        backgroundColor: `${color}33`,
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontFamily: fonts.label,
          fontSize: 11,
          lineHeight: 16,
        }}
      >
        {capitalize(questType)}
      </Text>
    </View>
  )
}
