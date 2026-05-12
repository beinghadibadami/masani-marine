import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Anchor, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const params = new URLSearchParams(location.search)
  const redirect = params.get('redirect') || '/account'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.authSuccess('Welcome back! You are now signed in.')
      navigate(redirect)
    } catch (err) {
      toast.authError(err.message || 'Failed to sign in. Please check your email and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ocean-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background elements */}
       <div className="sonar-ring" style={{ animationDuration: '6s' }} />
       
       <div className="bg-white/95 backdrop-blur-md border border-white/20 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10">
         <div className="text-center mb-8">
           <div className="w-16 h-16 bg-[#00AACC]/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#00AACC]/20">
             <Anchor size={32} className="text-[#00AACC]" />
           </div>
           <h1 className="font-heading text-3xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide">
             Welcome Back
           </h1>
           <p className="text-[var(--color-muted)] mt-2">Sign in to your Masani Marine account</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="label">Email Address</label>
             <input 
               type="email" 
               required 
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="input border-[var(--color-border)]" 
               placeholder="captain@vessel.com"
             />
           </div>
           <div>
             <div className="flex justify-between items-center">
               <label className="label mb-0">Password</label>
               <a href="#" className="text-xs text-[var(--color-primary)] hover:underline">Forgot?</a>
             </div>
             <div className="relative mt-1.5">
               <input 
                 type={showPassword ? "text" : "password"} 
                 required 
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="input border-[var(--color-border)] pr-12" 
                 placeholder="••••••••"
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors p-1"
               >
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
             </div>
           </div>
           
           <button 
             type="submit" 
             disabled={loading}
             className="btn btn-primary w-full justify-center mt-2"
           >
             {loading ? <div className="loader" style={{ width:20, height:20, borderWidth:2 }}/> : 'Sign In'}
             {!loading && <ArrowRight size={18}/>}
           </button>
         </form>

         <div className="text-center mt-8 pt-6 border-t border-[var(--color-border)]">
           <p className="text-[var(--color-muted)] text-sm">
             New to Masani Marine?{' '}
             <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-[var(--color-primary)] font-semibold hover:underline">
               Create an account
             </Link>
           </p>
         </div>
       </div>
    </div>
  )
}
