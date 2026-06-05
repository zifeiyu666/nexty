import { db } from '@/lib/db'
import { userSource } from '@/lib/db/schema'
import Bowser from 'bowser'
import { headers } from 'next/headers'

import {
  type ClientTrackingData,
  type GeoLocationData,
  type ParsedUserAgent,
  type UserSourceData
} from './shared'

// Re-export all types and utilities from types.ts
export { parseTrackingCookie, TRACKING_COOKIE_NAME } from './shared'
export type { ClientTrackingData, GeoLocationData, ParsedUserAgent, UserSourceData } from './shared'

/**
 * Parse user agent string using bowser (MIT license)
 */
export function parseUserAgent(userAgentString: string): ParsedUserAgent {
  const parser = Bowser.parse(userAgentString)

  // Determine device type
  let deviceType: string | undefined
  if (parser.platform.type) {
    deviceType = parser.platform.type // 'mobile', 'tablet', 'desktop'
  } else {
    deviceType = 'desktop'
  }

  return {
    browser: parser.browser.name,
    browserVersion: parser.browser.version,
    os: parser.os.name,
    osVersion: parser.os.version,
    deviceType,
    deviceBrand: parser.platform.vendor,
    deviceModel: parser.platform.model,
  }
}

/**
 * Extract geo location data from Cloudflare headers
 */
export async function getCloudflareGeoHeaders(): Promise<GeoLocationData> {
  const headersList = await headers()

  // IP address (priority: cf-connecting-ip > x-real-ip > x-forwarded-for)
  const cfIP = headersList.get('cf-connecting-ip')
  const realIP = headersList.get('x-real-ip')
  const forwarded = headersList.get('x-forwarded-for')
  const ipAddress = cfIP || realIP || (forwarded ? forwarded.split(',')[0].trim() : undefined)

  // Cloudflare geo headers
  const countryCode = headersList.get('cf-ipcountry') || undefined

  return {
    ipAddress,
    countryCode,
  }
}

/**
 * Extract referrer domain from full referrer URL
 */
export function extractReferrerDomain(referrer: string | undefined): string | undefined {
  if (!referrer) return undefined

  try {
    const url = new URL(referrer)
    return url.hostname
  } catch {
    return undefined
  }
}

/**
 * Get user agent from headers
 */
export async function getUserAgentFromHeaders(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('user-agent') || undefined
}

/**
 * Build complete user source data from client data and server headers
 */
export async function buildUserSourceData(
  userId: string,
  clientData?: ClientTrackingData,
): Promise<UserSourceData> {
  // Get server-side data
  const geoData = await getCloudflareGeoHeaders()
  const userAgentString = await getUserAgentFromHeaders()
  const parsedUA = userAgentString ? parseUserAgent(userAgentString) : {}

  // Extract referrer domain
  const referrerDomain = extractReferrerDomain(clientData?.referrer)

  return {
    userId,
    // Referral code
    affCode: clientData?.affCode,
    // UTM from client
    utmSource: clientData?.utmSource,
    utmMedium: clientData?.utmMedium,
    utmCampaign: clientData?.utmCampaign,
    utmTerm: clientData?.utmTerm,
    utmContent: clientData?.utmContent,
    // Referrer
    referrer: clientData?.referrer,
    referrerDomain,
    landingPage: clientData?.landingPage,
    // Device & Browser (from server-side UA parsing)
    userAgent: userAgentString,
    ...parsedUA,
    // Screen info from client
    screenWidth: clientData?.screenWidth,
    screenHeight: clientData?.screenHeight,
    language: clientData?.language,
    timezone: clientData?.timezone,
    // Geo from Cloudflare
    ...geoData,
  }
}

/**
 * Save user source data to database
 */
export async function saveUserSource(data: UserSourceData): Promise<void> {
  try {
    await db.insert(userSource).values({
      userId: data.userId,
      // Affiliate code
      affCode: data.affCode,
      // UTM
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      // Referrer
      referrer: data.referrer,
      referrerDomain: data.referrerDomain,
      landingPage: data.landingPage,
      // Device & Browser
      userAgent: data.userAgent,
      browser: data.browser,
      browserVersion: data.browserVersion,
      os: data.os,
      osVersion: data.osVersion,
      deviceType: data.deviceType,
      deviceBrand: data.deviceBrand,
      deviceModel: data.deviceModel,
      screenWidth: data.screenWidth,
      screenHeight: data.screenHeight,
      language: data.language,
      timezone: data.timezone,
      // Network & Location
      ipAddress: data.ipAddress,
      countryCode: data.countryCode,
      // Extra
      metadata: data.metadata,
    })
    console.log(`User source saved for user ${data.userId}`)
  } catch (error) {
    console.error('Failed to save user source:', error)
  }
}
