import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { mockProducts } from '../../data/mockProducts'

export function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const inputRef = useRef(null)
  const { searchProducts } = useProducts()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchProducts(query)
        setResults(data)
      } catch {
        // Fallback to mock data search if Supabase not configured
        const filtered = mockProducts.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8)
        setResults(filtered)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="search-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl px-4"
          >
            {/* Search Input */}
            <div className="relative">
              <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products, SKUs, categories..."
                className="w-full pl-12 pr-12 py-4 text-lg rounded-xl border border-white/20 bg-white/95 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] shadow-2xl"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Results */}
            <AnimatePresence>
              {(results.length > 0 || searching) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 bg-white rounded-xl shadow-2xl overflow-hidden border border-[var(--color-border)] max-h-[420px] overflow-y-auto"
                >
                  {searching ? (
                    <div className="p-6 text-center">
                      <div className="loader mx-auto" style={{ width: 24, height: 24, borderWidth: 2 }} />
                    </div>
                  ) : (
                    results.map((product, i) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--color-surface-2)] border-b border-[var(--color-border)] last:border-0 transition-colors group"
                      >
                        <img
                          src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/60/60`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-[var(--color-border)]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[var(--color-navy)] truncate">{product.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="sku-tag">{product.sku}</span>
                            <span className="text-xs text-[var(--color-muted)]">{product.category_name || product.categories?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="price-tag text-base">${product.price?.toLocaleString()}</span>
                          <ArrowRight size={16} className="text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                        </div>
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {query.length >= 2 && !searching && results.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-white/70 font-mono text-sm"
              >
                No products found for "{query}"
              </motion.p>
            )}

            <p className="mt-4 text-center text-white/50 text-sm">
              Press <kbd className="px-2 py-0.5 rounded bg-white/20 text-white text-xs font-mono">ESC</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
