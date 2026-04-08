import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DEFAULT_STALE_TIME } from '@/config/constants'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      retry: 2,
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
