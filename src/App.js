import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://your-pterodactyl-server.com';

  const register = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        username,
        password
      });
      setToken(response.data.token);
      setIsRegistered(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password
      });
      setToken(response.data.token);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const startPairing = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/start-pairing`, { phoneNumber: phone }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Poll for pairing code
      const pollCode = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/get-pairing-code?phone=${phone}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.code) {
            setCode(response.data.code);
            setLoading(false);
          } else {
            setTimeout(pollCode, 3000);
          }
        } catch (err) {
          setTimeout(pollCode, 3000);
        }
      };
      
      pollCode();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Pairing failed');
    }
  };

  if (!token) {
    return (
      <div className="container">
        <h1>WhatsApp Pairing Service</h1>
        
        {!isRegistered ? (
          <div className="auth-form">
            <h2>Register</h2>
            <form onSubmit={register}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
            <p>Already registered? <button onClick={() => setIsRegistered(true)}>Login</button></p>
          </div>
        ) : (
          <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={login}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
          </div>
        )}
        
        {error && <div className="error">{error}</div>}
        
        <div className="channel-link">
          <a href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer">
            Join our Telegram channel for support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>WhatsApp Pairing Service</h1>
      
      <div className="pairing-form">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number with country code"
        />
        
        <button 
          onClick={startPairing} 
          disabled={loading || !phone}
        >
          {loading ? 'Processing...' : 'Start Pairing'}
        </button>
        
        {code && (
          <div className="pairing-code">
            <h2>Your Pairing Code:</h2>
            <div className="code-display">{code}</div>
            <p>Enter this code in WhatsApp when prompted</p>
          </div>
        )}
        
        {error && <div className="error">{error}</div>}
      </div>
      
      <div className="channel-link">
        <a href="https://t.me/your_channel" target="_blank" rel="noopener noreferrer">
          Join our Telegram channel for support
        </a>
      </div>
    </div>
  );
}

export default App;
