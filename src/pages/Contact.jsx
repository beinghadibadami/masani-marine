import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Anchor } from 'lucide-react'
import { useToast } from '../components/ui/Toast'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate form submission
    setTimeout(() => {
      setLoading(false)
      toast.success('Message sent! We will contact you within 24 hours.')
      e.target.reset()
    }, 1500)
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen py-10">
      
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <div className="section-label justify-center mb-3">Get in Touch</div>
          <h1 className="font-heading text-4xl font-extrabold text-[var(--color-navy)] uppercase tracking-wide">
            Contact Us
          </h1>
          <p className="text-[var(--color-muted)] mt-2 max-w-xl mx-auto">
            Need a technical quote, shipping estimate, or have questions about our equipment? Our marine engineers are ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold uppercase text-[var(--color-navy)] mb-6 border-b border-[var(--color-border)] pb-3">Corporate Office</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold uppercase text-[var(--color-muted)] mb-1">Address</div>
                    <div className="text-[var(--color-text)] text-sm">
                      FF-10, GOLDEN PLAZA,<br/>
                      DESAI SHERI, BHAVNAGAR,<br/>
                      GUJARAT 364001, INDIA
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold uppercase text-[var(--color-muted)] mb-1">Phone / WhatsApp</div>
                    <a href="tel:+918200921272" className="text-[var(--color-text)] text-sm hover:text-[var(--color-primary)] font-bold transition-colors">
                      +91 82009 21272
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold uppercase text-[var(--color-muted)] mb-1">Email</div>
                    <a href="mailto:sales@masanienterprise.com" className="text-[var(--color-text)] text-sm hover:text-[var(--color-primary)] font-bold transition-colors">
                      sales@masanienterprise.com
                    </a>
                    <div className="text-[var(--color-muted)] text-xs mt-1">Direct: ZAHIR MASANI</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold uppercase text-[var(--color-muted)] mb-1">Working Hours</div>
                    <div className="text-[var(--color-text)] text-sm">
                      Mon - Friday: 08:00 - 18:00 GST<br/>
                      AOG/Emergency: 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Map Embed */}
            <div className="bg-white border border-[var(--color-border)] rounded-xl h-80 shadow-sm relative overflow-hidden">
               <iframe 
                 title="Masani Enterprise Location"
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 scrolling="no" 
                 marginHeight="0" 
                 marginWidth="0" 
                 src="https://maps.google.com/maps?q=FF-10,GOLDEN%20PLAZA,DESAI%20SHERI,BHAVNAGAR%20364001&t=&z=15&ie=UTF8&iwloc=&output=embed"
               />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-8 lg:p-10 shadow-sm">
              <h2 className="font-heading text-2xl font-bold uppercase text-[var(--color-navy)] mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name</label>
                    <input type="text" required className="input" placeholder="Capt. John Doe" />
                  </div>
                  <div>
                    <label className="label">Company / Vessel (Optional)</label>
                    <input type="text" className="input" placeholder="Vessel Name or Company" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" required className="input" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input type="tel" className="input" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <div>
                  <label className="label">Subject / Inquiry Type</label>
                  <select className="input" required>
                    <option value="">Select Topic...</option>
                    <option value="quote">Request a Quote</option>
                    <option value="technical">Technical Support</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="label">Message / Requirements</label>
                  <textarea 
                    required 
                    rows={6}
                    className="input resize-y" 
                    placeholder="Please include part numbers or specific specs if known..."
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full sm:w-auto">
                  {loading ? <div className="loader" style={{ width:24, height:24, borderWidth:2 }}/> : <><Send size={18} /> Submit Inquiry</>}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
