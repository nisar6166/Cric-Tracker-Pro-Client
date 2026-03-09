import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TournamentDashboard = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [activeTab, setActiveTab] = useState('INFO');
    const [loading, setLoading] = useState(true);

    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkMatchesList, setBulkMatchesList] = useState([]);

    const [globalOvers, setGlobalOvers] = useState(10);
    const [globalDuration, setGlobalDuration] = useState(120);

    const [currentUserId, setCurrentUserId] = useState(null);
    const token = localStorage.getItem('token');

    // --- Modal & Team States ---
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [searchTeam, setSearchTeam] = useState('');
    const [addingTeamId, setAddingTeamId] = useState(null);

    const [isCreatingNewTeam, setIsCreatingNewTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLocation, setNewTeamLocation] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    // Pool Management States
    const [isAssigningPools, setIsAssigningPools] = useState(false);
    // To make pools unlimited
    const [tempPools, setTempPools] = useState([
        { poolName: 'Pool A', teams: [] }
    ]);

    const addNewPool = () => {
        const nextLetter = String.fromCharCode(65 + tempPools.length);
        setTempPools([...tempPools, { poolName: `Pool ${nextLetter}`, teams: [] }]);
    };

    //  1. States for scheduling and editing league matches
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [isEditingMatch, setIsEditingMatch] = useState(false);
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [scheduleMatchData, setScheduleMatchData] = useState({ teamA: '', teamB: '', matchDateTime: '', totalOvers: 10, durationMinutes: 120 });

    // Function to schedule and edit matches
    const handleScheduleMatchSubmit = async (e) => {
        e.preventDefault();
        if (scheduleMatchData.teamA === scheduleMatchData.teamB) {
            return alert("Please select two different teams!");
        }

        try {
            const payload = {
                teamA: scheduleMatchData.teamA,
                teamB: scheduleMatchData.teamB,
                date: scheduleMatchData.matchDateTime,
                totalOvers: scheduleMatchData.totalOvers,
                durationMinutes: scheduleMatchData.durationMinutes
            };

            if (isEditingMatch) {
                await axios.put(`http://localhost:5000/api/matches/update/${editingMatchId}`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
                alert("Match updated successfully! ✅");
            } else {
                await axios.post(`http://localhost:5000/api/tournaments/${id}/schedule-match`, payload, { headers: { 'Authorization': `Bearer ${token}` } });
                alert("League Match scheduled successfully! 🏏");
            }

            setShowScheduleModal(false);
            fetchTournamentData();
        } catch (err) { alert(isEditingMatch ? "Failed to update match." : "Failed to schedule match."); }
    };

    const openEditMatchModal = (match) => {
        const formattedDate = new Date(match.date).toISOString().slice(0, 16);
        setScheduleMatchData({
            teamA: match.teamA._id || match.teamA,
            teamB: match.teamB._id || match.teamB,
            matchDateTime: formattedDate,
            totalOvers: match.totalOvers,
            durationMinutes: match.durationMinutes || 120
        });
        setEditingMatchId(match._id);
        setIsEditingMatch(true);
        setShowScheduleModal(true);
    };

    const handleDeleteMatch = async (matchId) => {
        if (!window.confirm("Are you sure you want to delete this match?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/matches/delete/${matchId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            alert("Match deleted successfully! 🗑️");
            fetchTournamentData();
        } catch (err) { alert("Failed to delete match."); }
    };

    const [showFinalModal, setShowFinalModal] = useState(false);
    const [finalMatchData, setFinalMatchData] = useState({ teamA: '', teamB: '', date: '', totalOvers: 10 });

    const handleScheduleFinalSubmit = async (e) => {
        e.preventDefault();
        if (finalMatchData.teamA === finalMatchData.teamB) return alert("Please select different teams for the Final!");

        try {
            await axios.post(`http://localhost:5000/api/tournaments/${id}/generate-knockouts`, {
                stage: 'Final',
                matches: [finalMatchData]
            }, { headers: { 'Authorization': `Bearer ${token}` } });

            alert("Grand Final scheduled successfully! 🏆🔥");
            setShowFinalModal(false);
            fetchTournamentData();
        } catch (err) { alert("Error scheduling final match."); }
    };

    const fetchTournamentData = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/tournaments/${id}`);
            setTournament(res.data);
            if (res.data.pools && res.data.pools.length > 0) {
                setTempPools(res.data.pools);
            }
        } catch (err) { console.error("Error fetching tournament:", err); }
        finally { setLoading(false); }
    };

    const fetchAvailableTeams = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/teams/all');
            setAvailableTeams(res.data);
        } catch (err) { console.error("Failed to fetch teams", err); }
    };

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id || payload._id);
            } catch (e) { console.error("Token parse error"); }
        }
        fetchTournamentData();
    }, [id, token]);

    const handleOpenAddTeamModal = async () => {
        setShowAddTeamModal(true);
        setIsCreatingNewTeam(false);
        await fetchAvailableTeams();
    };

    const handleAddTeamToTournament = async (teamId) => {
        setAddingTeamId(teamId);
        try {
            await axios.post(`http://localhost:5000/api/tournaments/${id}/add-team`, { teamId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchTournamentData();
            const currentTeamsCount = tournament.teams ? tournament.teams.length + 1 : 1;
            const maxAllowed = tournament.totalTeams > 0 ? tournament.totalTeams : 999;
            if (currentTeamsCount >= maxAllowed) setShowAddTeamModal(false);
        } catch (err) { alert(`Error: ${err.response?.data?.error || "Failed to add team"}`); }
        finally { setAddingTeamId(null); }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) { setNewTeamLogo(file); setLogoPreview(URL.createObjectURL(file)); }
    };

    const handleCreateAndAddTeam = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('teamName', newTeamName);
            formData.append('location', newTeamLocation);
            if (newTeamLogo) formData.append('teamLogo', newTeamLogo);

            const teamRes = await axios.post('http://localhost:5000/api/teams/add', formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const newTeamId = teamRes.data.team?._id || teamRes.data._id;
            await axios.post(`http://localhost:5000/api/tournaments/${id}/add-team`, { teamId: newTeamId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNewTeamName(''); setNewTeamLocation(''); setNewTeamLogo(null); setLogoPreview(null);
            await fetchTournamentData(); await fetchAvailableTeams();
            setIsCreatingNewTeam(false);
        } catch (err) { alert(`Error: ${err.response?.data?.error || "Failed to create team"}`); }
        finally { setIsCreating(false); }
    };

    const moveTeamToPool = (teamId, poolIndex) => {
        if (!tempPools || tempPools.length <= poolIndex) {
            alert("Pool does not exist. Please Add New Pool first!");
            return;
        }

        const updatedPools = [...tempPools];

        updatedPools.forEach(p => {
            if (p.teams) {
                p.teams = p.teams.filter(t => (t._id || t) !== teamId);
            } else {
                p.teams = [];
            }
        });

        updatedPools[poolIndex].teams.push(teamId);
        setTempPools(updatedPools);
    };

    const removeFromPool = (teamId) => {
        const updatedPools = tempPools.map(pool => ({
            ...pool,
            teams: pool.teams.filter(t => (t._id || t) !== teamId)
        }));
        setTempPools(updatedPools);
    };

    const handleRemoveTeamFromTournament = async (teamId) => {
        if (!window.confirm("Remove this team from the tournament?")) return;
        try {
            await axios.put(`http://localhost:5000/api/tournaments/${id}/remove-team`, { teamId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Team removed successfully!");
            fetchTournamentData();
        } catch (err) { alert("Failed to remove team"); }
    };

    const savePools = async () => {
        try {
            await axios.put(`http://localhost:5000/api/tournaments/${id}/assign-pools`, { pools: tempPools }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert("Pools updated! 🏆");
            fetchTournamentData();
            setIsAssigningPools(false);
        } catch (err) { alert("Failed to save pools"); }
    };

    // SMART KNOCKOUT GENERATOR (Supports Top 2, Top 4, Top 8, Top 16)
    const handleGenerateKnockouts = async () => {
        let allTeams = [];
        if (tournament.pools && tournament.pools.length > 0) {
            tournament.pools.forEach(p => {
                allTeams = [...allTeams, ...p.teams.map(t => tournament.teams.find(tm => tm._id === (t._id || t)))];
            });
        } else {
            allTeams = tournament.teams;
        }

        allTeams = [...new Set(allTeams.filter(Boolean))];

        if (allTeams.length < 2) return alert("You need at least 2 teams to generate knockouts!");

        const sortedTeams = allTeams.map(team => {
            const stats = getTeamStats(team._id || team);
            return { team, pts: stats.pts, nrr: parseFloat(stats.nrr || 0) };
        }).sort((a, b) => {
            if (b.pts !== a.pts) return b.pts - a.pts;
            return b.nrr - a.nrr;
        });

        const qualifyCountStr = window.prompt(
            "🏆 How many top teams should qualify for Knockouts?\n\n" +
            "Enter 2  👉 For Direct Final\n" +
            "Enter 4  👉 For Semi-Finals\n" +
            "Enter 8  👉 For Quarter-Finals\n" +
            "Enter 16 👉 For Pre-Quarter-Finals",
            "4"
        );

        if (!qualifyCountStr) return;
        const qualifyCount = parseInt(qualifyCountStr);

        // 16teams (Pre-Quarter)
        if (![2, 4, 8, 16].includes(qualifyCount)) {
            return alert("❌ Invalid input! Please enter exactly 2, 4, 8, or 16.");
        }

        if (sortedTeams.length < qualifyCount) {
            return alert(`❌ Not enough teams! You selected Top ${qualifyCount}, but only have ${sortedTeams.length} teams.`);
        }

        const topTeams = sortedTeams.slice(0, qualifyCount).map(t => t.team._id || t.team);
        let matchesToCreate = [];
        let stageName = '';
        const defaultOvers = tournament.matches[0]?.totalOvers || 10;

        if (qualifyCount === 2) {
            stageName = 'Final';
            matchesToCreate = [{ teamA: topTeams[0], teamB: topTeams[1], date: new Date(), totalOvers: defaultOvers }];
        } else if (qualifyCount === 4) {
            stageName = 'Semi-Final';
            matchesToCreate = [
                { teamA: topTeams[0], teamB: topTeams[3], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[1], teamB: topTeams[2], date: new Date(), totalOvers: defaultOvers }
            ];
        } else if (qualifyCount === 8) {
            stageName = 'Quarter-Final';
            matchesToCreate = [
                { teamA: topTeams[0], teamB: topTeams[7], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[1], teamB: topTeams[6], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[2], teamB: topTeams[5], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[3], teamB: topTeams[4], date: new Date(), totalOvers: defaultOvers }
            ];
        } else if (qualifyCount === 16) {
            // 16teams Pre-Quarter fixturesss
            stageName = 'Pre-Quarter-Final';
            matchesToCreate = [
                { teamA: topTeams[0], teamB: topTeams[15], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[1], teamB: topTeams[14], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[2], teamB: topTeams[13], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[3], teamB: topTeams[12], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[4], teamB: topTeams[11], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[5], teamB: topTeams[10], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[6], teamB: topTeams[9], date: new Date(), totalOvers: defaultOvers },
                { teamA: topTeams[7], teamB: topTeams[8], date: new Date(), totalOvers: defaultOvers }
            ];
        }

        if (!window.confirm(`Are you sure you want to generate ${matchesToCreate.length} ${stageName} match(es) for the Top ${qualifyCount} teams?`)) return;

        try {
            await axios.post(`http://localhost:5000/api/tournaments/${id}/generate-knockouts`, { stage: stageName, matches: matchesToCreate }, { headers: { 'Authorization': `Bearer ${token}` } });
            alert(`✅ ${stageName} matches generated successfully! 🏆`);
            fetchTournamentData();
            setActiveTab('MATCHES');
        } catch (err) { alert("Failed to generate knockouts."); }
    };

    // Logic to interleave and schedule matches across all pools
    const generateTournamentSchedule = () => {
        let allMatches = [];

        // 1. Generating all possible fixtures from all pools
        tournament.pools.forEach(pool => {
            const teams = pool.teams;
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    allMatches.push({
                        teamA: teams[i]._id || teams[i],
                        teamB: teams[j]._id || teams[j],
                        teamAName: teams[i].teamName,
                        teamBName: teams[j].teamName,
                        poolName: pool.poolName,
                        matchDateTime: '',
                        totalOvers: globalOvers,
                        durationMinutes: globalDuration
                    });
                }
            }
        });

        // 2. Shuffling Logic: Interleaving fixtures to prevent back-to-back matches from the same pool
        for (let i = allMatches.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allMatches[i], allMatches[j]] = [allMatches[j], allMatches[i]];
        }

        // 3. Ensuring rest intervals (Team Conflict Check - Optional but recommended). Using a simple interleaving approach here
        setBulkMatchesList(allMatches);
        setShowBulkModal(true);
    };

    const autoCalculateTimes = (startTime, duration = globalDuration) => {
        if (!startTime) return;
        let newList = [...bulkMatchesList];
        newList[0].matchDateTime = startTime;

        const gap = parseInt(duration) || 120;

        for (let i = 1; i < newList.length; i++) {
            let prevDate = new Date(newList[i - 1].matchDateTime);
            let nextDate = new Date(prevDate.getTime() + gap * 60000);
            newList[i].matchDateTime = new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        }
        setBulkMatchesList(newList);
    };

    const handleBulkScheduleSubmit = async () => {
        if (bulkMatchesList.some(m => !m.matchDateTime)) {
            return alert("Please set date and time for all matches!");
        }

        try {

            for (let match of bulkMatchesList) {
                await axios.post(`http://localhost:5000/api/tournaments/${id}/schedule-match`, {
                    teamA: match.teamA,
                    teamB: match.teamB,
                    date: match.matchDateTime,
                    totalOvers: match.totalOvers,
                    durationMinutes: match.durationMinutes || globalDuration
                }, { headers: { 'Authorization': `Bearer ${token}` } });
            }
            alert("All matches scheduled successfully! 🚀");
            setShowBulkModal(false);
            fetchTournamentData();
        } catch (err) { alert("Error in bulk scheduling."); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-900">Loading... 🏏</div>;
    if (!tournament) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Not Found!</div>;

    const role = localStorage.getItem('role');
    const isAdmin = role?.toLowerCase()?.trim() === 'admin' || currentUserId === (tournament.createdBy?._id || tournament.createdBy);
    const isScorer = role?.toLowerCase()?.trim() === 'scorer';
    const canManageKnockouts = isAdmin || isScorer;

    const currentTeamsCount = tournament.teams?.length || 0;
    const canAddMoreTeams = currentTeamsCount < (tournament.totalTeams > 0 ? tournament.totalTeams : 999);
    const tournamentTeamIds = tournament.teams?.map(t => t._id || t) || [];
    const teamsToShow = availableTeams.filter(t => !tournamentTeamIds.includes(t._id) && t.teamName.toLowerCase().includes(searchTeam.toLowerCase()));

    const knockoutMatches = tournament.matches?.filter(m => m.roundName && m.roundName !== 'League');
    const leagueMatches = tournament.matches?.filter(m => !m.roundName || m.roundName === 'League') || [];
    const isLeagueCompleted = leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'Completed');

    // Implementation: Precise Net Run Rate (NRR) and points calculation logic
    const getTeamStats = (teamId) => {
        let stats = { p: 0, w: 0, l: 0, nr: 0, pts: 0, nrr: "+0.000" };
        let totalRunsScored = 0;
        let totalOversFaced = 0;
        let totalRunsConceded = 0;
        let totalOversBowled = 0;

        if (!tournament.matches) return stats;

        const currentTeamId = String(teamId);

        tournament.matches.forEach(match => {
            const matchStatus = match.status?.toLowerCase()?.trim();
            const roundName = match.roundName?.toLowerCase()?.trim();

            if ((!roundName || roundName === 'league') && ['completed', 'abandoned'].includes(matchStatus)) {

                const teamA_Id = String(match.teamA?._id || match.teamA);
                const teamB_Id = String(match.teamB?._id || match.teamB);

                if (teamA_Id === currentTeamId || teamB_Id === currentTeamId) {
                    stats.p += 1;

                    // Fetching runs and overs for NRR calculation
                    let runsScored = 0, oversFaced = 0, runsConceded = 0, oversBowled = 0;

                    if (teamA_Id === currentTeamId) {
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

                    totalRunsScored += runsScored;
                    totalOversFaced += oversFaced;
                    totalRunsConceded += runsConceded;
                    totalOversBowled += oversBowled;

                    // Match result logic: Determining Win, Loss, or No Result (NR)
                    if (matchStatus === 'abandoned' || match.isNoResult) {
                        stats.nr += 1;
                        stats.pts += 1;
                    } else if (matchStatus === 'completed') {
                        const winnerField = match.winner || match.winningTeam || match.matchWinner;
                        const winnerId = winnerField ? String(winnerField?._id || winnerField) : null;

                        if (winnerId && winnerId !== 'undefined' && winnerId !== 'null') {
                            if (winnerId === currentTeamId) {
                                stats.w += 1;
                                stats.pts += 2;
                            } else {
                                stats.l += 1;
                            }
                        } else {
                            stats.nr += 1;
                            stats.pts += 1;
                        }
                    }
                }
            }
        });

        //  Final NRR calculation: (Total For / Overs For) - (Total Against / Overs Against)
        if (totalOversFaced > 0 || totalOversBowled > 0) {
            const runRateFor = totalOversFaced > 0 ? (totalRunsScored / totalOversFaced) : 0;
            const runRateAgainst = totalOversBowled > 0 ? (totalRunsConceded / totalOversBowled) : 0;
            const nrrValue = (runRateFor - runRateAgainst).toFixed(3);
            stats.nrr = nrrValue > 0 ? `+${nrrValue}` : `${nrrValue}`;
        }

        return stats;
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-10">
            {/* BANNER & LOGO */}
            <div className="relative bg-blue-900 h-48 md:h-64 flex justify-center items-center">
                {tournament.tournamentBanner ? <img src={`http://localhost:5000/${tournament.tournamentBanner}`} className="w-full h-full object-cover opacity-50" alt="Banner" /> : <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-800 opacity-90"></div>}
                <div className="absolute -bottom-12 left-6 md:left-12 flex items-end gap-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-xl border-4 border-white overflow-hidden flex justify-center items-center z-10">
                        {tournament.tournamentLogo ? <img src={`http://localhost:5000/${tournament.tournamentLogo}`} className="w-full h-full object-cover" alt="Logo" /> : <span className="text-4xl">🏆</span>}
                    </div>
                </div>
            </div>

            <div className="px-6 md:px-12 pt-16 pb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase">{tournament.tournamentName}</h1>
                    <p className="text-gray-500 font-bold mt-1 text-sm md:text-base">📍 {tournament.ground}, {tournament.city}</p>
                </div>
                {isAdmin && <Link to={`/edit-tournament/${tournament._id}`} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm text-sm">✏️ Edit</Link>}
            </div>

            {/* TABS */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 overflow-x-auto flex">
                {['INFO', 'TEAMS', 'MATCHES', 'POINTS TABLE'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-8 text-sm font-black whitespace-nowrap border-b-4 transition ${activeTab === tab ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <main className="max-w-6xl mx-auto p-4 md:p-6 mt-4">

                {/* INFO TAB */}
                {activeTab === 'INFO' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm animate-fade-in">
                        <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 font-black text-gray-600 uppercase tracking-wider text-xs">Tournament Info</div>
                        <div className="flex border-b border-gray-100">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Series</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{tournament.tournamentName}</div>
                        </div>
                        <div className="flex border-b border-gray-100">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Category</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{tournament.category}</div>
                        </div>
                        <div className="flex border-b border-gray-100">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Format</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{tournament.tournamentType || tournament.tournamentFormat}</div>
                        </div>
                        <div className="flex border-b border-gray-100">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Venue</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{tournament.ground}, {tournament.city}</div>
                        </div>
                        <div className="flex border-b border-gray-100">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Organiser</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{tournament.organiserName} <span className="text-gray-500 ml-2">(📞 {tournament.organiserPhone})</span></div>
                        </div>
                        <div className="flex">
                            <div className="w-1/3 p-4 font-bold text-gray-700 bg-gray-50">Teams Registered</div>
                            <div className="w-2/3 p-4 text-gray-900 font-medium">{currentTeamsCount} / {tournament.totalTeams > 0 ? tournament.totalTeams : 'Unlimited'}</div>
                        </div>
                    </div>
                )}

                {/* TEAMS TAB */}
                {activeTab === 'TEAMS' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-800">Teams ({currentTeamsCount})</h2>
                            <div className="flex gap-2">

                                {isAdmin && !isAssigningPools && tournament.pools?.map(pool => (
                                    <button
                                        key={pool._id}
                                        onClick={() => generatePoolPairs(pool)}
                                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-xs mb-4 mr-2 border border-purple-200"
                                    >
                                        ⚡ Bulk Schedule {pool.poolName}
                                    </button>
                                ))}

                                {isAdmin && canAddMoreTeams && (
                                    <button onClick={handleOpenAddTeamModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md text-sm transition">+ Add Team</button>
                                )}
                                {isAdmin && tournament.teams?.length > 1 && tournament.tournamentType !== 'KNOCKOUT' && (
                                    <button onClick={() => setIsAssigningPools(!isAssigningPools)} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold shadow-md text-sm transition">
                                        {isAssigningPools ? 'View Groups' : 'Manage Pools ⚙️'}

                                        {/* Unassigned teams*/}
                                        {tournament.teams.filter(t => !tempPools.some(p => p.teams.some(pt => (pt._id || pt) === t._id))).map(team => (
                                            <div key={team._id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border">
                                                <span className="font-bold text-xs truncate">{team.teamName}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => moveTeamToPool(team._id, 0)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-200">A</button>
                                                    <button onClick={() => moveTeamToPool(team._id, 1)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-200">B</button>
                                                    <button onClick={() => handleRemoveTeamFromTournament(team._id)} className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-black border border-red-200 ml-1">🗑️</button>
                                                </div>
                                            </div>
                                        ))}

                                    </button>
                                )}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="flex flex-wrap gap-2 mb-4">

                                {isAssigningPools && (
                                    <button onClick={addNewPool} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-xs border hover:bg-black transition">
                                        + Add New Pool
                                    </button>
                                )}

                                {!isAssigningPools && tournament.pools?.length > 0 && (
                                    <button
                                        onClick={generateTournamentSchedule}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-black text-xs shadow-lg animate-pulse hover:bg-purple-700 transition"
                                    >
                                        ⚡ SMART SCHEDULE ALL POOLS
                                    </button>
                                )}
                            </div>
                        )}

                        {isAssigningPools ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-100 p-4 rounded-xl border">
                                    <h3 className="font-bold mb-3 text-gray-600 uppercase text-[10px]">Unassigned Teams</h3>
                                    <div className="space-y-2">
                                        {tournament.teams.filter(t => !tempPools.some(p => p.teams.some(pt => (pt._id || pt) === t._id))).map(team => (
                                            <div key={team._id} className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center border">
                                                <span className="font-bold text-xs truncate">{team.teamName}</span>
                                                <div className="flex gap-1">
                                                    <button onClick={() => moveTeamToPool(team._id, 0)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-200">A</button>
                                                    <button onClick={() => moveTeamToPool(team._id, 1)} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-200">B</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {tempPools.map((pool, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm min-h-[150px]">
                                        <h3 className="font-black mb-3 text-blue-900 uppercase text-xs border-b pb-2">{pool.poolName}</h3>
                                        <div className="space-y-2">
                                            {pool.teams.map(tId => {
                                                const team = tournament.teams.find(t => t._id === (tId._id || tId));
                                                return team ? (
                                                    <div key={team._id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                                                        <div className="flex items-center gap-2">
                                                            <img src={`http://localhost:5000/${team.teamLogo}`} className="w-6 h-6 rounded-full object-cover" alt="logo" />
                                                            <span className="font-bold text-xs">{team.teamName}</span>
                                                        </div>

                                                        <button onClick={() => removeFromPool(team._id)} className="text-red-500 hover:text-red-700 font-bold px-1">✕</button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={savePools} className="col-span-full bg-green-600 text-white py-4 rounded-xl font-black shadow-lg">SAVE POOL STRUCTURE 🚀</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {tournament.pools?.length > 0 ? tournament.pools.map((pool, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                                        <div className="bg-blue-900 text-white px-6 py-3 font-black uppercase text-sm">{pool.poolName}</div>
                                        <div className="p-4 grid grid-cols-1 gap-2">
                                            {pool.teams.map(team => (
                                                <div key={team._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <img src={`http://localhost:5000/${team.teamLogo}`} className="w-10 h-10 rounded-full border bg-white" alt="logo" />
                                                    <span className="font-black text-gray-700 text-sm">{team.teamName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <div className="col-span-full p-10 text-center bg-white rounded-2xl border-2 border-dashed font-bold text-gray-400">No pools assigned. Use "Manage Pools" to organize teams.</div>}
                            </div>
                        )}
                    </div>
                )}

                {/* POINTS TABLE */}
                {activeTab === 'POINTS TABLE' && (
                    tournament.tournamentType === 'KNOCKOUT' ? (
                        <div className="p-10 text-center font-bold text-gray-400 bg-white rounded-2xl border border-dashed shadow-sm">
                            Knockout tournaments don't have a points table. Please check the MATCHES tab for brackets.
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            {tournament.pools?.map((pool, idx) => {
                                const sortedTeams = [...pool.teams].sort((a, b) => {
                                    const statsA = getTeamStats(a._id || a);
                                    const statsB = getTeamStats(b._id || b);
                                    return statsB.pts - statsA.pts;
                                });

                                return (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-blue-50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-3 w-10 text-center"></th>
                                                        <th className="px-2 py-3">{pool.poolName}</th>
                                                        <th className="px-3 py-3 text-center w-10">P</th>
                                                        <th className="px-3 py-3 text-center w-10">W</th>
                                                        <th className="px-3 py-3 text-center w-10">L</th>
                                                        <th className="px-3 py-3 text-center w-10">NR</th>
                                                        <th className="px-4 py-3 text-center w-12 text-gray-700">PTS</th>
                                                        <th className="px-4 py-3 text-center w-16">NRR</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                                                    {sortedTeams.map((team, index) => {
                                                        const stats = getTeamStats(team._id || team);
                                                        return (
                                                            <tr key={team._id} className="hover:bg-blue-50/50 transition duration-150">
                                                                <td className="px-4 py-3 text-center text-gray-500 font-bold">{index + 1}</td>
                                                                <td className="px-2 py-3 flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full border border-gray-200 overflow-hidden bg-white flex-shrink-0">
                                                                        <img src={team.teamLogo ? `http://localhost:5000/${team.teamLogo}` : 'https://placehold.co/100'} className="w-full h-full object-cover" alt="logo" />
                                                                    </div>
                                                                    <span className="font-bold text-[13px]">{team.teamName}</span>
                                                                </td>
                                                                <td className="px-3 py-3 text-center text-gray-600">{stats.p}</td>
                                                                <td className="px-3 py-3 text-center text-green-600">{stats.w}</td>
                                                                <td className="px-3 py-3 text-center text-red-500">{stats.l}</td>
                                                                <td className="px-3 py-3 text-center text-gray-400">{stats.nr}</td>
                                                                <td className="px-4 py-3 text-center font-black text-blue-900 text-[14px]">{stats.pts}</td>
                                                                <td className="px-4 py-3 text-center text-[12px] font-bold text-gray-600">{stats.nrr}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                )}

                {/*  MATCHES TAB (League + Knockout) */}
                {activeTab === 'MATCHES' && (
                    <div className="animate-fade-in">

                        {/* LEAGUE MATCHES SECTION */}
                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest">League Matches</h2>
                                {isAdmin && tournament.tournamentType !== 'KNOCKOUT' && (
                                    <button onClick={() => {
                                        setScheduleMatchData({ teamA: '', teamB: '', matchDateTime: '', totalOvers: 10, durationMinutes: 120 });
                                        setIsEditingMatch(false);
                                        setShowScheduleModal(true);
                                    }} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold shadow-sm text-sm border hover:bg-blue-200 transition">
                                        + Schedule Match
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {leagueMatches.length > 0 ? leagueMatches.map(match => (
                                    <div key={match._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${match.status === 'Live' ? 'bg-red-500 text-white animate-pulse' : match.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{match.status || 'Scheduled'}</span>

                                            {/*  Match Date & Time Display Section */}
<span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
    <span>📅</span>
    {(() => {
        const d = match.date || match.matchDateTime;
        if (!d) return "Date TBD";
        const dateObj = new Date(d);
        return isNaN(dateObj.getTime()) 
            ? "Invalid Date" 
            : dateObj.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    })()}
</span>

                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 relative">
                                            <span className="font-black text-blue-900 truncate w-2/5 text-center">{match.teamA?.teamName}</span>
                                            <span className="text-[10px] font-black text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm">VS</span>
                                            <span className="font-black text-blue-900 truncate w-2/5 text-center">{match.teamB?.teamName}</span>

                                            {/* match minutes scheduling */}
{(match.durationMinutes || tournament.globalDuration) && (
    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
        ⏱️ {match.durationMinutes || tournament.globalDuration || 120} Mins
    </div>
)}
                                        </div>

                                        {/* edit, delete buttons for admins only */}
                                        {isAdmin && (
                                            <div className="flex gap-2 mb-3 border-b border-gray-100 pb-3">
                                                <button onClick={() => openEditMatchModal(match)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold py-2 rounded-lg transition">✏️ Edit</button>
                                                <button onClick={() => handleDeleteMatch(match._id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold py-2 rounded-lg transition">🗑️ Delete</button>
                                            </div>
                                        )}

                                        {/* scoring buttons */}
                                        {(isAdmin || isScorer) && (
                                            match.status === 'Completed' ? (
                                                <Link to={`/view-score/${match._id}`} className="block w-full text-center bg-green-500 hover:bg-green-600 text-white text-xs font-black py-3 rounded-lg transition shadow-sm">✅ VIEW SCORE</Link>
                                            ) : (
                                                <Link to={`/scorematch/${match._id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-lg shadow-sm transition">🏏 {match.status === 'Live' ? 'UPDATE SCORE' : 'START SCORING'}</Link>
                                            )
                                        )}
                                    </div>
                                )) : <div className="col-span-full p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 font-bold">No league matches scheduled yet. Click '+ Schedule Match' to begin.</div>}
                            </div>
                        </div>

                        {/* TOURNAMENT BRACKETS */}
                        <div className="border-t border-gray-200 pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest">Tournament Brackets</h2>
                                {canManageKnockouts && tournament.pools?.length > 0 && knockoutMatches?.length === 0 && (
                                    <button
                                        onClick={handleGenerateKnockouts}
                                        disabled={!isLeagueCompleted}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition ${isLeagueCompleted ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {isLeagueCompleted ? 'Generate Knockouts 🏆' : '🔒 Locked'}
                                    </button>
                                )}
                            </div>

                            {knockoutMatches && knockoutMatches.length > 0 ? (
                                <div className="bg-white p-10 rounded-2xl border shadow-inner overflow-x-auto flex gap-12 items-center min-h-[500px]">
                                    {/*  SEMI FINALS COLUMN */}
                                    <div className="flex flex-col gap-12 min-w-[280px] relative">
                                        <h3 className="absolute -top-12 left-0 right-0 text-center font-black text-blue-800 bg-blue-50 py-1 rounded-md tracking-widest text-xs border border-blue-200">SEMI FINALS</h3>

                                        {knockoutMatches.filter(m => m.roundName === 'Semi-Final').map((match, i) => (
                                            <div key={match._id} className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-xl p-4 shadow-md relative z-10 transition transform hover:-translate-y-1">
                                                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full border bg-gray-50 overflow-hidden"><img src={`http://localhost:5000/${match.teamA?.teamLogo}`} className="w-full h-full object-cover" alt="A" /></div>
                                                        <span className="font-bold text-gray-800">{match.teamA?.teamName}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full border bg-gray-50 overflow-hidden"><img src={`http://localhost:5000/${match.teamB?.teamLogo}`} className="w-full h-full object-cover" alt="B" /></div>
                                                        <span className="font-bold text-gray-800">{match.teamB?.teamName}</span>
                                                    </div>
                                                </div>
                                                {(isAdmin || isScorer) && (
                                                    <Link to={`/scorematch/${match._id}`} className="block text-center bg-blue-50 text-blue-700 text-[10px] font-black py-2 rounded uppercase tracking-wider hover:bg-blue-600 hover:text-white transition">
                                                        Match Center ➡️
                                                    </Link>
                                                )}
                                            </div>
                                        ))}

                                        {knockoutMatches.filter(m => m.roundName === 'Semi-Final').length === 2 && (
                                            <div className="absolute right-[-48px] top-[25%] bottom-[25%] w-12 border-r-4 border-t-4 border-b-4 border-gray-300 rounded-r-xl z-0">
                                                <div className="absolute top-1/2 right-[-24px] w-6 border-b-4 border-gray-300 transform -translate-y-1/2"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/*  GRAND FINAL COLUMN */}
                                    <div className="flex flex-col min-w-[300px] relative ml-12">
                                        <h3 className="absolute -top-12 left-0 right-0 text-center font-black text-yellow-700 bg-yellow-50 py-1 rounded-md tracking-widest text-xs border border-yellow-300 shadow-sm animate-pulse">GRAND FINAL</h3>

                                        {knockoutMatches.filter(m => m.roundName === 'Final').length > 0 ? (
                                            knockoutMatches.filter(m => m.roundName === 'Final').map(match => (
                                                <div key={match._id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-5 shadow-xl relative z-10 transform scale-105">
                                                    <div className="flex justify-between items-center border-b border-yellow-200 pb-3 mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden"><img src={`http://localhost:5000/${match.teamA?.teamLogo}`} className="w-full h-full object-cover" alt="A" /></div>
                                                            <span className="font-extrabold text-gray-900">{match.teamA?.teamName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden"><img src={`http://localhost:5000/${match.teamB?.teamLogo}`} className="w-full h-full object-cover" alt="B" /></div>
                                                            <span className="font-extrabold text-gray-900">{match.teamB?.teamName}</span>
                                                        </div>
                                                    </div>
                                                    {(isAdmin || isScorer) && (
                                                        <Link to={`/scorematch/${match._id}`} className="block text-center bg-yellow-500 text-white text-xs font-black py-2.5 rounded shadow-sm uppercase tracking-wider hover:bg-yellow-600 transition">
                                                            Start Grand Finale 🏆
                                                        </Link>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center shadow-inner relative z-10 flex flex-col items-center justify-center h-[200px]">
                                                <span className="text-4xl mb-2 opacity-50">🏆</span>
                                                <span className="text-gray-400 font-bold text-sm mb-4">Waiting for Semi-Finals...</span>
                                                {isAdmin && (
                                                    <button onClick={() => setShowFinalModal(true)} className="bg-gray-800 text-white text-xs px-4 py-2 rounded-md font-bold shadow-md hover:bg-black transition transform hover:scale-105">
                                                        Schedule Final 🏆
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center">
                                    <span className="text-4xl mb-4">🗓️</span>
                                    <p className="text-gray-500 font-bold text-lg">No knockout brackets available.</p>
                                    <p className="text-gray-400 text-sm mt-1">Complete the league stage to generate semi-finals.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/*  MULTI-FEATURE ADD TEAM MODAL */}
            {showAddTeamModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-start border-b pb-3 mb-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-blue-900">Manage Teams</h3>
                                <p className="text-sm font-bold text-gray-500">{currentTeamsCount} / {tournament.totalTeams > 0 ? tournament.totalTeams : 'Unlimited'} Teams Added</p>
                            </div>
                            <button onClick={() => setShowAddTeamModal(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                        </div>

                        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setIsCreatingNewTeam(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${!isCreatingNewTeam ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>🔍 Select Existing</button>
                            <button onClick={() => setIsCreatingNewTeam(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${isCreatingNewTeam ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>✨ Create New</button>
                        </div>

                        {!isCreatingNewTeam ? (
                            <>
                                <input type="text" placeholder="Search teams..." value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500" />
                                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                                    {teamsToShow.length > 0 ? teamsToShow.map((team) => (
                                        <div key={team._id} className="border rounded-xl p-3 flex justify-between items-center hover:bg-blue-50 transition">
                                            <div className="flex items-center gap-3">
                                                <img src={team.teamLogo ? `http://localhost:5000/${team.teamLogo}` : "https://placehold.co/100?text=Logo"} alt="logo" className="w-10 h-10 rounded-full border" />
                                                <div><h4 className="font-bold text-gray-800 text-sm">{team.teamName}</h4><p className="text-xs text-gray-500">{team.location}</p></div>
                                            </div>
                                            <button onClick={() => handleAddTeamToTournament(team._id)} disabled={addingTeamId === team._id} className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50">{addingTeamId === team._id ? '⏳' : 'Add ➕'}</button>
                                        </div>
                                    )) : <div className="text-center text-gray-500 py-6 font-bold text-sm">No teams found.</div>}
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleCreateAndAddTeam} className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                <div className="flex flex-col items-center mb-5">
                                    <label className="cursor-pointer flex flex-col items-center group">
                                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-400 bg-gray-50 flex items-center justify-center overflow-hidden mb-2 group-hover:border-green-500 transition">
                                            {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-2xl">📷</span>}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500">Upload Team Logo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Team Name *</label><input type="text" required placeholder="Team Name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 font-bold" /></div>
                                    <div><label className="block text-xs font-bold text-gray-600 mb-1">Location *</label><input type="text" required placeholder="Location" value={newTeamLocation} onChange={(e) => setNewTeamLocation(e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 font-bold" /></div>
                                </div>
                                <button type="submit" disabled={isCreating} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black shadow-md transition disabled:opacity-70">{isCreating ? 'CREATING... ⏳' : 'CREATE & ADD TEAM 🚀'}</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/*  SCHEDULE / EDIT LEAGUE MATCH MODAL */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h3 className="text-xl font-black text-blue-900">
                                {isEditingMatch ? 'Edit Match ✏️' : 'Schedule Match 🏏'}
                            </h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-red-500 font-bold w-8 h-8 bg-gray-100 rounded-full flex justify-center items-center">✕</button>
                        </div>
                        <form onSubmit={handleScheduleMatchSubmit} className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Team 1</label>
                                    <select required value={scheduleMatchData.teamA} onChange={(e) => setScheduleMatchData({ ...scheduleMatchData, teamA: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select Team</option>
                                        {tournament.pools?.map(pool => (
                                            <optgroup key={pool.poolName} label={pool.poolName}>
                                                {pool.teams.map(t => {
                                                    const teamObj = tournament.teams.find(tm => tm._id === (t._id || t));
                                                    return teamObj ? <option key={teamObj._id} value={teamObj._id}>{teamObj.teamName}</option> : null;
                                                })}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Team 2</label>
                                    <select required value={scheduleMatchData.teamB} onChange={(e) => setScheduleMatchData({ ...scheduleMatchData, teamB: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select Team</option>
                                        {tournament.pools?.map(pool => (
                                            <optgroup key={pool.poolName} label={pool.poolName}>
                                                {pool.teams.map(t => {
                                                    const teamObj = tournament.teams.find(tm => tm._id === (t._id || t));
                                                    return teamObj ? <option key={teamObj._id} value={teamObj._id}>{teamObj.teamName}</option> : null;
                                                })}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Match Date & Time</label>
                                <input type="datetime-local" required value={scheduleMatchData.matchDateTime} onChange={(e) => setScheduleMatchData({ ...scheduleMatchData, matchDateTime: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Total Overs</label>
                                    <input type="number" required value={scheduleMatchData.totalOvers} onChange={(e) => setScheduleMatchData({ ...scheduleMatchData, totalOvers: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Duration (Mins)</label>
                                    <input type="number" required value={scheduleMatchData.durationMinutes} onChange={(e) => setScheduleMatchData({ ...scheduleMatchData, durationMinutes: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Eg: 120" />
                                </div>
                            </div>

                            <button type="submit" className={`w-full text-white py-3 rounded-xl font-black mt-6 shadow-md transition transform hover:-translate-y-1 ${isEditingMatch ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {isEditingMatch ? 'UPDATE MATCH 🚀' : 'SCHEDULE MATCH 🚀'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/*  SCHEDULE GRAND FINAL MODAL */}
            {showFinalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h3 className="text-xl font-black text-yellow-600">Schedule Grand Final 🏆</h3>
                            <button onClick={() => setShowFinalModal(false)} className="text-gray-400 hover:text-red-500 font-bold w-8 h-8 bg-gray-100 rounded-full flex justify-center items-center">✕</button>
                        </div>
                        <form onSubmit={handleScheduleFinalSubmit} className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Finalist 1</label>
                                    <select required onChange={(e) => setFinalMatchData({ ...finalMatchData, teamA: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-yellow-500">
                                        <option value="">Select Team</option>
                                        {tournament.teams?.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Finalist 2</label>
                                    <select required onChange={(e) => setFinalMatchData({ ...finalMatchData, teamB: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-800 outline-none focus:ring-2 focus:ring-yellow-500">
                                        <option value="">Select Team</option>
                                        {tournament.teams?.map(t => <option key={t._id} value={t._id}>{t.teamName}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Match Date</label>
                                <input type="date" required onChange={(e) => setFinalMatchData({ ...finalMatchData, date: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Total Overs</label>
                                <input type="number" required defaultValue={finalMatchData.totalOvers} onChange={(e) => setFinalMatchData({ ...finalMatchData, totalOvers: e.target.value })} className="w-full border border-gray-300 p-3 rounded-lg font-bold text-gray-700 outline-none focus:ring-2 focus:ring-yellow-500" />
                            </div>
                            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-black mt-6 shadow-md transition transform hover:-translate-y-1">
                                CONFIRM FINAL 🚀
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/*  BULK SCHEDULE MODAL (Global Overs & Auto Time) */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center border-b pb-3 mb-5">
                            <h3 className="text-xl font-black text-blue-900">Smart Schedule Matches ⚡</h3>
                            <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-red-500 font-bold w-8 h-8 bg-gray-100 rounded-full flex justify-center items-center">✕</button>
                        </div>

                        <div className="flex gap-4 mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-blue-900 mb-1">Overs (All Matches)</label>
                                <input type="number" value={globalOvers} onChange={(e) => {
                                    setGlobalOvers(e.target.value);
                                    setBulkMatchesList(bulkMatchesList.map(m => ({ ...m, totalOvers: e.target.value })));
                                }} className="border border-blue-200 p-2 rounded-lg w-full font-bold text-gray-700 outline-none" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-blue-900 mb-1">Duration Per Match (Mins)</label>
                                <input type="number" value={globalDuration} onChange={(e) => {
                                    setGlobalDuration(e.target.value);
                                    if (bulkMatchesList.length > 0 && bulkMatchesList[0].matchDateTime) {
                                        autoCalculateTimes(bulkMatchesList[0].matchDateTime, e.target.value);
                                    }
                                }} className="border border-blue-200 p-2 rounded-lg w-full font-bold text-gray-700 outline-none" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {bulkMatchesList.map((match, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4">
                                    <div className="font-bold text-sm flex-1">
                                        <span className="text-purple-600 mr-2 bg-purple-100 px-2 py-0.5 rounded text-[10px]">{match.poolName}</span>
                                        {match.teamAName} <span className="text-gray-400">VS</span> {match.teamBName}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1">{idx === 0 ? 'Start Time (Sets for all)' : 'Match Time'}</label>
                                        <input
                                            type="datetime-local" required value={match.matchDateTime}
                                            className={`border p-2 rounded-lg text-xs font-bold text-gray-700 outline-none ${idx === 0 ? 'border-purple-400 ring-2 ring-purple-100' : 'bg-white'}`}
                                            onChange={(e) => {
                                                if (idx === 0) { autoCalculateTimes(e.target.value, globalDuration); }
                                                else { let newList = [...bulkMatchesList]; newList[idx].matchDateTime = e.target.value; setBulkMatchesList(newList); }
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-8 border-t pt-5">
                            <button onClick={() => setShowBulkModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">Cancel</button>
                            <button onClick={handleBulkScheduleSubmit} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition">CONFIRM ALL MATCHES 🚀</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentDashboard;