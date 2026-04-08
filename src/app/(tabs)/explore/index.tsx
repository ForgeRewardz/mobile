import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function ExploreScreen() {
  return (
    <PlaceholderScreen
      title="Explore"
      screenNumber={17}
      links={[{ label: 'View Mission Detail →', href: '/(tabs)/explore/mission/demo-mission-1' }]}
    />
  )
}
