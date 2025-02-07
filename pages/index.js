// frontend/pages/index.js
import React from 'react';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div
        style={{
          /* A green gradient background */
          minHeight: 'calc(100vh - 80px)', // adjust if you have a fixed navbar/footer
          background: 'linear-gradient(135deg,rgb(249, 251, 246),rgb(242, 246, 240))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        {/* Centered content card */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: '#2d8642', fontSize: '2rem', marginBottom: '1rem' }}>
            Welcome to FS Tech & Analytics
          </h1>
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: '1.5' }}>
            Pwc US
          </p>
          <a
            href="/signup"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3cb371',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#349e5f')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3cb371')}
          >
            SignUp
          </a>
        </div>
      </div>
    </Layout>
  );
}
