import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// NRR HELPERS

// Convert stored overs + balls into decimal overs (3 ov 4 balls → 3.667)
const toDecimalOvers = (overs = 0, balls = 0) => overs + balls / 6;

 // NRR = (runs scored / overs faced) − (runs conceded / overs bowled)
 
const calcNRR = (teamId, completedMatches, matchOvers) => {
  let runsFor = 0, oversFor = 0, runsAgainst = 0, oversAgainst = 0;

  completedMatches.forEach(match => {
    const aId = match.teamA?._id?.toString();
    const bId = match.teamB?._id?.toString();
    if (teamId !== aId && teamId !== bId) return;

    // Skip no-results / ties for NRR
    const winnerId = match.winner?._id?.toString();
    if (!winnerId) return;

    const inn1 = match.innings1;
    const inn2 = match.innings2;

    const battingInn =
      inn1?.battingTeam?._id?.toString() === teamId ? inn1 :
      inn2?.battingTeam?._id?.toString() === teamId ? inn2 : null;

    const bowlingInn =
      inn1?.bowlingTeam?._id?.toString() === teamId ? inn1 :
      inn2?.bowlingTeam?._id?.toString() === teamId ? inn2 :
      (battingInn === inn1 ? inn2 : inn1);

    if (battingInn) {
      const allOut    = (battingInn.wickets || 0) >= 10;
      const decimalOv = toDecimalOvers(battingInn.overs || 0, battingInn.balls || 0);
      runsFor  += battingInn.runs || 0;
      oversFor += allOut ? matchOvers : decimalOv;
    }

    if (bowlingInn) {
      const allOut    = (bowlingInn.wickets || 0) >= 10;
      const decimalOv = toDecimalOvers(bowlingInn.overs || 0, bowlingInn.balls || 0);
      runsAgainst  += bowlingInn.runs || 0;
      oversAgainst += allOut ? matchOvers : decimalOv;
    }
  });

  const rrFor     = oversFor     > 0 ? runsFor     / oversFor     : 0;
  const rrAgainst = oversAgainst > 0 ? runsAgainst / oversAgainst : 0;
  return rrFor - rrAgainst;
};

const fmtNRR = (nrr) => {
  if (typeof nrr === 'string') return nrr; 
  
  const num = parseFloat(nrr);
  if (isNaN(num) || !isFinite(num)) return '—';
  return (num >= 0 ? '+' : '') + num.toFixed(3);
};

//  Points Table Logic
const buildPointsTable = (teams, matches) => {
    return teams.map(team => {
        const teamId = String(team._id || team);
        let stats = { p: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" };
        let totalRunsScored = 0, totalOversFaced = 0, totalRunsConceded = 0, totalOversBowled = 0;

        matches.forEach(match => {
            const matchStatus = match.status?.toLowerCase()?.trim();
            const roundName = match.roundName?.toLowerCase()?.trim();

            if ((!roundName || roundName === 'league') && ['completed', 'abandoned'].includes(matchStatus)) {
                const teamA_Id = String(match.teamA?._id || match.teamA);
                const teamB_Id = String(match.teamB?._id || match.teamB);

                if (teamA_Id === teamId || teamB_Id === teamId) {
                    stats.p += 1;
                    let runsScored = 0, oversFaced = 0, runsConceded = 0, oversBowled = 0;

                    if (teamA_Id === teamId) {
                        runsScored = match.scoreA || 0;
                        oversFaced = (match.oversA || 0) + ((match.ballsA || 0) / 6);
                        if (match.wicketsA === 10) oversFaced = match.totalOvers || oversFaced;

                        runsConceded = match.scoreB || 0;
                        oversBowled = (match.oversB || 0) + ((match.ballsB || 0) / 6);
                        if (match.wicketsB === 10) oversBowled = match.totalOvers || oversBowled;
                    } else {
                        runsScored = match.scoreB || 0;
                        oversFaced = (match.oversB || 0) + ((match.ballsB || 0) / 6);
                        if (match.wicketsB === 10) oversFaced = match.totalOvers || oversFaced;

                        runsConceded = match.scoreA || 0;
                        oversBowled = (match.oversA || 0) + ((match.ballsA || 0) / 6);
                        if (match.wicketsA === 10) oversBowled = match.totalOvers || oversBowled;
                    }

                    totalRunsScored += runsScored; totalOversFaced += oversFaced;
                    totalRunsConceded += runsConceded; totalOversBowled += oversBowled;

                    if (matchStatus === 'abandoned' || match.isNoResult) {
                        stats.nr += 1; stats.pts += 1;
                    } else if (matchStatus === 'completed') {
                        const winnerField = match.winner || match.winningTeam || match.matchWinner;
                        const winnerId = winnerField ? String(winnerField?._id || winnerField) : null;

                        if (winnerId && winnerId !== 'undefined' && winnerId !== 'null') {
                            if (winnerId === teamId) {
                                stats.w += 1; stats.pts += 2;
                            } else {
                                stats.l += 1;
                            }
                        } else {
                            stats.nr += 1; stats.pts += 1;
                        }
                    }
                }
            }
        });

        if (totalOversFaced > 0 || totalOversBowled > 0) {
            const runRateFor = totalOversFaced > 0 ? (totalRunsScored / totalOversFaced) : 0;
            const runRateAgainst = totalOversBowled > 0 ? (totalRunsConceded / totalOversBowled) : 0;
            const nrrValue = (runRateFor - runRateAgainst).toFixed(3);
            stats.nrr = nrrValue > 0 ? `+${nrrValue}` : `${nrrValue}`;
        }

        return { team, ...stats };
    }).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        return parseFloat(b.nrr || 0) - parseFloat(a.nrr || 0);
    });
};

