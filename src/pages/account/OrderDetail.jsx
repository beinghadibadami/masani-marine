import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Truck, Check, Package, Info } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'

export default function OrderDetail() {
  const { id } = useParams()
  const { getOrderById } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(id).then(data => {
      // Mock tracking timeline if missing from real DB (for visuals)
      if (!data.timeline) {
        data.timeline = [
          { label: 'Order Placed', date: data.created_at, done: true },
          { label: 'Processing', date: data.status !== 'pending' ? data.created_at : null, done: data.status !== 'pending' },
          { label: 'Shipped', date: data.status === 'shipped' || data.status === 'delivered' ? new Date().toISOString() : null, done: data.status === 'shipped' || data.status === 'delivered' },
          { label: 'Delivered', date: data.status === 'delivered' ? new Date().toISOString() : null, done: data.status === 'delivered' },
        ]
      }
      setOrder(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="p-10 flex justify-center"><div className="loader"/></div>
  if (!order) return <div className="p-10 text-center">Order not found</div>

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div className="flex items-center gap-3">
          <Link to="/account/orders" className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
            <ArrowLeft size={16} />
          </Link>
          <h2 className="font-heading text-xl md:text-2xl font-bold uppercase text-[var(--color-navy)]">
             Order <span className="text-[var(--color-primary)]">#{order.id.slice(0, 13).toUpperCase()}</span>
          </h2>
        </div>
        <span className={`badge ${
           order.status === 'delivered' ? 'badge-success' : 
           order.status === 'shipped' ? 'badge-info' : 
           order.status === 'pending' ? 'badge-warning' : 'badge-navy'
         }`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main tracking + items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline Tracking */}
          <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-6">
            <div className="font-heading font-bold uppercase text-[var(--color-navy)] mb-6 flex items-center gap-2">
              <Truck size={18} className="text-[var(--color-primary)]" /> Shipping Status
            </div>

            {order.tracking_number && (
              <div className="mb-6 bg-white p-3 rounded-lg border border-[var(--color-border)] inline-block">
                <span className="text-xs text-[var(--color-muted)] font-mono uppercase tracking-wider block mb-1">Tracking Number</span>
                <span className="font-mono font-bold text-[var(--color-navy)]">{order.tracking_number}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-[var(--color-border)] ml-3">
              {order.timeline?.map((step, i) => (
                 <div key={i} className="relative">
                   <div className={`absolute -left-[23px] top-1 w-5 h-5 rounded-full border-[3px] border-[var(--color-surface-2)] shadow-sm flex items-center justify-center ${step.done ? 'bg-emerald-500 text-white' : 'bg-gray-300'}`}>
                     {step.done && <Check size={10} />}
                   </div>
                   <div className="pl-3">
                     <div className={`text-sm font-semibold text-uppercase tracking-wider ${step.done ? 'text-[var(--color-navy)]' : 'text-[var(--color-muted)]'}`}>
                       {step.label}
                     </div>
                     {step.date && <div className="text-xs text-[var(--color-muted)] font-mono">{new Date(step.date).toLocaleString()}</div>}
                   </div>
                 </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] font-heading font-bold uppercase text-[var(--color-navy)] flex items-center gap-2">
               <Package size={18} className="text-[var(--color-primary)]"/> Purchased Items
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {order.order_items?.map(item => (
                <div key={item.id} className="p-4 flex gap-4 text-sm sm:items-center">
                   <img src={item.products?.images?.[0] || 'https://picsum.photos/60/60'} className="w-16 h-16 rounded border border-[var(--color-border)] object-cover bg-white"/>
                   <div className="flex-1 min-w-0">
                     <Link to={`/products/${item.products?.slug}`} className="font-bold text-[var(--color-navy)] hover:text-[var(--color-primary)] block truncate">
                       {item.products?.name}
                     </Link>
                     <div className="font-mono text-xs text-[var(--color-muted)] mt-1">SKU: {item.products?.sku}</div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <span className="font-mono text-[var(--color-navy)]">${item.unit_price?.toLocaleString()}</span>
                     <span className="text-[var(--color-muted)] text-xs mt-1">Qty: {item.quantity}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
            <h3 className="font-heading font-bold uppercase text-[var(--color-navy)] border-b border-[var(--color-border)] pb-3 mb-4 flex items-center gap-2">
               <MapPin size={16} className="text-[var(--color-primary)]"/> Shipping Info
            </h3>
            {order.shipping_address ? (
               <div className="text-sm text-[var(--color-text)] space-y-1">
                 <div className="font-semibold text-black">{order.shipping_address.name}</div>
                 <div>{order.shipping_address.line1}</div>
                 {order.shipping_address.line2 && <div>{order.shipping_address.line2}</div>}
                 <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</div>
                 <div className="font-mono text-xs mt-2 text-[var(--color-muted)]">{order.shipping_address.country}</div>
               </div>
            ) : (
               <div className="text-sm text-gray-500">Address not documented</div>
            )}
          </div>

          <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
            <h3 className="font-heading font-bold uppercase text-[var(--color-navy)] border-b border-[var(--color-border)] pb-3 mb-4">
               Summary
            </h3>
            <div className="space-y-2 text-sm font-mono mb-4">
               <div className="flex justify-between text-[var(--color-muted)]">
                 <span>Subtotal</span>
                 <span className="text-[var(--color-text)]">${order.subtotal?.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-[var(--color-muted)]">
                 <span>Shipping</span>
                 <span className="text-[var(--color-text)]">${(order.total - order.subtotal)?.toLocaleString() || '0'}</span>
               </div>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 items-center">
               <span className="font-heading uppercase font-bold text-[var(--color-navy)]">Total</span>
               <span className="text-[var(--color-primary)] font-bold text-xl">${order.total?.toLocaleString()}</span>
            </div>
            {order.paypal_order_id && (
              <div className="mt-4 pt-3 flex items-start gap-2 text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] border-dashed">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <span>Paid via PayPal / Card.<br/><span className="font-mono opacity-80">{order.paypal_order_id}</span></span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
