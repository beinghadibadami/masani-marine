import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { useCartContext } from '../../context/CartContext'
import { useToast } from './Toast'

export function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartContext()
  const toast = useToast()

  const image = product.images?.[0] || `https://picsum.photos/seed/${product.id}/400/300`

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link to={`/products/${product.slug}`} className="product-card block group">
        {/* Image */}
        <div className="relative overflow-hidden bg-[var(--color-surface-2)]" style={{ aspectRatio: '4/3' }}>
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-[var(--color-navy)]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-white text-[var(--color-navy)] px-4 py-2 rounded-lg font-heading font-bold text-sm uppercase tracking-wide hover:bg-[var(--color-primary)] hover:text-white transition-all flex items-center gap-2 shadow-xl"
            >
              <ShoppingCart size={15} /> Add to Cart
            </button>
          </div>
          {/* Stock badge */}
          {product.stockQuantity === 0 ? (
            <span className="absolute top-3 left-3 badge badge-error">Out of Stock</span>
          ) : product.stockQuantity <= 3 ? (
            <span className="absolute top-3 left-3 badge badge-warning">Low Stock</span>
          ) : null}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <span className="sku-tag mb-1.5 inline-block">{product.sku}</span>
              <h3 className="font-heading font-bold text-base text-[var(--color-navy)] leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </div>
          </div>
          <div className="text-xs text-[var(--color-muted)] mb-3">
            {product.category_name || product.categories?.name}
          </div>
          <div className="flex items-center justify-between">
            <span className="price-tag text-xl">${product.price?.toLocaleString()}</span>
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="btn btn-primary btn-sm py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
