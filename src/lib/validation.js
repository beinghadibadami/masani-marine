/**
 * Masani Marine Centralized Input Validation Utilities
 */

/**
 * Validates whether an email matches a standard valid email format.
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email).toLowerCase().trim())
}

/**
 * Validates zip codes based on country-specific formats.
 * @param {string} zip 
 * @param {string} country 
 * @returns {boolean}
 */
export const validateZipCode = (zip, country = 'US') => {
  const trimmed = String(zip).trim()
  if (!trimmed) return false

  switch (country) {
    case 'US':
      // US ZIP code: 5 digits, optionally followed by a hyphen and 4 digits
      return /^\d{5}(-\d{4})?$/.test(trimmed)
    case 'SG':
      // Singapore: exactly 6 digits
      return /^\d{6}$/.test(trimmed)
    case 'NL':
      // Netherlands: 4 digits, optional space, 2 letters (case insensitive)
      return /^[0-9]{4}\s?[A-Za-z]{2}$/.test(trimmed)
    case 'GB':
      // United Kingdom: basic alphanumeric postal code check (5 to 8 characters)
      return /^[A-Za-z0-9\s]{5,8}$/.test(trimmed)
    default:
      // Generic fallback: 3 to 10 alphanumeric characters (allowing spaces)
      return trimmed.length >= 3 && trimmed.length <= 10 && /^[A-Za-z0-9\s-]+$/.test(trimmed)
  }
}

/**
 * Validates state/province codes.
 * @param {string} state 
 * @param {string} country 
 * @returns {boolean}
 */
export const validateState = (state, country = 'US') => {
  const trimmed = String(state).trim()
  if (!trimmed) return false

  if (country === 'US') {
    // US State: exactly 2 alphabetic characters
    return /^[A-Za-z]{2}$/.test(trimmed)
  }
  // Generic: minimum 2 characters
  return trimmed.length >= 2
}

/**
 * Validates a full name (requires at least first and last name, min 3 chars total).
 * @param {string} name 
 * @returns {boolean}
 */
export const validateName = (name) => {
  const trimmed = String(name).trim()
  if (trimmed.length < 3) return false
  
  const words = trimmed.split(/\s+/).filter(Boolean)
  // Must have at least two parts (e.g. "John Doe")
  return words.length >= 2
}

/**
 * Validates phone numbers (7 to 15 digits, allows +, spaces, parentheses, hyphens).
 * @param {string} phone 
 * @param {boolean} required 
 * @returns {boolean}
 */
export const validatePhone = (phone, required = false) => {
  const trimmed = String(phone || '').trim()
  if (!trimmed) return !required

  const digitsOnly = trimmed.replace(/\D/g, '')
  const isValidChars = /^[+\d\s().-]+$/.test(trimmed)
  
  return digitsOnly.length >= 7 && digitsOnly.length <= 15 && isValidChars
}

/**
 * Validates product SKU (alphanumeric and hyphens only, min 4 characters).
 * @param {string} sku 
 * @returns {boolean}
 */
export const validateSku = (sku) => {
  const trimmed = String(sku).trim()
  return /^[A-Za-z0-9-]+$/.test(trimmed) && trimmed.length >= 4
}

/**
 * Validates product URL slug (lowercase alphanumeric and hyphens, no consecutive hyphens, no leading/trailing hyphens).
 * @param {string} slug 
 * @returns {boolean}
 */
export const validateSlug = (slug) => {
  const trimmed = String(slug).trim()
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)
}
