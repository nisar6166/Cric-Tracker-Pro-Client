import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
    mobile: '',
    role: 'viewer' 
  });
  
  const [file, setFile] = useState(null); // to save file
  const [preview, setPreview] = useState(null); // to see preview
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Changes upon photo selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreeTerms) {
      setError("Please agree to the Privacy Notice and Terms of conditions.");
      return;
    }

    try {
      // 1. Using FormData to send data including files
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobile', formData.mobile);
      data.append('role', formData.role);
      
      if (file) {
        data.append('profilePic', file); // Multer on the backend looks for this name
      }

      // 2. Sending data via Axios (Content-Type will be set automatically)
      const response = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/register', data);
      
      setSuccess("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* 1. Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full shadow-md">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>
        <div className="flex gap-6 text-lg items-center font-medium">
          <Link to="/login" className="hover:text-blue-300 transition">Login</Link>
          <Link to="/signup" className="bg-white text-blue-900 px-5 py-2 rounded-full font-bold shadow-sm">Signup</Link>
        </div>
      </nav>

      {/* 2. Signup Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border-t-4 border-blue-600">
          <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-6">Sign Up</h2>
          
          {error && <div className="text-red-600 mb-4 bg-red-100 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 text-center">{error}</div>}
          {success && <div className="text-green-700 mb-4 bg-green-100 px-4 py-3 rounded-lg text-sm font-bold border border-green-300 text-center">{success}</div>}

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            
            {/* --- photo upload section --- */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 mb-2">
                <div className="w-24 h-24 rounded-full border-4 border-blue-100 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center px-1">No Photo Selected</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md">
                  <span className="text-xs font-bold">Add</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500">Upload Profile Photo (Required for Admin/Scorer)</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" name="name" placeholder="Full Name" className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" onChange={handleChange} required />
            </div>

            <input type="email" name="email" placeholder="Email Id" className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" onChange={handleChange} required />
            <input type="text" name="mobile" placeholder="Mobile Number" className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" onChange={handleChange} required />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Select Role</label>
              <select name="role" className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 font-medium cursor-pointer" onChange={handleChange}>
                <option value="viewer">Viewer</option>
                <option value="scorer">Scorer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-start gap-2 text-sm mt-1 text-gray-600">
              <input type="checkbox" className="w-4 h-4 mt-1 cursor-pointer accent-blue-600" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <span>I agree to the <Link to="/" className="text-blue-600 hover:underline">Privacy Notice</Link> and <Link to="/" className="text-blue-600 hover:underline">Terms of conditions</Link></span>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-bold text-lg shadow-md mt-2">
              Create Account
            </button>

            <div className="text-sm text-center text-gray-600 mt-2">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Login</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Signup;