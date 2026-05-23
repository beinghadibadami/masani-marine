import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { useToast } from '../../components/ui/Toast'
import { validateSku, validateSlug } from '../../lib/validation'

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = !!id // For this build, using slug in URL but mapping to 'id' param conventionally
  const navigate = useNavigate()
  const toast = useToast()
  
  const { createProduct, updateProduct, getProductBySlug, uploadProductImage } = useProducts()
  const { categories } = useCategories()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  
  const [formData, setFormData] = useState({
    name: '', slug: '', sku: '', category_id: '',
    price: 0, shipping_cost: 0, stock_quantity: 0, description: '', is_visible: true,
  })
  
  // Dynamic specs dictionary
  const [specs, setSpecs] = useState([{ key: '', value: '' }])
  const [imageUrls, setImageUrls] = useState([''])
  const [prodId, setProdId] = useState(null) // Real DB ID if editing
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null)

  useEffect(() => {
    if (isEdit) {
      getProductBySlug(id).then(data => {
        setProdId(data.id)
        setFormData({
          name: data.name, slug: data.slug, sku: data.sku, 
          category_id: data.category_id || '', price: data.price, 
          shipping_cost: data.shipping_cost || 0,
          stock_quantity: data.stock_quantity || data.stockQuantity || 0,
          description: data.description || '', is_visible: data.is_visible
        })
        
        // Parse specs
        const parsedSpecs = typeof data.specifications === 'string' 
          ? JSON.parse(data.specifications || '{}') 
          : (data.specifications || {})
        const specArray = Object.entries(parsedSpecs).map(([k,v]) => ({key:k, value:v}))
        setSpecs(specArray.length ? specArray : [{key:'', value:''}])
        
        setImageUrls(data.images?.length ? data.images : [''])
        setLoading(false)
      }).catch(err => {
        toast.error('Product not found')
        navigate('/admin/products')
      })
    }
  }, [id, isEdit])

  const generateSlug = (text) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      let finalValue = type === 'checkbox' ? checked : value
      if (name === 'sku') {
        finalValue = String(finalValue).toUpperCase().trim()
      }
      
      const updates = { ...prev, [name]: finalValue }
      if (name === 'name' && !isEdit) updates.slug = generateSlug(value)
      return updates
    })

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  // Specs handling
  const updateSpec = (index, field, value) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }])
  const removeSpec = (i) => setSpecs(specs.filter((_, idx) => idx !== i))

  // Image handling
  const updateImage = (index, value) => {
    const newImgs = [...imageUrls]
    newImgs[index] = value
    setImageUrls(newImgs)
  }
  
  const handleImageUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImageIndex(index)
    try {
      const url = await uploadProductImage(formData.slug || 'new', file)
      updateImage(index, url)
      toast.success('Image uploaded successfully')
    } catch(err) {
      console.error('Image Upload Catch Error:', err)
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setUploadingImageIndex(null)
    }
  }

  const addImage = () => setImageUrls([...imageUrls, ''])
  const removeImage = (i) => setImageUrls(imageUrls.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    const errs = {}
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Product name must be at least 3 characters.'
    }
    if (!formData.sku || !validateSku(formData.sku)) {
      errs.sku = 'SKU must be alphanumeric/hyphens (min 4 characters).'
    }
    if (!formData.slug || !validateSlug(formData.slug)) {
      errs.slug = 'Slug must be valid URL-safe lowercase (e.g. garmin-fantom-54).'
    }
    const priceVal = parseFloat(formData.price)
    if (isNaN(priceVal) || priceVal <= 0) {
      errs.price = 'Price must be greater than 0.'
    }
    const shippingVal = parseFloat(formData.shipping_cost || 0)
    if (isNaN(shippingVal) || shippingVal < 0) {
      errs.shipping_cost = 'Shipping cost must be greater than or equal to 0.'
    }
    const stockVal = parseInt(formData.stock_quantity || 0)
    if (isNaN(stockVal) || stockVal < 0) {
      errs.stock_quantity = 'Stock quantity must be greater than or equal to 0.'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please correct the errors in the product form.')
      return
    }

    setErrors({})
    setSaving(true)
    
    // Format specs 
    const specObj = {}
    specs.forEach(s => { if(s.key.trim() && s.value.trim()) specObj[s.key] = s.value })

    const payload = {
      ...formData,
      category_id: formData.category_id || null, // Ensure null if empty
      specifications: specObj,
      images: imageUrls.filter(url => url.trim()),
      stock_quantity: parseInt(formData.stock_quantity),
      price: parseFloat(formData.price),
      shipping_cost: parseFloat(formData.shipping_cost || 0)
    }

    try {
      if (isEdit) {
        await updateProduct(prodId, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }
      navigate('/admin/products')
    } catch(err) {
      toast.error(err.message || 'Failed to save product')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-10 flex justify-center"><div className="loader"/></div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)]">
          {isEdit ? `Edit: ${formData.name}` : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Info */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <h2 className="font-heading uppercase font-bold text-lg text-[var(--color-navy)] mb-4 border-b border-[var(--color-border)] pb-2">Core Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="label">Product Name *</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className={`input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="input border-[var(--color-border)]">
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">SKU *</label>
              <input 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                className={`input font-mono uppercase ${errors.sku ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
              />
              {errors.sku && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.sku}</p>}
            </div>
            <div>
              <label className="label">URL Slug *</label>
              <input 
                name="slug" 
                value={formData.slug} 
                onChange={handleChange} 
                className={`input text-sm ${errors.slug ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
              />
              {errors.slug && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.slug}</p>}
            </div>
            <div>
              <label className="label">Price (USD) *</label>
              <input 
                type="number" 
                step="0.01" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                className={`input font-mono font-bold ${errors.price ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-500' : 'border-[var(--color-border)] text-[var(--color-primary)]'}`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.price}</p>}
            </div>
            <div>
              <label className="label">Shipping Cost (USD)</label>
              <input 
                type="number" 
                step="0.01" 
                name="shipping_cost" 
                value={formData.shipping_cost} 
                onChange={handleChange} 
                className={`input font-mono ${errors.shipping_cost ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-500' : 'border-[var(--color-border)] text-[var(--color-primary)]'}`}
              />
              {errors.shipping_cost && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.shipping_cost}</p>}
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input 
                type="number" 
                name="stock_quantity" 
                value={formData.stock_quantity} 
                onChange={handleChange} 
                className={`input ${errors.stock_quantity ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
              />
              {errors.stock_quantity && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.stock_quantity}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="label">Description</label>
            <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="input resize-y" />
          </div>

          <div>
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="checkbox" name="is_visible" checked={formData.is_visible} onChange={handleChange} className="w-4 h-4 accent-emerald-500" />
               <span className="text-sm font-semibold">Make Product Visible in Store</span>
             </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-4">
             <h2 className="font-heading uppercase font-bold text-lg text-[var(--color-navy)]">Technical Specifications</h2>
             <button type="button" onClick={addSpec} className="btn btn-outline py-1 px-3 text-xs flex gap-1"><Plus size={14}/> Add Row</button>
          </div>
          <div className="space-y-3">
             {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-3">
                   <input placeholder="Attribute (e.g. Dimensions)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="input flex-1" />
                   <input placeholder="Value (e.g. 10x20x30)" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="input flex-1 font-mono" />
                   <button type="button" onClick={() => removeSpec(i)} disabled={specs.length===1} className="w-10 flex-shrink-0 flex items-center justify-center text-red-400 hover:text-red-500 disabled:opacity-50">
                     <Trash2 size={16} />
                   </button>
                </div>
             ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-4">
             <h2 className="font-heading uppercase font-bold text-lg text-[var(--color-navy)] flex items-center gap-2"><ImageIcon size={18}/> Image URLs</h2>
             <button type="button" onClick={addImage} className="btn btn-outline py-1 px-3 text-xs flex gap-1"><Plus size={14}/> Add Image</button>
          </div>
          <p className="text-xs text-[var(--color-muted)] mb-3">Since cloud storage isn't fully wired, you can paste external image URLs here.</p>
           <div className="space-y-3">
             {imageUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-10 h-10 border border-[var(--color-border)] rounded overflow-hidden flex-shrink-0 bg-[var(--color-surface-2)]">
                     {url && <img src={url} className="w-full h-full object-cover"/>}
                   </div>
                   <input placeholder="https://... or upload file" value={url} onChange={e => updateImage(i, e.target.value)} className="input flex-1 font-mono text-sm" />
                   
                   <div className="relative flex-shrink-0">
                     <input type="file" accept="image/*" onChange={(e) => handleImageUpload(i, e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={uploadingImageIndex !== null} />
                     <button type="button" disabled={uploadingImageIndex !== null} className="btn btn-outline h-10 px-4 flex items-center justify-center gap-2 disabled:opacity-50 text-[var(--color-text)] hover:text-[var(--color-primary)] whitespace-nowrap">
                       {uploadingImageIndex === i ? <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" /> : <Upload size={16} />}
                       {uploadingImageIndex === i ? 'Uploading...' : 'Upload File'}
                     </button>
                   </div>

                   <button type="button" onClick={() => removeImage(i)} disabled={imageUrls.length===1} className="w-10 flex-shrink-0 flex items-center justify-center text-red-400 hover:text-red-500 disabled:opacity-50">
                     <Trash2 size={16} />
                   </button>
                </div>
             ))}
           </div>
        </div>

        {/* Submit */}
        <div className="sticky bottom-4 z-10 bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-xl flex items-center justify-between">
           <span className="text-sm font-mono text-[var(--color-muted)]">Unsaved changes</span>
           <div className="flex gap-3">
             <Link to="/admin/products" className="btn btn-outline">Cancel</Link>
             <button type="submit" disabled={saving} className="btn btn-primary flex gap-2">
               {saving ? <div className="loader" style={{borderWidth:2,width:20,height:20}}/> : <Save size={18} />}
               Save Product
             </button>
           </div>
        </div>

      </form>
    </div>
  )
}
