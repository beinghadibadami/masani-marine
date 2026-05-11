import { Link } from 'react-router-dom'
import { Package, Truck, FileText, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useOrders } from '../../hooks/useOrders'

export default function Overview() {
  const { profile } = useAuth()
  const { orders, isLoading } = useOrders()

  const recentOrders = orders?.slice(0, 3) || []

  return (
    <div className="p-6 md:p-8">
      <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)] mb-6">Account Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm text-[var(--color-primary)]">
             <Package size={20} />
           </div>
           <div className="text-sm text-[var(--color-muted)] mb-1 font-mono uppercase tracking-wider">Total Orders</div>
           <div className="text-2xl font-bold text-[var(--color-navy)]">{orders.length}</div>
        </div>
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm text-amber-500">
             <Truck size={20} />
           </div>
           <div className="text-sm text-[var(--color-muted)] mb-1 font-mono uppercase tracking-wider">In Transit</div>
           <div className="text-2xl font-bold text-[var(--color-navy)]">
             {orders.filter(o => o.status === 'shipped').length}
           </div>
        </div>
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-5">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm text-emerald-500">
             <FileText size={20} />
           </div>
           <div className="text-sm text-[var(--color-muted)] mb-1 font-mono uppercase tracking-wider">Member Since</div>
           <div className="text-lg font-bold text-[var(--color-navy)]">
             {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, {month:'short', year:'numeric'}) : '-'}
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading text-lg font-bold uppercase text-[var(--color-navy)] border-b-2 border-[var(--color-primary)] pb-1 inline-block">Recent Orders</h3>
        <Link to="/account/orders" className="text-sm text-[var(--color-primary)] hover:underline font-semibold flex items-center gap-1">
          View All <ArrowRight size={14}/>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center"><div className="loader"/></div>
      ) : recentOrders.length > 0 ? (
        <div className="space-y-4">
          {recentOrders.map(order => (
            <Link key={order.id} to={`/account/orders/${order.id}`} className="block bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary)] transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                   <div className="font-mono text-sm text-[var(--color-primary)] font-bold mb-1">{order.id.slice(0,18).toUpperCase()}</div>
                   <div className="text-xs text-[var(--color-muted)]">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <div className="flex -space-x-2 mr-2">
                     {order.order_items.map((item, i) => i < 3 ? (
                        <div key={i} className="w-8 h-8 rounded border border-white bg-white overflow-hidden shadow-sm">
                          <img src={item.products?.images?.[0] || 'https://picsum.photos/40/40'} className="w-full h-full object-cover"/>
                        </div>
                     ) : null)}
                     {order.order_items.length > 3 && (
                       <div className="w-8 h-8 rounded border border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                         +{order.order_items.length - 3}
                       </div>
                     )}
                   </div>
                   <div className="text-right flex-1 sm:flex-none">
                     <span className={`badge ${
                       order.status === 'delivered' ? 'badge-success' : 
                       order.status === 'shipped' ? 'badge-info' : 
                       order.status === 'pending' ? 'badge-warning' : 'badge-navy'
                     }`}>{order.status}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[var(--color-surface-2)]/50 rounded-lg border border-[var(--color-border)] border-dashed">
          <p className="text-[var(--color-muted)] text-sm mb-4">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-outline btn-sm">Start Shopping</Link>
        </div>
      )}
    </div>
  )
}
