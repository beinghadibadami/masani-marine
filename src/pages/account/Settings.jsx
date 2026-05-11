import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../components/ui/Toast'

export default function Settings() {
  const { profile, updateProfile } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const updates = {
      full_name: form.get('name'),
      phone: form.get('phone')
    }
    
    setLoading(true)
    try {
      await updateProfile(updates)
      toast.success('Profile updated successfully')
    } catch(err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)] mb-6 border-b border-[var(--color-border)] pb-4">
        Account Settings
      </h2>
      
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name / Company Name</label>
            <input 
              name="name" 
              defaultValue={profile?.full_name || ''} 
              className="input font-semibold"
              required
            />
          </div>
          
          <div>
            <label className="label">Email Address</label>
            <input 
              disabled 
              value={profile?.email || ''} 
              className="input bg-[var(--color-surface-2)] text-[var(--color-muted)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--color-muted)] font-mono mt-1 mt-1.5">Email cannot be changed directly.</p>
          </div>
          
          <div>
             <label className="label">Phone Number</label>
             <input 
               name="phone" 
               defaultValue={profile?.phone || ''}
               className="input"
               placeholder="+1 (555) 123-4567"
             />
          </div>
          
          <div className="pt-4 border-t border-[var(--color-border)]">
             <button type="submit" disabled={loading} className="btn btn-primary">
               {loading ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </form>
      </div>

    </div>
  )
}
