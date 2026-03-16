'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              An unexpected error occurred.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                background: '#000',
                color: '#fff',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
