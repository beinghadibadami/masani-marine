import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// @ts-ignore: Deno is available in the Supabase Edge Function environment
declare const Deno: any;

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET')
const ENVIRONMENT = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox' // 'sandbox' or 'live'

const PAYPAL_API = ENVIRONMENT === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function generateAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { orderID } = await req.json()

    if (!orderID) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await generateAccessToken()

    // Capture order with PayPal
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const orderData = await response.json()

    if (orderData.status === 'COMPLETED') {
      return new Response(JSON.stringify({
        verified: true,
        order: orderData
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({
        verified: false,
        status: orderData.status
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    })
  }
})
