import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Anchor, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const params = new URLSearchParams(location.search)
  const redirect = params.get('redirect') || '/account'

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(formData.email, formData.password, formData.fullName)
      toast.success('Success! Please check your email inbox to confirm your account, then sign in.')
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
    } catch (err) {
      toast.error(err.message || 'Failed to register.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ocean-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background elements */}
       <div className="sonar-ring" style={{ animationDuration: '6s' }} />
       
       <div className="bg-white/95 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 my-10">
         <div className="text-center mb-8">
           <div className="w-16 h-16 bg-[#00AACC]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#00AACC]/20">
             <Anchor size={32} className="text-[#00AACC]" />
           </div>
           <h1 className="font-heading text-3xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide">
             Create Account
           </h1>
           <p className="text-[var(--color-muted)] mt-2">Join Masani Marine for easy ordering</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="label">Full Name</label>
             <input 
               type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
               className="input border-[var(--color-border)]" placeholder="John Doe"
             />
           </div>
           <div>
             <label className="label">Email Address</label>
             <input 
               type="email" name="email" required value={formData.email} onChange={handleChange}
               className="input border-[var(--color-border)]" placeholder="email@address.com"
             />
           </div>
           <div>
             <label className="label">Password</label>
             <input 
               type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange}
               className="input border-[var(--color-border)]" placeholder="••••••••"
             />
           </div>
           <div>
             <label className="label">Confirm Password</label>
             <input 
               type="password" name="confirm" required minLength="6" value={formData.confirm} onChange={handleChange}
               className="input border-[var(--color-border)]" placeholder="••••••••"
             />
           </div>
           
           <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center mt-4">
             {loading ? <div className="loader" style={{ width:20, height:20, borderWidth:2 }}/> : 'Create Account'}
             {!loading && <ArrowRight size={18}/>}
           </button>
         </form>

         <div className="text-center mt-6 pt-6 border-t border-[var(--color-border)]">
           <p className="text-[var(--color-muted)] text-sm">
             Already have an account?{' '}
             <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[var(--color-primary)] font-semibold hover:underline">
               Sign In
             </Link>
           </p>
         </div>
       </div>
    </div>
  )
}
