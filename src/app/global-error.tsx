'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        backgroundColor: '#0f172a',
        color: '#e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f87171' }}>
          حدث خطأ في التطبيق
        </h2>
        <p style={{ marginBottom: '0.5rem', color: '#94a3b8', maxWidth: '600px' }}>
          {error.message || 'خطأ غير معروف'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            مسح البيانات وإعادة التحميل
          </button>
        </div>
      </body>
    </html>
  )
}
