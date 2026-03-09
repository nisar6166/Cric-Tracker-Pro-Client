import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  // Clearing existing data when the login page opens
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('userName');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      setError('Please agree to the Privacy Notice and Terms of conditions.');
      return;
    }
    
    setError(''); 

    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', {
        identifier,
        password
      });

      // 1. Saving all information to local storage upon successful login
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role); 
      localStorage.setItem('profilePic', response.data.user.profilePic || "");
      localStorage.setItem('userName', response.data.user.name);

      // 2. Redirecting directly to the home page
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Navbar Section */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full shadow-md">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>
        
        <div className="hidden md:flex gap-8 text-lg font-medium">
          <Link to="/" className="hover:text-blue-300 transition">Home</Link>
          <Link to="/" className="hover:text-blue-300 transition">Matches</Link>
          <Link to="/" className="hover:text-blue-300 transition">About</Link>
        </div>
        
        <div className="flex gap-6 text-lg items-center font-medium">
          <Link to="/contact" className="hover:text-blue-300 hidden md:block transition">Contact</Link>
          <Link to="/signup" className="hover:text-blue-300 transition">Signup</Link>
        </div>
      </nav>

      {/* Login Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 w-full">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
          <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-8">Log In</h2>
          
          {error && <div className="text-red-600 mb-6 bg-red-100 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 text-center">{error}</div>}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 ml-1">Email or Mobile</label>
              <input 
                type="text" 
                placeholder="Enter your email or mobile"
                className="w-full py-3 px-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full py-3 px-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-3 text-sm mt-1 text-gray-600">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-1 cursor-pointer accent-blue-600"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>I agree to the <Link to="/" className="text-blue-600 hover:underline">Privacy Notice</Link> and <Link to="/" className="text-blue-600 hover:underline">Terms</Link></span>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-bold text-lg shadow-md mt-2"
            >
              Login to Account
            </button>

            <div className="text-right mt-1 mb-4">
  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold transition">
    Forgot Password?
  </Link>
</div>

            <div className="text-sm text-center mt-4">
              Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-bold">Create Account</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;