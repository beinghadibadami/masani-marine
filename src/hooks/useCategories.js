// TODO: Replace mock data with Supabase queries
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

  return {
    categories,
    isLoading,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
