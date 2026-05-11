import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, List, Grid, Filter, X, Search } from 'lucide-react'
import { ProductCard } from '../components/ui/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()
  
  // Filters state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  })
  
  const [view, setView] = useState('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const { products, isLoading } = useProducts(filters)

  // Sync state to URL when filters change (debounced for price would be ideal, but simple for now)
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Sync URL to state on mount/popstate
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    })
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', sortBy: 'newest' })
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen py-10">
      <div className="container">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] font-mono uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-navy)] font-semibold">Equipment</span>
          </div>
          <h1 className="font-heading text-4xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide">
            Marine Equipment
          </h1>
          <p className="text-[var(--color-muted)] mt-2">
            Browse our full catalog of certified maritime machinery and navigational instruments.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button 
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-outline btn-sm"
            >
              <Filter size={16} /> Filters
            </button>
            <span className="text-sm font-mono text-[var(--color-muted)]">
              {products.length} Results
            </span>
          </div>

          {/* Sidebar / Filters (Desktop & Mobile Drawer) */}
          <aside className={`
            lg:w-1/4 flex-shrink-0
            ${mobileFilterOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}
          `}>
             {mobileFilterOpen && (
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)]">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-[var(--color-muted)]">
                  <X size={24} />
                </button>
              </div>
            )}

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
                <h3 className="font-heading text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[var(--color-primary)]" /> Filters
                </h3>
                {Object.values(filters).some(v => v && v !== 'newest') && (
                  <button onClick={clearFilters} className="text-xs text-[var(--color-primary)] hover:underline font-mono uppercase">
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-mono text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => handleFilterChange('category', '')}
                      className="accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm group-hover:text-[var(--color-primary)] transition-colors">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        checked={filters.category === cat.slug}
                        onChange={() => handleFilterChange('category', cat.slug)}
                        className="accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm group-hover:text-[var(--color-primary)] transition-colors">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6 border-t border-[var(--color-border)] pt-5">
                <h4 className="font-mono text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-3">Price Range ($)</h4>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                  <span className="text-[var(--color-muted)]">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 flex items-center justify-between shadow-sm mb-6">
              <span className="hidden lg:inline-block font-mono text-sm text-[var(--color-muted)] ml-2">
                {isLoading ? 'Loading...' : `Showing ${products.length} products`}
              </span>
              
              <div className="flex items-center gap-4 ml-auto w-full lg:w-auto justify-between lg:justify-end">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-[var(--color-muted)] hidden sm:block">Sort:</label>
                  <select 
                    value={filters.sortBy}
                    onChange={e => handleFilterChange('sortBy', e.target.value)}
                    className="input py-1.5 pl-3 pr-8 text-sm w-auto rounded-lg font-mono uppercase bg-[var(--color-surface-2)] border-[var(--color-border)]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-[var(--color-border)] rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setView('grid')}
                    className={`p-2 transition-colors ${view === 'grid' ? 'bg-[var(--color-surface-2)] text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setView('list')}
                    className={`p-2 transition-colors border-l border-[var(--color-border)] ${view === 'list' ? 'bg-[var(--color-surface-2)] text-[var(--color-primary)]' : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="loader"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center text-[var(--color-muted)] mb-4">
                  <Search size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-2">No products found</h3>
                <p className="text-[var(--color-muted)] max-w-sm">
                  We couldn't find any products matching your current filters. Try adjusting your search criteria.
                </p>
                <button onClick={clearFilters} className="btn btn-outline mt-6">
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={view}
                className={
                  view === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {products.map((product, i) => (
                  view === 'grid' ? (
                    <ProductCard key={product.id} product={product} index={i} />
                  ) : (
                    /* Simple List View Card */
                    <Link key={product.id} to={`/products/${product.slug}`} className="flex flex-col sm:flex-row bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-[var(--color-primary)] transition-all group shadow-sm">
                      <div className="w-full sm:w-48 bg-[var(--color-surface-2)] flex-shrink-0">
                        <img src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="sku-tag mb-2 inline-block">{product.sku}</span>
                              <h3 className="font-heading font-bold text-xl text-[var(--color-navy)] group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h3>
                              <p className="text-sm text-[var(--color-muted)] mt-1">{product.category_name || product.categories?.name}</p>
                            </div>
                            <span className="price-tag text-2xl">${product.price?.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-[var(--color-text)] mt-3 line-clamp-2 opacity-80">{product.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </motion.div>
            )}

            {/* Pagination Placeholder */}
            {!isLoading && products.length > 0 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                  <button className="px-4 py-2 border-r border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] transition-colors font-mono text-sm uppercase">Prev</button>
                  <button className="px-4 py-2 bg-[var(--color-primary)] text-white font-mono text-sm">1</button>
                  <button className="px-4 py-2 border-x border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors font-mono text-sm">2</button>
                  <button className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors font-mono text-sm uppercase">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
