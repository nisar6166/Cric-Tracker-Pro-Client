import React, { useState } from 'react';
import axios from 'axios';

// Props aayi team details-um status-um medikkunnu
const AiInsights = ({ teamA = "Team A", teamB = "Team B", status = "Scheduled", result = "" }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');

  const generateInsights = async (e) => {
    e.preventDefault(); // Page refresh aavathirikkan
    setLoading(true);
    setInsight('');
    
    try {
      // Body-yil match details backend-ilekku ayakkunnu
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/insights`, {
        teamA,
        teamB,
        status,
        result
      });
      setInsight(response.data.insight);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setInsight("Sorry, AI analysis is currently unavailable. Please try again later.");
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-lg my-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-blue-800">🤖 CricTracker AI Expert</h3>
        <button 
          onClick={generateInsights} 
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Analyzing... ⏳' : (status === 'Completed' ? 'Post-Match Summary ✨' : 'Match Prediction ✨')}
        </button>
      </div>

      {insight && (
        <div className="mt-3 p-3 bg-white border-l-4 border-green-500 rounded text-sm text-gray-700 leading-relaxed shadow-sm">
          {insight}
        </div>
      )}
    </div>
  );
};

export default AiInsights;