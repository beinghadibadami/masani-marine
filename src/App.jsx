import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

// Providers
import { AuthProvider } from './hooks/useAuth'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './components/ui/Toast'

// Guards
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute'

// Layouts
import { MainLayout } from './components/layout/MainLayout'
import { AdminLayout } from './components/layout/AdminLayout'

// Public Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'

// Account Pages
import AccountLayout from './pages/account/AccountLayout'
import AccountOverview from './pages/account/Overview'
import AccountOrders from './pages/account/Orders'
import AccountOrderDetail from './pages/account/OrderDetail'
import AccountAddresses from './pages/account/Addresses'
import AccountSettings from './pages/account/Settings'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminProductForm from './pages/admin/ProductForm'
import AdminCategories from './pages/admin/Categories'
import AdminOrders from './pages/admin/Orders'
import AdminCustomers from './pages/admin/Customers'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture" // or authorize
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                
                {/* Main Public Application */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Account Area (Protected) */}
                  <Route path="/account" element={<ProtectedRoute />}>
                    <Route element={<AccountLayout />}>
                      <Route index element={<AccountOverview />} />
                      <Route path="orders" element={<AccountOrders />} />
                      <Route path="orders/:id" element={<AccountOrderDetail />} />
                      <Route path="addresses" element={<AccountAddresses />} />
                      <Route path="settings" element={<AccountSettings />} />
                    </Route>
                  </Route>
                </Route>

                {/* Admin Area (Protected & AdminOnly) */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id/edit" element={<AdminProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={
                  <div className="min-h-screen ocean-bg text-white flex items-center justify-center flex-col p-6 text-center">
                    <h1 className="font-heading text-6xl font-black text-[#00AACC] tracking-widest mb-4">404</h1>
                    <p className="text-xl mb-8">Vessel off course. The requested page cannot be found.</p>
                    <a href="/" className="btn btn-primary">Return to Home Port</a>
                  </div>
                } />

              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  )
}
