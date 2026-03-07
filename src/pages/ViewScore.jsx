import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MatchAnalysis from '../components/MatchAnalysis';

const ViewScore = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchStats, setMatchStats] = useState(null);
  const [activeTab, setActiveTab] = useState('Scorecard');

  const fetchMatchAndScore = async () => {
    try {
      const matchRes = await axios.get('http://localhost:5000/api/matches/all');
      const currentMatch = matchRes.data.find(m => m._id === matchId);
      setMatch(currentMatch);

      const timestamp = new Date().getTime();
      const scoreRes = await axios.get(`http://localhost:5000/api/scorecard/${matchId}?t=${timestamp}`);
      
      if (scoreRes.data) {
        setScorecard(scoreRes.data);

        if (currentMatch?.status === 'Completed') {
          calculatePostMatchStats(scoreRes.data);
        }
      }
    } catch (err) {
      console.error("Error fetching viewer score:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchAndScore();
    const interval = setInterval(() => { 
        if(match?.status !== 'Completed') fetchMatchAndScore(); 
    }, 3000);
    return () => clearInterval(interval);
  }, [matchId, match?.status]);

  // Identifying MVP (Man of the Match) and top individual performers automatically
  const calculatePostMatchStats = (data) => {
    let allBatters = [];
    let allBowlers = [];
    let fielderCatches = {};
    let playerPoints = {};
    let playerProfiles = {};
    let playerNamesToId = {}; 

    const inningsList = [data.firstInnings, data.secondInnings].filter(Boolean);

    inningsList.forEach(innings => {
      if(innings.batters) {
          allBatters = [...allBatters, ...innings.batters];
          innings.batters.forEach(b => {
              if(b.player) {
                  playerNamesToId[b.player.name] = b.player._id;
                  playerProfiles[b.player._id] = b.player;
              }
          });
      }
      if(innings.bowlers) {
          allBowlers = [...allBowlers, ...innings.bowlers];
          innings.bowlers.forEach(b => {
              if(b.player) {
                  playerNamesToId[b.player.name] = b.player._id;
                  playerProfiles[b.player._id] = b.player;
              }
          });
      }
    });

    //  calculating point table
    allBatters.forEach(b => {
        if(!b.player) return;
        let pts = b.runs + (b.fours * 1) + (b.sixes * 2); 
        playerPoints[b.player._id] = (playerPoints[b.player._id] || 0) + pts;
    });

    allBowlers.forEach(b => {
        if(!b.player) return;
        let pts = (b.wickets * 25);
        playerPoints[b.player._id] = (playerPoints[b.player._id] || 0) + pts;
    });

   // Identifying catches and awarding fielding points
    inningsList.forEach(innings => {
      innings.batters?.forEach(b => {
        if(b.dismissal && b.dismissal.startsWith('c ') && b.dismissal.includes(' b ')) {
           let catcherName = b.dismissal.split('c ')[1].split(' b ')[0].trim();
           fielderCatches[catcherName] = (fielderCatches[catcherName] || 0) + 1;
           
           let catcherId = playerNamesToId[catcherName];
           if(catcherId) {
               playerPoints[catcherId] = (playerPoints[catcherId] || 0) + 2;
           }
        }
      });
    });

    const topScorer = [...allBatters].sort((a, b) => b.runs - a.runs)[0];
    const topBowler = [...allBowlers].sort((a, b) => {
        if (b.wickets !== a.wickets) return b.wickets - a.wickets;
        return a.runs - b.runs; 
    })[0];

    let topFielder = { name: "None", catches: 0 };
    Object.keys(fielderCatches).forEach(name => {
        if(fielderCatches[name] > topFielder.catches) {
            topFielder = { name, catches: fielderCatches[name] };
        }
    });

    let mvpId = Object.keys(playerPoints).sort((a, b) => playerPoints[b] - playerPoints[a])[0];
    let mvpPlayer = playerProfiles[mvpId];

    let mvpBatStats = allBatters.find(b => b.player?._id === mvpId);
    let mvpBowlStats = allBowlers.find(b => b.player?._id === mvpId);
    let mvpName = mvpPlayer?.name;

    let mvpDesc = "";
    if(mvpBatStats && mvpBatStats.runs > 0) mvpDesc += `${mvpBatStats.runs} runs`;
    if(mvpBowlStats && mvpBowlStats.wickets > 0) mvpDesc += (mvpDesc ? ' & ' : '') + `${mvpBowlStats.wickets}/${mvpBowlStats.runs}`;
    if(mvpName && fielderCatches[mvpName] > 0) mvpDesc += (mvpDesc ? ' & ' : '') + `${fielderCatches[mvpName]} catches`;

    setMatchStats({ topScorer, topBowler, topFielder, mvpPlayer, mvpDesc, mvpPoints: playerPoints[mvpId] || 0 });
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#f3f4f6] font-bold text-blue-900 text-xl">Loading Scorecard... 🏏</div>;
  if (!match) return <div className="min-h-screen flex justify-center items-center bg-[#f3f4f6] font-bold text-red-600">Match Not Found!</div>;

  const formatOvers = (overs, balls) => {
    const totalBalls = (overs * 6) + balls;
    return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
  };

  const renderInnings = (inningsData, title) => {
    if (!inningsData || !inningsData.batters || inningsData.batters.length === 0) return null;
    const displayWickets = Math.min(inningsData.wickets, 10);
    const displayOvers = formatOvers(inningsData.overs, inningsData.balls);

    return (
      <div className="bg-white shadow-sm md:rounded-xl overflow-hidden border border-gray-200 mb-6 animate-fade-in">
        <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="font-bold text-sm uppercase tracking-wide">{inningsData.team?.teamName || title}</h2>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg">{inningsData.runs}/{displayWickets}</span>
            <span className="text-xs text-gray-300 font-medium">({displayOvers} Ov)</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-3 pl-4 font-semibold w-1/2">Batters</th>
                <th className="p-3 text-right font-semibold">R</th>
                <th className="p-3 text-right font-semibold">B</th>
                <th className="p-3 text-right font-semibold">4s</th>
                <th className="p-3 text-right font-semibold">6s</th>
                <th className="p-3 text-right pr-4 font-semibold">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inningsData.batters.map((batter, idx) => (
                <tr key={idx}>
                  <td className="p-3 pl-4">
                     <div className="text-blue-700 font-bold">{batter.player?.name} {batter.dismissal === 'not out' ? '*' : ''}</div>
                     <div className="text-[10px] text-gray-500 mt-0.5">{batter.dismissal}</div>
                  </td>
                  <td className="p-3 text-right font-black text-gray-800">{batter.runs}</td>
                  <td className="p-3 text-right text-gray-600">{batter.balls}</td>
                  <td className="p-3 text-right text-gray-600">{batter.fours}</td>
                  <td className="p-3 text-right text-gray-600">{batter.sixes}</td>
                  <td className="p-3 text-right text-gray-600 pr-4">{batter.balls > 0 ? ((batter.runs/batter.balls)*100).toFixed(1) : '0.0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="overflow-x-auto border-t border-gray-300 mt-2">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-3 pl-4 font-semibold w-1/2">Bowlers</th>
                <th className="p-3 text-right font-semibold">O</th>
                <th className="p-3 text-right font-semibold">M</th>
                <th className="p-3 text-right font-semibold">R</th>
                <th className="p-3 text-right font-semibold">W</th>
                <th className="p-3 text-right pr-4 font-semibold">Eco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inningsData.bowlers.map((bowler, idx) => {
                const bowlerOvers = formatOvers(bowler.overs, bowler.balls);
                const rawBalls = (bowler.overs * 6) + bowler.balls;
                const eco = rawBalls > 0 ? (bowler.runs / (rawBalls / 6)).toFixed(2) : '0.00';
                return (
                  <tr key={idx}>
                    <td className="p-3 pl-4 text-blue-700 font-bold">{bowler.player?.name}</td>
                    <td className="p-3 text-right text-gray-600">{bowlerOvers}</td>
                    <td className="p-3 text-right text-gray-600">{bowler.maidens}</td>
                    <td className="p-3 text-right text-gray-600">{bowler.runs}</td>
                    <td className="p-3 text-right font-black text-gray-800">{bowler.wickets}</td>
                    <td className="p-3 text-right text-gray-600 pr-4">{eco}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const currentInnings = scorecard?.secondInnings?.batters?.length > 0 ? scorecard.secondInnings : scorecard?.firstInnings;
  const isSecondInnings = scorecard?.secondInnings?.batters?.length > 0;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-10">
      <nav className="bg-[#009270] text-white px-4 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-md">
         <Link to="/" className="text-xl font-bold hover:text-gray-200 transition">⬅</Link>
         <h1 className="text-lg font-bold truncate">{match.teamA?.teamName} vs {match.teamB?.teamName}</h1>
      </nav>

      <div className="max-w-4xl mx-auto md:mt-4 flex flex-col gap-3 p-2">
        
        {/*  Result Banner */}
        {match.status === 'Completed' && scorecard?.resultString ? (
           <div className="bg-white px-4 py-3 shadow-sm text-blue-900 font-black text-center text-lg uppercase tracking-wide border-t-4 border-blue-600 rounded-t-xl">
              🏆 {scorecard.resultString}
           </div>
        ) : (
           <div className={`bg-white px-4 py-3 shadow-sm font-bold text-sm md:text-base border-l-4 flex justify-between items-center ${match.status === 'Live' ? 'border-red-500 text-red-600' : 'border-yellow-500 text-yellow-700'}`}>
              <span>{match.status === 'Live' ? '🔴 LIVE NOW' : `Match Status: ${match.status} ${match.pauseReason ? `(${match.pauseReason})` : ''}`}</span>
           </div>
        )}

        {/*  Toss Banner */}
        {scorecard?.tossWonBy && (
           <div className="bg-gray-100 text-gray-600 font-bold text-xs text-center py-2 rounded shadow-inner border border-gray-200">
             🪙 {scorecard.tossWonBy?.teamName} won the toss and elected to {scorecard.optedTo} first.
           </div>
        )}

        {/*  POST MATCH PRESENTATION (MoM & MVP) */}
        {match.status === 'Completed' && matchStats && (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 text-white shadow-xl my-2 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 opacity-10 text-9xl">🌟</div>
                <h3 className="text-yellow-400 font-black uppercase tracking-widest text-xs mb-4 text-center">Post Match Presentation</h3>
                
                {matchStats.mvpPlayer && (
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-yellow-400 z-10">
                            {matchStats.mvpPlayer.profilePic ? <img src={`http://localhost:5000/${matchStats.mvpPlayer.profilePic}`} className="w-full h-full rounded-full object-cover" alt="MVP"/> : '🏅'}
                        </div>
                        <h2 className="text-2xl font-black mt-2 z-10 text-center">{matchStats.mvpPlayer.name}</h2>
                        <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Player of the Match</p>
                        <div className="mt-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold shadow-inner">
                            {matchStats.mvpDesc} <span className="text-yellow-300 text-xs ml-1">({matchStats.mvpPoints} pts)</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 bg-black/30 p-4 rounded-xl text-center z-10 relative">
                    <div>
                        <div className="text-[10px] text-indigo-300 uppercase font-bold mb-1">Top Scorer</div>
                        <div className="text-sm font-black truncate">{matchStats.topScorer?.player?.name || '-'}</div>
                        <div className="text-xs text-yellow-400 font-bold">{matchStats.topScorer?.runs || 0} Runs</div>
                    </div>
                    <div className="border-l border-r border-white/20">
                        <div className="text-[10px] text-indigo-300 uppercase font-bold mb-1">Top Bowler</div>
                        <div className="text-sm font-black truncate">{matchStats.topBowler?.player?.name || '-'}</div>
                        <div className="text-xs text-yellow-400 font-bold">{matchStats.topBowler?.wickets || 0} Wkts</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-indigo-300 uppercase font-bold mb-1">Most Catches</div>
                        <div className="text-sm font-black truncate">{matchStats.topFielder?.name !== 'None' ? matchStats.topFielder.name : '-'}</div>
                        <div className="text-xs text-yellow-400 font-bold">{matchStats.topFielder?.catches || 0} Catches</div>
                    </div>
                </div>
            </div>
        )}

        {/* Conditional Render: Display Scorecard & Analysis tabs only after match start */}
        {scorecard && (
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-2 mt-2">
            <button 
              onClick={() => setActiveTab('Scorecard')} 
              className={`flex-1 py-3 text-sm font-black transition ${activeTab === 'Scorecard' ? 'bg-[#009270] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              📋 SCORECARD
            </button>
            <button 
              onClick={() => setActiveTab('Analysis')} 
              className={`flex-1 py-3 text-sm font-black transition ${activeTab === 'Analysis' ? 'bg-[#009270] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              📈 ANALYSIS
            </button>
          </div>
        )}

        {/*  Main Content Rendering based on Active Tab */}
        {!scorecard ? (
          <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm border border-gray-200">
             Match hasn't started yet.
          </div>
        ) : (
          <>
            {activeTab === 'Scorecard' ? (
              <>
                {/* Score Box */}
                {currentInnings && match.status !== 'Completed' && (
                  <div className="bg-gradient-to-br from-[#1e2329] to-[#2a2f36] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-4 animate-fade-in">
                    <div className="text-[#c0d62d] font-bold text-sm tracking-widest uppercase mb-2">
                      {currentInnings.team?.teamName} Batting
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h1 className="text-6xl font-black tracking-tighter transition-all duration-300">{currentInnings.runs}<span className="text-4xl text-gray-400 font-bold">/{Math.min(currentInnings.wickets, 10)}</span></h1>
                      <span className="text-lg font-bold text-gray-300 ml-2">({formatOvers(currentInnings.overs, currentInnings.balls)})</span>
                    </div>
                    {isSecondInnings && scorecard.firstInnings && (
                      <div className="mt-3 bg-white/10 px-4 py-2 rounded-lg inline-block text-sm font-medium">
                         Target: {scorecard.firstInnings.runs + 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Scoreboards */}
                {renderInnings(scorecard?.firstInnings, '1st Innings')}
                {renderInnings(scorecard?.secondInnings, '2nd Innings')}
              </>
            ) : (
              // showing Analysis chart
              <MatchAnalysis scorecard={scorecard} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewScore;