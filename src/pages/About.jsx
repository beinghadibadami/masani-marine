import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Anchor, ShieldCheck, Ship, Target, Map, Award, Globe, CalendarDays, Package, Users } from 'lucide-react'

// Local count-up hook for stats
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

const STAT_META = [
  { value: '16', suffix: '+', label: 'Years Experience', icon: CalendarDays },
  { value: '500', suffix: '+', label: 'Certified Products', icon: Package },
  { value: '42', suffix: '', label: 'Countries Served', icon: Globe },
  { value: '1200', suffix: '+', label: 'Vessels Equipped', icon: Users },
]

function StatBox({ value, suffix, label, icon: Icon }) {
  const { count, ref } = useCountUp(value)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ translateY: -4, boxShadow: '0 16px 40px rgba(0,119,168,0.18)' }}
      transition={{ duration: 0.5 }}
      className="relative bg-white rounded-2xl border border-[var(--color-border)] p-6 flex flex-col items-center gap-3 overflow-hidden group"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--color-primary)] to-[#00AACC] rounded-t-2xl" />
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[rgba(0,119,168,0.1)] border border-[rgba(0,119,168,0.15)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
        {Icon && <Icon size={22} />}
      </div>
      {/* Number */}
      <div className="text-4xl font-extrabold leading-none" style={{ color: '#000000', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
        {count}{suffix}
      </div>
      {/* Label */}
      <div className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] text-center">{label}</div>
    </motion.div>
  )
}

function TimelineItem({ year, title, desc, active = false }) {
  return (
    <div className="relative pl-8 md:pl-0">
      <div className="md:hidden absolute left-0 top-1 w-4 h-4 rounded-full bg-[var(--color-primary)] border-4 border-white shadow-sm" />
      <div className="hidden md:flex flex-col items-center absolute left-1/2 -ml-[9px] top-0 bottom-0">
        <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${active ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)]'}`} />
        <div className="w-0.5 h-full bg-[var(--color-border)] mt-2" />
      </div>

      <div className="md:w-1/2 md:pr-10 md:ml-0 md:text-right mb-10 pb-2">
        <div className="font-mono text-[var(--color-primary)] font-bold text-lg mb-1">{year}</div>
        <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-2">{title}</h3>
        <p className="text-[var(--color-text)] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
function TimelineItemRight({ year, title, desc }) {
  return (
    <div className="relative pl-8 md:pl-0 mt-8 md:mt-16">
      <div className="md:hidden absolute left-0 top-1 w-4 h-4 rounded-full bg-[var(--color-primary)] border-4 border-white shadow-sm" />
      <div className="md:w-1/2 md:pl-10 md:ml-auto mb-10 pb-2">
        <div className="font-mono text-[var(--color-primary)] font-bold text-lg mb-1">{year}</div>
        <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-2">{title}</h3>
        <p className="text-[var(--color-text)] text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function About() {
  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      {/* Hero */}
      <section className="bg-white px-4 py-24 lg:py-40 relative text-center overflow-hidden border-b border-[var(--color-border)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.1]" style={{ 
            backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '60px 60px' 
          }} />
        </div>

        <div className="container relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="section-label justify-center mb-10 text-[var(--color-accent)]">
            Our Story
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="hero-text-large mb-12">
            <span className="text-black">Equipping the </span><span style={{ color: '#0077A8' }}>Maritime World</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-[var(--color-muted)] max-w-2xl mx-auto text-xl leading-relaxed font-medium" style={{ marginTop: '50px' }}>
            Since 2008, Masani Marine has been a trusted partner to the global shipping industry, providing precision equipment, unparalleled support, and deep technical expertise.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--color-surface-2)] py-16">
        <div className="container max-w-6xl">
          <div className="text-center mb-10">
            <div className="section-label justify-center mb-3">By The Numbers</div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-navy)] uppercase tracking-tight">Our Impact at Sea</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 px-4">
            {STAT_META.map((s, i) => (
              <StatBox key={s.label} value={s.value} suffix={s.suffix} label={s.label} icon={s.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="section pt-24">
        <div className="container max-w-4xl text-center">
          <img src="/logo.png" alt="Masani Marine" className="mx-auto h-36 md:h-48 mb-12 object-contain drop-shadow-lg" />
          <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase text-[var(--color-navy)] mb-6">Our Mission</h2>
          <p className="text-lg text-[var(--color-text)] leading-relaxed mb-6">
            At Masani Marine, we believe that the sea demands respect and absolute preparation. Our mission is to ensure that every vessel we serve is equipped with the most reliable, compliant, and advanced machinery available on the market.
          </p>
          <p className="text-lg text-[var(--color-text)] leading-relaxed">
            We don't just supply parts; we provide solutions. From critical engine room spares to life-saving survival craft, our focus is on safety, performance, and operational continuity.
          </p>
        </div>
      </section>

      {/* Certifications & Values */}
      <section className="section bg-[var(--color-surface-2)]">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label justify-center mb-3">What We Stand For</div>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Certified Quality', desc: 'An ISO 9001:2015 certified company. All our products meet stringent marine standards including SOLAS, MED, and ABS/DNV type approvals.' },
              { icon: Map, title: 'Global Logistics', desc: 'Strategically located in Dubai, we leverage integrated air and sea freight networks to deliver critical spares to any port, anywhere.' },
              { icon: Target, title: 'Technical Expertise', desc: 'Our team consists of former marine engineers and captains who understand the realities of sea-going operations firsthand.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ translateY: -4, boxShadow: '0 16px 40px rgba(0,119,168,0.15)' }}
                className="relative bg-white p-8 rounded-2xl border border-[var(--color-border)] overflow-hidden group"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--color-primary)] to-[#00AACC] rounded-t-2xl" />
                <div className="w-14 h-14 rounded-xl bg-[rgba(0,119,168,0.1)] border border-[rgba(0,119,168,0.15)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300 mb-5">
                  <Icon size={26} />
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-3">{title}</h3>
                <p className="text-[var(--color-muted)] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="section-title">Company Milestones</h2>
          </div>

          <div className="relative">
            <TimelineItem
              year="2008"
              title="The Beginning"
              desc="Founded as a small supplier of marine electronics in the UAE, focusing primarily on local commercial fishing and tugblood fleets."
            />
            <TimelineItemRight
              year="2012"
              title="Regional Expansion"
              desc="Opened our main warehouse facility in Jebel Ali Free Zone, expanding into propulsion components and deck machinery for the Middle East."
            />
            <TimelineItem
              year="2016"
              title="ISO Certification & Safety division"
              desc="Achieved ISO 9001 certification. Launched our dedicated Safety Equipment division, supplying SOLAS life rafts and EPIRBs."
            />
            <TimelineItemRight
              year="2020"
              title="Global Reach"
              desc="Expanded our digital parts catalog, establishing automated logistics partnerships to serve fleets in Europe and Asia."
            />
            <TimelineItem
              active
              year="Today"
              title="Comprehensive Solutions"
              desc="Serving over 1,200 clients globally across 42 countries with a catalog of over 500+ type-approved marine products."
            />
          </div>
        </div>
      </section>

    </div>
  )
}
