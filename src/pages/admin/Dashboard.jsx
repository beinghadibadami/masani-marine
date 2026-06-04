import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingBag, PackageOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'

export default function Dashboard() {
  const { orders, isLoading: isLoadingOrders } = useOrders()
  const { products, isLoading: isLoadingProducts } = useProducts()

  if (isLoadingOrders || isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[400px] flex-col gap-3">
        <div className="w-10 h-10 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-sm font-mono uppercase text-[var(--color-muted)]">Loading dashboard data...</p>
      </div>
    )
  }
  
  // Quick stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length
  const lowStockCount = products.filter(p => (p.stock !== undefined ? p.stock : 0) <= 3).length

  // Dynamically calculate weekly sales overview (last 7 days ending today)
  const getWeeklySales = (ordersList) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const last7Days = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      last7Days.push({
        dateString: d.toDateString(),
        dayName: days[d.getDay()],
        sales: 0
      })
    }

    ordersList.forEach(order => {
      if (!order.created_at) return
      const orderDate = new Date(order.created_at)
      orderDate.setHours(0, 0, 0, 0)
      const orderDateStr = orderDate.toDateString()

      const dayObj = last7Days.find(day => day.dateString === orderDateStr)
      if (dayObj) {
        dayObj.sales += Number(order.total) || 0
      }
    })

    return last7Days.map(day => ({
      name: day.dayName,
      sales: day.sales
    }))
  }

  const chartData = getWeeklySales(orders)

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
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
