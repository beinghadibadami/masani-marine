// TODO: Cart stays local — no Supabase needed
import { useState, useEffect } from 'react'

const CART_KEY = 'masani_cart'

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  function removeItem(productId) {
    setItems(prev => prev.filter(i => i.id !== productId))
  }

  function updateQuantity(productId, quantity) {
    if (quantity < 1) { removeItem(productId); return }
    setItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity } : i)
    )
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingTotal = items.reduce((sum, i) => sum + (i.shipping_cost || 0), 0)

  return { items, itemCount, subtotal, shippingTotal, addItem, removeItem, updateQuantity, clearCart }
}
