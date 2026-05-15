import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Settings, LogOut,
  Anchor, ChevronRight, Menu, X, Store
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

// ── Sidebar content (shared between desktop sidebar and mobile drawer)
function SidebarContent({ onClose, profile, handleLogout }) {
  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00AACC]/20 flex items-center justify-center flex-shrink-0">
            <Anchor size={18} style={{ color: '#00AACC' }} />
          </div>
          <div>
            <div className="font-sans text-base font-bold text-white uppercase tracking-wide">Masani Marine</div>
            <div className="font-sans text-[9px] text-white/40 tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>
        {/* Close btn (mobile only) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 font-sans overflow-y-auto">
        {ADMIN_LINKS.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
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
          <div className="w-8 h-8 rounded-full bg-[#00AACC] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {profile?.full_name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-white/40 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <NavLink
          to="/"
          onClick={onClose}
          className="admin-sidebar-link w-full text-left text-white/70 hover:text-white hover:bg-white/10 mb-1"
        >
          <Store size={15} /> View Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="admin-sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </>
  )
}

export function AdminLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('drawer-open')
    } else {
      document.body.classList.remove('drawer-open')
    }
    return () => document.body.classList.remove('drawer-open')
  }, [mobileMenuOpen])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">

      {/* ── Desktop Sidebar (lg+) ─────────────────────────────── */}
      <aside className="admin-sidebar hidden lg:flex flex-col">
        <SidebarContent profile={profile} handleLogout={handleLogout} onClose={null} />
      </aside>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] z-[300] flex flex-col bg-[var(--color-navy)] lg:hidden shadow-2xl"
            style={{ overflowY: 'auto' }}
          >
            <SidebarContent
              profile={profile}
              handleLogout={() => { handleLogout(); setMobileMenuOpen(false) }}
              onClose={() => setMobileMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-[var(--color-border)] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-[100]">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-navy)] hover:bg-[var(--color-surface-2)] transition-all"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] breadcrumb font-sans">
              <NavLink to="/" className="hover:text-[var(--color-primary)] hidden sm:inline">Store</NavLink>
              <ChevronRight size={14} className="hidden sm:inline" />
              <span className="text-[var(--color-navy)] font-semibold">Admin</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-4">
            <NavLink 
              to="/" 
              className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-white hover:bg-[var(--color-primary)] transition-all font-sans text-xs md:text-sm font-medium"
              title="Go to storefront"
            >
              <Store size={16} />
              <span className="hidden sm:inline">View Store</span>
            </NavLink>
            <span className="lg:hidden font-sans text-xs sm:text-sm font-bold text-[var(--color-navy)] uppercase">
              Admin Panel
            </span>
            {/* Avatar — desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <span className="text-sm font-semibold text-[var(--color-navy)] hidden xl:inline">
                {profile?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
