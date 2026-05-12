import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, PackageOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'

export default function Dashboard() {
  const { orders } = useOrders()
  const { products } = useProducts()
  
  // Quick stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length
  const lowStockCount = products.filter(p => p.stockQuantity <= 3).length

  // Mock chart data (in real app, group by date from orders)
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 6780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ]

  return (
    <div>
      <h1 className="font-heading text-xl md:text-3xl font-bold uppercase text-[var(--color-navy)] mb-6 tracking-wide border-b border-[var(--color-border)] pb-2">
        Admin Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[var(--color-muted)] text-sm font-mono uppercase font-bold tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign size={20}/></div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-[var(--color-navy)]">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[var(--color-muted)] text-sm font-mono uppercase font-bold tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={20}/></div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-[var(--color-navy)]">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[var(--color-muted)] text-sm font-mono uppercase font-bold tracking-wider">Pending Orders</span>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={20}/></div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-[var(--color-navy)]">{pendingOrdersCount}</div>
        </div>
        <div className="stat-card">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[var(--color-muted)] text-sm font-mono uppercase font-bold tracking-wider">Low Stock Items</span>
            <div className="p-2 bg-red-100 text-red-600 rounded-lg"><PackageOpen size={20}/></div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-[var(--color-navy)]">{lowStockCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="font-heading font-bold text-lg uppercase text-[var(--color-navy)] mb-6 flex items-center justify-between">
            Weekly Sales Overview
          </h2>
          <div className="h-52 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EDF4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5A7A8A', fontFamily: 'Inter' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#5A7A8A', fontFamily: 'Inter' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,119,168,0.05)'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontFamily: 'Inter', fontSize: '13px', fontWeight: 600 }} 
                />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg uppercase text-[var(--color-navy)]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-mono uppercase text-[var(--color-primary)] hover:underline flex items-center gap-1">View All <ArrowRight size={12}/></Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {orders.slice(0,5).map(o => (
              <div key={o.id} className="p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-sm font-bold text-[var(--color-navy)]">{o.id.slice(0,8).toUpperCase()}</span>
                  <span className={`badge ${
                     o.status === 'delivered' ? 'badge-success' : 
                     o.status === 'pending' ? 'badge-warning' : 'badge-info'
                   }`} style={{ zoom: 0.8 }}>{o.status}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-[var(--color-muted)]">{new Date(o.created_at).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-[var(--color-primary)]">${o.total?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
