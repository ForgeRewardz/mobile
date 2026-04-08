import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeScreen } from '@/components/layout/SafeScreen'

interface NavLink {
  label: string
  href: string
}

export function PlaceholderScreen({
  title,
  screenNumber,
  links,
}: {
  title: string
  screenNumber: number
  links?: NavLink[]
}) {
  const router = useRouter()

  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">Screen #{screenNumber}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-4 mb-6">
          Placeholder — implementation in later TODOs
        </Text>
        {links && links.length > 0 && (
          <View className="w-full px-8 gap-3">
            {links.map((link) => (
              <Pressable
                key={link.href}
                onPress={() => router.push(link.href as never)}
                className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3"
              >
                <Text className="text-indigo-600 dark:text-indigo-400 text-center font-medium">{link.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <Pressable onPress={() => router.back()} className="pb-6 items-center">
        <Text className="text-gray-500 dark:text-gray-400">← Back</Text>
      </Pressable>
    </SafeScreen>
  )
}
