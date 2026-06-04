import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ui/Toast'
import { validateName, validateZipCode, validateState } from '../../lib/validation'
import CountrySelect from '../../components/ui/CountrySelect'
import { usePostalLookup } from '../../hooks/usePostalLookup'
import { Loader2 } from 'lucide-react'

export default function Addresses() {
  const { profile, updateProfile } = useAuth()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '', company: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US'
  })

  // Auto-fill city & state when postal code + country changes
  const { isLooking, lookupError } = usePostalLookup({
    zip: formData.zip,
    country: formData.country,
    onResult: ({ city, state }) => {
      setFormData(prev => ({ ...prev, city, state }))
      setErrors(prev => { const c = { ...prev }; delete c.city; delete c.state; return c })
    }
  })

  useEffect(() => {
    if (profile?.shipping_address) {
      setFormData(profile.shipping_address)
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const validateForm = () => {
    const errs = {}
    
    // Name validation
    if (!formData.name || !validateName(formData.name)) {
      errs.name = 'Please enter both first and last name.'
    }
    
    // Address Line 1 validation
    if (!formData.line1 || formData.line1.trim().length < 5) {
      errs.line1 = 'Address line 1 must be at least 5 characters.'
    }
    
    // City validation
    const cityTrimmed = (formData.city || '').trim()
    if (!cityTrimmed || cityTrimmed.length < 2 || !/^[A-Za-z\s-]+$/.test(cityTrimmed)) {
      errs.city = 'City/Port name must be at least 2 characters (letters, spaces, and hyphens only).'
    }
    
    // State validation
    if (!formData.state || !validateState(formData.state, formData.country)) {
      errs.state = formData.country === 'US' 
        ? 'US States must be 2 letters (e.g., FL).' 
        : 'State/Province must be at least 2 characters.'
    }
    
    // ZIP code validation
    if (!formData.zip || !validateZipCode(formData.zip, formData.country)) {
      if (formData.country === 'US') {
        errs.zip = 'Invalid ZIP format (e.g., 33101 or 33101-1234).'
      } else if (formData.country === 'SG') {
        errs.zip = 'Singapore postal codes must be exactly 6 digits.'
      } else if (formData.country === 'NL') {
        errs.zip = 'Dutch postal codes must be 4 digits followed by 2 letters (e.g., 1234 AB).'
      } else if (formData.country === 'GB') {
        errs.zip = 'Invalid UK postal code format.'
      } else {
        errs.zip = 'Postal code must be 3 to 10 alphanumeric characters.'
      }
    }
    
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.')
      return
    }
    setIsSaving(true)

    // Capitalize US states
    let finalAddress = { ...formData }
    if (finalAddress.country === 'US' && finalAddress.state) {
      finalAddress.state = finalAddress.state.toUpperCase().trim()
    }

    try {
      await updateProfile({ shipping_address: finalAddress })
      toast.success('Address saved successfully!')
      setErrors({})
    } catch (err) {
      toast.error('Failed to save address.')
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)] mb-6">Saved Address</h2>
      
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-6">
        <p className="text-sm text-[var(--color-muted)] mb-6">
          This address will be automatically pre-filled when you checkout.
        </p>
 
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input 
                name="name" 
                className={`input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`} 
                value={formData.name || ''} 
                onChange={handleChange} 
                placeholder="Capt. John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Company / Vessel Name (Optional)</label>
              <input 
                name="company" 
                className="input border-[var(--color-border)]" 
                value={formData.company || ''} 
                onChange={handleChange} 
                placeholder="Seafarer Logistics"
              />
            </div>
          </div>
          
          <div>
            <label className="label">Address Line 1 *</label>
            <input 
              name="line1" 
              className={`input ${errors.line1 ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`} 
              value={formData.line1 || ''} 
              onChange={handleChange} 
              placeholder="Pier 4, Main Harbor"
            />
            {errors.line1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.line1}</p>}
          </div>
          
          <div>
            <label className="label">Address Line 2 (Optional)</label>
            <input 
              name="line2" 
              className="input border-[var(--color-border)]" 
              value={formData.line2 || ''} 
              onChange={handleChange} 
              placeholder="Suite, Unit, etc."
            />
          </div>
 
           <div>
            <label className="label">ZIP / Postal Code *</label>
            <div className="relative">
              <input 
                name="zip" 
                className={`input pr-8 ${errors.zip ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`} 
                value={formData.zip || ''} 
                onChange={handleChange} 
                placeholder="33101"
              />
              {isLooking && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-primary)]" />
              )}
            </div>
            {errors.zip && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.zip}</p>}
            {lookupError && !errors.zip && (
              <p className="text-amber-600 text-xs mt-1 font-semibold">{lookupError}</p>
            )}
            {!lookupError && !isLooking && formData.city && !errors.zip && (
              <p className="text-emerald-600 text-xs mt-1 font-semibold">✓ City & State auto-filled</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">City / Port *</label>
              <input 
                name="city" 
                className={`input ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`} 
                value={formData.city || ''} 
                onChange={handleChange} 
                placeholder="Miami"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.city}</p>}
            </div>
            <div>
              <label className="label">State / Province *</label>
              <input 
                name="state" 
                className={`input ${errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`} 
                value={formData.state || ''} 
                onChange={handleChange} 
                placeholder="FL"
              />
              {errors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.state}</p>}
            </div>
          </div>
 
          <div>
            <label className="label">Country *</label>
            <CountrySelect 
              name="country" 
              value={formData.country || 'US'} 
              onChange={handleChange}
            />
          </div>
 
          <div className="pt-4 mt-2">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Default Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

