import { useState, useEffect, useRef } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { countries } from '../../data/countries'

export default function CountrySelect({
  value: controlledValue,
  defaultValue = 'US',
  onChange,
  name = 'country',
  placeholder = 'Select country...',
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Find the currently selected country object
  const selectedCountry = countries.find(c => c.code === value)

  // Sync search input with selected country name when not searching
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(selectedCountry ? selectedCountry.name : '')
    }
  }, [value, isOpen, selectedCountry])

  // Filter countries based on input
  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        setFocusedIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => (prev + 1) % filteredCountries.length)
        e.preventDefault()
        break
      case 'ArrowUp':
        setFocusedIndex(prev => (prev - 1 + filteredCountries.length) % filteredCountries.length)
        e.preventDefault()
        break
      case 'Enter':
        if (focusedIndex >= 0 && focusedIndex < filteredCountries.length) {
          selectCountry(filteredCountries[focusedIndex])
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        e.preventDefault()
        break
      default:
        break
    }
  }

  const selectCountry = (country) => {
    if (controlledValue === undefined) {
      setInternalValue(country.code)
    }
    if (onChange) {
      onChange({
        target: {
          name,
          value: country.code
        }
      })
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Hidden input for standard forms (e.g. FormData in Checkout) */}
      <input type="hidden" name={name} value={value} />

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input pr-10 border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary-light)] w-full placeholder-slate-400"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearchQuery('') // Clear search query to show all options on focus
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin">
          {filteredCountries.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 italic">No countries found</div>
          ) : (
            filteredCountries.map((country, index) => {
              const isSelected = country.code === value
              const isFocused = index === focusedIndex

              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => selectCountry(country)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-sky-50 text-[var(--color-primary)] font-semibold' : ''
                  } ${isFocused ? 'bg-slate-50' : ''}`}
                >
                  <span className="truncate">{country.name}</span>
                  {isSelected && <Check size={16} className="text-[var(--color-primary)] flex-shrink-0 ml-2" />}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
