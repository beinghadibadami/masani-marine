// TODO: Replace mock data with Supabase queries
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSettings() {
  const [settings, setSettings] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    const { data } = await supabase.from('settings').select('*')
    if (data) {
      const map = data.reduce((acc, row) => {
        acc[row.key] = row.value
        return acc
      }, {})
      setSettings(map)
    }
    setIsLoading(false)
  }

  async function updateSetting(key, value) {
    const { error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key)
    if (error) throw error
    await fetchSettings()
  }

  return { settings, isLoading, updateSetting }
}
