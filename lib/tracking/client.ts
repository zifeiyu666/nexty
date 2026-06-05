'use client'

import Cookies from 'js-cookie'

import { isTrackingEnabled, TRACKING_COOKIE_NAME, type ClientTrackingData } from './shared'

// Re-export types for convenience
export { TRACKING_COOKIE_NAME } from './shared'
export type { ClientTrackingData } from './shared'

/**
 * Cookie expiration in days
 */
const COOKIE_EXPIRATION_DAYS = 30

/**
 * Check if tracking cookies are allowed
 * Returns true if:
 * - Cookie consent feature is not enabled (NEXT_PUBLIC_COOKIE_CONSENT_ENABLED !== 'true')
 * - User has NOT explicitly declined cookies (cookieConsent !== 'false')
 *
 * Logic:
 * - cookieConsent = "true" → User accepted → Allow tracking
 * - cookieConsent = "false" → User declined → Block tracking
 * - cookieConsent = undefined → User hasn't responded → Allow tracking (implicit consent)
 */
function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false

  // If cookie consent feature is not enabled, allow tracking
  const consentEnabled = process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENABLED === 'true'
  if (!consentEnabled) return true

  // Only block tracking if user has explicitly declined (cookieConsent === 'false')
  const consent = Cookies.get('cookieConsent')
  return consent !== 'false'
}

/**
 * Extract UTM parameters from current URL
 */
function extractUtmParams(): Partial<ClientTrackingData> {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
    utmTerm: params.get('utm_term') || undefined,
    utmContent: params.get('utm_content') || undefined,
  }
}

/**
 * Extract affiliate code from url params
 */
function getAffParams(): Partial<ClientTrackingData> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    affCode: params.get('aff') || params.get('via') || params.get('ref') || undefined,
  }
}

/**
 * Get device and browser information
 */
function getDeviceInfo(): Partial<ClientTrackingData> {
  if (typeof window === 'undefined') return {}

  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/**
 * Get referrer and landing page info
 */
function getReferrerInfo(): Partial<ClientTrackingData> {
  if (typeof window === 'undefined') return {}

  return {
    referrer: document.referrer || undefined,
    landingPage: window.location.href,
  }
}

/**
 * Collect all client-side tracking data
 */
export function collectClientTrackingData(): ClientTrackingData {
  const utmParams = extractUtmParams()
  const affParams = getAffParams()
  const deviceInfo = getDeviceInfo()
  const referrerInfo = getReferrerInfo()

  return {
    ...utmParams,
    ...affParams,
    ...deviceInfo,
    ...referrerInfo,
  }
}

/**
 * Save tracking data to cookie
 * Only saves if:
 * - Cookie consent is not required, OR user has consented
 * - There's no existing data or if new data has UTM/referrer info
 */
export function saveTrackingDataToCookie(): void {
  if (typeof window === 'undefined') return

  // Check cookie consent before saving
  if (!hasCookieConsent()) {
    return
  }

  const newData = collectClientTrackingData()
  const existingCookie = Cookies.get(TRACKING_COOKIE_NAME)

  // If no existing cookie, save the new data
  if (!existingCookie) {
    Cookies.set(TRACKING_COOKIE_NAME, JSON.stringify(newData), {
      expires: COOKIE_EXPIRATION_DAYS,
      sameSite: 'lax',
    })
    return
  }

  // If existing cookie exists, only update if new data has meaningful tracking info
  // This preserves the original referrer/UTM when user navigates
  try {
    const existingData: ClientTrackingData = JSON.parse(existingCookie)

    // Only update UTM/referrer if new data has them and existing doesn't
    const mergedData: ClientTrackingData = {
      ...existingData,
      // Always update device info (could change)
      screenWidth: newData.screenWidth,
      screenHeight: newData.screenHeight,
      language: newData.language,
      timezone: newData.timezone,
      // Affiliate code
      ...(newData.affCode && { affCode: newData.affCode }),
      // Only update UTM if new ones exist
      ...(newData.utmSource && { utmSource: newData.utmSource }),
      ...(newData.utmMedium && { utmMedium: newData.utmMedium }),
      ...(newData.utmCampaign && { utmCampaign: newData.utmCampaign }),
      ...(newData.utmTerm && { utmTerm: newData.utmTerm }),
      ...(newData.utmContent && { utmContent: newData.utmContent }),
    }

    Cookies.set(TRACKING_COOKIE_NAME, JSON.stringify(mergedData), {
      expires: COOKIE_EXPIRATION_DAYS,
      sameSite: 'lax',
    })
  } catch {
    // If parsing fails, just set new data
    Cookies.set(TRACKING_COOKIE_NAME, JSON.stringify(newData), {
      expires: COOKIE_EXPIRATION_DAYS,
      sameSite: 'lax',
    })
  }
}

/**
 * Get tracking data from cookie
 */
export function getTrackingDataFromCookie(): ClientTrackingData | null {
  if (typeof window === 'undefined') return null

  const cookieValue = Cookies.get(TRACKING_COOKIE_NAME)
  if (!cookieValue) return null

  try {
    return JSON.parse(cookieValue)
  } catch {
    return null
  }
}

/**
 * Clear tracking data cookie (call after user registration)
 */
export function clearTrackingCookie(): void {
  if (typeof window === 'undefined') return
  Cookies.remove(TRACKING_COOKIE_NAME)
}


/**
 * Initialize tracking - should be called on app mount
 */
export function initializeTracking(): void {
  if (!isTrackingEnabled()) {
    return
  }
  saveTrackingDataToCookie()
}
