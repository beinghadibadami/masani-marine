// TODO: Replace mock data with Supabase queries
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import imageCompression from 'browser-image-compression'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    setCategories(data || [])
    setIsLoading(false)
  }

  async function getCategoryBySlug(slug) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    return data
  }

  async function createCategory(categoryData) {
    const { error } = await supabase.from('categories').insert(categoryData)
    if (error) throw error
    await fetchCategories()
  }

  async function updateCategory(id, updates) {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    await fetchCategories()
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await fetchCategories()
  }

  async function uploadCategoryImage(slug, file) {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    }
    const compressedFile = await imageCompression(file, options)
    
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const path = `categories/${slug || 'temp'}/${Date.now()}-${safeName}`
    
    const { error } = await supabase.storage
      .from('category-images')
      .upload(path, compressedFile, { upsert: true })
      
    if (error) {
      console.error("Supabase Storage Error:", error)
      throw error
    }
    const { data } = supabase.storage.from('category-images').getPublicUrl(path)
    return data.publicUrl
  }

  return {
    categories,
    isLoading,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
  }
}
