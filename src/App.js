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
  const [debugInfo, setDebugInfo] = useState('');

  // Better API URL handling
  const API_URL = process.env.REACT_APP_API_URL || 'https://myapp.goodnesstechhost.xyz';

  // Debug function to log information
  const debugLog = (message, data = null) => {
    console.log(`[DEBUG] ${message}`, data);
    setDebugInfo(prev => `${prev}\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  useEffect(() => {
    debugLog('App initialized');
    debugLog('API URL:', API_URL);
    
    // Check if API URL is properly configured
    if (API_URL.includes('https://myapp.goodnesstechhost.xyz')) {
      setError('⚠️ API URL not configured. Please set REACT_APP_API_URL environment variable.');
    }
  }, [API_URL]);

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    debugLog('Starting registration', { username, hasPassword: !!password });
    
    try {
      debugLog('Making registration request to:', `${API_URL}/api/register`);
      
      const response = await axios.post(`${API_URL}/api/register`, {
        username,
        password
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      debugLog('Registration response:', response.data);
      setToken(response.data.token);
      setIsRegistered(true);
      setError('');
      debugLog('Registration successful');
      
    } catch (err) {
      debugLog('Registration error:', err);
      debugLog('Error response:', err.response);
      debugLog('Error message:', err.message);
      
      let errorMessage = 'Registration failed';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server not responding';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - cannot reach server';
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        debugLog('Server response status:', err.response.status);
        debugLog('Server response data:', err.response.data);
      } else if (err.request) {
        errorMessage = 'No response from server - check if backend is running';
        debugLog('No response received:', err.request);
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    debugLog('Starting login', { username, hasPassword: !!password });
    
    try {
      debugLog('Making login request to:', `${API_URL}/api/login`);
      
      const response = await axios.post(`${API_URL}/api/login`, {
        username,
        password
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      debugLog('Login response:', response.data);
      setToken(response.data.token);
      setError('');
      debugLog('Login successful');
      
    } catch (err) {
      debugLog('Login error:', err);
      debugLog('Error response:', err.response);
      debugLog('Error message:', err.message);
      
      let errorMessage = 'Login failed';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - server not responding';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - cannot reach server';
      } else if (err.response) {
        errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        debugLog('Server response status:', err.response.status);
        debugLog('Server response data:', err.response.data);
      } else if (err.request) {
        errorMessage = 'No response from server - check if backend is running';
        debugLog('No response received:', err.request);
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startPairing = async () => {
    setLoading(true);
    setError('');
    debugLog('Starting pairing process', { phone });
    
    try {
      await axios.post(`${API_URL}/api/start-pairing`, { phoneNumber: phone }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      debugLog('Pairing request sent, starting to poll for code');
      
      // Poll for pairing code
      const pollCode = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/get-pairing-code?phone=${phone}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.code) {
            setCode(response.data.code);
            setLoading(false);
            debugLog('Pairing code received:', response.data.code);
          } else {
            debugLog('No code yet, polling again...');
            setTimeout(pollCode, 3000);
          }
        } catch (err) {
          debugLog('Error polling for code:', err);
          setTimeout(pollCode, 3000);
        }
      };
      
      pollCode();
    } catch (err) {
      setLoading(false);
      debugLog('Pairing error:', err);
      setError(err.response?.data?.error || 'Pairing failed');
    }
  };

  // Test backend connection
  const testConnection = async () => {
    setError('');
    debugLog('Testing backend connection...');
    
    try {
      const response = await axios.get(`${API_URL}/api/health`, {
        timeout: 5000
      });
      debugLog('Connection test successful:', response.data);
      setError('✅ Backend connection successful!');
    } catch (err) {
      debugLog('Connection test failed:', err);
      setError(`❌ Backend connection failed: ${err.message}`);
    }
  };

  if (!token) {
    return (
      <div className="container">
        <h1>WhatsApp Pairing Service</h1>
        
        {/* Debug Panel */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px',
          margin: '10px 0',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          <strong>Debug Info:</strong>
          <div>API URL: {API_URL}</div>
          <button onClick={testConnection} style={{
            fontSize: '12px',
            padding: '5px 10px',
            margin: '5px 0'
          }}>
            Test Backend Connection
          </button>
          <pre style={{
            maxHeight: '100px',
            overflow: 'auto',
            fontSize: '10px',
            background: 'white',
            padding: '5px',
            margin: '5px 0'
          }}>
            {debugInfo}
          </pre>
        </div>
        
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
              <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p>Already registered? <button type="button" onClick={() => setIsRegistered(true)}>Login</button></p>
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
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p>Need to register? <button type="button" onClick={() => setIsRegistered(false)}>Register</button></p>
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
