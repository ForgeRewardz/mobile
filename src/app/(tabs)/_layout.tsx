import { Tabs, Redirect } from 'expo-router'
import { View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { TabBarIcon } from '@/components/layout/TabBarIcon'
import { usePointsBalance } from '@/hooks/use-points-balance'
import { colors } from '@/theme/tokens'

/**
 * Tab icon wrapper with a pending-points notification dot.
 * Shown on the Rewards tab when the user has pending points.
 */
function RewardsTabIcon({ focused }: { focused: boolean }) {
  const { data: balance } = usePointsBalance()
  const hasPending = (balance?.pending ?? 0) > 0

  return (
    <View style={{ position: 'relative' }}>
      <TabBarIcon name="rewards" focused={focused} />
      {hasPending ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.pending,
          }}
        />
      ) : null}
    </View>
  )
}

export default function TabLayout() {
  const { account } = useMobileWallet()

  // Auth guard: prevent unauthenticated deep-link access to tabs
  if (!account) {
    return <Redirect href="/(auth)/welcome" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => <TabBarIcon name="explore" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ focused }) => <RewardsTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