// LEADERBOARD

const ViewerTournamentDetails = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [activeTab, setActiveTab]   = useState('MATCHES');
  const [loading, setLoading]       = useState(true);
  const [leaderboard, setLeaderboard] = useState({ topRuns: [], topWickets: [], mvp: [] });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/tournaments/${id}`)
      .then(r => setTournament(r.data))
      .catch(err => console.error('Error fetching tournament:', err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!tournament || !tournament.matches) return;
      
      const completedMatches = tournament.matches.filter(m => m.status === 'Completed');
      if (completedMatches.length === 0) return;

      try {
       
        const responses = await Promise.all(
          completedMatches.map(m => 
            axios.get(`http://localhost:5000/api/scorecard/${m._id || m}`)
                 .catch(err => null) 
          )
        );
        
        const players = {};
        
        responses.forEach(res => {
          if (!res || !res.data) return; 
          const data = res.data;
          
          const inningsList = [data.firstInnings || data.innings1, data.secondInnings || data.innings2].filter(Boolean);
          
          inningsList.forEach(inn => {
            const batters = inn.batters || inn.battingLineup || [];
            const bowlers = inn.bowlers || inn.bowlingLineup || [];

            batters.forEach(bat => {
              const pid = bat.player?._id || bat.player;
              const name = bat.player?.name || 'Unknown Player';
              if (!pid) return;
              
              if (!players[pid]) players[pid] = { name, runs: 0, wickets: 0, mvpPoints: 0 };
              players[pid].runs += Number(bat.runs) || 0;
              players[pid].mvpPoints += Number(bat.runs) || 0;
            });

            bowlers.forEach(bowl => {
              const pid = bowl.player?._id || bowl.player;
              const name = bowl.player?.name || 'Unknown Player';
              if (!pid) return;

              if (!players[pid]) players[pid] = { name, runs: 0, wickets: 0, mvpPoints: 0 };
              players[pid].wickets += Number(bowl.wickets) || 0;
              players[pid].mvpPoints += (Number(bowl.wickets) || 0) * 20;
            });
          });
        });

        const arr = Object.values(players);
        setLeaderboard({
          topRuns: [...arr].sort((a, b) => b.runs - a.runs).slice(0, 5),
          topWickets: [...arr].sort((a, b) => b.wickets - a.wickets).slice(0, 5),
          mvp: [...arr].sort((a, b) => b.mvpPoints - a.mvpPoints).slice(0, 5),
        });
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };

    fetchLeaderboardData();
  }, [tournament]);

  if (loading)     return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900 text-xl">Loading Tournament... 🏏</div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Tournament Not Found!</div>;

  const matches          = tournament.matches || [];
  const completedMatches = matches.filter(m => m.status === 'Completed');
  const liveMatches      = matches.filter(m => m.status === 'Live');

  // Build data
  const pointsTable    = buildPointsTable(tournament.teams || [], completedMatches, matches, tournament.overs || 20);
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <div className="relative bg-gradient-to-r from-blue-900 to-indigo-800 h-40 md:h-56 flex justify-center items-end">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }} />
        <div className="relative z-10 pb-4 text-center w-full px-4">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
            {tournament.category} · {tournament.tournamentFormat}
          </p>
          <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow">
            {tournament.tournamentName}
          </h1>
          <p className="text-blue-200 mt-1 text-sm font-medium">
            📍 {tournament.ground}, {tournament.city}
          </p>
        </div>
      </div>

      {/* QUICK STATS BAR */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-4 text-center py-3">
          {[
            ['Teams',     tournament.teams?.length || 0],
            ['Matches',   matches.length],
            ['Completed', completedMatches.length],
            ['Live Now',  liveMatches.length],
          ].map(([label, val]) => (
            <div key={label} className="px-2">
              <p className="text-xl font-black">{val}</p>
              <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 flex justify-center">
        {['MATCHES', 'POINTS TABLE', 'LEADERBOARD'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 md:px-12 text-sm font-black whitespace-nowrap border-b-4 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:bg-gray-50'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 mt-4">

        {/*  MATCHES TAB*/}
        {activeTab === 'MATCHES' && (
          <div className="space-y-3 animate-fade-in">
            {/* Live banner */}
            {liveMatches.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block shrink-0"></span>
                <span className="text-red-700 font-black text-sm">
                  {liveMatches.length} match{liveMatches.length > 1 ? 'es' : ''} live right now!
                </span>
              </div>
            )}

            {matches.length === 0 ? (
              <div className="text-center p-10 text-gray-400 font-bold bg-white rounded-xl border border-dashed">
                No matches scheduled yet.
              </div>
            ) : matches.map(match => {
              //  DATE & TIME LOGIC
              const matchTime = match.date || match.matchDateTime || match.dateOfMatch;
              const dateStr = matchTime
                ? new Date(matchTime).toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Date Not Set';

              return (
                <Link to={`/view-score/${match._id}`} key={match._id}
                  className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition group">
                  <div className="flex justify-between items-center mb-4">
                    
                    <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                       📅 {dateStr}
                    </span>
                    
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                      match.status === 'Live'      ? 'bg-red-500 text-white animate-pulse' :
                      match.status === 'Completed' ? 'bg-green-100 text-green-700'         :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {match.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Team A */}
                    <div className="flex items-center gap-3 w-2/5">
                      <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
                        style={{ backgroundColor: match.teamA?.teamColor || '#1e3a8a' }}>
                        {match.teamA?.shortName?.slice(0, 2) || match.teamA?.teamName?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-800 text-sm leading-tight">{match.teamA?.teamName}</span>
                    </div>

                    {/* VS */}
                    <div className="font-black text-gray-300 w-1/5 text-center text-sm">VS</div>

                    {/* Team B */}
                    <div className="flex items-center gap-3 w-2/5 justify-end">
                      <span className="font-bold text-gray-800 text-sm text-right leading-tight">{match.teamB?.teamName}</span>
                      <div className="w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm"
                        style={{ backgroundColor: match.teamB?.teamColor || '#15803d' }}>
                        {match.teamB?.shortName?.slice(0, 2) || match.teamB?.teamName?.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Result */}
                  {match.result && (
                    <p className="mt-3 text-center text-xs font-bold text-green-700 bg-green-50 py-1.5 rounded-lg">
                      🏆 {match.result}
                    </p>
                  )}

                  <div className="mt-3 text-center">
                    <span className="text-blue-600 text-xs font-bold group-hover:underline">
                      View Scorecard ➡️
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* POINTS TABLE TAB */}
        {activeTab === 'POINTS TABLE' && (
          <div className="animate-fade-in space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 bg-white rounded-xl px-4 py-3 border border-gray-100">
              <span><strong>P</strong> Played</span>
              <span><strong>W</strong> Won</span>
              <span><strong>L</strong> Lost</span>
              <span><strong>NR</strong> No Result / Tied</span>
              <span><strong>NRR</strong> Net Run Rate</span>
              <span><strong>PTS</strong> Win=2, NR/Tie=1</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[480px]">
                  <thead className="bg-blue-900 text-white font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">#</th>
                      <th className="px-3 py-3">Team</th>
                      <th className="px-3 py-3 text-center">P</th>
                      <th className="px-3 py-3 text-center">W</th>
                      <th className="px-3 py-3 text-center">L</th>
                      <th className="px-3 py-3 text-center">NR</th>
                      <th className="px-3 py-3 text-center">NRR</th>
                      <th className="px-4 py-3 text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pointsTable.length === 0 ? (
                      <tr><td colSpan="8" className="text-center py-10 text-gray-400 font-bold">
                        No teams added to this tournament yet.
                      </td></tr>
                    ) : pointsTable.map((row, index) => (
                      <tr key={row.team._id}
                        className={`transition ${
                          index === 0 && row.p > 0 ? 'bg-yellow-50'  :
                          index === 1 && row.p > 0 ? 'bg-green-50'   : 'hover:bg-blue-50/40'
                        }`}>
                        {/* Rank */}
                        <td className="px-4 py-3.5 text-center">
                          {index === 0 && row.p > 0 ? <span className="text-base">🥇</span>
                          : index === 1 && row.p > 0 ? <span className="text-base">🥈</span>
                          : index === 2 && row.p > 0 ? <span className="text-base">🥉</span>
                          : <span className="text-gray-400 font-bold">{index + 1}</span>}
                        </td>
                        {/* Team name with colored badge */}
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm"
                              style={{ backgroundColor: row.team.teamColor || '#1e3a8a' }}>
                              {row.team.shortName?.slice(0, 2) || row.team.teamName?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-[13px]">{row.team.teamName}</p>
                              {row.team.city && <p className="text-[10px] text-gray-400">{row.team.city}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-center text-gray-600">{row.p}</td>
                        <td className="px-3 py-3.5 text-center font-black text-green-600">{row.w}</td>
                        <td className="px-3 py-3.5 text-center text-red-500">{row.l}</td>
                        <td className="px-3 py-3.5 text-center text-gray-400">{row.nr}</td>
                        <td className="px-3 py-3.5 text-center">
                          {row.p === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              row.nrr > 0 ? 'bg-green-100 text-green-700' :
                              row.nrr < 0 ? 'bg-red-100 text-red-600'    :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {fmtNRR(row.nrr)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-blue-900 text-[15px]">{row.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NRR explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
              <p className="font-black mb-1">📐 Net Run Rate (NRR) Formula</p>
              <p>NRR = (Total runs scored ÷ Total overs faced) − (Total runs conceded ÷ Total overs bowled).
                When a team is <strong>all out</strong>, the full match overs ({tournament.overs}) count as the denominator.
                Teams are sorted by Points first, then NRR breaks the tie.</p>
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'LEADERBOARD' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Top Run Scorers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-black text-blue-900 mb-4 border-b pb-2 uppercase text-xs tracking-widest">
                🏏 Top Run Scorers
              </h3>
              <div className="space-y-2.5">
                {leaderboard.topRuns.length > 0 ? leaderboard.topRuns.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold text-xs w-4">{i + 1}.</span>
                      <span className="font-bold text-gray-700 text-sm">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-blue-700">{p.runs}</span>
                      <span className="text-[10px] text-gray-400 ml-1">runs</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 text-center py-6 leading-relaxed">
                    Stats available after<br/>matches are completed.
                  </p>
                )}
              </div>
            </div>

            {/* Top Wicket Takers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-black text-green-900 mb-4 border-b pb-2 uppercase text-xs tracking-widest">
                🎾 Top Wicket Takers
              </h3>
              <div className="space-y-2.5">
                {leaderboard.topWickets.length > 0 ? leaderboard.topWickets.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold text-xs w-4">{i + 1}.</span>
                      <span className="font-bold text-gray-700 text-sm">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-green-700">{p.wickets}</span>
                      <span className="text-[10px] text-gray-400 ml-1">wkts</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 text-center py-6 leading-relaxed">
                    Stats available after<br/>matches are completed.
                  </p>
                )}
              </div>
            </div>

            {/* MVP */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-5">
              <h3 className="font-black text-yellow-800 mb-4 border-b border-yellow-200 pb-2 uppercase text-xs tracking-widest">
                🌟 Most Valuable Player
              </h3>
              <p className="text-[10px] text-yellow-700 opacity-70 mb-3">
                MVP Points: 1 per run · 20 per wicket
              </p>
              <div className="space-y-2.5">
                {leaderboard.mvp.length > 0 ? leaderboard.mvp.map((p, i) => (
                  <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg shadow-sm border border-yellow-100 ${i === 0 ? 'bg-yellow-100' : 'bg-white'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold text-xs w-4">{i === 0 ? '👑' : `${i + 1}.`}</span>
                      <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-yellow-700">{p.mvpPoints}</span>
                      <span className="text-[10px] text-gray-400 ml-1">pts</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-yellow-600 opacity-70 text-center py-6 leading-relaxed">
                    MVP revealed as tournament<br/>progresses.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default ViewerTournamentDetails;