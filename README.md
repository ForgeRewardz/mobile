# Rewardz Mobile

Solana-based reward infrastructure mobile app. Discover rewarded on-chain actions, earn points, and play mining rounds for Token X.

## Local dev

Part of the REWARDZ `mobileSpecs/` stack. For the full local setup, env canonicalisation, and migration guide, see [`../LOCAL-SETUP.md`](../LOCAL-SETUP.md).

Quick path (from mobileSpecs/ root):

```bash
./scripts/bootstrap-local.sh           # surfpool + api + keeper (services)
pnpm --dir mobile dev                  # Expo Metro; iOS sim / Android emulator
```

**Env renames applied:** `SOLANA_CLUSTER` → `SOLANA_NETWORK`, `RPC_URL` → `SOLANA_RPC_URL`, `INTENT_API_BASE_URL` → `API_BASE_URL`, `REWARDZ_PROGRAM_ID` → `PROGRAM_ID`. See LOCAL-SETUP.md §10 for migration.

## Stack

- **Expo 55** / React Native 0.83 / React 19
- **@solana/kit** v6 — Solana client (no web3.js)
- **@wallet-ui/react-native-kit** — Mobile Wallet Adapter 2.0
- **Expo Router** — file-based navigation
- **Uniwind** — Tailwind CSS for React Native
- **Zustand** — wallet & app state
- **TanStack React Query** — server state
- **@solana-program/token** — SPL token operations

## Setup

```bash
pnpm install
cp .env.example .env   # edit with your devnet config
```

## Run

```bash
npx expo prebuild --platform android --clean # prebuild

pnpm run android         # build + run on Android device/emulator
pnpm run dev             # Expo dev server
```

## Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm run android`   | Build and run Android            |
| `pnpm run dev`       | Expo dev server with cache reset |
| `pnpm run typecheck` | TypeScript type checking         |
| `pnpm run lint`      | ESLint with auto-fix             |
| `pnpm run format`    | Prettier format                  |
| `pnpm run ci`        | Type-check + lint + format check |

## Project Structure

```
src/
├── app/              # Expo Router screens (file-based routing)
│   ├── (auth)/       # Onboarding flow (welcome, connect, unlock, success)
│   ├── (tabs)/       # Main app (Home, Explore, Rewards, Profile)
│   │   ├── home/     # Intent search → results → offer → blink → tx flow
│   │   ├── explore/  # Categories, missions
│   │   ├── rewards/  # Points, history, mining game
│   │   └── profile/  # Wallet, stake, settings
│   ├── locked.tsx    # Teaser mode (no X stake)
│   └── error.tsx     # Error/offline
├── components/       # Shared UI components
├── config/           # Environment, Solana cluster, constants
├── hooks/            # useWallet, useAppState, useRewardzClient
├── services/         # Wallet adapter, API client
├── store/            # Zustand stores (wallet, app state)
├── types/            # Navigation params, API types
├── utils/            # Address formatting, PDA derivation, storage
└── providers/        # React Query provider
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `SOLANA_CLUSTER` — `devnet` | `staging` | `mainnet-beta`
- `RPC_URL` — Solana RPC endpoint
- `REWARDZ_PROGRAM_ID` — on-chain program address
- `INTENT_API_BASE_URL` — backend API URL

## Architecture Notes

- Uses `@solana/kit` exclusively — no `@solana/web3.js` dependency
- Wallet session persistence handled by `@wallet-ui/react-native-kit` via AsyncStorage
- `@dialectlabs/blinks` deferred to TODO-0012 (requires web3.js peer dep evaluation)
- API client is a thin HTTP layer until `@rewardz/sdk` upgrades to kit v6

## Mining Game

- `/(tabs)/rewards/mining` shows the active 1-minute round, total player count, caller deployment state, and result reveal.
- `use-game-round` and `use-round-result` read `/v1/game/round/*` API routes. Other players' deployed points are not displayed.
- `use-deploy-to-round` builds the `deployToRound` instruction with `@rewardz/sdk/generated`, compiles the transaction with `@solana/kit`, and signs through Mobile Wallet Adapter.
- The default program fallback is `mineHEHyaVbQAkcPDDCuCSbkfGNid1RVz6GzcEgSVTh`; override `REWARDZ_PROGRAM_ID` per environment when deployed.

## Distribution

Android via Solana dApp Store. See [publishing docs](https://docs.solanamobile.com/dapp-publishing/overview).
