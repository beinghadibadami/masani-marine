import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}
