import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { useToast } from '../../components/ui/Toast'

export default function Settings() {
  const { settings, isLoading, updateSetting } = useSettings()
  const toast = useToast()
  
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setFormData(settings)
  }, [settings])

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Very basic individual update loop for simplicity
      const promises = Object.entries(formData).map(([k, v]) => updateSetting(k, v))
      await Promise.all(promises)
      toast.success('Settings updated globally')
    } catch(err) {
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <div className="p-10 flex justify-center"><div className="loader"/></div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6 border-b border-[var(--color-border)] pb-4">
        <h1 className="font-heading text-xl md:text-3xl font-bold uppercase text-[var(--color-navy)] tracking-wide">
          Global Settings
        </h1>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Company Name</label>
                <input name="company_name" value={formData.company_name || ''} onChange={handleChange} className="input font-semibold" />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input name="tagline" value={formData.tagline || ''} onChange={handleChange} className="input text-sm" />
              </div>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold border-b border-[var(--color-border)] pb-2 mb-4 mt-6 text-[var(--color-navy)]">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Contact Email</label>
                  <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Support Phone</label>
                  <input name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Headquarters Address</label>
                  <textarea name="address" rows="3" value={formData.address || ''} onChange={handleChange} className="input resize-y" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)]">
              <button type="submit" disabled={saving} className="btn btn-primary">
                 {saving ? 'Saving...' : <><Save size={18}/> Save Settings</>}
              </button>
            </div>
         </form>
      </div>
    </div>
  )
}
