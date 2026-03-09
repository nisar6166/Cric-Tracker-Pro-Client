import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ScoreMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);

  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [matchStatus, setMatchStatus] = useState('Scheduled');
  const [pauseReason, setPauseReason] = useState('');
  const [matchResultString, setMatchResultString] = useState('');

  const [oversData, setOversData] = useState([]);
  const [runsAtStartOfOver, setRunsAtStartOfOver] = useState(0);

  const [setupStep, setSetupStep] = useState(1);
  const [tossWonBy, setTossWonBy] = useState('');
  const [optedTo, setOptedTo] = useState('');
  const [playingXIA, setPlayingXIA] = useState([]);
  const [playingXIB, setPlayingXIB] = useState([]);

  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  //  SCORING STATES
  const [innings, setInnings] = useState(1);
  const [targetScore, setTargetScore] = useState(0);

  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [overs, setOvers] = useState(0);
  const [balls, setBalls] = useState(0);
  const [thisOver, setThisOver] = useState([]);

  const [batter1, setBatter1] = useState({ info: null, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
  const [batter2, setBatter2] = useState({ info: null, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
  const [onStrike, setOnStrike] = useState(1);
  const [outBatsmenIds, setOutBatsmenIds] = useState([]);

  const [bowlerActive, setBowlerActive] = useState({ info: null, overs: 0, maidens: 0, balls: 0, runs: 0, wickets: 0 });

  const [bowlerStatsMap, setBowlerStatsMap] = useState({});
  const [batterStatsMap, setBatterStatsMap] = useState({});
  const [bowlerOverRuns, setBowlerOverRuns] = useState(0);

  const [innings1Data, setInnings1Data] = useState(null);

  const [history, setHistory] = useState([]);
  const [modalType, setModalType] = useState('NONE');
  const [pendingOverChange, setPendingOverChange] = useState(false);
  const [newBatsmanId, setNewBatsmanId] = useState('');
  const [nextStrikeRole, setNextStrikeRole] = useState('NEW');
  const [newBowlerId, setNewBowlerId] = useState('');

  const [currentExtraType, setCurrentExtraType] = useState('');
  const [dismissalType, setDismissalType] = useState('Bowled');
  const [fielderId, setFielderId] = useState('');
  const [runoutRuns, setRunoutRuns] = useState(0);
  const [whoGotOut, setWhoGotOut] = useState(1);

  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerTeamId, setAddPlayerTeamId] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('Batsman');
  const [newPlayerAge, setNewPlayerAge] = useState('');
  const [newPlayerMobile, setNewPlayerMobile] = useState('');
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // PRO: NEW STATE FOR SYNC INDICATOR
  const [syncStatus, setSyncStatus] = useState('Synced ✅');

  const teamAId = match?.teamA?._id || match?.teamA;
  const teamBId = match?.teamB?._id || match?.teamB;

  const tossBatTeamId = tossWonBy === teamAId ? (optedTo === 'Bat' ? teamAId : teamBId) : (optedTo === 'Bat' ? teamBId : teamAId);
  const tossBowlTeamId = tossBatTeamId === teamAId ? teamBId : teamAId;

  const battingTeamId = innings === 1 ? tossBatTeamId : tossBowlTeamId;
  const bowlingTeamId = innings === 1 ? tossBowlTeamId : tossBatTeamId;

  //  RESTORE DATA & FETCH
  useEffect(() => {
    const savedData = localStorage.getItem(`match_${id}_state`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setRuns(parsed.runs || 0); setWickets(parsed.wickets || 0); setOvers(parsed.overs || 0); setBalls(parsed.balls || 0);
      setThisOver(parsed.thisOver || []); setBatter1(parsed.batter1); setBatter2(parsed.batter2);
      setOnStrike(parsed.onStrike || 1); setOutBatsmenIds(parsed.outBatsmenIds || []); setBowlerActive(parsed.bowlerActive);
      setBowlerStatsMap(parsed.bowlerStatsMap || {}); setBatterStatsMap(parsed.batterStatsMap || {});
      setBowlerOverRuns(parsed.bowlerOverRuns || 0); setInnings(parsed.innings || 1); setTargetScore(parsed.targetScore || 0);
      setHistory(parsed.history || []);
      setInnings1Data(parsed.innings1Data || null);
      setMatchResultString(parsed.matchResultString || '');

      setTossWonBy(parsed.tossWonBy || ''); setOptedTo(parsed.optedTo || '');
      setPlayingXIA(parsed.playingXIA || []); setPlayingXIB(parsed.playingXIB || []);
      setMatchStatus(parsed.matchStatus || 'Scheduled'); setSetupStep(parsed.setupStep || 1);
    }

    const fetchData = async () => {
      try {
        const matchRes = await axios.get(`http://localhost:5000/api/matches/all`);
        const currentMatch = matchRes.data.find(m => m._id === id);
        setMatch(currentMatch);
        if (!savedData && currentMatch?.status) setMatchStatus(currentMatch.status);
        if (!savedData && currentMatch?.pauseReason) setPauseReason(currentMatch.pauseReason);
        fetchPlayersData(currentMatch);
      } catch (err) { }
    };
    fetchData();
  }, [id]);

  const fetchPlayersData = async (currentMatch) => {
    try {
      const playersRes = await axios.get(`http://localhost:5000/api/players/all`);
      const allPlayers = playersRes.data;
      if (currentMatch) {
        const tAId = currentMatch.teamA?._id || currentMatch.teamA;
        const tBId = currentMatch.teamB?._id || currentMatch.teamB;
        setTeamAPlayers(allPlayers.filter(p => p.team === tAId || p.team?._id === tAId));
        setTeamBPlayers(allPlayers.filter(p => p.team === tBId || p.team?._id === tBId));
      }
    } catch (playerErr) { }
  };

  // PRO: ROBUST DATABASE SYNC FUNCTION 
  const syncScoreToDB = async () => {
    if (matchStatus !== 'Live' && matchStatus !== 'Completed') return;

    setSyncStatus('Syncing... ⏳');

    try {
      const token = localStorage.getItem('token');

      const currentBatterMap = { ...batterStatsMap };
      if (batter1?.info) currentBatterMap[batter1.info._id] = batter1;
      if (batter2?.info) currentBatterMap[batter2.info._id] = batter2;

      const currentBowlerMap = { ...bowlerStatsMap };
      if (bowlerActive?.info) currentBowlerMap[bowlerActive.info._id] = bowlerActive;

      // Get Manhattan/Worm data from oversData state, defaulting to an empty array
      const currentOversData = typeof oversData !== 'undefined' ? oversData : [];

      const currentInningsData = {
        team: battingTeamId,
        runs, wickets, overs, balls,
        batters: Object.values(currentBatterMap).map(b => ({
          player: b.info._id, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes,
          dismissal: b.dismissal || (outBatsmenIds.includes(b.info._id) ? 'out' : 'not out')
        })),
        bowlers: Object.values(currentBowlerMap).map(b => ({
          player: b.info._id, overs: b.overs, balls: b.balls, maidens: b.maidens, runs: b.runs, wickets: b.wickets
        })),
        oversData: currentOversData
      };

      let firstInningsPayload = null;
      if (innings === 2 && innings1Data) {
        firstInningsPayload = {
          team: tossBatTeamId,
          runs: innings1Data.runs, wickets: innings1Data.wickets, overs: innings1Data.overs, balls: innings1Data.balls,
          batters: Object.values(innings1Data.batterStatsMap).map(b => ({
            player: b.info._id, runs: b.runs, balls: b.balls, fours: b.fours, sixes: b.sixes,
            dismissal: b.dismissal || (innings1Data.outBatsmenIds?.includes(b.info._id) ? 'out' : 'not out')
          })),
          bowlers: Object.values(innings1Data.bowlerStatsMap).map(b => ({
            player: b.info._id, overs: b.overs, balls: b.balls, maidens: b.maidens, runs: b.runs, wickets: b.wickets
          })),
          oversData: innings1Data.oversData || []
        };
      }

      const payload = {
        tossWonBy: tossWonBy || null,
        optedTo: optedTo || 'Bat',
        resultString: matchResultString,
        firstInnings: innings === 1 ? currentInningsData : firstInningsPayload,
        secondInnings: innings === 2 ? currentInningsData : null
      };

      await axios.post(`http://localhost:5000/api/scorecard/save/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSyncStatus('Synced ✅');
    } catch (err) {
      console.error("Failed to sync score to DB", err);
      setSyncStatus('Sync Failed ❌');
      // Show exact error reason to user
      alert(`Sync Error: ${err.response?.data?.message || err.response?.data?.error || err.message}`);
    }
  };

  //  PRO: LOCAL STORAGE & INTELLIGENT AUTO-SYNC
  useEffect(() => {
    if (matchStatus === 'Live' || matchStatus === 'Paused' || matchStatus === 'Completed') {
      const stateToSave = {
        runs, wickets, overs, balls, thisOver, batter1, batter2, onStrike, outBatsmenIds,
        bowlerActive, bowlerStatsMap, batterStatsMap, bowlerOverRuns, innings, targetScore, history,
        tossWonBy, optedTo, playingXIA, playingXIB, matchStatus, setupStep, innings1Data, matchResultString
      };
      localStorage.setItem(`match_${id}_state`, JSON.stringify(stateToSave));

      // Trigger sync ONLY when relevant scoring states change, with 1.5s delay to prevent spamming
      const timeoutId = setTimeout(() => { syncScoreToDB(); }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [runs, balls, wickets, innings, matchStatus]);

  useEffect(() => {
    setBatterStatsMap(prev => {
      const newMap = { ...prev };
      if (batter1?.info) newMap[batter1.info._id] = batter1;
      if (batter2?.info) newMap[batter2.info._id] = batter2;
      return newMap;
    });
  }, [batter1, batter2]);

  useEffect(() => {
    if (bowlerActive?.info) {
      setBowlerStatsMap(prev => ({ ...prev, [bowlerActive.info._id]: bowlerActive }));
    }
  }, [bowlerActive]);

  const updateMatchStatusDB = async (status, reason = '', mvpData = null, winnerId = null) => {
    setMatchStatus(status);
    if (reason) setPauseReason(reason);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/matches/update/${id}`,
        { status, pauseReason: reason, manOfTheMatch: mvpData, winner: winnerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.error("Error updating DB:", err); }
  };

  const handleAddNewPlayer = async (e) => {
    e.preventDefault();
    setIsAddingPlayer(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newPlayerName);
      formData.append('role', newPlayerRole);
      formData.append('team', addPlayerTeamId);
      formData.append('age', newPlayerAge);
      formData.append('mobile', newPlayerMobile);

      const res = await axios.post('http://localhost:5000/api/players/add', formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      await fetchPlayersData(match);
      const newPlayerId = res.data.player?._id || res.data._id;
      if (newPlayerId) {
        if (addPlayerTeamId === teamAId) setPlayingXIA(prev => [...prev, newPlayerId]);
        else setPlayingXIB(prev => [...prev, newPlayerId]);
      }

      setShowAddPlayerModal(false); setNewPlayerName(''); setNewPlayerRole('Batsman'); setNewPlayerAge(''); setNewPlayerMobile('');
    } catch (err) {
      alert(`Failed to add player: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const battingTeamXI = battingTeamId === teamAId ? teamAPlayers.filter(p => playingXIA.includes(p._id)) : teamBPlayers.filter(p => playingXIB.includes(p._id));
  const bowlingTeamXI = bowlingTeamId === teamAId ? teamAPlayers.filter(p => playingXIA.includes(p._id)) : teamBPlayers.filter(p => playingXIB.includes(p._id));

  const maxWicketsAllowed = battingTeamXI.length > 0 ? battingTeamXI.length - 1 : 10;
  const availableBatsmen = battingTeamXI.filter(p => !outBatsmenIds.includes(p._id) && batter1.info?._id !== p._id && batter2.info?._id !== p._id);
  const availableBowlers = bowlingTeamXI.filter(p => bowlerActive.info?._id !== p._id);

  const handlePlayerToggle = (team, playerId) => {
    if (team === 'A') setPlayingXIA(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    else setPlayingXIB(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
  };

  const startMatch = () => {
    if (!strikerId || !nonStrikerId || !bowlerId) return alert("Select Opening Batters and Bowler!");

    const strikerObj = battingTeamXI.find(p => p._id === strikerId);
    const nonStrikerObj = battingTeamXI.find(p => p._id === nonStrikerId);
    const bowlerObj = bowlingTeamXI.find(p => p._id === bowlerId);

    setBatter1(batterStatsMap[strikerId] || { info: strikerObj, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
    setBatter2(batterStatsMap[nonStrikerId] || { info: nonStrikerObj, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
    setBowlerActive(bowlerStatsMap[bowlerId] || { info: bowlerObj, overs: 0, maidens: 0, balls: 0, runs: 0, wickets: 0 });

    setOnStrike(1); setSetupStep(3);
    setHistory([]);
    updateMatchStatusDB('Live');
    syncScoreToDB(); // Initial Sync Call
  };

  //  FIXED: Added setupStep to the history snapshot
  const saveToHistory = () => {
    const currentState = { runs, wickets, overs, balls, thisOver, batter1, batter2, onStrike, outBatsmenIds, bowlerActive, bowlerStatsMap, batterStatsMap, bowlerOverRuns, innings, targetScore, setupStep };
    setHistory(prev => [...prev, currentState].slice(-15));
  };

  //  FIXED: Added setSetupStep restore on undo
  const handleUndo = () => {
    if (history.length === 0) return alert("No previous balls to undo!");
    const prevState = history[history.length - 1];

    setRuns(prevState.runs); setWickets(prevState.wickets); setOvers(prevState.overs); setBalls(prevState.balls);
    setThisOver(prevState.thisOver); setBatter1(prevState.batter1); setBatter2(prevState.batter2);
    setOnStrike(prevState.onStrike); setOutBatsmenIds(prevState.outBatsmenIds); setBowlerActive(prevState.bowlerActive);
    setBowlerStatsMap(prevState.bowlerStatsMap); setBatterStatsMap(prevState.batterStatsMap); setBowlerOverRuns(prevState.bowlerOverRuns);
    setInnings(prevState.innings); setTargetScore(prevState.targetScore);
    setSetupStep(prevState.setupStep ?? 3); // ✅ Fixed: Restore setupStep to prevent wrong screen flash
    setHistory(prev => prev.slice(0, -1));
    syncScoreToDB(); // Sync on Undo
  };

  const generateResultString = (finalRuns, finalWickets) => {
    const team1Name = tossBatTeamId === teamAId ? match?.teamA?.teamName : match?.teamB?.teamName;
    const team2Name = tossBatTeamId === teamAId ? match?.teamB?.teamName : match?.teamA?.teamName;

    if (finalRuns >= targetScore) {
      return `${team2Name} won by ${maxWicketsAllowed - finalWickets} wickets`;
    } else if (finalRuns === targetScore - 1) {
      return `Match Tied!`;
    } else {
      return `${team1Name} won by ${targetScore - 1 - finalRuns} runs`;
    }
  };

  const finishMatch = (finalRuns, finalWickets) => {
    const result = generateResultString(finalRuns, finalWickets);
    setMatchResultString(result);

   // Calculate MVP stats and sync with backend on match completion
    let playerPoints = {};
    let playerNames = {};

    const processBatters = (statsMap) => {
      Object.values(statsMap).forEach(b => {
        if (!b.info) return;
        playerNames[b.info._id] = b.info.name;
        playerPoints[b.info._id] = (playerPoints[b.info._id] || 0) + b.runs + (b.fours * 1) + (b.sixes * 2);
      });
    };
    const processBowlers = (statsMap) => {
      Object.values(statsMap).forEach(b => {
        if (!b.info) return;
        playerPoints[b.info._id] = (playerPoints[b.info._id] || 0) + (b.wickets * 25);
      });
    };

    if (innings1Data) { processBatters(innings1Data.batterStatsMap); processBowlers(innings1Data.bowlerStatsMap); }
    processBatters(batterStatsMap); processBowlers(bowlerStatsMap);

    // Finding the player with the highest total points
    let mvpId = Object.keys(playerPoints).sort((a, b) => playerPoints[b] - playerPoints[a])[0];
    let mvpData = mvpId ? { name: playerNames[mvpId], desc: `${playerPoints[mvpId]} Points` } : null;

    // Determine the winner team ID for the points table
    let winnerId = null;
    if (finalRuns >= targetScore) {
      winnerId = tossBowlTeamId; // chasing team won
    } else if (finalRuns < targetScore - 1) {
      winnerId = tossBatTeamId; // first batting team won
    }
    // if tied (finalRuns === targetScore - 1), winnerId stays null

    // Sending status, MVP data, and winner together to the backend
    updateMatchStatusDB('Completed', '', mvpData, winnerId);
    syncScoreToDB();
    alert(`Match Complete! 🏆 ${result}`);
  };

  const handleInningsBreak = (finalRuns, finalWickets, finalOvers, finalBalls, finalBowler, fb1 = batter1, fb2 = batter2, currentOutBatsmen = outBatsmenIds) => {
    const finalBatterMap = { ...batterStatsMap };
    if (fb1.info) finalBatterMap[fb1.info._id] = fb1;
    if (fb2.info) finalBatterMap[fb2.info._id] = fb2;

    const finalBowlerMap = { ...bowlerStatsMap, [finalBowler.info._id]: finalBowler };

    setInnings1Data({
      teamName: battingTeamId === teamAId ? match?.teamA?.teamName : match?.teamB?.teamName,
      runs: finalRuns, wickets: finalWickets, overs: finalOvers, balls: finalBalls,
      batterStatsMap: finalBatterMap,
      bowlerStatsMap: finalBowlerMap,
      battingTeamXI, availableBatsmen,
      outBatsmenIds: [...currentOutBatsmen]
    });

    // FIXED: syncScoreToDB() moved BEFORE setTimeout so it captures correct innings 1 data
    // Previously it was inside setTimeout AFTER state was reset to 0, causing wrong data to sync
    syncScoreToDB();

    setTimeout(() => {
      alert(`1st Innings Complete! Target: ${finalRuns + 1}`);
      setTargetScore(finalRuns + 1); setInnings(2);
      setRuns(0); setWickets(0); setOvers(0); setBalls(0); setThisOver([]); setBowlerOverRuns(0); setOutBatsmenIds([]); setHistory([]);
      setStrikerId(''); setNonStrikerId(''); setBowlerId('');
      setBatter1({ info: null, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
      setBatter2({ info: null, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' });
      setBowlerActive({ info: null, overs: 0, maidens: 0, balls: 0, runs: 0, wickets: 0 });
      setBatterStatsMap({}); setBowlerStatsMap({});
      setSetupStep(2); setMatchStatus('Scheduled'); setModalType('NONE');
      setOversData([]);
      setRunsAtStartOfOver(0);
    }, 500);
  };

  const checkOverEnd = (newRuns, newWickets, finalBowler, fb1 = batter1, fb2 = batter2, currentOutBatsmen = outBatsmenIds) => {
    const newGlobalBalls = balls + 1;
    const isGlobalOverEnd = newGlobalBalls === 6;
    const isWin = innings === 2 && newRuns >= targetScore;
    const isAllOut = newWickets >= maxWicketsAllowed;

    // Manhattan Chart Update: Triggered by End of Over, Win, or All-Out
    if (isGlobalOverEnd || isWin || isAllOut) {
      const currentOverRuns = newRuns - runsAtStartOfOver;
      setOversData(prev => [...prev, { overNumber: overs + 1, runs: currentOverRuns }]);
      setRunsAtStartOfOver(newRuns); // Resetting over runs for the new over
    }

    if (isWin) {
      setBalls(isGlobalOverEnd ? 0 : newGlobalBalls);
      if (isGlobalOverEnd) setOvers(overs + 1);
      setTimeout(() => finishMatch(newRuns, newWickets), 300);
      return isGlobalOverEnd;
    }

    if (isGlobalOverEnd || isAllOut) {
      let newOversTotal = overs;
      if (isGlobalOverEnd) {
        newOversTotal += 1; setOvers(newOversTotal); setBalls(0); setBowlerOverRuns(0);
        setTimeout(() => setThisOver([]), 1500);
      } else {
        setBalls(newGlobalBalls);
      }

      if (newOversTotal >= match.totalOvers || isAllOut) {
        if (innings === 1) handleInningsBreak(newRuns, newWickets, newOversTotal, isGlobalOverEnd ? 0 : newGlobalBalls, finalBowler, fb1, fb2, currentOutBatsmen);
        else finishMatch(newRuns, newWickets);
      } else {
        if (isGlobalOverEnd && !isAllOut) setModalType('NEW_BOWLER');
      }
      return isGlobalOverEnd;
    } else {
      setBalls(newGlobalBalls);
      return false;
    }
  };

  // SCORING LOGIC
  const handleLegalBall = (run) => {
    if (matchStatus !== 'Live' || modalType !== 'NONE') return;
    saveToHistory();

    const newRuns = runs + run;
    setRuns(newRuns); setThisOver(prev => [...prev, run]);
    const isFour = run === 4 ? 1 : 0; const isSix = run === 6 ? 1 : 0;

    let finalBatter1 = { ...batter1 };
    let finalBatter2 = { ...batter2 };
    if (onStrike === 1) {
      finalBatter1 = { ...finalBatter1, runs: finalBatter1.runs + run, balls: finalBatter1.balls + 1, fours: finalBatter1.fours + isFour, sixes: finalBatter1.sixes + isSix };
      setBatter1(finalBatter1);
    } else {
      finalBatter2 = { ...finalBatter2, runs: finalBatter2.runs + run, balls: finalBatter2.balls + 1, fours: finalBatter2.fours + isFour, sixes: finalBatter2.sixes + isSix };
      setBatter2(finalBatter2);
    }

    const newBowlerRuns = bowlerActive.runs + run;
    let newBowlerBalls = bowlerActive.balls + 1;
    let newBowlerOvers = bowlerActive.overs;
    let newBowlerMaidens = bowlerActive.maidens;
    if (newBowlerBalls === 6) { newBowlerOvers += 1; newBowlerBalls = 0; if (bowlerOverRuns + run === 0) newBowlerMaidens += 1; }

    const finalBowler = { ...bowlerActive, balls: newBowlerBalls, overs: newBowlerOvers, maidens: newBowlerMaidens, runs: newBowlerRuns };
    setBowlerOverRuns(prev => prev + run);
    setBowlerActive(finalBowler);

    const isOverEnd = checkOverEnd(newRuns, wickets, finalBowler, finalBatter1, finalBatter2, outBatsmenIds);
    if ((run % 2 !== 0) !== isOverEnd) setOnStrike(prev => prev === 1 ? 2 : 1);
  };

  const openExtraModal = (type) => {
    if (matchStatus !== 'Live' || modalType !== 'NONE') return;
    setCurrentExtraType(type); setModalType('EXTRA_RUNS');
  };

  const processExtra = (extraRunsTaken) => {
    saveToHistory();
    const extraType = currentExtraType;
    let totalRunsAdded = extraRunsTaken;
    if (extraType === 'WD' || extraType === 'NB') totalRunsAdded += 1;

    const newRuns = runs + totalRunsAdded;
    setRuns(newRuns);
    setThisOver(prev => [...prev, extraRunsTaken > 0 ? `${extraType}+${extraRunsTaken}` : extraType]);

    let isLegalForBatter = false;
    let isLegalForBowler = false;

    let finalBatter1 = { ...batter1 };
    let finalBatter2 = { ...batter2 };

    if (extraType === 'BYE' || extraType === 'LB') {
      isLegalForBatter = true; isLegalForBowler = true;
      if (onStrike === 1) { finalBatter1.balls += 1; setBatter1(finalBatter1); }
      else { finalBatter2.balls += 1; setBatter2(finalBatter2); }
    } else if (extraType === 'NB') {
      isLegalForBatter = true;
      if (extraRunsTaken > 0) {
        if (onStrike === 1) { finalBatter1.runs += extraRunsTaken; finalBatter1.balls += 1; setBatter1(finalBatter1); }
        else { finalBatter2.runs += extraRunsTaken; finalBatter2.balls += 1; setBatter2(finalBatter2); }
      } else {
        if (onStrike === 1) { finalBatter1.balls += 1; setBatter1(finalBatter1); }
        else { finalBatter2.balls += 1; setBatter2(finalBatter2); }
      }
    }

    const bowlerRunsToAdd = (extraType === 'WD' || extraType === 'NB') ? totalRunsAdded : 0;
    setBowlerOverRuns(prev => prev + totalRunsAdded);

    let newBowlerBalls = bowlerActive.balls + (isLegalForBowler ? 1 : 0);
    let newBowlerOvers = bowlerActive.overs;
    let newBowlerMaidens = bowlerActive.maidens;
    if (newBowlerBalls === 6) { newBowlerOvers += 1; newBowlerBalls = 0; if (bowlerOverRuns + bowlerRunsToAdd === 0) newBowlerMaidens += 1; }

    const finalBowler = { ...bowlerActive, balls: newBowlerBalls, overs: newBowlerOvers, maidens: newBowlerMaidens, runs: bowlerActive.runs + bowlerRunsToAdd };
    setBowlerActive(finalBowler);

    setModalType('NONE'); setCurrentExtraType('');

    let isOverEnd = false;
    if (isLegalForBowler) { isOverEnd = checkOverEnd(newRuns, wickets, finalBowler, finalBatter1, finalBatter2, outBatsmenIds); }
    else if (innings === 2 && newRuns >= targetScore) { finishMatch(newRuns, wickets); }

    if ((extraRunsTaken % 2 !== 0) !== isOverEnd) setOnStrike(prev => prev === 1 ? 2 : 1);
  };

  const openWicketModal = () => {
    if (matchStatus !== 'Live' || modalType !== 'NONE') return;
    if (wickets >= maxWicketsAllowed) return alert("Team is already all out!");
    setDismissalType('Bowled'); setFielderId(''); setRunoutRuns(0); setWhoGotOut(onStrike);
    setModalType('WICKET_DETAILS');
  };

  const processWicket = () => {
    saveToHistory();
    const newWickets = wickets + 1;
    const newRuns = runs + Number(runoutRuns);
    const isAllOut = newWickets >= maxWicketsAllowed;

    setRuns(newRuns); setWickets(newWickets);
    setThisOver(prev => [...prev, 'W']);

    const outId = whoGotOut === 1 ? batter1.info?._id : batter2.info?._id;
    const currentOutBatsmen = outId ? [...outBatsmenIds, outId] : outBatsmenIds;
    if (outId) setOutBatsmenIds(currentOutBatsmen);

    const fielderName = bowlingTeamXI.find(p => p._id === fielderId)?.name || 'Fielder';
    let outDesc = dismissalType;
    if (dismissalType === 'Caught') outDesc = `c ${fielderName} b ${bowlerActive.info?.name}`;
    else if (dismissalType === 'Bowled') outDesc = `b ${bowlerActive.info?.name}`;
    else if (dismissalType === 'Stumped') outDesc = `st ${fielderName} b ${bowlerActive.info?.name}`;
    else if (dismissalType === 'Run Out') outDesc = `run out (${fielderName})`;

    let finalBatter1 = { ...batter1 };
    let finalBatter2 = { ...batter2 };

    if (onStrike === 1) {
      finalBatter1.balls += 1;
      finalBatter1.runs += Number(runoutRuns);
    } else {
      finalBatter2.balls += 1;
      finalBatter2.runs += Number(runoutRuns);
    }

    if (whoGotOut === 1) { finalBatter1.dismissal = outDesc; }
    else { finalBatter2.dismissal = outDesc; }

    setBatter1(finalBatter1);
    setBatter2(finalBatter2);

    const bowlerRunsToAdd = Number(runoutRuns);
    const countsAsBowlerWicket = dismissalType !== 'Run Out';

    let newBowlerBalls = bowlerActive.balls + 1;
    let newBowlerOvers = bowlerActive.overs;
    let newBowlerMaidens = bowlerActive.maidens;
    if (newBowlerBalls === 6) { newBowlerOvers += 1; newBowlerBalls = 0; if (bowlerOverRuns + bowlerRunsToAdd === 0) newBowlerMaidens += 1; }

    const finalBowler = { ...bowlerActive, balls: newBowlerBalls, overs: newBowlerOvers, maidens: newBowlerMaidens, runs: bowlerActive.runs + bowlerRunsToAdd, wickets: bowlerActive.wickets + (countsAsBowlerWicket ? 1 : 0) };
    setBowlerActive(finalBowler);

    const isOverEnd = balls === 5;
    const isWin = innings === 2 && newRuns >= targetScore;

    if (isWin) {
      setBalls(isOverEnd ? 0 : balls + 1);
      if (isOverEnd) setOvers(overs + 1);
      setTimeout(() => finishMatch(newRuns, newWickets), 300);
      return;
    }

    if (isAllOut) {
      let newOversTotal = overs;
      if (isOverEnd) {
        newOversTotal += 1; setOvers(newOversTotal); setBalls(0); setBowlerOverRuns(0);
        setTimeout(() => setThisOver([]), 1500);
      } else {
        setBalls(balls + 1);
      }
      if (innings === 1) handleInningsBreak(newRuns, newWickets, newOversTotal, isOverEnd ? 0 : balls + 1, finalBowler, finalBatter1, finalBatter2, currentOutBatsmen);
      else finishMatch(newRuns, newWickets);
      return;
    }

    if (isOverEnd) {
      let newOversTotal = overs + 1;
      setOvers(newOversTotal); setBalls(0); setBowlerOverRuns(0);
      setTimeout(() => setThisOver([]), 1500);

      if (newOversTotal >= match.totalOvers) {
        if (innings === 1) handleInningsBreak(newRuns, newWickets, newOversTotal, 0, finalBowler, finalBatter1, finalBatter2, currentOutBatsmen);
        else finishMatch(newRuns, newWickets);
      } else {
        setPendingOverChange(true);
        setModalType('WICKET_NEXT_BATTER');
      }
    } else {
      setBalls(balls + 1);
      setModalType('WICKET_NEXT_BATTER');
    }
  };

  const handleWicketSubmit = () => {
    if (!newBatsmanId) return alert("Please select the next batsman!");

    const newPlayer = battingTeamXI.find(p => p._id === newBatsmanId);
    const existingStats = batterStatsMap[newBatsmanId] || { info: newPlayer, runs: 0, balls: 0, fours: 0, sixes: 0, dismissal: '' };

    if (whoGotOut === 1) setBatter1(existingStats);
    else setBatter2(existingStats);

    if (nextStrikeRole !== 'NEW') setOnStrike(whoGotOut === 1 ? 2 : 1);
    else setOnStrike(whoGotOut);

    setNewBatsmanId('');
    setModalType('NONE');

    if (pendingOverChange) {
      setTimeout(() => {
        setModalType('NEW_BOWLER');
        setPendingOverChange(false);
      }, 300);
    }
  };

  const handleNewBowlerSubmit = () => {
    if (!newBowlerId) return alert("Please select the next bowler!");
    const newBowlerObj = bowlingTeamXI.find(p => p._id === newBowlerId);
    const existingStats = bowlerStatsMap[newBowlerId] || { info: newBowlerObj, overs: 0, maidens: 0, balls: 0, runs: 0, wickets: 0 };
    setBowlerActive(existingStats);
    setNewBowlerId(''); setModalType('NONE');
  };

  if (!match) return <div className="min-h-screen bg-gray-50 flex justify-center items-center font-bold">Loading...</div>;

  const totalOversBowled = overs + (balls / 6);
  const crr = totalOversBowled > 0 ? (runs / totalOversBowled).toFixed(2) : "0.00";
  const projectedScore = totalOversBowled > 0 ? Math.floor((runs / totalOversBowled) * (match.totalOvers || 10)) : 0;
  const remainingRuns = targetScore - runs;
  const remainingBalls = (match.totalOvers * 6) - (overs * 6 + balls);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800 relative">

      {/*  PRO: SYNC INDICATOR AND BUTTON ADDED HERE */}
      <nav className="bg-[#1e2329] border-b border-[#3a4048] text-white px-4 py-3 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-3">
          <Link to="/mycricket" className="text-xl hover:text-[#c0d62d] transition font-bold">⬅</Link>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wide">{match?.teamA?.teamName} vs {match?.teamB?.teamName}</span>
            <div className="flex gap-2 items-center">
              {matchStatus === 'Paused' && <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded font-bold animate-pulse inline-block mt-0.5 w-max">PAUSED: {pauseReason}</span>}
              {matchStatus === 'Live' && <span className="text-[10px] text-gray-400 mt-0.5">{syncStatus}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {matchStatus === 'Live' && (
            <>
              <button onClick={syncScoreToDB} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-sm flex items-center gap-1">☁️ Sync</button>
              <button onClick={() => setModalType('PAUSE_MATCH')} className="px-3 py-1.5 bg-yellow-500 text-black rounded text-xs font-bold shadow-sm">Pause</button>
            </>
          )}
          {matchStatus === 'Paused' && <button onClick={() => updateMatchStatusDB('Live')} className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-bold shadow-sm">Resume</button>}
          {matchStatus !== 'Scheduled' && matchStatus !== 'Completed' && matchStatus !== 'Postponed' && matchStatus !== 'Abandoned' && (
            <button onClick={() => setModalType('END_MATCH')} className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold shadow-sm">End Match</button>
          )}
        </div>
      </nav>

      {matchStatus === 'Scheduled' && setupStep < 3 && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-blue-900">⚙️ Match Setup</h2>
              <button onClick={() => navigate('/mycricket')} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">Cancel & Back</button>
            </div>

            {setupStep === 1 && (
              <div className="animate-fade-in">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-700 mb-2 text-sm">🪙 Toss Won By:</h3>
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setTossWonBy(teamAId)} className={`flex-1 py-2 rounded-lg font-bold border text-sm ${tossWonBy === teamAId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>{match?.teamA?.teamName}</button>
                    <button onClick={() => setTossWonBy(teamBId)} className={`flex-1 py-2 rounded-lg font-bold border text-sm ${tossWonBy === teamBId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>{match?.teamB?.teamName}</button>
                  </div>
                  {tossWonBy && (
                    <div className="flex gap-2">
                      <button onClick={() => setOptedTo('Bat')} className={`flex-1 py-2 rounded-lg font-bold border text-sm ${optedTo === 'Bat' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}>🏏 Bat</button>
                      <button onClick={() => setOptedTo('Bowl')} className={`flex-1 py-2 rounded-lg font-bold border text-sm ${optedTo === 'Bowl' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300'}`}>⚾ Bowl</button>
                    </div>
                  )}
                </div>
                {tossWonBy && optedTo && (
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-2 text-sm">🛡️ Playing XI</h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-gray-200 rounded p-2 bg-gray-50 flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-1">
                          <div>
                            <span className="text-xs font-bold text-blue-900">{match?.teamA?.teamName}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 ${playingXIA.length >= 7 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{playingXIA.length} Selected</span>
                          </div>
                          <button onClick={() => { setAddPlayerTeamId(teamAId); setShowAddPlayerModal(true); }} className="text-[10px] font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 rounded transition">➕ Add</button>
                        </div>
                        <div className="h-32 overflow-y-auto">
                          {teamAPlayers.map(p => <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer"><input type="checkbox" className="w-3 h-3" checked={playingXIA.includes(p._id)} onChange={() => handlePlayerToggle('A', p._id)} /><span className="text-[10px] font-medium">{p.name}</span></label>)}
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded p-2 bg-gray-50 flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-1">
                          <div>
                            <span className="text-xs font-bold text-blue-900">{match?.teamB?.teamName}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 ${playingXIB.length >= 7 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{playingXIB.length} Selected</span>
                          </div>
                          <button onClick={() => { setAddPlayerTeamId(teamBId); setShowAddPlayerModal(true); }} className="text-[10px] font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 rounded transition">➕ Add</button>
                        </div>
                        <div className="h-32 overflow-y-auto">
                          {teamBPlayers.map(p => <label key={p._id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer"><input type="checkbox" className="w-3 h-3" checked={playingXIB.includes(p._id)} onChange={() => handlePlayerToggle('B', p._id)} /><span className="text-[10px] font-medium">{p.name}</span></label>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button onClick={() => { if (playingXIA.length >= 3 && playingXIB.length >= 3) setSetupStep(2); else alert("Select at least 3 players per team to proceed!") }} disabled={!tossWonBy || !optedTo || playingXIA.length < 3 || playingXIB.length < 3} className="w-full bg-blue-900 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold shadow-md text-sm transition">Next Step ➡️</button>
              </div>
            )}
            {setupStep === 2 && (
              <div className="animate-fade-in mt-2 space-y-3">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800 mb-2">Opening Players</h3>
                  <button onClick={() => setSetupStep(1)} className="text-xs font-bold text-blue-600 underline">⬅ Edit XI</button>
                </div>
                <select onChange={(e) => setStrikerId(e.target.value)} value={strikerId} className="w-full p-2.5 border rounded text-sm font-bold"><option value="">-- Striker --</option>{battingTeamXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
                <select onChange={(e) => setNonStrikerId(e.target.value)} value={nonStrikerId} className="w-full p-2.5 border rounded text-sm font-bold"><option value="">-- Non-Striker --</option>{battingTeamXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
                <select onChange={(e) => setBowlerId(e.target.value)} value={bowlerId} className="w-full p-2.5 border rounded text-sm font-bold border-red-300"><option value="">-- Bowler --</option>{bowlingTeamXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
                <button onClick={startMatch} disabled={!strikerId || !nonStrikerId || !bowlerId} className="w-full bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold shadow-md mt-2 transition">LET'S PLAY 🏏</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-blue-900 mb-4 border-b pb-2">➕ Quick Add Player</h3>
            <form onSubmit={handleAddNewPlayer}>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600">Player Name *</label>
                <input type="text" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} required />
              </div>
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-600">Age *</label>
                  <input type="number" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" value={newPlayerAge} onChange={(e) => setNewPlayerAge(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-600">Mobile *</label>
                  <input type="text" className="w-full mt-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" value={newPlayerMobile} onChange={(e) => setNewPlayerMobile(e.target.value)} />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-600">Role</label>
                <select className="w-full mt-1 py-2 px-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" value={newPlayerRole} onChange={(e) => setNewPlayerRole(e.target.value)}>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-rounder">All-rounder</option>
                  <option value="Wicket-keeper">Wicket-keeper</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddPlayerModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-bold">Cancel</button>
                <button type="submit" disabled={isAddingPlayer} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold">
                  {isAddingPlayer ? 'Adding...' : 'Save Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'PAUSE_MATCH' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm border-t-4 border-yellow-500">
            <h2 className="text-lg font-black mb-4 text-gray-800">⏸️ Pause Match</h2>
            <select onChange={(e) => setPauseReason(e.target.value)} className="w-full p-3 border rounded bg-gray-50 font-bold mb-4">
              <option value="">-- Select Reason --</option>
              <option value="Rain stopped play">🌧️ Rain stopped play</option>
              <option value="Technical issue">⚙️ Technical issue</option>
              <option value="Match will start soon">⏳ Match will start soon</option>
              <option value="Bad light">💡 Bad light</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setModalType('NONE')} className="flex-1 py-2 bg-gray-200 rounded font-bold">Cancel</button>
              <button onClick={() => { if (pauseReason) { updateMatchStatusDB('Paused', pauseReason); setModalType('NONE'); } else alert("Select a reason!") }} className="flex-1 py-2 bg-yellow-500 text-black rounded font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'END_MATCH' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm border-t-4 border-red-600">
            <h2 className="text-lg font-black mb-4 text-red-600">⏹️ End Match Options</h2>
            <button onClick={() => { finishMatch(runs, wickets); setModalType('NONE'); }} className="w-full py-3 bg-green-600 text-white rounded font-bold mb-3">✅ Complete Match Normally</button>
            <button onClick={() => { updateMatchStatusDB('Postponed', 'Match Postponed'); localStorage.removeItem(`match_${id}_state`); setModalType('NONE'); }} className="w-full py-3 bg-blue-600 text-white rounded font-bold mb-3">📅 Match Postponed</button>
            <button onClick={() => { updateMatchStatusDB('Abandoned', 'Match Abandoned'); localStorage.removeItem(`match_${id}_state`); setModalType('NONE'); }} className="w-full py-3 bg-gray-800 text-white rounded font-bold mb-4">🌧️ Match Abandoned</button>
            <button onClick={() => setModalType('NONE')} className="w-full py-2 bg-gray-200 rounded font-bold text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {modalType === 'EXTRA_RUNS' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm border-t-4 border-blue-600">
            <h2 className="text-lg font-black mb-4 text-blue-900">How many extra runs taken? ({currentExtraType})</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5, 6].map(num => (
                <button key={num} onClick={() => processExtra(num)} className="bg-gray-100 hover:bg-blue-100 border border-gray-200 py-3 rounded text-xl font-bold text-gray-800">{num}</button>
              ))}
            </div>
            <button onClick={() => setModalType('NONE')} className="w-full py-3 bg-red-100 text-red-600 rounded font-bold">Cancel</button>
          </div>
        </div>
      )}

      {modalType === 'WICKET_DETAILS' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm border-t-4 border-red-600">
            <h2 className="text-xl font-black mb-4 text-red-600">☝️ Dismissal Details</h2>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">How Out?</label>
            <select onChange={(e) => setDismissalType(e.target.value)} value={dismissalType} className="w-full p-3 border rounded bg-gray-50 font-bold mb-4">
              <option value="Bowled">Bowled</option>
              <option value="Caught">Caught</option>
              <option value="Run Out">Run Out</option>
              <option value="LBW">LBW</option>
              <option value="Stumped">Stumped</option>
            </select>

            {/* Mandatory fielder selection for Caught, Run Out, or Stumped dismissals */}
            {(dismissalType === 'Caught' || dismissalType === 'Run Out' || dismissalType === 'Stumped') && (
              <>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  {dismissalType === 'Stumped' ? 'Wicket Keeper' : 'Fielder'}
                </label>
                <select onChange={(e) => setFielderId(e.target.value)} value={fielderId} className="w-full p-3 border rounded bg-gray-50 font-bold mb-4">
                  <option value="">-- Select {dismissalType === 'Stumped' ? 'Keeper' : 'Fielder'} --</option>
                  {bowlingTeamXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </>
            )}

            {dismissalType === 'Run Out' && (
              <>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Who got out?</label>
                <select onChange={(e) => setWhoGotOut(Number(e.target.value))} value={whoGotOut} className="w-full p-3 border rounded bg-gray-50 font-bold mb-4 text-red-600">
                  <option value={1}>Striker ({batter1.info?.name})</option>
                  <option value={2}>Non-Striker ({batter2.info?.name})</option>
                </select>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Runs completed before runout</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[0, 1, 2, 3].map(num => (
                    <button key={num} onClick={() => setRunoutRuns(num)} className={`py-2 rounded text-lg font-bold border ${runoutRuns === num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{num}</button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={() => setModalType('NONE')} className="flex-1 py-3 bg-gray-200 rounded font-bold">Cancel</button>
              <button onClick={processWicket} className="flex-1 py-3 bg-red-600 text-white rounded font-bold">OUT!</button>
            </div>
          </div>
        </div>
      )}

      {(modalType === 'WICKET_NEXT_BATTER' || modalType === 'NEW_BOWLER') && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className={`bg-white p-6 rounded-2xl w-full max-w-sm border-t-4 ${modalType === 'WICKET_NEXT_BATTER' ? 'border-red-600' : 'border-blue-600'}`}>
            <h2 className={`text-xl font-black mb-4 ${modalType === 'WICKET_NEXT_BATTER' ? 'text-red-600' : 'text-blue-900'}`}>{modalType === 'WICKET_NEXT_BATTER' ? 'Select Next Batter' : '🔄 NEW OVER'}</h2>
            <select onChange={(e) => modalType === 'WICKET_NEXT_BATTER' ? setNewBatsmanId(e.target.value) : setNewBowlerId(e.target.value)} value={modalType === 'WICKET_NEXT_BATTER' ? newBatsmanId : newBowlerId} className="w-full p-3 border border-gray-300 rounded bg-gray-50 font-bold mb-4">
              <option value="">{modalType === 'WICKET_NEXT_BATTER' ? '-- Select Next Batter --' : '-- Select Next Bowler --'}</option>
              {(modalType === 'WICKET_NEXT_BATTER' ? availableBatsmen : availableBowlers).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {modalType === 'WICKET_NEXT_BATTER' && (
              <div className="flex gap-2 mb-4">
                <label className={`flex-1 text-center py-2 rounded cursor-pointer font-bold border ${nextStrikeRole === 'NEW' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'border-gray-200 text-gray-500'}`}><input type="radio" className="hidden" onChange={() => setNextStrikeRole('NEW')} checked={nextStrikeRole === 'NEW'} /> New on Strike</label>
                <label className={`flex-1 text-center py-2 rounded cursor-pointer font-bold border ${nextStrikeRole === 'EXISTING' ? 'bg-blue-100 border-blue-500 text-blue-900' : 'border-gray-200 text-gray-500'}`}><input type="radio" className="hidden" onChange={() => setNextStrikeRole('EXISTING')} checked={nextStrikeRole === 'EXISTING'} /> Existing on Strike</label>
              </div>
            )}
            <button onClick={modalType === 'WICKET_NEXT_BATTER' ? handleWicketSubmit : handleNewBowlerSubmit} className={`w-full text-white py-3 rounded font-black ${modalType === 'WICKET_NEXT_BATTER' ? 'bg-red-600' : 'bg-blue-600'}`}>Confirm</button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-10 flex flex-col bg-[#1e2329]">

        {/* LIVE SCORING UI  */}
        {(matchStatus === 'Live' || matchStatus === 'Paused' || matchStatus === 'Scheduled') && (
          <div className={`${matchStatus === 'Paused' ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="py-8 px-4 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#1e2329] to-[#2a2f36] text-white">
              <div className="text-[#c0d62d] text-xs font-bold uppercase tracking-widest mb-1">{battingTeamId === teamAId ? match?.teamA?.teamName : match?.teamB?.teamName} Innings</div>
              <div className="flex items-baseline">
                <span className="text-6xl font-normal tracking-tight">{runs}<span className="text-4xl text-gray-400">/{wickets}</span></span>
                <span className="text-base font-medium ml-2 text-gray-400">({overs}.{balls}/{match?.totalOvers})</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-2 font-medium tracking-wide">
                CRR: {crr} &nbsp;&nbsp; {innings === 1 ? `Projected: ${projectedScore}` : (matchStatus !== 'Completed' && `Target: ${targetScore} (Need ${remainingRuns > 0 ? remainingRuns : 0} from ${remainingBalls > 0 ? remainingBalls : 0})`)}
              </div>
            </div>

            <div className="flex flex-col bg-[#2a2f36] border-t border-b border-[#3a4048]">
              <div className="flex divide-x divide-[#3a4048]">
                <div className={`flex-1 p-3 flex flex-col ${onStrike === 1 ? 'bg-[#31373e]' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] ${onStrike === 1 ? 'text-[#00e6b8]' : 'invisible'}`}>🏏</span>
                    <span className={`text-sm font-semibold truncate ${onStrike === 1 ? 'text-[#00e6b8]' : 'text-gray-200'}`}>{batter1.info?.name || 'Striker'}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5 ml-4">{batter1.runs}({batter1.balls})</div>
                </div>
                <div className={`flex-1 p-3 flex flex-col ${onStrike === 2 ? 'bg-[#31373e]' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] ${onStrike === 2 ? 'text-[#00e6b8]' : 'invisible'}`}>🏏</span>
                    <span className={`text-sm font-semibold truncate ${onStrike === 2 ? 'text-[#00e6b8]' : 'text-gray-200'}`}>{batter2.info?.name || 'Non-Striker'}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5 ml-4">{batter2.runs}({batter2.balls})</div>
                </div>
              </div>

              <div className="p-3 border-t border-[#3a4048]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span className="text-sm font-semibold text-gray-200">{bowlerActive.info?.name || 'Current Bowler'}</span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">{bowlerActive.overs}.{bowlerActive.balls}-{bowlerActive.maidens}-{bowlerActive.runs}-{bowlerActive.wickets}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {thisOver.length === 0 ? <span className="text-xs text-gray-500 italic">No balls bowled yet in this over</span> :
                    thisOver.map((ball, idx) => (
                      <div key={idx} className={`w-9 h-9 rounded-full flex justify-center items-center text-sm font-bold flex-shrink-0 ${ball === 'W' ? 'bg-red-500 text-white' : ball === 4 || ball === 6 ? 'bg-[#c0d62d] text-[#1e2329]' : 'bg-white text-gray-800'}`}>{ball}</div>
                    ))
                  }
                </div>
              </div>
            </div>

            {matchStatus === 'Live' && (
              <div className="bg-white p-1 shadow-sm border-b-4 border-gray-200">
                <div className="max-w-4xl mx-auto grid grid-cols-4 gap-1 min-h-[260px]">
                  <button onClick={() => handleLegalBall(0)} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl font-medium text-gray-700 active:bg-gray-100">0</button>
                  <button onClick={() => handleLegalBall(1)} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl font-medium text-gray-700 active:bg-gray-100">1</button>
                  <button onClick={() => handleLegalBall(2)} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl font-medium text-gray-700 active:bg-gray-100">2</button>
                  <button onClick={handleUndo} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-[#009270] hover:bg-green-50 active:bg-gray-100">UNDO</button>

                  <button onClick={() => handleLegalBall(3)} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl font-medium text-gray-700 active:bg-gray-100">3</button>
                  <button onClick={() => handleLegalBall(4)} className="bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center active:bg-gray-100"><span className="text-2xl font-medium text-gray-700">4</span></button>
                  <button onClick={() => handleLegalBall(6)} className="bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center active:bg-gray-100"><span className="text-2xl font-medium text-gray-700">6</span></button>
                  <div className="grid grid-rows-2 gap-1">
                    <button onClick={() => handleLegalBall(5)} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-gray-600 active:bg-gray-100">5, 7</button>
                    <button onClick={openWicketModal} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-black text-red-600 hover:bg-red-50 active:bg-red-100">OUT</button>
                  </div>

                  <button onClick={() => openExtraModal('WD')} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-gray-500 active:bg-gray-100">WD</button>
                  <button onClick={() => openExtraModal('NB')} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-gray-500 active:bg-gray-100">NB</button>
                  <button onClick={() => openExtraModal('BYE')} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-gray-500 active:bg-gray-100">BYE</button>
                  <button onClick={() => openExtraModal('LB')} className="bg-white border border-gray-100 shadow-sm flex items-center justify-center text-sm font-bold text-gray-500 active:bg-gray-100">LB</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- FULL SCORECARD VIEW --- */}
        {(matchStatus !== 'Scheduled' || setupStep >= 3) && (
          <div className="bg-gray-100 flex-1 w-full p-2 md:p-4">

            {/* Winning Result Banner */}
            {matchStatus === 'Completed' && matchResultString && (
              <div className="p-4 shadow-sm border-l-4 border-green-600 font-bold mb-4 bg-white text-green-800 text-center text-lg uppercase tracking-wide">
                {matchResultString}
              </div>
            )}
            {matchStatus !== 'Live' && matchStatus !== 'Completed' && (
              <div className="p-4 shadow-sm border-l-4 font-bold mb-4 bg-white border-yellow-500 text-yellow-700">
                Match {matchStatus} ⚠️ ({pauseReason})
              </div>
            )}

            {/*  INNINGS 1 SCORECARD */}
            {innings1Data && (
              <div className="bg-white shadow-sm md:rounded-xl overflow-hidden border border-gray-200 mb-6">
                <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
                  <h2 className="font-bold text-sm uppercase tracking-wide truncate w-2/3">{innings1Data.teamName} Innings</h2>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg">{innings1Data.runs}/{innings1Data.wickets}</span>
                    <span className="text-xs text-gray-300 font-medium">({innings1Data.overs}.{innings1Data.balls} Ov)</span>
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
                      {innings1Data.battingTeamXI.map(player => {
                        const stats = innings1Data.batterStatsMap[player._id];
                        if (!stats) return null;
                        const isOut = innings1Data.outBatsmenIds.includes(player._id);
                        return (
                          <tr key={player._id}>
                            <td className="p-3 pl-4">
                              <div className="text-blue-700 font-bold">{player.name} {!isOut ? '*' : ''}</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">{isOut ? stats.dismissal : 'not out'}</div>
                            </td>
                            <td className="p-3 text-right font-black text-gray-800">{stats.runs}</td>
                            <td className="p-3 text-right text-gray-600">{stats.balls}</td>
                            <td className="p-3 text-right text-gray-600">{stats.fours}</td>
                            <td className="p-3 text-right text-gray-600">{stats.sixes}</td>
                            <td className="p-3 text-right text-gray-600 pr-4">{stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-gray-200 text-[13px] text-gray-800">
                  <div className="flex px-4 py-3 justify-between items-center bg-gray-50">
                    <div className="font-semibold text-gray-600">Total</div>
                    <div className="font-black text-sm">{innings1Data.runs}/{innings1Data.wickets} <span className="text-gray-400 font-normal text-xs ml-1">({innings1Data.overs}.{innings1Data.balls} Ov)</span></div>
                  </div>
                </div>

                <div className="overflow-x-auto border-t border-gray-300">
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
                      {Object.values(innings1Data.bowlerStatsMap).map(stats => (
                        <tr key={stats.info._id}>
                          <td className="p-3 pl-4 text-blue-700 font-bold">{stats.info.name}</td>
                          <td className="p-3 text-right text-gray-600">{stats.overs}.{stats.balls}</td>
                          <td className="p-3 text-right text-gray-600">{stats.maidens}</td>
                          <td className="p-3 text-right text-gray-600">{stats.runs}</td>
                          <td className="p-3 text-right font-black text-gray-800">{stats.wickets}</td>
                          <td className="p-3 text-right text-gray-600 pr-4">{(stats.overs + stats.balls / 6) > 0 ? (stats.runs / (stats.overs + stats.balls / 6)).toFixed(2) : '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/*  INNINGS 2 (OR CURRENT INNINGS) SCORECARD */}
            <div className="bg-white shadow-sm md:rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
                <h2 className="font-bold text-sm uppercase tracking-wide truncate w-2/3">{battingTeamId === teamAId ? match?.teamA?.teamName : match?.teamB?.teamName} Innings</h2>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg">{runs}/{wickets}</span>
                  <span className="text-xs text-gray-300 font-medium">({overs}.{balls} Ov)</span>
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
                    {battingTeamXI.map(player => {
                      const stats = batterStatsMap[player._id] || (player._id === batter1.info?._id ? batter1 : player._id === batter2.info?._id ? batter2 : null);
                      if (!stats) return null;
                      const isOut = outBatsmenIds.includes(player._id);
                      return (
                        <tr key={player._id}>
                          <td className="p-3 pl-4">
                            <div className="text-blue-700 font-bold">{player.name} {!isOut ? '*' : ''}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{isOut ? stats.dismissal : 'not out'}</div>
                          </td>
                          <td className="p-3 text-right font-black text-gray-800">{stats.runs}</td>
                          <td className="p-3 text-right text-gray-600">{stats.balls}</td>
                          <td className="p-3 text-right text-gray-600">{stats.fours}</td>
                          <td className="p-3 text-right text-gray-600">{stats.sixes}</td>
                          <td className="p-3 text-right text-gray-600 pr-4">{stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : '0.0'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-200 text-[13px] text-gray-800">
                <div className="flex px-4 py-3 justify-between items-center bg-gray-50">
                  <div className="font-semibold text-gray-600">Total</div>
                  <div className="font-black text-sm">{runs}/{wickets} <span className="text-gray-400 font-normal text-xs ml-1">({overs}.{balls} Ov)</span> <span className="text-gray-600 font-bold text-xs ml-2">RR {crr}</span></div>
                </div>
              </div>

              {matchStatus !== 'Completed' && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-800 mb-1">To bat:</div>
                  <div className="text-xs text-gray-500 italic leading-relaxed">
                    {availableBatsmen.map(p => p.name).join(', ') || 'None'}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border-t border-gray-300">
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
                    {Object.values(bowlerStatsMap).map(stats => (
                      <tr key={stats.info._id}>
                        <td className="p-3 pl-4 text-blue-700 font-bold">{stats.info.name}</td>
                        <td className="p-3 text-right text-gray-600">{stats.overs}.{stats.balls}</td>
                        <td className="p-3 text-right text-gray-600">{stats.maidens}</td>
                        <td className="p-3 text-right text-gray-600">{stats.runs}</td>
                        <td className="p-3 text-right font-black text-gray-800">{stats.wickets}</td>
                        <td className="p-3 text-right text-gray-600 pr-4">{(stats.overs + stats.balls / 6) > 0 ? (stats.runs / (stats.overs + stats.balls / 6)).toFixed(2) : '0.00'}</td>
                      </tr>
                    ))}
                    {bowlerActive.info && !bowlerStatsMap[bowlerActive.info._id] && (
                      <tr>
                        <td className="p-3 pl-4 text-blue-700 font-bold">{bowlerActive.info.name}</td>
                        <td className="p-3 text-right text-gray-600">{bowlerActive.overs}.{bowlerActive.balls}</td>
                        <td className="p-3 text-right text-gray-600">{bowlerActive.maidens}</td>
                        <td className="p-3 text-right text-gray-600">{bowlerActive.runs}</td>
                        <td className="p-3 text-right font-black text-gray-800">{bowlerActive.wickets}</td>
                        <td className="p-3 text-right text-gray-600 pr-4">{totalOversBowled > 0 ? (bowlerActive.runs / totalOversBowled).toFixed(2) : '0.00'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default ScoreMatch;