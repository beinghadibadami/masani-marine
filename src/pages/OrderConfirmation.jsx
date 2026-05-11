import { useEffect, useState } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOrders } from '../hooks/useOrders'

export default function OrderConfirmation() {
  const location = useLocation()
  const { getOrderById } = useOrders()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const orderId = location.state?.orderId

  useEffect(() => {
    if (!orderId) return
    getOrderById(orderId)
      .then(data => setOrder(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [orderId])

  if (!orderId) return <Navigate to="/" replace />

  return (
    <div className="bg-[var(--color-bg)] min-h-[85vh] py-16 flex items-center justify-center relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{ 
        backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
        backgroundSize: '40px 40px' 
      }} />

      <div className="container relative z-10 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden text-center p-10 md:p-14 line-glow"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={50} />
          </motion.div>
          
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[var(--color-navy)] uppercase tracking-tight mb-4">
            Order Confirmed!
          </h1>
          <p className="text-[var(--color-muted)] text-lg max-w-lg mx-auto mb-8">
            Thank you for your purchase. We've received your order and are currently processing it for shipment.
          </p>

          {isLoading ? (
            <div className="loader my-8" />
          ) : order ? (
             <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-6 mb-10 mx-auto max-w-md text-left">
              <div className="flex justify-between border-b border-[var(--color-border)] pb-3 mb-3">
                <span className="text-[var(--color-muted)] text-sm">Order Number</span>
                <span className="font-mono text-[var(--color-navy)] font-bold">{order.id.slice(0, 13).toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border)] pb-3 mb-3">
                <span className="text-[var(--color-muted)] text-sm">Date</span>
                <span className="text-[var(--color-text)] text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--color-border)] pb-3 mb-3">
                <span className="text-[var(--color-muted)] text-sm">Amount Paid</span>
                <span className="text-[var(--color-primary)] font-bold">${order.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)] text-sm">Est. Delivery</span>
                <span className="text-[var(--color-text)] font-semibold text-sm">3-5 Business Days</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/account/orders" className="btn btn-primary btn-lg w-full sm:w-auto">
              <Truck size={18} /> Track Order
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg w-full sm:w-auto">
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>

          <p className="text-[var(--color-muted)] text-sm mt-10">
            A confirmation email has been sent to your registered email address.
          </p>

        </motion.div>
      </div>
    </div>
  )
}
