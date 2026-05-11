import { NavLink, Outlet } from 'react-router-dom'
import { User, Package, MapPin, Settings } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/account', end: true, icon: User, label: 'Overview' },
  { to: '/account/orders', icon: Package, label: 'My Orders' },
  { to: '/account/addresses', icon: MapPin, label: 'Addresses' },
  { to: '/account/settings', icon: Settings, label: 'Settings' },
]

export default function AccountLayout() {
  const { profile } = useAuth()

  return (
    <div className="bg-[var(--color-surface-2)] min-h-[80vh] py-10">
      <div className="container">
        <h1 className="font-heading text-4xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide mb-12">
          My Account
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm sticky top-24">
              <div className="p-6 border-b border-[var(--color-border)] text-center bg-[var(--color-surface-2)]/50">
                <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-heading font-bold text-2xl mx-auto mb-3 shadow-md">
                  {profile?.full_name?.[0] || 'U'}
                </div>
                <h2 className="font-bold text-[var(--color-navy)] text-lg truncate px-2">{profile?.full_name || 'Customer'}</h2>
                <p className="font-mono text-xs text-[var(--color-muted)] truncate px-2 mt-1">{profile?.email}</p>
              </div>
              
              <nav className="p-2 flex flex-col gap-1">
                {NAV.map(({ to, end, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} /> {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
            <Outlet />
          </main>
          
        </div>
      </div>
    </div>
  )
}
