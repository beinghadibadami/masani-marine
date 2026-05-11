import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Settings, LogOut,
  Anchor, ChevronRight, Waves
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ADMIN_LINKS = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export function AdminLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">
      {/* Sidebar */}
      <aside className="admin-sidebar hidden lg:flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00AACC]/20 flex items-center justify-center">
              <Anchor size={18} style={{ color: '#00AACC' }} />
            </div>
            <div>
              <div className="font-heading text-base font-bold text-white uppercase tracking-wide">Masani Marine</div>
              <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {ADMIN_LINKS.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#00AACC] flex items-center justify-center text-white font-bold text-sm">
              {profile?.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-white/40 text-xs truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] breadcrumb">
            <NavLink to="/" className="hover:text-[var(--color-primary)]">Store</NavLink>
            <ChevronRight size={14} />
            <span className="text-[var(--color-navy)] font-semibold">Admin</span>
          </div>
          <div className="lg:hidden">
            <span className="font-heading text-sm font-bold text-[var(--color-navy)] uppercase">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
