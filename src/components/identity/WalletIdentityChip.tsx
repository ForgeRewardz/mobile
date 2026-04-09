import { Text, Pressable, Alert } from 'react-native'
import { colors, fonts } from '@/theme/tokens'
import { truncateAddress } from '@/utils/format'

interface WalletIdentityChipProps {
  address: string
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    const Clipboard = await import('expo-clipboard')
    await Clipboard.setStringAsync(text)
  } catch {
    // expo-clipboard not available — fall back to alert
    Alert.alert('Address', text)
  }
}

export function WalletIdentityChip({ address }: WalletIdentityChipProps) {
  return (
    <Pressable
      onPress={() => copyToClipboard(address)}
      style={({ pressed }) => ({
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          color: colors.onSurface,
          fontFamily: fonts.label,
          fontSize: 12,
          lineHeight: 16,
        }}
      >
        {truncateAddress(address)}
      </Text>
    </Pressable>
  )
}
