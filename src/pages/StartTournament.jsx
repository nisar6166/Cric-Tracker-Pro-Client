import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

const StartTournament = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL
  const isEditMode = Boolean(id);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      alert("Access Denied! Please login as Admin.");
      navigate('/login');
    }
  }, [navigate, token]);

  // States
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [ground, setGround] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [category, setCategory] = useState('OPEN');
  const [ballType, setBallType] = useState('Tennis');
  const [pitchType, setPitchType] = useState('ROUGH');
  const [matchType, setMatchType] = useState('Limited Overs');
  const [winningPrize, setWinningPrize] = useState('BOTH');
  const [format, setFormat] = useState('LEAGUE');

  const [entryFee, setEntryFee] = useState('');
  const [totalTeams, setTotalTeams] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Mode: Fetch existing data
  useEffect(() => {
    if (isEditMode) {
      const loadTournament = async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tournaments/${id}`);
          const t = res.data;
          setName(t.tournamentName || '');
          setCity(t.city || '');
          setGround(t.ground || '');
          setOrgName(t.organiserName || '');
          setOrgPhone(t.organiserPhone || '');
          if (t.startDate) setStartDate(t.startDate.split('T')[0]);
          if (t.endDate) setEndDate(t.endDate.split('T')[0]);
          setCategory(t.category || 'OPEN');
          setBallType(t.ballType || 'Tennis');
          setPitchType(t.pitchType || 'ROUGH');
          setMatchType(t.matchType || 'Limited Overs');
          setEntryFee(t.entryFee || '');
          setTotalTeams(t.totalTeams || '');
          setWinningPrize(t.winningPrize || 'BOTH');
          setFormat(t.tournamentFormat || 'LEAGUE');
        } catch (err) {
          setError("Failed to load tournament data.");
        }
      };
      loadTournament();
    }
  }, [id, isEditMode]);

  const SelectionPills = ({ options, selected, onSelect }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => (
        <button
          key={opt} type="button" onClick={() => onSelect(opt)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border ${
            selected === opt 
              ? 'bg-blue-600 text-white border-blue-600 scale-105' 
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    try {
      const formData = new FormData();
      formData.append('tournamentName', name);
      formData.append('city', city);
      formData.append('ground', ground);
      formData.append('organiserName', orgName);
      formData.append('organiserPhone', orgPhone);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('category', category);
      formData.append('ballType', ballType);
      formData.append('pitchType', pitchType);
      formData.append('matchType', matchType);
      formData.append('entryFee', entryFee);
      formData.append('totalTeams', totalTeams);
      formData.append('winningPrize', winningPrize);
      formData.append('tournamentFormat', format);
      
      if (logo) formData.append('logo', logo);
      if (banner) formData.append('banner', banner);

      if (isEditMode) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/tournaments/update/${id}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuccess('Tournament Updated Successfully! 🎉');
      } else {
        await axios.post(import.meta.env.VITE_API_URL + '/api/tournaments/create', formData, {
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        setSuccess('Tournament Created Successfully! 🎉');
      }
      
      setTimeout(() => navigate('/mycricket'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save tournament.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 pb-10">
      <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="text-xl font-bold flex items-center gap-2">🏆 {isEditMode ? 'Edit Tournament' : 'Add a Tournament'}</div>
        <Link to="/mycricket" className="bg-white text-blue-900 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm hover:bg-gray-100">Cancel</Link>
      </nav>

      <main className="flex-1 flex justify-center w-full px-4 mt-6">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="flex flex-col">
            
            <div className="relative bg-gray-200 h-40 flex justify-center items-center border-b border-gray-300 overflow-hidden">
                {banner ? (
                  <img src={URL.createObjectURL(banner)} alt="Banner" className="w-full h-full object-cover opacity-80" />
                ) : (
                  <span className="text-gray-500 font-bold flex flex-col items-center">📸 <span className="text-sm mt-1">{isEditMode ? 'Change Banner' : 'Add Banner Cover'}</span></span>
                )}
                <input type="file" accept="image/*" onChange={(e) => setBanner(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                
                <div className="absolute -bottom-10 left-6 w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex justify-center items-center overflow-hidden z-10">
                    {logo ? (
                       <img src={URL.createObjectURL(logo)} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-gray-400 text-xs font-bold text-center leading-tight">{isEditMode ? 'Change Logo' : 'Add Logo'}</span>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>

            <div className="p-8 pt-14 flex flex-col gap-8">
              {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-bold text-center">{error}</div>}
              {success && <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm font-bold text-center">{success}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tournament / Series Name *</label>
                  <input type="text" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 text-lg font-bold text-gray-800 bg-transparent" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="e.g. Kerala Premier League" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">City *</label>
                  <input type="text" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium text-gray-800 bg-transparent" value={city} onChange={(e)=>setCity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Ground *</label>
                  <input type="text" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium text-gray-800 bg-transparent" value={ground} onChange={(e)=>setGround(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Organiser Name *</label>
                  <input type="text" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium text-gray-800 bg-transparent" value={orgName} onChange={(e)=>setOrgName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Organiser Number *</label>
                  <input type="text" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium text-gray-800 bg-transparent" value={orgPhone} onChange={(e)=>setOrgPhone(e.target.value)} required />
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600">Start Date *</label>
                  <input type="date" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={startDate} onChange={(e)=>setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">End Date *</label>
                  <input type="date" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" value={endDate} onChange={(e)=>setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-800">Tournament Category *</label>
                  <SelectionPills options={['OPEN', 'CORPORATE', 'COMMUNITY', 'SCHOOL', 'COLLEGE', 'SERIES']} selected={category} onSelect={setCategory} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800">Select Ball Type *</label>
                  <SelectionPills options={['Tennis', 'Leather', 'Other']} selected={ballType} onSelect={setBallType} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800">Pitch Type</label>
                  <SelectionPills options={['ROUGH', 'CEMENT', 'TURF', 'ASTROTURF', 'MATTING']} selected={pitchType} onSelect={setPitchType} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800">Match Type *</label>
                  <SelectionPills options={['Limited Overs', 'Box/Turf Cricket', 'Test Match', 'The Hundred']} selected={matchType} onSelect={setMatchType} />
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-blue-900">Team Details & Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Entry Fee</label>
                    <input type="number" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium bg-transparent" value={entryFee} onChange={(e)=>setEntryFee(e.target.value)} placeholder="e.g. 5000" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Total No. of Teams</label>
                    <input type="number" className="w-full mt-1 py-2 px-0 border-0 border-b-2 border-gray-300 focus:ring-0 focus:border-blue-600 font-medium bg-transparent" value={totalTeams} onChange={(e)=>setTotalTeams(e.target.value)} placeholder="e.g. 16" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-800">Winning Prize *</label>
                  <SelectionPills options={['CASH', 'TROPHIES', 'BOTH']} selected={winningPrize} onSelect={setWinningPrize} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-800">Tournament Format *</label>
                  <SelectionPills options={['LEAGUE', 'KNOCKOUT']} selected={format} onSelect={setFormat} />
                </div>
              </div>

            </div>

            <div className="bg-gray-100 p-6 border-t border-gray-200 sticky bottom-0 z-10">
                <button type="submit" disabled={loading} className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-md transition duration-300 ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}>
                  {loading ? 'Processing...' : (isEditMode ? 'Update Tournament 🏆' : 'Save Tournament 🏆')}
                </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StartTournament;