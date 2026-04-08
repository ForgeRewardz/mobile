import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function VerifyingScreen() {
  return (
    <PlaceholderScreen
      title="Verification Pending"
      screenNumber={14}
      links={[
        { label: 'Points Awarded →', href: '/(tabs)/home/awarded' },
        { label: 'Rejected →', href: '/(tabs)/home/rejected' },
      ]}
    />
  )
}
