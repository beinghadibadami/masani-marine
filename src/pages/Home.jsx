import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Anchor, ArrowRight, Shield, Globe, Headphones, Award,
  ChevronRight, Waves, Compass, Ship, LifeBuoy, Zap,
  MapPin, Clock, Package
} from 'lucide-react'
import { ProductCard } from '../components/ui/ProductCard'
import { mockProducts } from '../data/mockProducts'
import { mockCategories } from '../data/mockCategories'

// ── Animated count-up hook ───────────────────────────────────────
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const end = parseInt(target)
    if (!end) return
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

// ── Stat item ───────────────────────────────────────────────────
function StatItem({ value, label, suffix = '' }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <div className="trust-number">{count}{suffix}</div>
      <div className="font-mono text-xs text-white/60 tracking-widest uppercase mt-1">{label}</div>
    </div>
  )
}

// ── Section Wrapper with scroll animation ───────────────────────
function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  const featuredProducts = mockProducts.slice(0, 6)

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="ocean-bg min-h-[92vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Sonar rings */}
        <div className="sonar-ring" />
        <div className="sonar-ring" />
        <div className="sonar-ring" />

        {/* Decorative compass rose */}
        <div className="deco-compass" style={{ top: '10%', right: '5%', opacity: 0.06 }}>
          <Compass size={260} />
        </div>
        <div className="deco-compass" style={{ bottom: '5%', left: '2%', opacity: 0.04 }}>
          <Anchor size={200} />
        </div>

        {/* Content */}
        <div className="container text-center relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-label justify-center mb-6"
              style={{ color: '#00AACC', borderColor: '#00AACC' }}
            >
              <span style={{ background: '#00AACC' }} />
              Masani Marine Equipment
              <span style={{ background: '#00AACC' }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="hero-text-large mb-2"
              style={{ color: '#00AACC' }}
            >
              Precision
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="hero-text-large mb-6"
              style={{ color: '#ffffff' }}
            >
              Equipment.
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="hero-text-large mb-8"
              style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', color: '#00AACC' }}
            >
              Reliable Seas.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white/70 text-lg max-w-xl mx-auto mb-10"
            >
              Supplying certified marine machinery, navigation systems, and safety equipment to vessels across 42+ countries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/products" className="btn btn-primary btn-lg">
                <Ship size={18} /> Browse Products
              </Link>
              <Link to="/contact" className="btn btn-lg"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Request a Quote <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full" style={{ display: 'block' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────── */}
      <section className="bg-[var(--color-primary-dark)] py-10 relative">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="16" suffix="+" label="Years in Business" />
            <StatItem value="42" suffix="+" label="Countries Served" />
            <StatItem value="500" suffix="+" label="Products" />
            <StatItem value="1200" suffix="+" label="Happy Clients" />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────────── */}
      <Section className="section bg-[var(--color-bg)]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center mb-3">
              <Waves size={14} /> Browse by Category <Waves size={14} />
            </div>
            <h2 className="section-title">Marine Equipment Categories</h2>
            <p className="text-[var(--color-muted)] mt-3 max-w-xl mx-auto">
              From navigation to engine room — we stock everything a modern vessel requires.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/products?category=${cat.slug}`} className="category-card block">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="category-overlay" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <div className="font-heading text-xl font-bold text-white uppercase tracking-wide">{cat.name}</div>
                    <p className="text-white/70 text-sm mt-1 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[#00AACC] text-sm font-semibold">
                      View Products <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      <Section className="section bg-[var(--color-surface-2)]">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="section-label mb-3">
                <Package size={14} /> Featured Products
              </div>
              <h2 className="section-title">Top Selling Equipment</h2>
            </div>
            <Link to="/products" className="btn btn-outline hidden md:flex">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn btn-outline">View All Products <ArrowRight size={16} /></Link>
          </div>
        </div>
      </Section>

      {/* ── WHY US ─────────────────────────────────────────────── */}
      <Section className="section bg-[var(--color-bg)]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center mb-3">
              <Shield size={14} /> Why Masani Marine
            </div>
            <h2 className="section-title">Engineered for the Ocean</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: 'Certified Quality',
                desc: 'All products meet SOLAS, IMO, and ISO 9001 standards. Fully type-approved.',
              },
              {
                icon: Globe,
                title: 'Global Shipping',
                desc: 'We ship to 42+ countries. Port-to-port logistics and customs handling included.',
              },
              {
                icon: Headphones,
                title: 'Technical Support',
                desc: '24/7 technical assistance from our team of qualified marine engineers.',
              },
              {
                icon: Shield,
                title: 'Compliance Ready',
                desc: 'Full documentation pack: CE, MED, DNV GL, Lloyd\'s, and flag state approvals.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="feature-item flex flex-col items-start gap-4 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-shadow"
              >
                <div className="feature-icon-wrap">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-navy)] uppercase mb-2">{title}</h3>
                  <p className="text-[var(--color-muted)] text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── OCEAN DIVIDER + CTA BANNER ──────────────────────────── */}
      <section className="ocean-bg py-20 relative overflow-hidden">
        <div className="sonar-ring" style={{ animationDelay: '0s' }} />
        <div className="sonar-ring" style={{ animationDelay: '1.5s' }} />
        <div className="deco-compass" style={{ right: '3%', top: '10%' }}>
          <LifeBuoy size={200} />
        </div>
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="font-mono text-sm tracking-widest uppercase mb-4" style={{ color: '#00AACC' }}>
              Ready to Equip Your Vessel?
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-extrabold uppercase mb-6 tracking-tight" style={{ color: '#fff' }}>
              Let's Navigate<br />
              <span style={{ color: '#00AACC' }}>Together</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-10">
              Get expert advice, competitive pricing, and fast delivery on all marine equipment. Our team is ready to support you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn btn-accent btn-lg">
                Request a Quote <ArrowRight size={18} />
              </Link>
              <Link to="/products" className="btn btn-lg"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>
                <Ship size={18} /> Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CLIENT LOGOS ────────────────────────────────────────── */}
      <Section className="section bg-[var(--color-surface-2)]">
        <div className="container">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-3">
              Trusted By
            </div>
            <h2 className="font-heading text-3xl font-bold text-[var(--color-navy)] uppercase">
              Global Marine Partners
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {['MSC Shipping', 'Maersk Line', 'AMSOL', 'Wilhelmsen', 'Svitzer', 'Stolt Tankers'].map(name => (
              <div
                key={name}
                className="px-6 py-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] font-mono text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}
