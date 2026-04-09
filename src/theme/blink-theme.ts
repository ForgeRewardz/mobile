import { colors, radii } from './tokens'

export const blinkTheme = {
  '--blink-bg-primary': colors.surface,
  '--blink-bg-secondary': colors.surfaceContainerLow,
  '--blink-button': colors.primary,
  '--blink-button-disabled': colors.surfaceContainerHighest,
  '--blink-button-success': colors.tertiary,
  '--blink-input-bg': colors.surfaceContainerHighest,
  '--blink-input-stroke': `${colors.outlineVariant}26`, // 15% opacity
  '--blink-input-stroke-selected': `${colors.primary}66`, // 40% opacity
  '--blink-text-primary': colors.onSurface,
  '--blink-text-secondary': colors.onSurfaceVariant,
  '--blink-text-button': colors.surface,
  '--blink-text-error': colors.error,
  '--blink-text-input': colors.onSurface,
  '--blink-stroke-error': colors.error,
  '--blink-stroke-primary': `${colors.outlineVariant}26`,
  '--blink-border-radius-rounded-lg': `${radii.xl}px`,
  '--blink-border-radius-rounded-xl': `${radii['2xl']}px`,
  '--blink-border-radius-rounded-button': `${radii.full}px`,
  '--blink-border-radius-rounded-input': `${radii.sm}px`,
} as const

export type BlinkTheme = typeof blinkTheme
