import { useState, useEffect, useRef } from 'react'

/**
 * Looks up city and state from a postal code using the Zippopotam.us API.
 * Triggers automatically on zip/country change with a 600ms debounce.
 *
 * @param {string} zip      - The postal/zip code entered by the user
 * @param {string} country  - ISO 2-letter country code (e.g. 'US', 'IN')
 * @param {function} onResult - Callback called with { city, state } on success
 */
export function usePostalLookup({ zip, country, onResult }) {
  const [isLooking, setIsLooking] = useState(false)
  const [lookupError, setLookupError] = useState(null)
  const debounceRef = useRef(null)
  const lastKey = useRef('')

  useEffect(() => {
    // Need at least 3 characters to try a lookup
    if (!zip || !country || zip.replace(/\s/g, '').length < 3) {
      setLookupError(null)
      return
    }

    const key = `${country}-${zip.trim()}`
    if (key === lastKey.current) return // Already looked this up

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsLooking(true)
      setLookupError(null)
      try {
        const cleanZip = zip.trim().replace(/\s/g, '%20')
        const res = await fetch(
          `https://api.zippopotam.us/${country.toLowerCase()}/${cleanZip}`
        )

        if (res.status === 404) {
          // Country not supported or postal code doesn't exist
          setLookupError('Postal code not found — please enter city & state manually.')
          setIsLooking(false)
          return
        }

        if (!res.ok) throw new Error('Lookup request failed')

        const data = await res.json()
        const place = data.places?.[0]

        if (place) {
          lastKey.current = key
          onResult({
            city: place['place name'] || '',
            state: place['state abbreviation'] || place['state'] || ''
          })
          setLookupError(null)
        }
      } catch {
        // Network error or other issue — silently let user type manually
        setLookupError(null)
      } finally {
        setIsLooking(false)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [zip, country]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isLooking, lookupError }
}
