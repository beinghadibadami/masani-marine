// TODO: Replace mock data with Supabase queries
// Note: shipping_cost will be handled as part of productData in create/update.
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import imageCompression from 'browser-image-compression'

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    fetchProducts()
  }, [filterKey])

  async function fetchProducts() {
    setIsLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug)')
        
      if (!filters.admin) {
        query = query.eq('is_visible', true)
      }

      if (filters.category) {
        query = query.eq('categories.slug', filters.category)
      }
      if (filters.minPrice) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
      }
      if (filters.sortBy === 'price_asc') query = query.order('price', { ascending: true })
      else if (filters.sortBy === 'price_desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error: qError } = await query
      if (qError) throw qError
      setProducts(data || [])
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data
  }

  async function getProductsByCategory(categorySlug, limit = 4) {
    const { data } = await supabase
      .from('products')
      .select('*, categories!inner(slug)')
      .eq('categories.slug', categorySlug)
      .eq('is_visible', true)
      .limit(limit)
    return data || []
  }

  async function searchProducts(term) {
    if (!term || term.length < 2) return []
    const { data } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .or(`name.ilike.%${term}%,sku.ilike.%${term}%`)
      .eq('is_visible', true)
      .limit(10)
    return data || []
  }

  // Admin CRUD
  async function createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
    if (error) throw error
    await fetchProducts()
    return data
  }

  async function updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      
    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error("Update failed: 0 rows modified. This is usually caused by Supabase RLS (Row Level Security) blocking the UPDATE operation.")
    }
    await fetchProducts()
  }

  async function deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchProducts()
  }

  async function uploadProductImage(productId, file) {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    }
    const compressedFile = await imageCompression(file, options)
    
    // Maintain the original file name extension if it changes internally
    const extension = file.name.split('.').pop()
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const path = `products/${productId}/${Date.now()}-${safeName}`
    
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, compressedFile, { upsert: true })
      
    if (error) {
      console.error("Supabase Storage Error:", error)
      throw error
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function uploadProductManual(productId, file) {
    const path = `manuals/${productId}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('product-manuals')
      .upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-manuals').getPublicUrl(path)
    return data.publicUrl
  }

  return {
    products,
    isLoading,
    error,
    getProductBySlug,
    getProductsByCategory,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    uploadProductManual,
    refetch: fetchProducts,
  }
}
