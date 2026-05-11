import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ui/Toast'

export default function Addresses() {
  const { profile, updateProfile } = useAuth()
  const toast = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '', company: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US'
  })

  useEffect(() => {
    if (profile?.shipping_address) {
      setFormData(profile.shipping_address)
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ shipping_address: formData })
      toast.success('Address saved successfully!')
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

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" required className="input" value={formData.name || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Company / Vessel Name (Optional)</label>
              <input name="company" className="input" value={formData.company || ''} onChange={handleChange} />
            </div>
          </div>
          
          <div>
            <label className="label">Address Line 1</label>
            <input name="line1" required className="input" value={formData.line1 || ''} onChange={handleChange} />
          </div>
          
          <div>
            <label className="label">Address Line 2 (Optional)</label>
            <input name="line2" className="input" value={formData.line2 || ''} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">City / Port</label>
              <input name="city" required className="input" value={formData.city || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">State / Province</label>
              <input name="state" required className="input" value={formData.state || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="label">ZIP / Postal Code</label>
              <input name="zip" required className="input" value={formData.zip || ''} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="label">Country</label>
            <select name="country" required className="input" value={formData.country || 'US'} onChange={handleChange}>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AE">United Arab Emirates</option>
              <option value="SG">Singapore</option>
              <option value="NL">Netherlands</option>
            </select>
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
