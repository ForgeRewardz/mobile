import { View, Text } from 'react-native'
import { colors, fonts } from '@/theme/tokens'

interface ProgressTimelineProps {
  steps: string[]
  currentStep: number
}

export function ProgressTimeline({ steps, currentStep }: ProgressTimelineProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      {steps.map((label, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isFuture = index > currentStep

        let dotColor = colors.surfaceContainerHighest
        if (isCompleted) dotColor = colors.primary
        if (isCurrent) dotColor = colors.primary

        let labelColor = colors.onSurfaceVariant
        if (isCompleted) labelColor = colors.primary
        if (isCurrent) labelColor = colors.onSurface

        return (
          <View
            key={label}
            style={{
              flex: 1,
              alignItems: 'center',
            }}
          >
            {/* Dot + connector row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {/* Left connector */}
              {index > 0 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isCompleted ? colors.primary : colors.surfaceContainerHighest,
                  }}
                />
              )}
              {index === 0 && <View style={{ flex: 1 }} />}

              {/* Dot */}
              <View
                style={{
                  width: isCurrent ? 14 : 10,
                  height: isCurrent ? 14 : 10,
                  borderRadius: isCurrent ? 7 : 5,
                  backgroundColor: dotColor,
                  ...(isCurrent && {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    elevation: 4,
                  }),
                }}
              />

              {/* Right connector */}
              {index < steps.length - 1 && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: index < currentStep ? colors.primary : colors.surfaceContainerHighest,
                  }}
                />
              )}
              {index === steps.length - 1 && <View style={{ flex: 1 }} />}
            </View>

            {/* Label */}
            <Text
              style={{
                color: labelColor,
                fontFamily: isCurrent ? fonts.label : fonts.body,
                fontSize: 11,
                lineHeight: 16,
                marginTop: 6,
                textAlign: 'center',
              }}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
