// TODO: Replace mock data with Supabase queries
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrders() {
  const { user, isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) fetchOrders()
    else setIsLoading(false)
  }, [user, isAdmin])

  async function fetchOrders() {
    setIsLoading(true)
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, sku))')
      .order('created_at', { ascending: false })

    if (!isAdmin) query = query.eq('user_id', user.id)

    const { data } = await query
    setOrders(data || [])
    setIsLoading(false)
  }

  async function getOrderById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, sku, price))')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async function createOrder({ 
    cartItems, 
    shippingAddress, 
    subtotal, 
    total, 
    paymentMethod = 'paypal',
    paymentStatus = 'paid',
    paypalOrderId = null, 
    paypalDetails = null 
  }) {
    // 1. Verify stock before proceeding
    const { data: currentProducts, error: stockCheckError } = await supabase
      .from('products')
      .select('id, name, stock')
      .in('id', cartItems.map(i => i.id))

    if (stockCheckError) throw new Error('Could not verify stock: ' + stockCheckError.message)

    for (const item of cartItems) {
      const product = currentProducts.find(p => p.id === item.id)
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.name || 'unknown item'}`)
      }
    }

    let order = null
    try {
      // 2. Create the order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          shipping_address: shippingAddress,
          subtotal,
          total,
          paypal_order_id: paypalOrderId,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError
      order = newOrder

      // 3. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 4. Update stock levels
      for (const item of cartItems) {
        const { error: stockUpdateError } = await supabase
          .rpc('decrement_stock', { 
            row_id: item.id, 
            dec_amt: item.quantity 
          })
        
        // Fallback if RPC doesn't exist yet
        if (stockUpdateError) {
           await supabase
            .from('products')
            .update({ stock: (currentProducts.find(p => p.id === item.id).stock - item.quantity) })
            .eq('id', item.id)
        }
      }

      // 5. Log transaction if it was a PayPal payment
      if (paypalDetails) {
        await supabase.from('transactions').insert({
          order_id: order.id,
          paypal_order_id: paypalOrderId,
          payer_email: paypalDetails.payer?.email_address,
          amount: total,
          currency: 'USD',
          status: paypalDetails.status,
          full_response: paypalDetails,
        })
      }

      await fetchOrders()
      return order

    } catch (err) {
      // 6. Safety Net: If PayPal was captured but DB failed, log to failed_transactions
      if (paymentStatus === 'paid' && !order && paypalOrderId) {
        await supabase.from('failed_transactions').insert({
          paypal_order_id: paypalOrderId,
          user_id: user.id,
          cart_snapshot: cartItems,
          error_message: err.message,
          amount: total,
        })
      }
      throw err
    }
  }

  async function updateOrderStatus(orderId, status, trackingNumber = null) {
    const updates = { status }
    if (trackingNumber) updates.tracking_number = trackingNumber
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
    if (error) throw error
    await fetchOrders()
  }

  return {
    orders,
    isLoading,
    getOrderById,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}
