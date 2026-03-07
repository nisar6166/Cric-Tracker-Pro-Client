import React from 'react';
import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// ChartJS ragister
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const MatchAnalysis = ({ scorecard }) => {
    
    if (!scorecard) return <div className="p-8 text-center text-gray-500 font-bold">No data available for analysis</div>;

    const inn1 = scorecard.innings1 || scorecard.firstInnings;
    const inn2 = scorecard.innings2 || scorecard.secondInnings;

    const team1Name = scorecard.teamA?.teamName || "Team A";
    const team2Name = scorecard.teamB?.teamName || "Team B";

    const batters1 = inn1?.batting || inn1?.batters || [];
    const batters2 = inn2?.batting || inn2?.batters || [];

    // 1. WICKETS BREAKDOWN (Doughnut Chart)

    let wicketTypes = { 'Bowled': 0, 'Caught': 0, 'Run Out': 0, 'Stumped': 0, 'LBW': 0, 'Other': 0 };
    
    const processWickets = (batters) => {
        batters.forEach(b => {
            const out = (b.dismissal || b.howOut || '').toLowerCase();
            // Taking only the data where it is not 'not out' and a wicket has fallen.
            if (out && !out.includes('not out') && !out.includes('batting')) {
                if (out.includes('run out')) wicketTypes['Run Out']++;
                else if (out.includes('c ') || out.includes('caught')) wicketTypes['Caught']++;
                else if (out.includes('st ') || out.includes('stumped')) wicketTypes['Stumped']++;
                else if (out.includes('lbw')) wicketTypes['LBW']++;
                else if (out.includes('b ') || out.includes('bowled')) wicketTypes['Bowled']++;
                else wicketTypes['Other']++;
            }
        });
    };

    processWickets(batters1);
    processWickets(batters2);

    const wicketData = {
        labels: Object.keys(wicketTypes).filter(key => wicketTypes[key] > 0),
        datasets: [{
            data: Object.values(wicketTypes).filter(val => val > 0),
            backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#6b7280'],
            borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6
        }]
    };

    // 2. TYPES OF RUNS (Bar Chart)

    const getRunTypes = (batters) => {
        let fours = 0, sixes = 0, runningRuns = 0;
        batters.forEach(b => {
            const f = b.fours || 0;
            const s = b.sixes || 0;
            const r = b.runs || 0;
            fours += f;
            sixes += s;
            // Runs scored through running (excluding boundaries)
            runningRuns += Math.max(0, r - ((f * 4) + (s * 6)));
        });
        return [runningRuns, fours * 4, sixes * 6];
    };

    const runTypesData = {
        labels: ['Running (1s, 2s, 3s)', 'Runs from 4s', 'Runs from 6s'],
        datasets: [
            { label: team1Name, data: getRunTypes(batters1), backgroundColor: '#14b8a6', borderRadius: 4 },
            { label: team2Name, data: getRunTypes(batters2), backgroundColor: '#ef4444', borderRadius: 4 }
        ]
    };

    // 3. MANHATTAN & WORM CHARTS (Over by Over)
    
    const getOversData = (innings) => {
        if (innings?.oversData && innings.oversData.length > 0) {
            return innings.oversData.map(o => o.runs || 0);
        }
        return []; //
    };

    const t1RunsPerOver = getOversData(inn1);
    const t2RunsPerOver = getOversData(inn2);

    const maxOvers = Math.max(t1RunsPerOver.length, t2RunsPerOver.length, 1);
    const labels = Array.from({ length: maxOvers }, (_, i) => `Ov ${i + 1}`);

    const manhattanData = {
        labels,
        datasets: [
            { label: team1Name, data: t1RunsPerOver, backgroundColor: '#14b8a6' },
            { label: team2Name, data: t2RunsPerOver, backgroundColor: '#ef4444' }
        ]
    };

    const manhattanOptions = {
        responsive: true,
        plugins: { legend: { position: 'bottom' }, title: { display: false } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Runs' } }, x: { title: { display: true, text: 'Overs' } } }
    };

    const calculateCumulative = (arr) => {
        let sum = 0; return arr.map(val => { sum += val; return sum; });
    };

    const wormData = {
        labels,
        datasets: [
            { label: team1Name, data: calculateCumulative(t1RunsPerOver), borderColor: '#14b8a6', backgroundColor: '#14b8a6', tension: 0.1, borderWidth: 2, pointRadius: 4 },
            { label: team2Name, data: calculateCumulative(t2RunsPerOver), borderColor: '#ef4444', backgroundColor: '#ef4444', tension: 0.1, borderWidth: 2, pointRadius: 4 }
        ]
    };

    const wormOptions = {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Total Runs' } }, x: { title: { display: true, text: 'Overs' } } }
    };

    // Hide the chart if wicket data is empty
    const totalWicketsFallen = Object.values(wicketTypes).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6 animate-fade-in p-2 pb-10">
            
            {/*  RUN TYPES CHART */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-gray-800 font-black text-lg mb-4 border-b pb-2">📊 Types of Runs</h3>
                <Bar data={runTypesData} options={{ indexAxis: 'y', responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { beginAtZero: true } } }} />
            </div>

            {/* WICKETS CHART */}
            {totalWicketsFallen > 0 ? (
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-800 font-black text-lg mb-4 border-b pb-2">🎯 Wickets Breakdown</h3>
                    <div className="w-full max-w-xs mx-auto relative">
                        <Doughnut data={wicketData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-30px]">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Total Wickets</span>
                            <span className="text-3xl font-black text-gray-800">{totalWicketsFallen}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-400 font-bold">
                    🎯 No wickets fell in this match yet.
                </div>
            )}

            {/*  MANHATTAN & WORM CHARTS */}
            {t1RunsPerOver.length > 0 || t2RunsPerOver.length > 0 ? (
                <>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-800 font-black text-lg mb-4 border-b pb-2">🏙️ Manhattan</h3>
                        <Bar data={manhattanData} options={manhattanOptions} />
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-800 font-black text-lg mb-4 border-b pb-2">📈 Worm</h3>
                        <Line data={wormData} options={wormOptions} />
                    </div>
                </>
            ) : (
                <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 font-bold text-sm">
                    📈 Over-by-over data is not available for this match.
                </div>
            )}

        </div>
    );
};

export default MatchAnalysis;