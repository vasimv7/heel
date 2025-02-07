// // frontend/components/Navbar.js

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for token on component mount
  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // Remove token
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Optionally redirect to home or login
    window.location.href = '/';
  };

  return (
    <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
      <Link href="/" style={{ marginRight: '1rem' }}>
        Home
      </Link>

      {isLoggedIn ? (
        // If logged in, show these links
        <>
          <Link href="/dashboard" style={{ marginRight: '1rem' }}>
            Dashboard
          </Link>
          <Link href="/projects" style={{ marginRight: '1rem' }}>
            Projects
          </Link>
          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        // If not logged in, show Login/Signup
        <>
          <Link href="/login" style={{ marginRight: '1rem' }}>
            Login
          </Link>
          <Link href="/signup">
            Signup
          </Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
