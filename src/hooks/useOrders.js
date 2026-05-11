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

  async function createOrder({ cartItems, shippingAddress, subtotal, total, paypalOrderId, paypalDetails }) {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        shipping_address: shippingAddress,
        subtotal,
        total,
        paypal_order_id: paypalOrderId,
        payment_status: 'paid',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

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

    // Insert into transactions table
    if (paypalDetails) {
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          order_id: order.id,
          paypal_order_id: paypalOrderId,
          payer_email: paypalDetails.payer?.email_address,
          amount: total,
          currency: 'USD',
          status: paypalDetails.status,
          full_response: paypalDetails,
        })
      if (txError) {
        console.error('Failed to log transaction:', txError)
        // We don't throw here to avoid failing the order if the log fails, 
        // but in production you'd want robust error handling.
      }
    }

    await fetchOrders()
    return order
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
