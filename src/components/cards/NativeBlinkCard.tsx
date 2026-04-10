import { useMemo } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { ParameterFieldRow } from '@/components/inputs'
import { colors, radii, spacing, typography } from '@/theme/tokens'
import type { BlinkMetadata, BlinkParameter } from '@/types/api'

interface NativeBlinkCardProps {
  /** Blink metadata from GET action URL */
  metadata: BlinkMetadata
  /** Current parameter values keyed by parameter name */
  parameters: Record<string, string>
  /** Called when a parameter value changes */
  onParameterChange: (name: string, value: string) => void
  /** Called when user taps "Sign Action" */
  onSign: () => void
  /** Whether the sign action is in progress */
  isSigning?: boolean
  /** Optional error to display */
  error?: string | null
}

export function NativeBlinkCard({
  metadata,
  parameters,
  onParameterChange,
  onSign,
  isSigning = false,
  error = null,
}: NativeBlinkCardProps) {
  const primaryAction = metadata.links?.actions?.[0]
  const actionParameters: BlinkParameter[] = useMemo(() => primaryAction?.parameters ?? [], [primaryAction])

  const requiredParams = useMemo(() => actionParameters.filter((p) => p.required), [actionParameters])

  const allRequiredFilled = useMemo(
    () => requiredParams.every((p) => (parameters[p.name] ?? '').trim().length > 0),
    [requiredParams, parameters],
  )

  const canSign = !isSigning && allRequiredFilled

  const actionTitle = primaryAction?.label ?? metadata.label ?? metadata.title
  const protocolInitial = (metadata.title?.trim().charAt(0) || '?').toUpperCase()

  return (
    <View
      accessibilityRole="summary"
      style={{
        backgroundColor: colors.surfaceContainer,
        borderRadius: radii.xl,
        padding: spacing.base,
        gap: spacing.base,
      }}
    >
      {/* Action header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.full,
            backgroundColor: colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: typography.labelFont,
              fontSize: 15,
            }}
          >
            {protocolInitial}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.onSurface,
              fontFamily: typography.headlineMdFont,
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {metadata.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: typography.labelFont,
              fontSize: 11,
              lineHeight: 16,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {metadata.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {metadata.description ? (
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontFamily: typography.bodyFont,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {metadata.description}
        </Text>
      ) : null}

      {/* Parameters section */}
      {actionParameters.length > 0 ? (
        <View style={{ gap: spacing.md }}>
          {actionParameters.map((param) => (
            <ParameterFieldRow
              key={param.name}
              name={param.name}
              label={param.label}
              type={param.type}
              required={param.required}
              value={parameters[param.name] ?? ''}
              onChangeText={(value) => onParameterChange(param.name, value)}
              options={param.options}
            />
          ))}
        </View>
      ) : null}

      {/* Review summary box */}
      <View
        style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radii.lg,
          padding: spacing.md,
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontFamily: typography.labelFont,
            fontSize: 12,
            lineHeight: 16,
          }}
        >
          You are about to execute
        </Text>
        <Text
          style={{
            color: colors.onSurface,
            fontFamily: typography.headlineMdFont,
            fontSize: 15,
            lineHeight: 20,
          }}
        >
          {actionTitle}
        </Text>
      </View>

      {/* Error display */}
      {error ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: colors.error,
            fontFamily: typography.bodyFont,
            fontSize: 13,
            lineHeight: 18,
          }}
        >
          {error}
        </Text>
      ) : null}

      {/* Sign Action button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign Action"
        accessibilityState={{ disabled: !canSign, busy: isSigning }}
        onPress={onSign}
        disabled={!canSign}
        style={({ pressed }) => ({
          backgroundColor: canSign
            ? pressed
              ? colors.primary
              : colors.primaryContainer
            : colors.surfaceContainerHighest,
          borderRadius: radii.full,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          minHeight: 48,
        })}
      >
        {isSigning ? (
          <>
            <ActivityIndicator size="small" color={canSign ? colors.surface : colors.onSurfaceVariant} />
            <Text
              style={{
                color: canSign ? colors.surface : colors.onSurfaceVariant,
                fontFamily: typography.buttonFont,
                fontSize: 15,
              }}
            >
              Signing...
            </Text>
          </>
        ) : (
          <Text
            style={{
              color: canSign ? colors.surface : colors.onSurfaceVariant,
              fontFamily: typography.buttonFont,
              fontSize: 15,
            }}
          >
            Sign Action
          </Text>
        )}
      </Pressable>

      {/* Wallet handoff prompt */}
      {isSigning ? (
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontFamily: typography.bodyFont,
            fontSize: 12,
            lineHeight: 16,
            textAlign: 'center',
          }}
        >
          Approve in your wallet app
        </Text>
      ) : null}
    </View>
  )
}
