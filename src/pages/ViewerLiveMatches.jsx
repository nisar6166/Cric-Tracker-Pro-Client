import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ViewerLiveMatches = () => {
  const [activeTab, setActiveTab] = useState('Live');
  const [displayMatches, setDisplayMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/matches/all');
      
      let filtered = [];
      if (activeTab === 'Completed') {
      
        filtered = res.data.filter(m => m.status === 'Completed');
      } else {
        
        filtered = res.data.filter(m => m.status === 'Live' || m.status === 'Paused');
      }
      
      setDisplayMatches(filtered);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-[#10b981] text-white px-6 py-4 flex justify-between items-center shadow-md">
         <div className="text-xl font-bold flex items-center gap-3">
           <Link to="/" className="hover:text-green-200 transition">⬅</Link>
           <span>🔴 Live Action Central</span>
         </div>
      </nav>

      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="flex max-w-4xl mx-auto overflow-x-auto hide-scrollbar">
          {['Live', 'Live Full Scoreboard', 'Completed'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab); setLoading(true); }} 
              className={`py-4 px-6 text-sm font-bold whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {loading ? (
           <div className="text-center py-20 font-bold text-red-600 text-xl animate-pulse">Finding Matches... 📡</div>
        ) : displayMatches.length === 0 ? (
           <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-200">
             <span className="text-4xl mb-3 block">{activeTab === 'Completed' ? '🏏' : '😴'}</span>
             <h2 className="text-xl font-black text-gray-800">No {activeTab} Matches Currently</h2>
             <p className="text-gray-500 mt-2">Check back later for action!</p>
           </div>
        ) : (
           <div className="space-y-6 animate-fade-in">
             {displayMatches.map(match => (
               <div key={match._id} className={`bg-white rounded-2xl shadow-lg border-l-8 overflow-hidden ${match.status === 'Completed' ? 'border-green-500' : 'border-red-500'}`}>
                 <div className="p-6">
                   <div className="flex justify-between items-center mb-4">
                     <span className={`${match.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600 animate-pulse'} text-xs font-black px-3 py-1 rounded-full`}>
                       {match.status === 'Completed' ? '✅ COMPLETED' : `🔴 ${match.status.toUpperCase()}`}
                     </span>
                     <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{match.city} • {match.totalOvers} Overs</span>
                   </div>
                   
                   <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-100 gap-4">
                     <div className="text-2xl font-black text-blue-900 w-full md:w-2/5 text-center md:text-right truncate">{match.teamA?.teamName}</div>
                     <div className={`w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center font-black flex-shrink-0 ${match.status === 'Completed' ? 'text-gray-400' : 'text-red-500'}`}>VS</div>
                     <div className="text-2xl font-black text-blue-900 w-full md:w-2/5 text-center md:text-left truncate">{match.teamB?.teamName}</div>
                   </div>

                   {/*  Player of the Match Banner */}
                   {match.status === 'Completed' && match.manOfTheMatch && (
                       <div className="mt-4 bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 px-4 py-3 rounded-xl flex items-center gap-4 shadow-sm">
                           <span className="text-4xl drop-shadow-sm">🏆</span>
                           <div className="flex flex-col">
                              <span className="text-yellow-600 font-black uppercase tracking-widest text-[10px] mb-0.5">Player of the Match</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-gray-800 font-black text-lg">{match.manOfTheMatch.name}</span>
                                <span className="text-gray-500 font-bold text-xs bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">{match.manOfTheMatch.desc}</span>
                              </div>
                           </div>
                       </div>
                   )}

                   {activeTab === 'Live Full Scoreboard' && match.status !== 'Completed' && (
                      <div className="mt-6 border-t pt-4 border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-3 font-medium">To view the detailed ball-by-ball scoreboard for this match, click below:</p>
                        <Link to={`/view-score/${match._id}`} className="inline-block w-full sm:w-auto bg-blue-900 text-white px-8 py-3 rounded-xl font-black shadow-md hover:bg-blue-800 transition transform hover:-translate-y-1">
                          📊 Open Full Live Scoreboard
                        </Link>
                      </div>
                   )}
                   
                   {(activeTab === 'Live' || activeTab === 'Completed') && (
                     <div className="mt-4 flex justify-end">
                        <Link to={`/view-score/${match._id}`} className={`${match.status === 'Completed' ? 'text-blue-600' : 'text-red-600'} font-bold text-sm hover:underline`}>
                           {match.status === 'Completed' ? 'View Full Scorecard 📊' : 'Watch Live ➡️'}
                        </Link>
                     </div>
                   )}
                 </div>
               </div>
             ))}
           </div>
        )}
      </main>
    </div>
  );
};

export default ViewerLiveMatches;