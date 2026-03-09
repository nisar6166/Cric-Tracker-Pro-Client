import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [location, setLocation] = useState('');
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Show preview when a logo is selected
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // 1. Get the token (required for protected backend routes)
      const token = localStorage.getItem('token');

      // 2. Use FormData to send the file along with text data
      const formData = new FormData();
      formData.append('teamName', teamName);
      formData.append('location', location);
      if (logo) {
        formData.append('teamLogo', logo); // Field name expected by the backend
      }

      // 3. Send data to the API
      const response = await axios.post(import.meta.env.VITE_API_URL + '/api/teams/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}` // Attach Admin token
        }
      });

      setSuccess('Team added successfully!');
      
      // Redirect to the dashboard after 2 seconds
      setTimeout(() => {
        navigate('/mycricket');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Navbar (Simple Header for inner pages) */}
      <nav className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold flex items-center gap-2">
          🏏 CricTrackerPro
        </div>
        <Link to="/mycricket" className="bg-white text-blue-900 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-sm">
          Back to Dashboard
        </Link>
      </nav>

      {/* Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-green-500">
          
          <h2 className="text-2xl font-extrabold text-center text-blue-900 mb-2">Create New Team</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Enter details to register a team for matches</p>
          
          {/* Messages */}
          {error && <div className="text-red-600 mb-4 bg-red-100 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 text-center">{error}</div>}
          {success && <div className="text-green-700 mb-4 bg-green-100 px-4 py-3 rounded-lg text-sm font-bold border border-green-300 text-center">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Team Logo Upload */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-24 h-24 mb-2">
                <div className="w-24 h-24 rounded-full border-4 border-green-100 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                  {preview ? (
                    <img src={preview} alt="Team Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                </label>
              </div>
              <p className="text-xs font-medium text-gray-500">Upload Team Logo (Optional)</p>
            </div>

            {/* Team Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 ml-1">Team Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Chennai Super Kings CC"
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required 
              />
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600 ml-1">Location / District *</label>
              <input 
                type="text" 
                placeholder="e.g. Malappuram"
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required 
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 text-white rounded-lg font-bold text-lg shadow-md mt-2 transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {loading ? 'Saving...' : 'Save Team'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default AddTeam;