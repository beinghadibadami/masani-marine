import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

// Duration constants (ms)
export const TOAST_DURATION = {
  auth: 10000,   // login / register messages — 10 s
  default: 7000, // cart, orders, admin actions — 7 s
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = TOAST_DURATION.default) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const toast = {
    success: (msg, duration)      => addToast(msg, 'success', duration ?? TOAST_DURATION.default),
    error:   (msg, duration)      => addToast(msg, 'error',   duration ?? TOAST_DURATION.default),
    info:    (msg, duration)      => addToast(msg, 'info',    duration ?? TOAST_DURATION.default),
    // Convenience: auth toasts always last 10 s
    authSuccess: (msg) => addToast(msg, 'success', TOAST_DURATION.auth),
    authError:   (msg) => addToast(msg, 'error',   TOAST_DURATION.auth),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 max-w-sm w-full sm:w-auto">
        <AnimatePresence>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100)
  const startRef = useRef(Date.now())
  const rafRef = useRef(null)

  // Animate the progress bar down over the toast duration
  useEffect(() => {
    const duration = toast.duration
    function tick() {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [toast.duration])

  const icons = {
    success: <CheckCircle size={18} />,
    error:   <XCircle size={18} />,
    info:    <Info size={18} />,
  }
  const classes = {
    success: 'toast-success',
    error:   'toast-error',
    info:    'toast-info',
  }
  const barColors = {
    success: 'rgba(255,255,255,0.4)',
    error:   'rgba(255,255,255,0.4)',
    info:    'rgba(255,255,255,0.4)',
  }

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`toast ${classes[toast.type]} relative overflow-hidden`}
      style={{ minWidth: '280px', maxWidth: '380px' }}
    >
      {icons[toast.type]}
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="ml-2 opacity-70 hover:opacity-100 flex-shrink-0">
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] transition-none rounded-b"
        style={{
          width: `${progress}%`,
          background: barColors[toast.type],
        }}
      />
    </motion.div>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
