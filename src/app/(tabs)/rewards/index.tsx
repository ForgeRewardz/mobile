import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function RewardsScreen() {
  return (
    <PlaceholderScreen
      title="Rewards"
      screenNumber={19}
      links={[
        { label: 'Rewards History →', href: '/(tabs)/rewards/history' },
        { label: 'Mining Game Teaser →', href: '/(tabs)/rewards/mining' },
        { label: 'Point Sync Teaser →', href: '/(tabs)/rewards/sync' },
      ]}
    />
  )
}
