import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // In a real app we'd fetch full profile details and run a count aggregation.
      // For this simplified version we'll just fetch all profiles.
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setCustomers(data || [])
      setIsLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-6 border-b border-[var(--color-border)] pb-4">
        <h1 className="font-heading text-3xl font-bold uppercase text-[var(--color-navy)] tracking-wide">
          Customers
        </h1>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-10"><div className="loader" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                 {customers.map(c => (
                   <tr key={c.id}>
                     <td>
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                           {c.full_name?.[0] || c.email?.[0]}
                         </div>
                         <div>
                           <div className="font-bold text-[var(--color-navy)]">{c.full_name || 'No Name Provided'}</div>
                           <div className="font-mono text-xs text-[var(--color-muted)]">{c.email}</div>
                         </div>
                       </div>
                     </td>
                     <td>
                        <span className={`badge ${c.role === 'admin' ? 'badge-primary' : 'badge-navy'}`}>{c.role}</span>
                     </td>
                     <td className="text-[var(--color-muted)]">{new Date(c.created_at).toLocaleDateString()}</td>
                     <td className="font-mono text-xs">{c.phone || '-'}</td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
