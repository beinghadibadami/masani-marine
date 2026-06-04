import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  Check, ShieldCheck, MapPin, CreditCard, CheckCircle,
  Building2, Info, AlertTriangle, ChevronLeft, Loader2
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useCartContext } from '../context/CartContext'
import { useOrders } from '../hooks/useOrders'
import { useToast } from '../components/ui/Toast'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { supabase } from '../lib/supabase'
import { sendOrderEmail } from '../lib/email'
import { validateName, validateZipCode, validateState } from '../lib/validation'
import CountrySelect from '../components/ui/CountrySelect'
import { usePostalLookup } from '../hooks/usePostalLookup'

export default function Checkout() {
  const { user, profile, updateProfile } = useAuth()
  const { items, itemCount, subtotal, shippingTotal, clearCart } = useCartContext()
  const { createOrder } = useOrders()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment
  const [shippingData, setShippingData] = useState(() => {
    const saved = localStorage.getItem('masani_shipping_data')
    return saved ? JSON.parse(saved) : null
  })
  const [paymentMethod, setPaymentMethod] = useState(() => {
    const subtotalCalc = itemCount > 0 ? items.reduce((acc, item) => acc + (item.price * item.quantity), 0) : 0
    const totalCalc = subtotalCalc + (subtotalCalc > 10000 ? 0 : 150)
    return totalCalc > 5000 ? 'bank_transfer' : 'paypal'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  // Controlled fields for auto-fill
  const savedAddr = profile?.shipping_address || shippingData || {}
  const [zipValue, setZipValue] = useState(savedAddr.zip || '')
  const [cityValue, setCityValue] = useState(savedAddr.city || '')
  const [stateValue, setStateValue] = useState(savedAddr.state || '')
  const [countryValue, setCountryValue] = useState(savedAddr.country || 'US')

  // Auto-fill city & state when postal code is entered
  const { isLooking, lookupError } = usePostalLookup({
    zip: zipValue,
    country: countryValue,
    onResult: ({ city, state }) => {
      setCityValue(city)
      setStateValue(state)
      setErrors(prev => { const c = { ...prev }; delete c.city; delete c.state; return c })
    }
  })

  // Persist shipping data
  useEffect(() => {
    if (shippingData) {
      localStorage.setItem('masani_shipping_data', JSON.stringify(shippingData))
    }
  }, [shippingData])

  if (itemCount === 0) return <Navigate to="/cart" replace />
  if (!user) return <Navigate to="/login?redirect=/checkout" replace />

  const total = subtotal + shippingTotal
  const PAYPAL_LIMIT = 5000
  const exceedsPaypalLimit = total > PAYPAL_LIMIT

  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    const data = Object.fromEntries(fd.entries())

    // Validate fields
    const errs = {}
    if (!data.name || !validateName(data.name)) {
      errs.name = 'Please enter both first and last name.'
    }
    if (!data.line1 || data.line1.trim().length < 5) {
      errs.line1 = 'Address line 1 must be at least 5 characters.'
    }
    const cityTrimmed = (data.city || '').trim()
    if (!cityTrimmed || cityTrimmed.length < 2 || !/^[A-Za-z\s-]+$/.test(cityTrimmed)) {
      errs.city = 'City/Port name must be at least 2 characters (letters, spaces, and hyphens only).'
    }
    if (!data.state || !validateState(data.state, data.country)) {
      errs.state = data.country === 'US'
        ? 'US States must be 2 letters (e.g., FL).'
        : 'State/Province must be at least 2 characters.'
    }
    if (!data.zip || !validateZipCode(data.zip, data.country)) {
      if (data.country === 'US') {
        errs.zip = 'Invalid ZIP format (e.g., 33101 or 33101-1234).'
      } else if (data.country === 'SG') {
        errs.zip = 'Singapore postal codes must be exactly 6 digits.'
      } else if (data.country === 'NL') {
        errs.zip = 'Dutch postal codes must be 4 digits followed by 2 letters (e.g., 1234 AB).'
      } else if (data.country === 'GB') {
        errs.zip = 'Invalid UK postal code format.'
      } else {
        errs.zip = 'Postal code must be 3 to 10 alphanumeric characters.'
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please correct the errors in the shipping form.')
      return
    }

    // Capitalize US state code
    if (data.country === 'US' && data.state) {
      data.state = data.state.toUpperCase().trim()
    }

    setShippingData(data)
    setErrors({})

    try {
      if (updateProfile) {
        await updateProfile({ shipping_address: data })
      }
    } catch (err) {
      console.warn('Failed to save address to profile:', err)
    }

    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle successful paypal approval
  const handlePaymentApprove = async (data, actions) => {
    setIsProcessing(true)
    try {
      // Server-side capture via Supabase Edge Function
      const res = await supabase.functions.invoke('verify-paypal-payment', {
        body: { orderID: data.orderID }
      })

      if (res.error) throw new Error(res.error.message || 'Function execution failed')
      if (!res.data?.verified) throw new Error('Payment capture failed on server: ' + (res.data?.status || 'Unknown status'))

      const details = res.data.order

      const order = await createOrder({
        cartItems: items,
        shippingAddress: shippingData,
        subtotal,
        total,
        paymentMethod: 'paypal',
        paymentStatus: 'paid',
        paypalOrderId: data.orderID,
        paypalDetails: details
      })

      localStorage.removeItem('masani_shipping_data')
      clearCart()

      // Send email
      await sendOrderEmail({ ...order, user_email: user.email }, 'placed')

      toast.success('Payment successful! Order placed.')
      navigate(`/order-confirmation`, { state: { orderId: order.id } })

    } catch (err) {
      toast.error('Failed to process order: ' + (err.message || 'Unknown error'))
      console.error('Order creation error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBankTransfer = async () => {
    setIsProcessing(true)
    try {
      const order = await createOrder({
        cartItems: items,
        shippingAddress: shippingData,
        subtotal,
        total,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'awaiting_payment'
      })

      localStorage.removeItem('masani_shipping_data')
      clearCart()

      // Send email
      await sendOrderEmail({ ...order, user_email: user.email }, 'placed')

      toast.success('Order placed! Awaiting bank transfer.')
      navigate(`/order-confirmation`, { state: { orderId: order.id } })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen py-10">
      <div className="container max-w-6xl">

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10 max-w-2xl mx-auto">
          <div className="stepper-step flex-1">
            <div className={`stepper-circle ${step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'}`}>
              {step > 1 ? <Check size={18} /> : '1'}
            </div>
            <span className={`text-xs mt-2 font-mono uppercase font-bold tracking-wider ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`}>Shipping</span>
          </div>
          <div className={`stepper-line ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-2)]'}`} />
          <div className="stepper-step flex-1">
            <div className={`stepper-circle ${step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'}`}>
              {step > 2 ? <Check size={18} /> : '2'}
            </div>
            <span className={`text-xs mt-2 font-mono uppercase font-bold tracking-wider ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`}>Payment</span>
          </div>
          <div className={`stepper-line ${step >= 3 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-2)]'}`} />
          <div className="stepper-step flex-1">
            <div className={`stepper-circle ${step >= 3 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-muted)]'}`}>
              3
            </div>
            <span className={`text-xs mt-2 font-mono uppercase font-bold tracking-wider ${step >= 3 ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}`}>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] px-6 py-4 flex items-center gap-3">
                {step === 1 ? <MapPin size={20} className="text-[var(--color-primary)]" /> : <CreditCard size={20} className="text-[var(--color-primary)]" />}
                <h2 className="font-heading text-xl font-bold text-[var(--color-navy)] uppercase tracking-wide">
                  {step === 1 ? 'Shipping Address' : 'Secure Payment'}
                </h2>
              </div>

              <div className="p-6">
                {step === 1 && (
                  <form onSubmit={handleShippingSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Full Name *</label>
                        <input
                          name="name"
                          className={`input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
                          placeholder="Capt. John Doe"
                          defaultValue={profile?.shipping_address?.name || user?.user_metadata?.full_name || ''}
                          onChange={() => errors.name && setErrors(prev => { const c = { ...prev }; delete c.name; return c; })}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="label">Company / Vessel Name (Optional)</label>
                        <input
                          name="company"
                          className="input border-[var(--color-border)]"
                          placeholder="Seafarer Logistics"
                          defaultValue={profile?.shipping_address?.company || ''}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Address Line 1 *</label>
                      <input
                        name="line1"
                        className={`input ${errors.line1 ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
                        placeholder="Pier 4, Main Harbor"
                        defaultValue={profile?.shipping_address?.line1 || ''}
                        onChange={() => errors.line1 && setErrors(prev => { const c = { ...prev }; delete c.line1; return c; })}
                      />
                      {errors.line1 && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.line1}</p>}
                    </div>

                    <div>
                      <label className="label">Address Line 2 (Optional)</label>
                      <input
                        name="line2"
                        className="input border-[var(--color-border)]"
                        placeholder="Suite, Unit, etc."
                        defaultValue={profile?.shipping_address?.line2 || ''}
                      />
                    </div>

                    {/* ZIP / Postal Code — first so auto-fill can populate city & state */}
                    <div>
                      <label className="label">ZIP / Postal Code *</label>
                      <div className="relative">
                        <input
                          name="zip"
                          value={zipValue}
                          className={`input pr-8 ${errors.zip ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
                          placeholder="33101"
                          onChange={e => {
                            setZipValue(e.target.value)
                            if (errors.zip) setErrors(prev => { const c = { ...prev }; delete c.zip; return c })
                          }}
                        />
                        {isLooking && (
                          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-primary)]" />
                        )}
                      </div>
                      {errors.zip && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.zip}</p>}
                      {lookupError && !errors.zip && (
                        <p className="text-amber-600 text-xs mt-1 font-semibold">{lookupError}</p>
                      )}
                      {!lookupError && !isLooking && cityValue && !errors.zip && (
                        <p className="text-emerald-600 text-xs mt-1 font-semibold">✓ City & State auto-filled</p>
                      )}
                    </div>

                    {/* City & State — auto-filled from postal lookup */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">City / Port *</label>
                        <input
                          name="city"
                          value={cityValue}
                          className={`input ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
                          placeholder="Miami"
                          onChange={e => {
                            setCityValue(e.target.value)
                            if (errors.city) setErrors(prev => { const c = { ...prev }; delete c.city; return c })
                          }}
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="label">State / Province *</label>
                        <input
                          name="state"
                          value={stateValue}
                          className={`input ${errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-[var(--color-border)]'}`}
                          placeholder="FL"
                          onChange={e => {
                            setStateValue(e.target.value)
                            if (errors.state) setErrors(prev => { const c = { ...prev }; delete c.state; return c })
                          }}
                        />
                        {errors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.state}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="label">Country *</label>
                      <CountrySelect
                        name="country"
                        value={countryValue}
                        onChange={e => {
                          setCountryValue(e.target.value)
                          setErrors({})
                        }}
                      />
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)] mt-6">
                      <button type="submit" className="btn btn-primary w-full sm:w-auto">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <div>
                    <div className="mb-8 p-4 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start gap-4">
                      <MapPin className="text-[var(--color-muted)] flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold uppercase text-[var(--color-navy)] mb-1">Shipping To:</div>
                        <div className="text-sm text-[var(--color-text)]">
                          {shippingData.name} <br />
                          {shippingData.line1} {shippingData.line2}<br />
                          {shippingData.city}, {shippingData.state} {shippingData.zip}<br />
                          {shippingData.country}
                        </div>
                        <button onClick={() => setStep(1)} className="text-xs text-[var(--color-primary)] font-mono uppercase mt-2 hover:underline flex items-center gap-1">
                          <ChevronLeft size={12} /> Edit Address
                        </button>
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="label mb-4">Select Payment Method</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setPaymentMethod('paypal')}
                          disabled={exceedsPaypalLimit}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'paypal' ? 'border-[var(--color-accent)] bg-[var(--color-cyan-glow)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]'} ${exceedsPaypalLimit ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                              {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />}
                            </div>
                            <div className="text-left">
                              <span className="font-bold uppercase text-sm tracking-wide block">PayPal / Card</span>
                              {exceedsPaypalLimit && <span className="text-[10px] text-red-500 font-bold uppercase">Over $5k Limit</span>}
                            </div>
                          </div>
                          <CreditCard size={20} className={paymentMethod === 'paypal' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                        </button>

                        <button
                          onClick={() => setPaymentMethod('bank_transfer')}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-accent)] bg-[var(--color-cyan-glow)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary-light)]'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                              {paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />}
                            </div>
                            <span className="font-bold uppercase text-sm tracking-wide">Bank Transfer</span>
                          </div>
                          <Building2 size={20} className={paymentMethod === 'bank_transfer' ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                      <div className="p-6">
                        {paymentMethod === 'paypal' ? (
                          <div className="flex flex-col items-center text-center">
                            <ShieldCheck size={40} className="text-green-500 mb-3" />
                            <h3 className="font-heading text-lg font-bold text-[var(--color-navy)] uppercase">Instant Secure Payment</h3>
                            <p className="text-[var(--color-muted)] text-sm mb-6 max-w-md">
                              Your order will be processed immediately after PayPal confirmation.
                            </p>

                            <div className="w-full max-w-sm relative z-0">
                              {isProcessing ? (
                                <div className="flex flex-col items-center py-4">
                                  <Loader2 className="animate-spin text-[var(--color-primary)] mb-2" size={32} />
                                  <p className="text-xs font-mono uppercase text-[var(--color-muted)]">Processing Payment...</p>
                                </div>
                              ) : (
                                <PayPalButtons
                                  fundingSource="paypal"
                                  style={{ layout: "vertical", shape: "rect", color: "gold" }}
                                  createOrder={(data, actions) => {
                                    return actions.order.create({
                                      purchase_units: [{
                                        amount: {
                                          value: total.toString(),
                                          currency_code: "USD"
                                        }
                                      }]
                                    })
                                  }}
                                  onApprove={handlePaymentApprove}
                                  onError={() => toast.error('PayPal widget error. Please check configuration.')}
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-amber-900 leading-relaxed">
                                <p className="font-bold mb-1 uppercase tracking-tight">Wire Transfer Instructions</p>
                                After placing your order, please transfer the total amount to the bank account below.
                                Include your <strong>Order ID</strong> as the payment reference.
                                Your order will be shipped once the payment is confirmed.
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[var(--color-surface-2)] p-6 rounded-xl border border-[var(--color-border)]">
                              <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold block mb-1">Bank Name</label>
                                <div className="text-sm font-bold text-[var(--color-navy)]">HDFC BANK</div>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold block mb-1">Account Name</label>
                                <div className="text-sm font-bold text-[var(--color-navy)]">MASANI MARINE</div>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold block mb-1">Account Number</label>
                                <div className="text-sm font-mono font-bold text-[var(--color-navy)]">50200030539450</div>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold block mb-1">IFSC Code</label>
                                <div className="text-sm font-mono font-bold text-[var(--color-navy)]">HDFC0001687</div>
                              </div>
                            </div>

                            <button
                              onClick={handleBankTransfer}
                              disabled={isProcessing}
                              className="btn btn-brand w-full justify-center py-4 text-lg"
                            >
                              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Place Order & Get Invoice'}
                            </button>

                            <p className="text-center text-[10px] text-[var(--color-muted)] uppercase tracking-widest">
                              By clicking, you agree to complete the transfer within 7 days.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-heading text-xl font-bold text-[var(--color-navy)] uppercase border-b border-[var(--color-border)] pb-3 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-[var(--color-surface-2)] rounded border border-[var(--color-border)] flex-shrink-0">
                      <img src={item.images?.[0]} className="w-full h-full object-cover rounded" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[var(--color-navy)] truncate">{item.name}</div>
                      <div className="text-[var(--color-muted)] text-xs font-mono mt-0.5">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-mono text-[var(--color-text)]">${(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 font-mono text-sm border-t border-[var(--color-border)] pt-4">
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--color-text)]">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--color-muted)]">
                  <span>Shipping</span>
                  <span className="text-[var(--color-text)]">{shippingTotal === 0 ? 'Free' : `$${shippingTotal.toLocaleString()}`}</span>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-lg uppercase text-[var(--color-navy)] font-bold">Total</span>
                  <span className="price-tag text-2xl text-[var(--color-primary)]">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
