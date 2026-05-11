import { Link } from 'react-router-dom'
import { Anchor, Mail, Phone, MapPin, Globe, MessageSquare, Share2 } from 'lucide-react'

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'All Products' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
  { to: '/cart', label: 'Cart' },
]

const CATEGORY_LINKS = [
  { to: '/products?category=navigation-systems', label: 'Navigation Systems' },
  { to: '/products?category=propulsion', label: 'Propulsion' },
  { to: '/products?category=safety-equipment', label: 'Safety Equipment' },
  { to: '/products?category=deck-machinery', label: 'Deck Machinery' },
  { to: '/products?category=marine-electronics', label: 'Marine Electronics' },
  { to: '/products?category=engine-room', label: 'Engine Room' },
]

export function Footer() {
  return (
    <footer className="bg-[var(--color-navy)] text-white relative overflow-hidden">
      {/* Decorative waves */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none z-0" style={{ height: 50 }}>
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,25 C300,50 900,0 1200,25 L1200,0 L0,0 Z" fill="var(--color-bg)" />
        </svg>
      </div>

      <div className="relative z-10" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

            {/* About */}
            <div>
              <div className="mb-6">
                <img src="/logo-white.jpeg" alt="Masani Marine" className="h-28 md:h-35 w-auto object-contain bg-white rounded-xl p-3 shadow-lg" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Supplying precision marine equipment and machinery to vessels worldwide since 2008.
                Quality you can trust. Service you can rely on.
              </p>
              {/* Social */}
              <div className="flex gap-3 mt-5">
                {[Globe, MessageSquare, Share2].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#00AACC] hover:text-white transition-all">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#00AACC] inline-block" />
                Quick Links
              </h4>
              <ul className="space-y-2">
                {QUICK_LINKS.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-white/60 hover:text-[#00AACC] text-sm transition-colors flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#00AACC] inline-block" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#00AACC] inline-block" />
                Categories
              </h4>
              <ul className="space-y-2">
                {CATEGORY_LINKS.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-white/60 hover:text-[#00AACC] text-sm transition-colors flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#00AACC] inline-block" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading text-lg font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#00AACC] inline-block" />
                Contact
              </h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <MapPin size={16} className="text-[#00AACC] flex-shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm">Jebel Ali Free Zone, Dubai, UAE</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={16} className="text-[#00AACC] flex-shrink-0" />
                  <a href="tel:+97141234567" className="text-white/60 text-sm hover:text-[#00AACC] transition-colors">
                    +971 4 123 4567
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={16} className="text-[#00AACC] flex-shrink-0" />
                  <a href="mailto:info@masanimarine.com" className="text-white/60 text-sm hover:text-[#00AACC] transition-colors break-all">
                    info@masanimarine.com
                  </a>
                </li>
              </ul>

              {/* Cert badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                {['ISO 9001', 'DNV GL', 'SOLAS', 'IMO'].map(cert => (
                  <span key={cert} className="px-2 py-0.5 rounded border border-white/20 text-white/50 font-mono text-xs">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm font-mono">
              © {new Date().getFullYear()} Masani Marine FZE. All rights reserved.
            </p>
            <div className="flex gap-5">
              <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Privacy Policy</a>
              <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Terms of Service</a>
              <a href="#" className="text-white/40 hover:text-white/70 text-xs transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
