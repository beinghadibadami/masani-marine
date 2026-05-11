import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Menu, X, Anchor, LogOut, Settings,
  Package, LayoutDashboard, ChevronDown, Waves
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCartContext } from '../../context/CartContext'
import { SearchOverlay } from '../ui/SearchOverlay'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const { user, profile, isAdmin, logout } = useAuth()
  const { itemCount } = useCartContext()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
    setAccountMenuOpen(false)
  }

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-[var(--color-border)]'
            : 'bg-white/70 backdrop-blur-sm'
        }`}
        style={{ zIndex: 100 }}
      >
        <div className="max-w-full px-2 md:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img src="/logo.png" alt="Masani Marine" className="h-16 md:h-24 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] transition-all"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] transition-all"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center font-mono"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-bold">
                      {(profile?.full_name || user.email)?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown size={14} className="text-[var(--color-muted)]" />
                  </button>
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-[var(--color-border)] overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[var(--color-border)]">
                          <p className="font-semibold text-sm text-[var(--color-navy)]">{profile?.full_name || 'Account'}</p>
                          <p className="text-xs text-[var(--color-muted)] truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to="/account" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text)]">
                            <User size={15} /> My Account
                          </Link>
                          <Link to="/account/orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-text)]">
                            <Package size={15} /> My Orders
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--color-surface-2)] text-[var(--color-primary)] font-semibold">
                              <LayoutDashboard size={15} /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-[var(--color-border)] py-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm w-full text-left hover:bg-red-50 text-red-600">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="btn btn-brand btn-sm">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[var(--color-muted)]">
                <Search size={20} />
              </button>
              <Link to="/cart" className="relative p-2 text-[var(--color-muted)]">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setDrawerOpen(true)} className="p-2 text-[var(--color-text)]">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[200]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="mobile-drawer"
              style={{ zIndex: 300 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Anchor size={20} className="text-[var(--color-primary)]" />
                  <span className="font-heading text-lg font-bold text-[var(--color-navy)] uppercase">Masani Marine</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)]">
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link text-base ${isActive ? 'active' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {user && (
                  <>
                    <hr className="my-2 border-[var(--color-border)]" />
                    <NavLink to="/account" onClick={() => setDrawerOpen(false)} className="sidebar-link">
                      <User size={16} /> My Account
                    </NavLink>
                    {isAdmin && (
                      <NavLink to="/admin" onClick={() => setDrawerOpen(false)} className="sidebar-link text-[var(--color-primary)]">
                        <LayoutDashboard size={16} /> Admin Panel
                      </NavLink>
                    )}
                    <button onClick={() => { handleLogout(); setDrawerOpen(false) }} className="sidebar-link text-red-600 w-full text-left">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                )}
                {!user && (
                  <Link to="/login" onClick={() => setDrawerOpen(false)} className="btn btn-primary mt-4 w-full justify-center">
                    Sign In
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Nav spacer */}
      <div className="h-24 md:h-32" />
    </>
  )
}
