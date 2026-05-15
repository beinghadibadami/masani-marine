import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Anchor, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
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
      toast.authError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const data = await register(formData.email, formData.password, formData.fullName)

      // Supabase with "user enumeration protection" ON returns success but with an empty identities array
      // when the email already exists — we must treat this as an existing-account warning.
      if (!data?.user || (data?.user?.identities && data.user.identities.length === 0)) {
        toast.authError(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">This email is already registered.</span>
            <a href="/login" className="underline font-bold text-white/90">Sign in instead →</a>
          </div>
        )
        return
      }

      toast.authSuccess('Account created successfully!')
      navigate(redirect === '/account' ? '/' : redirect)
    } catch (err) {
      const msg = err.message?.toLowerCase() ?? ''
      const isExistingUser =
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('email already') ||
        msg.includes('user already') ||
        msg.includes('duplicate')

      if (isExistingUser) {
        toast.authError(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">This email is already registered.</span>
            <a href="/login" className="underline font-bold text-white/90">Sign in instead →</a>
          </div>
        )
      } else {
        toast.authError(err.message || 'Registration failed. Please try again.')
      }
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
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} name="password" required minLength="6" value={formData.password} onChange={handleChange}
                  className="input border-[var(--color-border)] pr-12" placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} name="confirm" required minLength="6" value={formData.confirm} onChange={handleChange}
                  className="input border-[var(--color-border)] pr-12" placeholder="••••••••"
                />
              </div>
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
