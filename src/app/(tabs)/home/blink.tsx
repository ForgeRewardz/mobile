import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function BlinkExecutionScreen() {
  return (
    <PlaceholderScreen
      title="Blink Execution"
      screenNumber={12}
      links={[{ label: 'Transaction Pending →', href: '/(tabs)/home/pending' }]}
    />
  )
}
