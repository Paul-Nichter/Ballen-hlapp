/**
 * Domain Configuration
 *
 * This file contains the domain configuration for the application.
 * Update the DOMAIN constant to match your production domain.
 */

export const DOMAIN = "Kleinballenzaeler.de"
export const PROTOCOL = "https"
export const BASE_URL = `${PROTOCOL}://${DOMAIN}`

/**
 * Generate an absolute URL for a given path
 * @param path - The path to append to the base URL (e.g., "/dashboard", "/api/orders")
 * @returns The complete absolute URL
 */
export function getAbsoluteUrl(path = ""): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${BASE_URL}/${cleanPath}`
}

/**
 * Get the API base URL
 * @returns The base URL for API endpoints
 */
export function getApiUrl(): string {
  return `${BASE_URL}/api`
}
