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
      {error.stack && (
        <pre style={{ 
          marginBottom: '1rem', 
          color: '#64748b', 
          fontSize: '0.7rem', 
          maxWidth: '800px',
          overflow: 'auto',
          textAlign: 'left',
          direction: 'ltr',
          backgroundColor: '#1e293b',
          padding: '1rem',
          borderRadius: '0.5rem',
          maxHeight: '200px'
        }}>
          {error.stack.substring(0, 1000)}
        </pre>
      )}
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
