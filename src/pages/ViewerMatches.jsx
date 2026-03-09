import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ViewerMatches = () => {
  const [activeTab, setActiveTab] = useState('Matches');
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, tourneyRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL + '/api/matches/all'),
          axios.get(import.meta.env.VITE_API_URL + '/api/tournaments/all')
        ]);
        setMatches(matchRes.data);
        setTournaments(tourneyRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const liveMatches = matches.filter(m => m.status === 'Live');
  const pastMatches = matches.filter(m => m.status === 'Completed');

  const renderContent = () => {
    if (loading) return <div className="text-center py-20 font-bold text-blue-900 text-xl">Loading Data... 🏏</div>;

    if (activeTab === 'Matches') {
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Live Matches Section */}
          <section>
            <h2 className="text-xl font-black text-blue-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span> Live Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.length > 0 ? liveMatches.map(match => (
                <div key={match._id} className="bg-white rounded-xl shadow-md border-t-4 border-red-500 p-5 hover:shadow-lg transition">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-1 rounded-full animate-pulse">LIVE NOW</span>
                    <span className="text-xs text-gray-500 font-bold">{match.city}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <div className="font-black text-blue-900">{match.teamA?.teamName}</div>
                    <div className="text-xs font-black text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm">VS</div>
                    <div className="font-black text-blue-900">{match.teamB?.teamName}</div>
                  </div>
                  <Link to={`/view-score/${match._id}`} className="block mt-4 text-center bg-red-50 text-red-600 font-bold py-2 rounded-lg hover:bg-red-100 transition">Watch Live Score</Link>
                </div>
              )) : <div className="text-gray-500 bg-white p-6 rounded-xl text-center shadow-sm">No live matches at the moment.</div>}
            </div>
          </section>

          {/* Past Matches Section */}
          <section>
            <h2 className="text-xl font-black text-blue-900 mb-4">✅ Recent Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastMatches.length > 0 ? pastMatches.map(match => (
                <div key={match._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full">COMPLETED</span>
                    <span className="text-xs text-gray-500">{new Date(match.dateOfMatch).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                    <div className="font-bold text-gray-800">{match.teamA?.teamName}</div>
                    <div className="text-[10px] font-black text-gray-400">VS</div>
                    <div className="font-bold text-gray-800">{match.teamB?.teamName}</div>
                  </div>
                  <Link to={`/view-score/${match._id}`} className="block mt-4 text-center bg-blue-50 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-100 transition">View Full Scorecard</Link>
                </div>
              )) : <div className="text-gray-500 bg-white p-6 rounded-xl text-center shadow-sm">No recent matches found.</div>}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'Tournaments') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {tournaments.length > 0 ? tournaments.map(tourney => (
            
            <Link 
               to={`/viewer/tournament/${tourney._id}`} 
               key={tourney._id} 
               className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition transform hover:-translate-y-1 hover:border-blue-400"
            >
               <div className="h-32 bg-gradient-to-r from-blue-700 to-blue-500 relative flex justify-center items-center">
                 <h3 className="text-2xl font-black text-white shadow-sm">{tourney.tournamentName}</h3>
                 <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-[10px] font-bold px-2 py-1 rounded">{tourney.category}</span>
               </div>
               <div className="p-5 flex-1 flex flex-col">
                 <p className="text-sm text-gray-500 font-medium mb-4 text-center">📍 {tourney.ground}, {tourney.city}</p>
                 <div className="mt-auto grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Starts</p>
                       <p className="text-xs font-bold text-gray-700">{new Date(tourney.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center border-l">
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Format</p>
                       <p className="text-xs font-bold text-gray-700">{tourney.tournamentFormat}</p>
                    </div>
                 </div>
               </div>
            </Link>

          )) : <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl">No tournaments available.</div>}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-[#1e3a8a] text-white px-6 py-4 flex justify-between items-center shadow-md">
         <div className="text-xl font-bold flex items-center gap-3">
           <Link to="/" className="hover:text-blue-300 transition">⬅</Link>
           <span>🏏 CricTrackerPro Dashboard</span>
         </div>
      </nav>

      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex max-w-5xl mx-auto overflow-x-auto hide-scrollbar">
          {['Matches', 'Tournaments'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`py-4 px-6 text-sm font-bold whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default ViewerMatches;