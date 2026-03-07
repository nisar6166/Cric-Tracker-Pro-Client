import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AddPlayer = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('Batsman');
  const [team, setTeam] = useState('');
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Fetch teams when the component loads
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teams/all');
        setTeams(response.data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeams();
  }, []);

  // Handle profile image selection and show preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!team) {
      setError("Please select a team for the player.");
      setLoading(false);
      return;
    }

    try {
      // Get the admin token from local storage
      const token = localStorage.getItem('token');

      // Prepare data using FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('mobile', mobile);
      formData.append('age', age);
      formData.append('role', role);
      formData.append('team', team); // Sending the team's ObjectId
      
      if (image) {
        formData.append('profileImage', image);
      }

      // API call to add the player
      await axios.post('http://localhost:5000/api/players/add', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Player added successfully!');
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/mycricket');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* Navbar Section */}
      <nav className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold flex items-center gap-2">
          🏏 CricTrackerPro
        </div>
        <Link to="/mycricket" className="bg-white text-blue-900 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-sm">
          Back to Dashboard
        </Link>
      </nav>

      {/* Main Form Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-purple-500">
          
          <h2 className="text-2xl font-extrabold text-center text-blue-900 mb-2">Register Player</h2>
          <p className="text-center text-gray-500 text-sm mb-6">Add a new player to your squad</p>
          
          {error && <div className="text-red-600 mb-4 bg-red-100 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 text-center">{error}</div>}
          {success && <div className="text-green-700 mb-4 bg-green-100 px-4 py-3 rounded-lg text-sm font-bold border border-green-300 text-center">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Player Image Upload */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative w-24 h-24 mb-2">
                <div className="w-24 h-24 rounded-full border-4 border-purple-100 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                  {preview ? (
                    <img src={preview} alt="Player Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center px-2">No Photo</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-xs font-medium text-gray-500">Upload Player Photo</p>
            </div>

            {/* Input Fields */}
            <input 
              type="text" 
              placeholder="Player Name *"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />

            <div className="flex gap-4">
              <input 
                type="number" 
                placeholder="Age *"
                className="w-1/3 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                value={age}
                onChange={(e) => setAge(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Mobile Number *"
                className="w-2/3 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)} 
              />
            </div>

            {/* Role Selection Dropdown */}
            <select 
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-700 font-medium"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicket-keeper">Wicket-keeper</option>
            </select>

            {/* Team Selection Dropdown */}
            <select 
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-700 font-medium"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
            >
              <option value="">-- Select Team --</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.teamName} ({t.location})
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 text-white rounded-lg font-bold text-lg shadow-md mt-2 transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? 'Adding Player...' : 'Save Player'}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default AddPlayer;