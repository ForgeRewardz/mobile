import { Text } from 'react-native'

const icons: Record<string, string> = {
  home: '🏠',
  explore: '🔍',
  rewards: '🏆',
  profile: '👤',
}

export function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '•'}</Text>
}
