import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function SearchScreen() {
  return (
    <PlaceholderScreen
      title="Intent Search"
      screenNumber={9}
      links={[{ label: 'View Results →', href: '/(tabs)/home/results?query=swap' }]}
    />
  )
}
