import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Anchor, ShieldCheck, Ship, Target, Map, Award, Globe } from 'lucide-react'

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

function StatBox({ value, suffix, label }) {
  const { count, ref } = useCountUp(value)
  return (
    <div ref={ref} className="stat-card text-center items-center">
      <div className="text-4xl font-heading font-extrabold text-[#00AACC] flex items-center justify-center">
        {count}{suffix}
      </div>
      <div className="font-mono text-xs text-[var(--color-muted)] uppercase tracking-wider mt-2">{label}</div>
    </div>
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
      <section className="ocean-bg px-4 py-20 lg:py-32 relative text-center">
        <div className="container relative z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="section-label justify-center mb-6" style={{ color: '#00AACC', borderColor: '#00AACC' }}>
            <span style={{ background: '#00AACC' }} />Our Story<span style={{ background: '#00AACC' }} />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="hero-text-large mb-6">
            <span style={{ color: '#ffffff' }}>Equipping the </span><span style={{ color: '#00AACC' }}>Maritime World</span>
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/70 max-w-2xl mx-auto text-lg">
            Since 2008, Masani Marine has been a trusted partner to the global shipping industry, providing precision equipment, unparalleled support, and deep technical expertise.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-20 -mt-12 md:-mt-16 mx-auto container max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          <StatBox value="16" suffix="+" label="Years Experience" />
          <StatBox value="500" suffix="+" label="Certified Products" />
          <StatBox value="42" suffix="" label="Countries Served" />
          <StatBox value="1200" suffix="+" label="Vessels Equipped" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-[var(--color-border)]">
              <ShieldCheck size={36} className="text-[var(--color-primary)] mb-5" />
              <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-3">Certified Quality</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                An ISO 9001:2015 certified company. All our products meet stringent marine standards including SOLAS, MED, and ABS/DNV type approvals.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-[var(--color-border)]">
              <Map size={36} className="text-[var(--color-primary)] mb-5" />
              <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-3">Global Logistics</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                Strategically located in Dubai, we leverage integrated air and sea freight networks to deliver critical spares to any port, anywhere.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-[var(--color-border)]">
              <Target size={36} className="text-[var(--color-primary)] mb-5" />
              <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-3">Technical Expertise</h3>
              <p className="text-[var(--color-muted)] text-sm leading-relaxed">
                Our team consists of former marine engineers and captains who understand the realities of sea-going operations firsthand.
              </p>
            </div>
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
