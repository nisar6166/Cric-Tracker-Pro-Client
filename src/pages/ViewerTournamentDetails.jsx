import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ViewerTournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('MATCHES'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
        setTournament(res.data);
      } catch (err) {
        console.error("Error fetching tournament:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentData();
  }, [id]);

  // point table calculation
  const getTeamStats = (teamId) => {
    let stats = { p: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" };
    if (!tournament?.matches) return stats;

    tournament.matches.forEach(match => {
        if ((match.roundName === 'League' || !match.roundName) && ['Completed', 'Abandoned'].includes(match.status)) {
            const isTeamA = match.teamA?._id === teamId || match.teamA === teamId;
            const isTeamB = match.teamB?._id === teamId || match.teamB === teamId;

            if (isTeamA || isTeamB) {
                stats.p += 1;
                if (match.status === 'Abandoned' || match.isNoResult) {
                    stats.nr += 1; stats.pts += 1;
                } else if (match.status === 'Completed') {
                    const winnerId = match.winner?._id || match.winner;
                    if (winnerId === teamId) { stats.w += 1; stats.pts += 2; }
                    else if (!winnerId) { stats.nr += 1; stats.pts += 1; }
                    else { stats.l += 1; }
                }
            }
        }
    });
    return stats;
  };

  // Player Leaderboard: Aggregating total runs and wickets
  const getLeaderboard = () => {
    let players = {}; 
    tournament?.matches?.forEach(m => {
      if(m.status === 'Completed') {
        [m.innings1, m.innings2].forEach(inn => {
           if(!inn) return;
           // Batting Stats
           inn.batting?.forEach(bat => {
              if(!players[bat.player]) players[bat.player] = { name: bat.name, runs: 0, wickets: 0, mvpPoints: 0 };
              players[bat.player].runs += bat.runs;
              players[bat.player].mvpPoints += bat.runs; // 1 run = 1 MVP Point
           });
           // Bowling Stats
           inn.bowling?.forEach(bowl => {
              if(!players[bowl.player]) players[bowl.player] = { name: bowl.name, runs: 0, wickets: 0, mvpPoints: 0 };
              players[bowl.player].wickets += bowl.wickets;
              players[bowl.player].mvpPoints += (bowl.wickets * 20); // 1 Wicket = 20 MVP Points
           });
        });
      }
    });

    const playersArr = Object.values(players);
    return {
       topRuns: [...playersArr].sort((a,b) => b.runs - a.runs).slice(0, 5),
       topWickets: [...playersArr].sort((a,b) => b.wickets - a.wickets).slice(0, 5),
       mvp: [...playersArr].sort((a,b) => b.mvpPoints - a.mvpPoints).slice(0, 5)
    };
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Loading Tournament... 🏏</div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Tournament Not Found!</div>;

  const leaderboardData = getLeaderboard();

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/*  BANNER & LOGO */}
      <div className="relative bg-blue-900 h-48 md:h-64 flex justify-center items-center">
        {tournament.tournamentBanner ? (
          <img src={`http://localhost:5000/${tournament.tournamentBanner}`} alt="Banner" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-800 opacity-90"></div>
        )}
      </div>

      <div className="px-6 md:px-12 pt-6 pb-6 text-center -mt-16 relative z-10">
         <div className="w-24 h-24 mx-auto bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex justify-center items-center mb-3">
            {tournament.tournamentLogo ? <img src={`http://localhost:5000/${tournament.tournamentLogo}`} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-4xl">🏆</span>}
         </div>
         <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-widest">{tournament.tournamentName}</h1>
         <p className="text-gray-500 font-bold mt-1 text-sm md:text-base">📍 {tournament.ground}, {tournament.city}</p>
      </div>

      {/*  TABS NAVIGATION */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 flex justify-center">
        {['MATCHES', 'POINTS TABLE', 'LEADERBOARD'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-6 md:px-12 text-sm font-black whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-4">
        
        {/*  MATCHES TAB */}
        {activeTab === 'MATCHES' && (
          <div className="animate-fade-in space-y-4">
             {tournament.matches?.length > 0 ? tournament.matches.map(match => (
                <Link to={`/match-center/${match._id}`} key={match._id} className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition group">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase">{match.roundName || 'League'} • {new Date(match.date).toLocaleDateString()}</span>
                      <span className={`text-[10px] px-2 py-1 rounded font-black ${match.status === 'Live' ? 'bg-red-500 text-white animate-pulse' : match.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {match.status.toUpperCase()}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 w-2/5">
                         <img src={`http://localhost:5000/${match.teamA?.teamLogo}`} className="w-10 h-10 rounded-full border" alt="A" />
                         <span className="font-bold text-gray-800">{match.teamA?.teamName}</span>
                      </div>
                      <div className="font-black text-gray-300 w-1/5 text-center text-sm">VS</div>
                      <div className="flex items-center gap-3 w-2/5 justify-end">
                         <span className="font-bold text-gray-800">{match.teamB?.teamName}</span>
                         <img src={`http://localhost:5000/${match.teamB?.teamLogo}`} className="w-10 h-10 rounded-full border" alt="B" />
                      </div>
                   </div>
                   <div className="mt-4 text-center">
                     <span className="text-blue-600 text-xs font-bold group-hover:underline">View Scorecard & Analysis ➡️</span>
                   </div>
                </Link>
             )) : <div className="text-center p-10 text-gray-400 font-bold bg-white rounded-xl border-dashed border">No matches scheduled yet.</div>}
          </div>
        )}

        {/*  POINTS TABLE TAB */}
        {activeTab === 'POINTS TABLE' && (
           tournament.tournamentType === 'KNOCKOUT' ? (
             <div className="p-10 text-center font-bold text-gray-400 bg-white rounded-xl border border-dashed shadow-sm">Knockout tournaments don't have a points table.</div>
           ) : (
             <div className="animate-fade-in space-y-8">
                {tournament.pools?.map((pool, idx) => {
                  const sortedTeams = [...pool.teams].sort((a, b) => getTeamStats(b._id || b).pts - getTeamStats(a._id || a).pts);
                  return (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-blue-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                          <tr><th className="px-4 py-3 w-10 text-center"></th><th className="px-2 py-3">{pool.poolName}</th><th className="px-3 py-3 text-center">P</th><th className="px-3 py-3 text-center">W</th><th className="px-3 py-3 text-center">L</th><th className="px-3 py-3 text-center">NR</th><th className="px-4 py-3 text-center">PTS</th><th className="px-4 py-3 text-center">NRR</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-medium">
                          {sortedTeams.map((team, index) => {
                            const stats = getTeamStats(team._id || team);
                            return (
                            <tr key={team._id} className="hover:bg-blue-50/50 transition">
                              <td className="px-4 py-3 text-center text-gray-500 font-bold">{index + 1}</td>
                              <td className="px-2 py-3 flex items-center gap-3"><div className="w-6 h-6 rounded-full border bg-white overflow-hidden"><img src={`http://localhost:5000/${team.teamLogo}`} className="w-full h-full object-cover" alt="logo" /></div><span className="font-bold text-[13px]">{team.teamName}</span></td>
                              <td className="px-3 py-3 text-center text-gray-600">{stats.p}</td><td className="px-3 py-3 text-center text-green-600">{stats.w}</td><td className="px-3 py-3 text-center text-red-500">{stats.l}</td><td className="px-3 py-3 text-center text-gray-400">{stats.nr}</td><td className="px-4 py-3 text-center font-black text-blue-900 text-[14px]">{stats.pts}</td><td className="px-4 py-3 text-center text-[12px] font-bold text-gray-600">{stats.nrr}</td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )})}
             </div>
           )
        )}

        {/*  LEADERBOARD TAB */}
        {activeTab === 'LEADERBOARD' && (
           <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Runs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                 <h3 className="font-black text-blue-900 mb-4 border-b pb-2 uppercase text-xs tracking-widest">🏏 Top Run Scorers</h3>
                 <div className="space-y-3">
                   {leaderboardData.topRuns.length > 0 ? leaderboardData.topRuns.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-bold text-gray-700 text-sm">{i+1}. {p.name || 'Unknown'}</span>
                        <span className="font-black text-blue-700">{p.runs}</span>
                      </div>
                   )) : <p className="text-xs text-gray-400 text-center py-4">Stats available after matches complete.</p>}
                 </div>
              </div>

              {/* Top Wickets */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                 <h3 className="font-black text-green-900 mb-4 border-b pb-2 uppercase text-xs tracking-widest">🎾 Top Wicket Takers</h3>
                 <div className="space-y-3">
                   {leaderboardData.topWickets.length > 0 ? leaderboardData.topWickets.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="font-bold text-gray-700 text-sm">{i+1}. {p.name || 'Unknown'}</span>
                        <span className="font-black text-green-700">{p.wickets}</span>
                      </div>
                   )) : <p className="text-xs text-gray-400 text-center py-4">Stats available after matches complete.</p>}
                 </div>
              </div>

              {/* MVP */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-5">
                 <h3 className="font-black text-yellow-800 mb-4 border-b border-yellow-200 pb-2 uppercase text-xs tracking-widest">🌟 Most Valuable Player</h3>
                 <div className="space-y-3">
                   {leaderboardData.mvp.length > 0 ? leaderboardData.mvp.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-yellow-100">
                        <span className="font-bold text-gray-800 text-sm">{i+1}. {p.name || 'Unknown'}</span>
                        <span className="font-black text-yellow-600">{p.mvpPoints} pts</span>
                      </div>
                   )) : <p className="text-xs text-yellow-600 opacity-70 text-center py-4">MVP revealed as tournament progresses.</p>}
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
};

export default ViewerTournamentDetails;