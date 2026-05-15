import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Check, Info, FileText, Truck, ChevronRight, ShieldCheck, ChevronLeft, Minus, Plus } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCartContext } from '../context/CartContext'
import { useToast } from '../components/ui/Toast'
import { ProductCard } from '../components/ui/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getProductBySlug, getProductsByCategory } = useProducts()
  const { addItem, items: cartItems, updateQuantity } = useCartContext()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const prod = await getProductBySlug(slug)
        setProduct(prod)
        setActiveImage(0)
        setQuantity(1)
        
        // Load related
        if (prod?.categories?.slug) {
          const related = await getProductsByCategory(prod.categories.slug, 5)
          setRelatedProducts(related.filter(r => r.id !== prod.id).slice(0, 4))
        }
      } catch (err) {
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="loader" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)]">
        <h2 className="font-heading text-3xl font-bold uppercase mb-4 text-[var(--color-navy)]">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">Back to Products</button>
      </div>
    )
  }

  const images = product.images?.length > 0 ? product.images : [`https://picsum.photos/seed/${product.id}/800/800`]
  const specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : (product.specifications || {})
  const currentStock = product.stock ?? product.stock_quantity ?? product.stockQuantity ?? 0;
  
  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${quantity} x ${product.name} added to cart`)
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen pt-4 pb-20">
      <div className="container">
        
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Equipment</Link>
          <ChevronRight size={14} />
          <Link to={`/products?category=${product.categories?.slug}`}>{product.categories?.name}</Link>
          <ChevronRight size={14} />
          <span className="text-[var(--color-navy)] font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main Product Area */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 lg:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Left: Images */}
            <div>
              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface-2)] aspect-square mb-4 relative">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      onClick={() => setActiveImage(idx)}
                      className={`thumb ${activeImage === idx ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              <span className="sku-tag self-start mb-4 uppercase">SKU: {product.sku}</span>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-3">
                <span className="price-tag text-4xl">${product.price?.toLocaleString()}</span>
                {currentStock > 5 ? (
                  <span className="badge badge-success"><Check size={12} className="mr-1"/> In Stock</span>
                ) : currentStock > 0 ? (
                  <span className="badge badge-warning">Low Stock ({currentStock})</span>
                ) : (
                  <span className="badge badge-error">Out of Stock</span>
                )}
              </div>
              
              <div className="text-sm font-mono text-[var(--color-muted)] mb-6 flex items-center gap-2">
                <Truck size={14} /> 
                {product.shipping_cost > 0 
                  ? `Shipping Cost: $${product.shipping_cost.toLocaleString()}` 
                  : 'Free Shipping'}
              </div>

              <p className="text-[var(--color-muted)] text-base mb-8 leading-relaxed">
                {product.description}
              </p>

              <hr className="divider mb-8" />

              {/* Action Area */}
              <div className="bg-[var(--color-surface-2)] rounded-xl p-6 border border-[var(--color-border)]">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  
                  {/* Quantity */}
                  <div className="flex items-center bg-white border border-[var(--color-border)] rounded-lg h-12 w-full sm:w-32">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors h-full"
                    >
                      <Minus size={16} />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center font-mono font-bold outline-none text-[var(--color-navy)] h-full bg-transparent"
                    />
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors h-full"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button 
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className="btn btn-primary h-12 flex-1 w-full flex justify-center text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                </div>

                <div className="mt-5 space-y-2 font-mono text-xs text-[var(--color-muted)]">
                  <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500"/> Certified Original Equipment</div>
                  <div className="flex items-center gap-2"><Truck size={14} className="text-[var(--color-primary)]"/> Global Shipping Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Area */}
        <div className="mb-16">
          <div className="flex border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`tab-btn flex items-center gap-2 ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Info size={16}/> Overview
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`tab-btn flex items-center gap-2 ${activeTab === 'specs' ? 'active' : ''}`}
            >
              <FileText size={16}/> Specifications
            </button>
            <button 
              onClick={() => setActiveTab('shipping')}
              className={`tab-btn flex items-center gap-2 ${activeTab === 'shipping' ? 'active' : ''}`}
            >
              <Truck size={16}/> Shipping
            </button>
          </div>
          
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] border-t-0 rounded-b-xl p-6 lg:p-8 min-h-[300px]">
             {activeTab === 'overview' && (
               <div className="prose max-w-none text-[var(--color-text)]">
                 <h3 className="font-heading text-xl uppercase mb-4 text-[var(--color-navy)]">Product Overview</h3>
                 <p>{product.description}</p>
               </div>
             )}
             
             {activeTab === 'specs' && (
               <div>
                  <h3 className="font-heading text-xl uppercase mb-6 text-[var(--color-navy)]">Technical Specifications</h3>
                  {Object.keys(specs).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0 border-t border-[var(--color-border)] pt-2">
                       {Object.entries(specs).map(([key, value]) => (
                         <div key={key} className="py-3 border-b border-[var(--color-border)] flex justify-between gap-4">
                           <span className="text-[var(--color-muted)] font-mono text-sm capitalize">{key}</span>
                           <span className="text-[var(--color-text)] font-semibold text-right text-sm">{value}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <p className="text-[var(--color-muted)] italic">No specifications available.</p>
                  )}
               </div>
             )}

             {activeTab === 'shipping' && (
               <div>
                 <h3 className="font-heading text-xl uppercase mb-4 text-[var(--color-navy)]">Shipping Information</h3>
                 <p className="text-[var(--color-text)] mb-4">
                   We offer worldwide shipping via our trusted logistics partners (DHL, FedEx, Kuehne+Nagel). 
                   {product.shipping_cost > 0 
                     ? ` The estimated shipping cost for this item is $${product.shipping_cost.toLocaleString()}.`
                     : ' This item currently qualifies for free standard shipping.'}
                 </p>
                 <ul className="list-disc pl-5 text-[var(--color-muted)] space-y-2">
                   <li>Standard processing time: 1-2 business days.</li>
                   <li>Expedited air freight available for critical spares.</li>
                   <li>Customs clearance assistance provided.</li>
                 </ul>
               </div>
             )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)]">Related Equipment</h2>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                  <ChevronLeft size={16}/>
                </button>
                <button className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
