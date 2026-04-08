import { PlaceholderScreen } from '@/components/placeholder/PlaceholderScreen'

export default function ResultsScreen() {
  return (
    <PlaceholderScreen
      title="Intent Results"
      screenNumber={10}
      links={[{ label: 'View Offer Detail →', href: '/(tabs)/home/offer/demo-offer-1' }]}
    />
  )
}
