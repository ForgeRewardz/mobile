import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { colors, typography, spacing } from '@/theme/tokens'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging — can be extended with a reporting service
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing['2xl'],
            paddingHorizontal: spacing.base,
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: spacing.base }}>⚠️</Text>

          <Text
            style={{
              fontFamily: typography.headlineFont,
              fontSize: 18,
              color: colors.onSurface,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Something went wrong
          </Text>

          <Text
            style={{
              fontFamily: typography.bodyFont,
              fontSize: 14,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: spacing.xl,
            }}
          >
            This section encountered an error. Try again or come back later.
          </Text>

          <Pressable onPress={this.handleRetry}>
            <View
              style={{
                backgroundColor: colors.primaryContainer,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                borderRadius: 9999,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.buttonFont,
                  fontSize: 14,
                  color: colors.surface,
                  textAlign: 'center',
                }}
              >
                Try again
              </Text>
            </View>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}
