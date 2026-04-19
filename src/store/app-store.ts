import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AppState {
  _hasHydrated: boolean
  isOnboarded: boolean
  isUnlocked: boolean
  onboardingStep: number
  referralCode: string | null
  setHasHydrated: (value: boolean) => void
  setOnboarded: (value: boolean) => void
  setUnlocked: (value: boolean) => void
  setOnboardingStep: (step: number) => void
  setReferralCode: (code: string | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      isOnboarded: false,
      isUnlocked: false,
      onboardingStep: 0,
      referralCode: null,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
      setOnboarded: (value) => set({ isOnboarded: value }),
      setUnlocked: (value) => set({ isUnlocked: value }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setReferralCode: (code) => set({ referralCode: code }),
      reset: () => set({ isOnboarded: false, isUnlocked: false, onboardingStep: 0, referralCode: null }),
    }),
    {
      name: 'rewardz-app-state',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        isUnlocked: state.isUnlocked,
        onboardingStep: state.onboardingStep,
        referralCode: state.referralCode,
      }),
    },
  ),
)
