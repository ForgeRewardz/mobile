import { useQuery, useQueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { CompletionStatus } from '@/types/api'

const STORAGE_KEY = 'rewardz:pending-completions'

export interface PendingCompletion {
  completionId: string
  offerTitle: string
  status: CompletionStatus
  createdAt: string
}

interface UsePendingCompletionsResult {
  data: PendingCompletion[]
  isLoading: boolean
}

async function readStorage(): Promise<PendingCompletion[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingCompletion[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

async function writeStorage(items: PendingCompletion[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage failure is non-fatal — the list just won't persist
  }
}

/**
 * Read the list of pending completions from AsyncStorage.
 *
 * The list is populated by {@link addPendingCompletion} (called from the
 * Blink execution flow after init) and cleaned by {@link removePendingCompletion}
 * (called when a completion reaches a terminal state).
 */
export function usePendingCompletions(): UsePendingCompletionsResult {
  const query = useQuery<PendingCompletion[]>({
    queryKey: ['pending-completions'],
    queryFn: readStorage,
    staleTime: 10_000,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  }
}

/**
 * Add a pending completion to the AsyncStorage-backed list.
 * Call this from the Blink execution flow after a successful completion init.
 */
export async function addPendingCompletion(entry: PendingCompletion): Promise<void> {
  const current = await readStorage()
  // Dedupe by completionId — most recent wins
  const deduped = current.filter((c) => c.completionId !== entry.completionId)
  const next = [entry, ...deduped].slice(0, 20) // keep last 20
  await writeStorage(next)
}

/**
 * Remove a completion from the pending list (e.g. after terminal state reached).
 */
export async function removePendingCompletion(completionId: string): Promise<void> {
  const current = await readStorage()
  const next = current.filter((c) => c.completionId !== completionId)
  await writeStorage(next)
}

/**
 * Invalidate the pending-completions query so the UI re-reads from storage.
 * Call this after addPendingCompletion or removePendingCompletion.
 */
export function usePendingCompletionsInvalidator() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['pending-completions'] })
}
