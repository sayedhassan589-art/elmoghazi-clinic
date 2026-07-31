'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      direction: 'rtl',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#dc2626' }}>
        حدث خطأ في التطبيق
      </h2>
      <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
        {error.message || 'خطأ غير معروف'}
      </p>
      {error.digest && (
        <p style={{ marginBottom: '0.5rem', color: '#9ca3af', fontSize: '0.8rem' }}>
          رمز الخطأ: {error.digest}
        </p>
      )}
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
    </div>
  )
}
