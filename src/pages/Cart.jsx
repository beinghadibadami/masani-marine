import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartContext } from '../context/CartContext'

export default function Cart() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCartContext()
  const navigate = useNavigate()

  if (itemCount === 0) {
    return (
      <div className="bg-[var(--color-bg)] min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[var(--color-muted)] shadow-sm mb-6 border border-[var(--color-border)]">
          <ShoppingCart size={40} />
        </div>
        <h2 className="font-heading text-3xl font-extrabold uppercase text-[var(--color-navy)] mb-3">Your Cart is Empty</h2>
        <p className="text-[var(--color-muted)] max-w-md mx-auto mb-8">
          Looks like you haven't added any equipment to your cart yet. Browse our catalog to find what you need.
        </p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    )
  }

  const shippingEstimate = subtotal > 10000 ? 0 : 150 // Free shipping over 10k
  const total = subtotal + shippingEstimate

  return (
    <div className="bg-[var(--color-bg)] min-h-screen py-10">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-4xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide flex items-center gap-3">
            <ShoppingCart size={28} className="text-[var(--color-primary)]" /> Your Cart
            <span className="text-xl font-mono text-[var(--color-muted)] ml-2">({itemCount} items)</span>
          </h1>
          <button onClick={clearCart} className="text-sm font-mono text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-1 transition-colors">
            <Trash2 size={14}/> Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Cart Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-[var(--color-border)] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm"
                >
                  <Link to={`/products/${item.slug}`} className="w-24 h-24 flex-shrink-0 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] overflow-hidden">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0 w-full">
                    <Link to={`/products/${item.slug}`} className="font-heading font-bold text-lg text-[var(--color-navy)] uppercase hover:text-[var(--color-primary)] transition-colors truncate block">
                      {item.name}
                    </Link>
                    <div className="text-xs font-mono text-[var(--color-muted)] mt-1 mb-3">SKU: {item.sku}</div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-md h-9">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] h-full"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] h-full"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="price-tag text-xl">${(item.price * item.quantity).toLocaleString()}</span>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-heading text-2xl font-bold text-[var(--color-navy)] uppercase border-b border-[var(--color-border)] pb-4 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 font-mono text-sm">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-text)]">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Shipping Estimate</span>
                  <span className="text-[var(--color-text)]">{shippingEstimate === 0 ? 'Free' : `$${shippingEstimate}`}</span>
                </div>
                {shippingEstimate > 0 && (
                  <div className="text-xs text-emerald-600 mt-1">
                    Add ${(10000 - subtotal).toLocaleString()} more for free shipping!
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--color-border)] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-lg uppercase text-[var(--color-navy)] font-bold">Total</span>
                  <span className="price-tag text-3xl text-[var(--color-primary)]">${total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full flex justify-center py-3 text-lg mb-4"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--color-muted)] mt-4">
                <Shield size={14} className="text-emerald-500" /> Secure Checkout Process
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
