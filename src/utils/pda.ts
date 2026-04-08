import { address, getProgramDerivedAddress, getUtf8Encoder, getAddressEncoder } from '@solana/kit'
import { ENV } from '@/config/env'
import {
  SEED_CONFIG,
  SEED_USER_STAKE,
  SEED_PROTOCOL_STAKE,
  SEED_POINT_ROOT,
  SEED_MINT_ATTEMPT,
} from '@/config/constants'

const utf8 = getUtf8Encoder()
const addressEncoder = getAddressEncoder()

function programAddress() {
  return address(ENV.REWARDZ_PROGRAM_ID)
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

export async function getMintAttemptPda(authority: string, nonce: bigint) {
  return getProgramDerivedAddress({
    programAddress: programAddress(),
    seeds: [
      utf8.encode(SEED_MINT_ATTEMPT),
      addressEncoder.encode(address(authority)),
      // Little-endian u64 — matches Solana's on-chain byte order (LE on all supported platforms)
      new Uint8Array(new BigUint64Array([nonce]).buffer),
    ],
  })
}
