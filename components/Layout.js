// frontend/components/Layout.js
import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '1rem', marginTop: '2rem' }}>
        © {new Date().getFullYear()} FS Project Allocator
      </footer>
    </div>
  );
};

export default Layout;
