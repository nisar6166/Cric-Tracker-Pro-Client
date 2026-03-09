import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const MyCricket = () => {
  const [activeTab, setActiveTab] = useState('Matches');
  const [matchSubTab, setMatchSubTab] = useState('Scheduled');

  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [searchTeam, setSearchTeam] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamLocation, setEditTeamLocation] = useState('');

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editPlayerId, setEditPlayerId] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerAge, setEditPlayerAge] = useState('');
  const [editPlayerMobile, setEditPlayerMobile] = useState('');
  const [editPlayerRole, setEditPlayerRole] = useState('');

  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profilePic = localStorage.getItem('profilePic');
  const userName = localStorage.getItem('userName');

  const isAdmin = role?.toLowerCase()?.trim() === 'admin';
  const isScorer = role?.toLowerCase()?.trim() === 'scorer';

  useEffect(() => {
    if (!token) {
      alert("Access Denied! Please login as Admin or Scorer.");
      navigate('/login');
    }
  }, [navigate, token]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [matchRes, teamRes, playerRes, tournamentRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL + '/api/matches/all'),
        axios.get(import.meta.env.VITE_API_URL + '/api/teams/all'),
        axios.get(import.meta.env.VITE_API_URL + '/api/players/all'),
        axios.get(import.meta.env.VITE_API_URL + '/api/tournaments/all')
      ]);
      setMatches(matchRes.data);
      setTeams(teamRes.data);
      setPlayers(playerRes.data);
      setTournaments(tournamentRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getProfileImg = () => {
    if (profilePic && profilePic !== "undefined") return `${import.meta.env.VITE_API_URL}/${profilePic}`;
    return "https://placehold.co/150?text=No+Photo";
  };

  // --- ADMIN ONLY HANDLERS ---
  const handleDeleteMatch = async (id) => {
    if (!window.confirm("Delete this match?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/matches/delete/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchAllData();
    } catch (err) { alert("Failed to delete match."); }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm("Delete this tournament?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tournaments/delete/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchAllData();
    } catch (err) { alert("Failed to delete tournament."); }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Delete this team?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/teams/delete/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchAllData();
    } catch (err) { alert("Failed to delete team."); }
  };

  const openEditTeamModal = (team) => {
    setEditTeamId(team._id); setEditTeamName(team.teamName); setEditTeamLocation(team.location); setShowTeamModal(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/teams/update/${editTeamId}`,
        { teamName: editTeamName, location: editTeamLocation },
        { headers: { 'Authorization': `Bearer ${token}` } });
      setShowTeamModal(false); fetchAllData();
    } catch (err) { alert("Failed to update team."); }
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm("Delete this player?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/players/delete/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      fetchAllData();
    } catch (err) { alert("Failed to delete player."); }
  };

  const openEditPlayerModal = (player) => {
    setEditPlayerId(player._id); setEditPlayerName(player.name); setEditPlayerRole(player.role); setShowPlayerModal(true);
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/players/update/${editPlayerId}`,
        { name: editPlayerName, role: editPlayerRole },
        { headers: { 'Authorization': `Bearer ${token}` } });
      setShowPlayerModal(false); fetchAllData();
    } catch (err) { alert("Failed to update player."); }
  };

  const filteredTeams = teams.filter((team) => team.teamName.toLowerCase().includes(searchTeam.toLowerCase()) || team.location.toLowerCase().includes(searchTeam.toLowerCase()));
  const filteredPlayers = players.filter((player) => player.name.toLowerCase().includes(searchPlayer.toLowerCase()) || player.role.toLowerCase().includes(searchPlayer.toLowerCase()));

  const renderTabContent = () => {
    if (isLoading) return <div className="text-center py-20 font-bold text-blue-900">Loading Data... 🏏</div>;

    switch (activeTab) {
      case 'Matches':
        return (
          <div className="p-4 animate-fade-in">
            {isAdmin && (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-700 font-medium text-lg mb-4 sm:mb-0">Ready to start a new match?</p>
                <Link to="/start-match" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-md transition">Start Match 🏏</Link>
              </div>
            )}

            <div className="mt-8">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-extrabold text-blue-900">🏆 Matches</h3>

                {/*  SUB-TABS (Scheduled & Completed) */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-full shadow-inner">
                  <button
                    onClick={() => setMatchSubTab('Scheduled')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${matchSubTab === 'Scheduled' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    ⏳ Scheduled/Live
                  </button>
                  <button
                    onClick={() => setMatchSubTab('Completed')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${matchSubTab === 'Completed' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    ✅ Completed
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {matches
                  .filter(match =>
                    matchSubTab === 'Scheduled'
                      ? (match.status === 'Scheduled' || match.status === 'Live' || !match.status)
                      : (match.status === 'Completed' || match.status === 'Abandoned')
                  )
                  .map(match => (
                    <div key={match._id} className={`bg-white p-5 rounded-2xl shadow-md border-t-4 relative hover:shadow-lg transition ${match.status === 'Completed' ? 'border-green-500' : match.status === 'Live' ? 'border-red-500' : 'border-yellow-400'}`}>
                      <div className="absolute -top-3 left-4">
                        <span className={`px-3 py-1 text-[10px] uppercase font-black rounded-full shadow-sm ${match.status === 'Live' ? 'bg-red-500 text-white animate-pulse' : match.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                          {match.status || 'Scheduled'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-4 mt-2">

  {/* Date and Time section */}
  <div className="text-[10px] font-bold text-gray-500 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
    <span>📅</span>
    {(() => {
      // match.date, match.matchDateTime, match.dateOfMatch
      const d = match.date || match.matchDateTime || match.dateOfMatch;
      if (!d) return "Date TBD";
      const dateObj = new Date(d);
      return isNaN(dateObj.getTime()) 
        ? "Invalid Date" 
        : dateObj.toLocaleString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
    })()}
  </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider">{match.totalOvers} Overs • {match.city}</span>
                      </div>

                      <div className="flex justify-between items-center mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-sm font-black text-blue-900 truncate w-2/5 text-center">{match.teamA?.teamName}</h4>
                        <div className="w-8 h-8 bg-white shadow-sm text-gray-400 border border-gray-100 rounded-full flex items-center justify-center text-[10px] font-black mx-2">VS</div>
                        <h4 className="text-sm font-black text-blue-900 truncate w-2/5 text-center">{match.teamB?.teamName}</h4>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 w-full">
                        {isAdmin && (
                          <>
                            <button onClick={() => navigate(`/edit-match/${match._id}`)} className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition">✏️ Edit</button>
                            <button onClick={() => handleDeleteMatch(match._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">🗑️ Delete</button>
                          </>
                        )}

                        {/* View Score or Update Score Button */}
                        {(isAdmin || isScorer) && (
                          match.status === 'Completed' ? (
                            <Link to={`/view-score/${match._id}`} className="flex-[2] bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-xs text-center transition shadow-sm">
                              ✅ View Score
                            </Link>
                          ) : (
                            <Link to={`/scorematch/${match._id}`} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-xs text-center shadow-sm transition">
                              🏏 {match.status === 'Live' ? 'Update Score' : 'Start Scoring'}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ))}

                {matches.filter(m => matchSubTab === 'Scheduled' ? (m.status === 'Scheduled' || m.status === 'Live') : m.status === 'Completed').length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-10 bg-white rounded-xl border border-dashed border-gray-200 font-bold">
                    No {matchSubTab.toLowerCase()} matches found.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Tournaments':
        return (
          <div className="p-4 animate-fade-in">
            {isAdmin && (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                <p className="text-gray-700 font-medium text-lg mb-4 sm:mb-0">Want to host a new tournament?</p>
                <Link to="/start-tournament" className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-600 shadow-md transition transform hover:-translate-y-1">Create Tournament 🏆</Link>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments.length > 0 ? tournaments.map(tourney => (
                <div key={tourney._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition flex flex-col">
                  <div className="h-32 bg-gray-200 relative">
                    {tourney.tournamentBanner ? (
                      <img src={`${import.meta.env.VITE_API_URL}/${tourney.tournamentBanner}`} alt="banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    )}
                    <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wider">{tourney.category}</span>
                  </div>
                  <div className="p-5 pt-12 relative flex-1 flex flex-col">
                    <div className="absolute -top-10 left-5 w-20 h-20 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex justify-center items-center">
                      {tourney.tournamentLogo ? (
                        <img src={`${import.meta.env.VITE_API_URL}/${tourney.tournamentLogo}`} alt="logo" className="w-full h-full object-cover" />
                      ) : (<span className="text-2xl">🏆</span>)}
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-1">{tourney.tournamentName}</h3>
                    <p className="text-sm text-gray-500 font-medium mb-3">📍 {tourney.ground}, {tourney.city}</p>
                    <div className="mt-auto grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Start Date</p>
                        <p className="text-xs font-bold text-gray-700">{new Date(tourney.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Format</p>
                        <p className="text-xs font-bold text-gray-700">{tourney.tournamentFormat}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2 w-full">
                        <button onClick={() => navigate(`/edit-tournament/${tourney._id}`)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition">✏️ Edit</button>
                        <button onClick={() => handleDeleteTournament(tourney._id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">🗑️ Delete</button>
                      </div>
                    )}
                    {/* view button */}
                    <button
                      onClick={() => navigate(`/tournament/${tourney._id}`)}
                      className="w-full mt-3 bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition border border-blue-100 shadow-sm"
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              )) : <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed border-gray-300">No Tournaments found.</div>}
            </div>
          </div>
        );

      case 'Teams':
        return (
          <div className="p-4 animate-fade-in">
            {isAdmin && (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                <p className="text-gray-700 font-medium text-lg mb-4 sm:mb-0">Want to create a new team?</p>
                <Link to="/add-team" className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 shadow-md transition">Create Team 🛡️</Link>
              </div>
            )}
            <input type="text" placeholder="🔍 Search Teams..." className="w-full border border-gray-300 rounded-lg p-3 mb-5 bg-white outline-none focus:ring-2 focus:ring-green-500 shadow-sm" value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTeams.length > 0 ? filteredTeams.map((team) => (
                <div key={team._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-green-100 flex-shrink-0">
                      <img src={team.teamLogo ? `${import.meta.env.VITE_API_URL}/${team.teamLogo}` : "https://placehold.co/150?text=Logo"} alt={team.teamName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{team.teamName}</h3>
                      <p className="text-sm text-gray-500">📍 {team.location}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <button onClick={() => openEditTeamModal(team)} className="text-gray-400 hover:text-blue-600 bg-gray-50 p-2 rounded-lg transition">✏️</button>
                      <button onClick={() => handleDeleteTeam(team._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 p-2 rounded-lg transition">🗑️</button>
                    </div>
                  )}
                </div>
              )) : <div className="text-center text-gray-500 py-8">No teams found.</div>}
            </div>
          </div>
        );

      case 'Players':
        return (
          <div className="p-4 animate-fade-in">
            {isAdmin && (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-700 font-medium text-lg mb-4 sm:mb-0">Add new players!</p>
                <Link to="/add-player" className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700 shadow-md transition">Add Player 🏃</Link>
              </div>
            )}
            <input type="text" placeholder="🔍 Search Players..." className="w-full border border-gray-300 rounded-lg p-3 mb-5 bg-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                <div key={player._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">{player.role}</div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-purple-100 flex-shrink-0 mt-2">
                      <img src={player.profileImage ? `${import.meta.env.VITE_API_URL}/${player.profileImage}` : "https://placehold.co/150?text=Player"} alt={player.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-2">
                      <h3 className="font-bold text-gray-800 text-lg">{player.name}</h3>
                      <p className="text-sm text-gray-500">🛡️ {player.team?.teamName || 'Unknown'}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1 z-10">
                      <button onClick={() => openEditPlayerModal(player)} className="text-gray-400 hover:text-blue-600 bg-gray-50 p-2 rounded-lg transition">✏️</button>
                      <button onClick={() => handleDeletePlayer(player._id)} className="text-gray-400 hover:text-red-600 bg-gray-50 p-2 rounded-lg transition">🗑️</button>
                    </div>
                  )}
                </div>
              )) : <div className="text-center text-gray-500 py-8">No players found.</div>}
            </div>
          </div>
        );

      case 'Stats':
        return <div className="p-4"><div className="mt-8 p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed">Coming Soon...</div></div>;

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 relative">
      <nav className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center w-full shadow-md z-10">
        <div className="text-2xl font-bold flex items-center gap-2"><Link to="/">🏏 CricTrackerPro</Link></div>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-300 hidden md:block transition font-medium">Home</Link>
          <div className="flex items-center gap-4 border-l border-blue-800 pl-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-white leading-none capitalize">{userName || role}</span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm mt-1 ${isAdmin ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {role}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-green-400 overflow-hidden shadow-md bg-gray-200">
              <img src={getProfileImg()} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold shadow-sm hover:bg-red-600 transition text-sm">Logout</button>
          </div>
        </div>
      </nav>

      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="flex overflow-x-auto hide-scrollbar max-w-4xl mx-auto">
          {['Matches', 'Tournaments', 'Teams', 'Players', 'Stats'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 px-6 text-sm md:text-base font-bold text-center border-b-4 transition-colors duration-300 whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full mt-4 pb-10">{renderTabContent()}</main>

      {/* --- EDIT TEAM MODAL (Admin Only) --- */}
      {isAdmin && showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-extrabold text-blue-900 mb-4 border-b pb-2">Edit Team</h3>
            <form onSubmit={handleUpdateTeam} className="flex flex-col gap-3">
              <input type="text" placeholder="Team Name" className="w-full py-2 px-3 border rounded-lg" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} required />
              <input type="text" placeholder="Location" className="w-full py-2 px-3 border rounded-lg" value={editTeamLocation} onChange={(e) => setEditTeamLocation(e.target.value)} required />
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowTeamModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PLAYER MODAL (Admin Only) --- */}
      {isAdmin && showPlayerModal && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-extrabold text-blue-900 mb-4 border-b pb-2">Edit Player</h3>
            <form onSubmit={handleUpdatePlayer} className="flex flex-col gap-3">
                
                {/* 1. Player Name */}
                <input type="text" placeholder="Player Name" className="w-full py-2 px-3 border rounded-lg" value={editPlayerName} onChange={(e) => setEditPlayerName(e.target.value)} required />
                
                <input type="number" placeholder="Age" className="w-full py-2 px-3 border rounded-lg" value={editPlayerAge || ''} onChange={(e) => setEditPlayerAge(e.target.value)} />
                
                <input type="text" placeholder="Mobile Number" className="w-full py-2 px-3 border rounded-lg" value={editPlayerMobile || ''} onChange={(e) => setEditPlayerMobile(e.target.value)} />

                {/* 4. Player Role */}
                <select className="w-full py-2 px-3 border rounded-lg" value={editPlayerRole} onChange={(e) => setEditPlayerRole(e.target.value)}>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                </select>

                <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setShowPlayerModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg font-bold">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold">Save</button>
                </div>
            </form>
        </div>
    </div>
)}
    </div>
  );
};

export default MyCricket;