import { address, getProgramDerivedAddress, getUtf8Encoder, getAddressEncoder } from '@solana/kit'
import { ENV } from '@/config/env'
import {
  SEED_CONFIG,
  SEED_USER_STAKE,
  SEED_PROTOCOL_STAKE,
  SEED_POINT_ROOT,
  SEED_GAME_CONFIG,
  SEED_GAME_ROUND,
  SEED_PLAYER_DEPLOYMENT,
  SEED_GAME_TREASURY,
  SEED_ROUND_VAULT,
} from '@/config/constants'

const utf8 = getUtf8Encoder()
const addressEncoder = getAddressEncoder()

function programAddress() {
  return address(ENV.PROGRAM_ID)
}

export function u64ToLeBytes(value: bigint | number | string): Uint8Array {
  const bytes = new Uint8Array(8)
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true)
  return bytes
}

export async function getConfigPda() {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_CONFIG)],
  })
}

export async function getUserStakePda(authority: string) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_USER_STAKE), addressEncoder.encode(address(authority))],
  })
}

export async function getProtocolStakePda(authority: string) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_PROTOCOL_STAKE), addressEncoder.encode(address(authority))],
  })
}

export async function getPointRootPda() {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_POINT_ROOT)],
  })
}

export async function getGameConfigPda() {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_GAME_CONFIG)],
  })
}

export async function getGameTreasuryPda() {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_GAME_TREASURY)],
  })
}

export async function getGameRoundPda(roundId: bigint | number | string) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_GAME_ROUND), u64ToLeBytes(roundId)],
  })
}

export async function getRoundVaultPda(roundId: bigint | number | string) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_ROUND_VAULT), u64ToLeBytes(roundId)],
  })
}

export async function getPlayerDeploymentPda(authority: string, roundId: bigint | number | string) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [utf8.encode(SEED_PLAYER_DEPLOYMENT), u64ToLeBytes(roundId), addressEncoder.encode(address(authority))],
  })
}
