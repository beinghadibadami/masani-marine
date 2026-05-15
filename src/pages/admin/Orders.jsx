import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Eye, Filter } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { useToast } from '../../components/ui/Toast'
import { sendOrderEmail } from '../../lib/email'

export default function Orders() {
  const { orders, isLoading, updateOrderStatus } = useOrders()
  const toast = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trackingModal, setTrackingModal] = useState(null) // { order, newStatus }

  const filteredOrders = orders.filter(o => 
    (statusFilter === 'all' || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === 'shipped') {
      setTrackingModal({ order, newStatus })
      return
    }

    await executeStatusUpdate(order, newStatus, null)
  }

  const executeStatusUpdate = async (order, newStatus, trackingNumber) => {

    try {
      await updateOrderStatus(order.id, newStatus, trackingNumber);
      
      // Update order object for email template
      const updatedOrder = { ...order, status: newStatus, tracking_number: trackingNumber };
      
      // Send notification based on new status
      if (newStatus === 'shipped' || newStatus === 'delivered') {
        await sendOrderEmail(updatedOrder, newStatus);
      }
      
      toast.success('Order status updated');
    } catch(err) {
      toast.error('Failed to update status');
    } finally {
      setTrackingModal(null)
    }
  }

  return (
    <div>
      <div className="mb-6 border-b border-[var(--color-border)] pb-4">
        <h1 className="font-heading text-xl md:text-3xl font-bold uppercase text-[var(--color-navy)] tracking-wide">
          Manage Orders
        </h1>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm mb-6 p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input pl-10" 
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-[var(--color-muted)] hidden md:block" />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-full md:w-48 uppercase font-mono text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10"><div className="loader" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status Workflow</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredOrders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono font-bold text-[var(--color-primary)]">
                       {o.id.slice(0,18).toUpperCase()}
                    </td>
                    <td className="text-[var(--color-muted)]">
                       {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div className="font-semibold text-[var(--color-navy)]">{o.shipping_address?.name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--color-muted)]">{o.shipping_address?.country || ''}</div>
                    </td>
                    <td className="font-mono font-bold">${o.total?.toLocaleString()}</td>
                    <td>
                      <select 
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className={`text-xs font-bold uppercase rounded px-2 py-1 border-0 focus:ring-0 cursor-pointer ${
                          o.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                          o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                          o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {o.tracking_number && (
                        <div className="text-[10px] font-mono mt-1 text-[var(--color-muted)]">
                          Track: {o.tracking_number}
                        </div>
                      )}
                    </td>
                    <td className="text-right">
                      <Link to={`/account/orders/${o.id}`} className="p-1.5 inline-flex text-blue-500 hover:bg-blue-50 rounded transition-colors" title="View details">
                         <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 font-mono text-[var(--color-muted)]">No orders match filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tracking Number Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-up">
            <div className="bg-[var(--color-navy)] text-white px-6 py-4">
              <h3 className="font-heading font-bold uppercase text-lg">Enter Tracking Number</h3>
              <p className="text-xs opacity-80 mt-1 font-mono">Order: {trackingModal.order.id.slice(0,8).toUpperCase()}</p>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.target)
                const trackingNum = fd.get('trackingNumber').trim()
                if (!trackingNum) return toast.error('Tracking number is required')
                executeStatusUpdate(trackingModal.order, trackingModal.newStatus, trackingNum)
              }} 
              className="p-6"
            >
              <div className="mb-6">
                <label className="label">Tracking Number (Required)</label>
                <input 
                  type="text" 
                  name="trackingNumber" 
                  required
                  autoFocus
                  defaultValue={trackingModal.order.tracking_number || ''}
                  className="input font-mono uppercase" 
                  placeholder="e.g. 1Z9999999999999999"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setTrackingModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
