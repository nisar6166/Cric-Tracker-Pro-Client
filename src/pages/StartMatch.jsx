import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const StartMatch = () => {
  const { matchId } = useParams(); 
  const isEditMode = Boolean(matchId); 

  // --- Main Form States ---
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [totalOvers, setTotalOvers] = useState('');
  const [city, setCity] = useState('');
  const [ground, setGround] = useState('');
  const [dateOfMatch, setDateOfMatch] = useState('');
  const [ballType, setBallType] = useState('Tennis');
  const [status, setStatus] = useState('Scheduled'); 
  
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Modal States ---
  const [showModal, setShowModal] = useState(false);
  const [targetDropdown, setTargetDropdown] = useState(''); 
  const [modalTeamName, setModalTeamName] = useState('');
  const [modalLocation, setModalLocation] = useState('');
  const [modalLogo, setModalLogo] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  
  const navigate = useNavigate();

  const fetchTeamsList = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams/all');
      setTeams(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchTeamsList(); 

      if (isEditMode) {
        try {
          const matchRes = await axios.get(`http://localhost:5000/api/matches/${matchId}`);
          const matchData = matchRes.data;
          
          const tA_id = (matchData.teamA && typeof matchData.teamA === 'object') ? matchData.teamA._id : matchData.teamA;
          const tB_id = (matchData.teamB && typeof matchData.teamB === 'object') ? matchData.teamB._id : matchData.teamB;
          
          setTeamA(tA_id || '');
          setTeamB(tB_id || '');
          setTotalOvers(matchData.totalOvers || '');
          setCity(matchData.city || '');
          setGround(matchData.ground || '');
          setBallType(matchData.ballType || 'Tennis');
          setStatus(matchData.status || 'Scheduled');
          
          if (matchData.dateOfMatch) {
            const formattedDate = new Date(matchData.dateOfMatch).toISOString().slice(0, 16);
            setDateOfMatch(formattedDate);
          }
        } catch (err) {
          setError("Failed to load match details for editing.");
        }
      }
    };
    loadInitialData();
  }, [matchId, isEditMode]);

  const handleTeamAChange = (e) => {
    if (e.target.value === 'add_new') {
      setTargetDropdown('A'); setShowModal(true); setTeamA('');
    } else { setTeamA(e.target.value); }
  };

  const handleTeamBChange = (e) => {
    if (e.target.value === 'add_new') {
      setTargetDropdown('B'); setShowModal(true); setTeamB('');
    } else { setTeamB(e.target.value); }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true); setModalError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('teamName', modalTeamName);
      formData.append('location', modalLocation);
      if (modalLogo) formData.append('teamLogo', modalLogo);

      const response = await axios.post('http://localhost:5000/api/teams/add', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const updatedTeams = await fetchTeamsList();
      const createdTeam = updatedTeams.find(t => t.teamName === modalTeamName);
      const newTeamId = createdTeam ? createdTeam._id : response.data.team?._id;

      if (newTeamId) {
        if (targetDropdown === 'A') setTeamA(newTeamId);
        if (targetDropdown === 'B') setTeamB(newTeamId);
      }
      setShowModal(false); setModalTeamName(''); setModalLocation(''); setModalLogo(null);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to add team.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (teamA === teamB) {
      setError("Team A and Team B cannot be the same."); return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const matchData = {
        teamA, teamB, totalOvers: Number(totalOvers),
        city, ground, dateOfMatch, ballType, status
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/matches/update/${matchId}`, matchData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('Match updated successfully!');
        setTimeout(() => navigate('/mycricket'), 1500);
      } else {
        // Create New Match & directly navigate back to MyCricket page
        await axios.post('http://localhost:5000/api/matches/create', matchData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        setSuccess('Match scheduled successfully!');
        setTimeout(() => navigate(`/mycricket`), 1500);
      }

    } catch (err) {
      console.error("Save Error Details:", err);
      const detailedError = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`Failed: ${detailedError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 relative">
      <nav className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold flex items-center gap-2">🏏 CricTrackerPro</div>
        <Link to="/mycricket" className="bg-white text-blue-900 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-100 transition shadow-sm">Cancel & Go Back</Link>
      </nav>

      <main className="flex-1 flex flex-col items-center py-10 px-4 w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-500 relative z-10">
          <h2 className="text-2xl font-extrabold text-center text-blue-900 mb-2">
            {isEditMode ? 'Edit Match Details ✏️' : 'Start a New Match 🏏'}
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            {isEditMode ? 'Update the details below' : 'Select teams and configure match settings'}
          </p>
          
          {error && <div className="text-red-600 mb-6 bg-red-100 px-4 py-3 rounded-lg text-sm font-medium border border-red-200 text-center animate-fade-in">{error}</div>}
          {success && <div className="text-green-700 mb-6 bg-green-100 px-4 py-3 rounded-lg text-sm font-bold border border-green-300 text-center animate-fade-in">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-4 uppercase tracking-wider">1. Select Playing Teams</h3>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full">
                  <label className="text-xs font-bold text-gray-600 ml-1">Host Team (Team A) *</label>
                  <select className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium" value={teamA} onChange={handleTeamAChange} required>
                    <option value="">-- Select Team A --</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                    <option value="add_new" className="font-bold text-blue-600 bg-blue-50">➕ + Create New Team</option>
                  </select>
                </div>
                <div className="bg-blue-900 text-white font-black rounded-full w-10 h-10 flex items-center justify-center shrink-0 shadow-md">VS</div>
                <div className="w-full">
                  <label className="text-xs font-bold text-gray-600 ml-1">Visitor Team (Team B) *</label>
                  <select className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium" value={teamB} onChange={handleTeamBChange} required>
                    <option value="">-- Select Team B --</option>
                    {teams.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                    <option value="add_new" className="font-bold text-blue-600 bg-blue-50">➕ + Create New Team</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">2. Match Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-600 ml-1">Total Overs *</label>
                  <input type="number" min="1" className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={totalOvers} onChange={(e) => setTotalOvers(e.target.value)} required />
                </div>
                
                {isEditMode ? (
                  <div>
                    <label className="text-xs font-bold text-gray-600 ml-1">Match Status</label>
                    <select className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-bold text-blue-900" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Live">Live</option>
                      <option value="Completed">Completed</option>
                      <option value="Abandoned">Abandoned</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-600 ml-1">Ball Type</label>
                    <select className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={ballType} onChange={(e) => setBallType(e.target.value)}>
                      <option value="Tennis">Tennis</option>
                      <option value="Leather">Leather</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-600 ml-1">City / Location *</label>
                  <input type="text" className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 ml-1">Ground Name *</label>
                  <input type="text" className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={ground} onChange={(e) => setGround(e.target.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 ml-1">Match Date & Time *</label>
                  <input type="datetime-local" className="w-full mt-1 py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={dateOfMatch} onChange={(e) => setDateOfMatch(e.target.value)} required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md mt-2 transition duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'}`}>
              {loading ? 'Processing...' : (isEditMode ? 'Update Match Details ✅' : 'Save Match')}
            </button>
          </form>
        </div>
      </main>

      {/* MODAL CODE FOR ADDING NEW TEAM */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-extrabold text-blue-900 mb-4 border-b pb-2">Create New Team</h3>
            
            {modalError && <p className="text-red-600 text-xs font-bold mb-3 bg-red-100 p-2 rounded">{modalError}</p>}
            
            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Team Name *</label>
                <input type="text" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={modalTeamName} onChange={(e) => setModalTeamName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Location *</label>
                <input type="text" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={modalLocation} onChange={(e) => setModalLocation(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Team Logo (Optional)</label>
                <input type="file" accept="image/*" className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={(e) => setModalLogo(e.target.files[0])} />
              </div>
              
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" disabled={modalLoading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                  {modalLoading ? 'Saving...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartMatch;