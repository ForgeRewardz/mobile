export const REFERRAL_STORAGE_KEY = 'rewardz.ref'
export const REFERRAL_QUERY_PARAM = 'r'
export const REFERRAL_ATTRIBUTE_PATH = '/v1/referrals/attribute'
export const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export function isValidReferralCode(value: string | null | undefined): value is string {
  return typeof value === 'string' && REFERRAL_CODE_PATTERN.test(value)
}
