import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/reset-password', { email, newPassword });
      
      setMessage("Password updated successfully! ✅");
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage("Email not found. Please try again! ❌");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-black text-blue-900 mb-2 text-center">Reset Password 🔐</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your registered email and a new password.</p>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm font-bold text-center ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Registered Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-black mt-2 hover:bg-blue-700 transition shadow-md">
            RESET PASSWORD
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600">⬅️ Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;