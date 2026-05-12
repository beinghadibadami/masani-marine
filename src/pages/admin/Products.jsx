import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useToast } from '../../components/ui/Toast'

export default function Products() {
  const { products, deleteProduct, updateProduct, isLoading } = useProducts()
  const toast = useToast()
  
  const [deletingId, setDeletingId] = useState(null)

  const toggleVisibility = async (product) => {
    try {
      await updateProduct(product.id, { is_visible: !product.is_visible })
      toast.success(`${product.name} is now ${!product.is_visible ? 'visible' : 'hidden'}.`)
    } catch(err) {
      toast.error('Failed to update visibility.')
    }
  }

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete ${name}?`)) return
    setDeletingId(id)
    try {
      await deleteProduct(id)
      toast.success('Product deleted.')
    } catch(err) {
      toast.error('Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[var(--color-border)] pb-4 gap-4">
        <h1 className="font-heading text-xl md:text-3xl font-bold uppercase text-[var(--color-navy)] tracking-wide">
          Inventory
        </h1>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm block text-center">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-10"><div className="loader"/></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-16">Image</th>
                  <th>Product Name & SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th className="text-center">Visible</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="w-10 h-10 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden">
                        <img src={p.images?.[0] || 'https://picsum.photos/40/40'} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-[var(--color-navy)] hover:text-[var(--color-primary)] truncate max-w-[200px] cursor-pointer" title={p.name}>
                        {p.name}
                      </div>
                      <div className="font-mono text-[10px] uppercase text-[var(--color-muted)] mt-0.5">{p.sku}</div>
                    </td>
                    <td className="text-[var(--color-muted)]">{p.categories?.name || p.category_name}</td>
                    <td className="font-mono font-semibold">${p.price?.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${p.stockQuantity <= 0 ? 'badge-error' : p.stockQuantity <= 3 ? 'badge-warning' : 'badge-navy'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => toggleVisibility(p)} 
                        className={`p-1.5 rounded-full inline-flex transition-colors ${p.is_visible ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {p.is_visible ? <Eye size={16}/> : <EyeOff size={16}/>}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${p.slug}/edit`} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          {deletingId === p.id ? <div className="loader" style={{width:16,height:16,borderWidth:2}}/> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
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
