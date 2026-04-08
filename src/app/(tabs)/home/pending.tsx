import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function PendingScreen() {
  return (
    <PlaceholderScreen
      title="Transaction Pending"
      screenNumber={13}
      links={[{ label: 'Verification Pending →', href: '/(tabs)/home/verifying' }]}
    />
  )
}
