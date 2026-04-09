import { View, Text, Pressable } from 'react-native'
import { colors, fonts, radii } from '@/theme/tokens'
import { QuestTypePill } from './QuestTypePill'
import type { QuestType } from './QuestTypePill'

interface MissionCardQuest {
  id: string
  title: string
  description: string
  questType: QuestType
  rewardPoints: number
  protocolName: string
  protocolIcon?: string
}

interface MissionCardProps {
  quest: MissionCardQuest
  onPress?: () => void
}

const POST_LAUNCH_TYPES: QuestType[] = ['composable', 'streak', 'subscription']

export function MissionCard({ quest, onPress }: MissionCardProps) {
  if (POST_LAUNCH_TYPES.includes(quest.questType)) {
    return null
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radii['2xl'],
        padding: 16,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Protocol icon placeholder */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.label,
              fontSize: 14,
            }}
          >
            {quest.protocolName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: colors.onSurface,
              fontFamily: fonts.headline,
              fontSize: 15,
              lineHeight: 20,
            }}
            numberOfLines={1}
          >
            {quest.title}
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fonts.body,
              fontSize: 13,
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {quest.description}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <QuestTypePill questType={quest.questType} />
        <Text
          style={{
            color: colors.primary,
            fontFamily: fonts.button,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          +{quest.rewardPoints.toLocaleString('en-US')} pts
        </Text>
      </View>
    </Pressable>
  )
}
