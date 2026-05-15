import { useState } from 'react'
import { Plus, Edit2, Trash2, Upload, Loader2 } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useToast } from '../../components/ui/Toast'

export default function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory, uploadCategoryImage, isLoading } = useCategories()
  const toast = useToast()
  
  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' })

  const generateSlug = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || cat.image_url || '' })
    setEditingId(cat.id)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setFormData({ name: '', slug: '', description: '', image: '' })
    setEditingId(null)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadCategoryImage(formData.slug || 'new', file)
      setFormData({ ...formData, image: url })
      toast.success('Image uploaded successfully')
    } catch(err) {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        image_url: formData.image
      }
      if (editingId) {
        await updateCategory(editingId, payload)
        toast.success('Category updated')
      } else {
        await createCategory(payload)
        toast.success('Category created')
      }
      handleCancel()
    } catch(err) {
      toast.error('Failed to save category')
    }
  }

  const handleDelete = async (id, name) => {
    if(!window.confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await deleteCategory(id)
      toast.success('Category deleted')
    } catch(err) {
      toast.error('Failed to delete. Ensure no products use this category.')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-[var(--color-border)] pb-4 gap-4">
        <h1 className="font-heading text-xl md:text-3xl font-bold uppercase text-[var(--color-navy)] tracking-wide">
          Categories
        </h1>
        {!isAdding && !editingId && (
          <button onClick={handleAdd} className="btn btn-primary btn-sm flex items-center justify-center gap-2">
            <Plus size={16} /> New Category
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
         <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm mb-6 animate-fade-up">
           <h2 className="font-heading uppercase font-bold text-lg text-[var(--color-navy)] mb-4">
             {editingId ? 'Edit Category' : 'Add Category'}
           </h2>
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="label">Name</label>
                   <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
                 </div>
                 <div>
                   <label className="label">Slug (URL)</label>
                   <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="input font-mono text-sm" placeholder="Auto-generated if empty" />
                 </div>
              </div>
              <div>
                 <label className="label">Description</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input" rows="2" />
              </div>
              <div>
                 <label className="label">Image URL or Upload</label>
                 <div className="flex items-center gap-2">
                   <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="input font-mono text-sm flex-1" placeholder="https://... or upload file" />
                   <div className="relative flex-shrink-0">
                     <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={uploading} />
                     <button type="button" disabled={uploading} className="btn btn-outline h-10 px-4 flex items-center justify-center gap-2 disabled:opacity-50 text-[var(--color-text)] hover:text-[var(--color-primary)] whitespace-nowrap">
                       {uploading ? <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" /> : <Upload size={16} />}
                       {uploading ? 'Uploading...' : 'Upload File'}
                     </button>
                   </div>
                 </div>
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="submit" className="btn btn-primary">Save Category</button>
                 <button type="button" onClick={handleCancel} className="btn btn-outline">Cancel</button>
              </div>
           </form>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {isLoading ? (
            <div className="loader mx-auto col-span-full mt-10"/>
         ) : categories.map(cat => (
           <div key={cat.id} className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm group">
             <div className="h-40 bg-[var(--color-surface-2)] overflow-hidden relative">
               <img src={cat.image || cat.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)] to-transparent opacity-80" />
               <h3 className="absolute bottom-4 left-4 right-4 font-heading text-xl font-bold uppercase text-white truncate">{cat.name}</h3>
             </div>
             <div className="p-4">
                <div className="font-mono text-xs text-[var(--color-muted)] mb-3 bg-[var(--color-surface-2)] inline-block px-2 py-0.5 rounded">/{cat.slug}</div>
                <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-4">{cat.description}</p>
                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
                   <button onClick={() => handleEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Edit">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  )
}
