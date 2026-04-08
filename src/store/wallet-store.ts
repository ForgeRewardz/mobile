import { create } from 'zustand'

/**
 * Zustand wallet store for loading/error state and non-React access.
 *
 * IMPORTANT: For "is wallet connected?" in React components, prefer
 * useWallet().connected (reads directly from MWA) over isConnected here,
 * which may lag by one render cycle on app restart.
 */
interface WalletState {
  isConnected: boolean
  address: string | null
  isConnecting: boolean
  error: string | null
  setConnected: (address: string) => void
  setDisconnected: () => void
  setConnecting: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  isConnecting: false,
  error: null,
  setConnected: (address) => set({ isConnected: true, address, isConnecting: false, error: null }),
  setDisconnected: () => set({ isConnected: false, address: null, isConnecting: false, error: null }),
  setConnecting: (loading) => set({ isConnecting: loading }),
  setError: (error) => set({ error, isConnecting: false }),
}))
