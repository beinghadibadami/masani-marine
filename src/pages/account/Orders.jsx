import { Link } from 'react-router-dom'
import { Eye, Clock } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'

export default function Orders() {
  const { orders, isLoading } = useOrders()

  if (isLoading) {
    return <div className="p-10 flex justify-center"><div className="loader"/></div>
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)] mb-6">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center text-[var(--color-muted)] mx-auto mb-4">
            <Clock size={28} />
          </div>
          <h3 className="font-heading text-xl uppercase font-bold text-[var(--color-navy)] mb-2">No Orders Found</h3>
          <p className="text-[var(--color-muted)] mb-6">You have no order history in your account.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="font-mono font-semibold text-[var(--color-primary)]">
                    {order.id.slice(0, 13).toUpperCase()}
                  </td>
                  <td className="text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                       order.status === 'delivered' ? 'badge-success' : 
                       order.status === 'shipped' ? 'badge-info' : 
                       order.status === 'pending' ? 'badge-warning' : 'badge-navy'
                     }`}>{order.status}</span>
                  </td>
                  <td className="font-mono font-bold text-[var(--color-navy)]">${order.total?.toLocaleString()}</td>
                  <td className="text-right">
                    <Link to={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)] text-sm font-semibold transition-colors">
                      <Eye size={16} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
