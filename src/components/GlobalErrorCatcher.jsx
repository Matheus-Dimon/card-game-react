import React, { useEffect, useState } from 'react'

export default function GlobalErrorCatcher() {
  const [error, setError] = useState(null)
  const [promiseError, setPromiseError] = useState(null)

  useEffect(() => {
    const onError = (event) => {
      try {
        const err = event && event.error ? event.error : null
        const message = event && event.message ? event.message : (err && err.message) || String(event)
        const stack = err && err.stack ? err.stack : ''
        console.error('Global caught error', event)
        // defer setState to avoid updating other components during render
        setTimeout(() => setError({ message: message?.toString?.() || String(message), stack }), 0)
      } catch (e) {
        // swallow
        console.error('Error in global onError handler', e)
      }
      // don't prevent browser default handling
      return false
    }

    const onRejection = (ev) => {
      try {
        const reason = ev && ev.reason ? ev.reason : ev
        const message = reason && reason.message ? reason.message : String(reason)
        const stack = reason && reason.stack ? reason.stack : ''
        console.error('Global unhandledrejection', reason)
        setTimeout(() => setPromiseError({ message: message?.toString?.() || String(message), stack }), 0)
      } catch (e) {
        console.error('Error in global onRejection handler', e)
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  if (!error && !promiseError) return null

  const e = error || promiseError

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,30,0.85)', color: '#fff', zIndex: 99999, padding: 20, fontFamily: 'monospace', overflow: 'auto' }}>
      <div style={{ maxWidth: 1000, margin: '20px auto' }}>
        <h2 style={{ marginTop: 0 }}>An unexpected error occurred</h2>
        <div style={{ whiteSpace: 'pre-wrap', background: '#071226', padding: 12, borderRadius: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
          <strong>Message:</strong>
          <div>{e.message}</div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <strong>Stack / Info:</strong>
          <div style={{ marginTop: 8 }}>{e.stack || 'No stack available'}</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => { window.location.reload() }} style={{ padding: '8px 12px', background: '#0ea5a3', color: '#002', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Reload</button>
          <button onClick={() => { setError(null); setPromiseError(null) }} style={{ marginLeft: 8, padding: '8px 12px', background: '#334155', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}
