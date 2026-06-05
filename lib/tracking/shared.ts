/**
 * Client tracking data collected from the browser
 */
export interface ClientTrackingData {
  // Affiliate code
  affCode?: string
  // UTM parameters
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  // Referrer
  referrer?: string
  landingPage?: string
  // Device info
  screenWidth?: number
  screenHeight?: number
  language?: string
  timezone?: string
}

/**
 * Parsed user agent data
 */
export interface ParsedUserAgent {
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceType?: string
  deviceBrand?: string
  deviceModel?: string
}

/**
 * Geo location data from Cloudflare headers
 */
export interface GeoLocationData {
  ipAddress?: string
  countryCode?: string
}

/**
 * Complete user source data
 */
export interface UserSourceData {
  userId: string
  // Affiliate code
  affCode?: string
  // UTM
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  // Referrer
  referrer?: string
  referrerDomain?: string
  landingPage?: string
  // Device & Browser
  userAgent?: string
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceType?: string
  deviceBrand?: string
  deviceModel?: string
  screenWidth?: number
  screenHeight?: number
  language?: string
  timezone?: string
  // Network & Location
  ipAddress?: string
  countryCode?: string
  // Extra
  metadata?: Record<string, unknown>
}

/**
 * Cookie name for storing client tracking data
 */
export const TRACKING_COOKIE_NAME = 'user_tracking_data'

/**
 * Parse tracking data from cookie value (pure function, environment-agnostic)
 */
export function parseTrackingCookie(cookieValue: string | undefined): ClientTrackingData | null {
  if (!cookieValue) return null

  try {
    return JSON.parse(decodeURIComponent(cookieValue))
  } catch {
    return null
  }
}

/**
 * Check if user source tracking is enabled via environment variable
 */
export function isTrackingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USER_SOURCE_TRACKING_ENABLED === 'true'
}
