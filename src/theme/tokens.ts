export const colors: Record<string, string> = {
  surface: '#10141a',
  surfaceContainerLow: '#181c22',
  surfaceContainer: '#1c2026',
  surfaceContainerHighest: '#31353c',
  surfaceVariant: '#1c2026',
  primary: '#c3f5ff',
  primaryContainer: '#00e5ff',
  onSurface: '#dfe2eb',
  onSurfaceVariant: '#9ca3af',
  outlineVariant: '#31353c',
  tertiary: '#4ade80',
  tertiaryContainer: '#166534',
  onTertiaryContainer: '#bbf7d0',
  error: '#ef4444',
  errorContainer: '#7f1d1d',
  warning: '#f59e0b',
  pending: '#3b82f6',
  questHold: '#3b82f6',
  questEngagement: '#22c55e',
  questNewcomer: '#eab308',
}

export type Colors = typeof colors

export const typography: Record<string, string> = {
  displayFont: 'Manrope_800ExtraBold',
  displayLg: 'Manrope_800ExtraBold',
  displayMd: 'Manrope_700Bold',
  headlineFont: 'Manrope_700Bold',
  headlineLarge: 'Manrope_700Bold',
  headlineMdFont: 'Manrope_600SemiBold',
  headlineMedium: 'Manrope_600SemiBold',
  headlineSmall: 'Manrope_600SemiBold',
  bodyFont: 'Inter_400Regular',
  bodyRegular: 'Inter_400Regular',
  bodyLarge: 'Inter_500Medium',
  bodyMdFont: 'Inter_500Medium',
  bodyMedium: 'Inter_500Medium',
  bodySmall: 'Inter_400Regular',
  labelFont: 'Inter_600SemiBold',
  labelSemiBold: 'Inter_600SemiBold',
  labelMedium: 'Inter_500Medium',
  labelSmall: 'Inter_500Medium',
  labelBold: 'Inter_700Bold',
  buttonFont: 'Inter_700Bold',
}

// Alias — some components import `fonts` instead of `typography`
export const fonts = typography

export const radii: Record<string, number> = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
}

export const spacing: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

export const elevation = {
  ambient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 48,
    elevation: 24,
  },
} as const
