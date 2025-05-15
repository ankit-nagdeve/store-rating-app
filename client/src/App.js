import React, { useState, useEffect } from 'react';
import StoreList from './StoreList'; 
const API_BASE = 'http://localhost:4000/api';

function App() {
  const [page, setPage] = useState('login'); // 'login' or 'signup' or 'dashboard'
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Handle form input changes
  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Signup submit
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation example (you can extend this)
    if (signupData.name.length < 20) {
      setError('Name must be at least 20 characters');
      setLoading(false);
      return;
    }
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const json = await res.json();

      if (res.ok) {
        alert('Signup successful! Please login.');
        setPage('login');
        setSignupData({ name: '', email: '', password: '', address: '' });
      } else {
        setError(json.error || 'Signup failed');
      }
    } catch (err) {
      setError('Signup failed: ' + err.message);
    }
    setLoading(false);
  };

  // Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const json = await res.json();

      if (res.ok) {
        setToken(json.token);
        localStorage.setItem('token', json.token);
        setUserName(json.name || '');
        setPage('dashboard');
        setLoginData({ email: '', password: '' });
      } else {
        setError(json.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  // Logout user
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setPage('login');
    setUserName('');
  };

  // Simple dashboard page after login
 if (page === 'dashboard' && token) {
     return (
       <div style={styles.container}>
         <h1>Welcome {userName || 'User '}!</h1>
         <button onClick={handleLogout} style={styles.button}>
           Logout
         </button>
         <StoreList token={token} /> {/* Add this line to render StoreList */}
       </div>
     );
   }

  return (
    <div style={styles.container}>
      <h1>{page === 'login' ? 'Login' : 'Sign Up'}</h1>
      {error && <div style={styles.error}>{error}</div>}

      {page === 'signup' ? (
        <form onSubmit={handleSignup} style={styles.form}>
          <input
            name="name"
            placeholder="Name (min 20 chars)"
            value={signupData.name}
            onChange={handleSignupChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupData.email}
            onChange={handleSignupChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupData.password}
            onChange={handleSignupChange}
            required
            style={styles.input}
          />
          <textarea
            name="address"
            placeholder="Address"
            value={signupData.address}
            onChange={handleSignupChange}
            style={styles.textarea}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => setPage('login')} style={styles.linkButton}>
              Login
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={loginData.email}
            onChange={handleLoginChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleLoginChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => setPage('signup')} style={styles.linkButton}>
              Sign Up
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    height: '80px',
    resize: 'vertical',
  },
  button: {
    padding: '10px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
};

export default App;
