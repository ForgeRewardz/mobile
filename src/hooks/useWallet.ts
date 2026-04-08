import { useEffect } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useWalletStore, useAppStore } from '@/store'
import { clearAuthSession } from '@/services/wallet-service'

/**
 * Convenience hook combining @wallet-ui/react-native-kit's useMobileWallet
 * with the Zustand wallet store. Provides the interface specified in TODO-0006C:
 * publicKey, connected, connect, disconnect, signTransaction, signAndSendTransaction.
 */
export function useWallet() {
  const mobileWallet = useMobileWallet()
  const { setConnected, setDisconnected, setConnecting, setError } = useWalletStore()

  // Sync MWA account state → Zustand store
  useEffect(() => {
    if (mobileWallet.account) {
      setConnected(mobileWallet.account.address)
    } else {
      setDisconnected()
    }
  }, [mobileWallet.account, setConnected, setDisconnected])

  const connect = async () => {
    try {
      setError(null)
      setConnecting(true)
      const account = await mobileWallet.connect()
      setConnected(account.address)
      return account
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to connect wallet')
      throw error
    }
  }

  const disconnect = async () => {
    try {
      await mobileWallet.disconnect()
      setDisconnected()
      // Reset app state to prevent cross-user leakage (Bug I)
      useAppStore.getState().reset()
      // Clear cached auth session
      clearAuthSession()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to disconnect wallet')
      throw error
    }
  }

  return {
    publicKey: mobileWallet.account?.address ?? null,
    connected: !!mobileWallet.account,
    connect,
    disconnect,
    signTransaction: mobileWallet.signTransaction,
    signAndSendTransaction: mobileWallet.signAndSendTransaction,
    signMessage: mobileWallet.signMessage,
    sendTransaction: mobileWallet.sendTransaction,
    getTransactionSigner: mobileWallet.getTransactionSigner,
    client: mobileWallet.client,
  }
}
