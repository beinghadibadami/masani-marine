import { supabase } from './supabase'

/**
 * Sends an order receipt email via the Supabase Edge Function `send-order-email`,
 * which uses Resend internally. The RESEND_API_KEY never touches the browser.
 *
 * @param {object} order  - The full order object including user_email, items, shipping_address, totals, payment_method, payment_status
 * @param {string} type   - 'placed' | 'shipped' | 'delivered'
 */
export const sendOrderEmail = async (order, type = 'placed') => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-email', {
      body: { order, type }
    })

    if (error) throw new Error(error.message || 'Edge function invocation failed')

    console.log('[email] Receipt sent successfully:', data)
    return true
  } catch (err) {
    // Email failure should never block the checkout flow
    console.error('[email] Failed to send receipt:', err.message)
    return false
  }
}
