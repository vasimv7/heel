// // frontend/pages/signup.js
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';
// import Layout from '../components/Layout';

// const Signup = () => {
//   const [name, setName]         = useState('');
//   const [email, setEmail]       = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole]         = useState('employee'); 
//   const [error, setError]       = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
//         { name, email, password, role }
//       );
//       localStorage.setItem('token', res.data.token);
//       router.push('/dashboard');
//     } catch (err) {
//       setError(err.response?.data?.msg || 'Signup failed');
//     }
//   };

//   return (
//     <Layout>
//       <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
//         <h1>Signup</h1>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div>
//             <label>Name:</label><br/>
//             <input
//               type="text"
//               value={name}
//               onChange={e => setName(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Email:</label><br/>
//             <input
//               type="email"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label>Password:</label><br/>
//             <input
//               type="password"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label>Role:</label><br/>
//             <select
//               value={role}
//               onChange={e => setRole(e.target.value)}
//               required
//             >
//               <option value="employee">Employee</option>
//               <option value="manager">Manager</option>
//               <option value="hr">HR</option>
//               <option value="director">Director</option>
//             </select>
//           </div>

//           <button type="submit" style={{ marginTop: '1rem' }}>Signup</button>
//         </form>
//       </div>
//     </Layout>
//   );
// };

// export default Signup;
// frontend/pages/signup.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

const Signup = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('employee');
  const [error, setError]       = useState('');
  
  const router = useRouter();

  // If user is already logged in (token exists), redirect to /dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        { name, email, password, role }
      );
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h1>Signup</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label><br/>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label>Email:</label><br/>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label>Password:</label><br/>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Role:</label><br/>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="director">Director</option>
            </select>
          </div>

          <button type="submit" style={{ marginTop: '1rem' }}>
            Signup
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;
