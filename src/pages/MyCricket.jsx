import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MyCricket = () => {
  const [activeTab, setActiveTab] = useState('Matches');
  const navigate = useNavigate();

  // security check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Access Denied! Please login as Admin or Scorer.");
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Matches':
        return (
          <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700 font-medium">Want to start a match?</p>
              <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-medium hover:bg-blue-700 shadow-sm transition">Start</button>
            </div>
          </div>
        );
      case 'Tournaments':
        return (
          <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-medium">Want to host a tournament?</p>
              <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-medium hover:bg-blue-700 shadow-sm transition">Register</button>
            </div>
          </div>
        );
      case 'Teams':
        return (
          <div className="p-4 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-medium">Want to create a new team?</p>
              <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-medium hover:bg-blue-700 shadow-sm transition">Create</button>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm shadow-sm shrink-0">Your Teams</button>
              <button className="bg-white text-gray-600 px-5 py-1.5 rounded-full text-sm border hover:bg-gray-50 transition shrink-0">Opponents</button>
              <button className="bg-white text-gray-600 px-5 py-1.5 rounded-full text-sm border hover:bg-gray-50 transition shrink-0">Following</button>
            </div>
            <input type="text" placeholder="🔍 Quick search" className="w-full border border-gray-300 rounded-lg p-3 mb-5 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
          </div>
        );
      case 'Stats':
        return (
          <div className="p-4 animate-fade-in">
             <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700 font-medium">Want to improve your stats?</p>
              <button className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-medium hover:bg-blue-700 shadow-sm transition">Analyze</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm shrink-0 shadow-sm">Batting</button>
              <button className="bg-white text-gray-600 px-6 py-2 rounded-full text-sm border shrink-0 hover:bg-gray-50 transition">Bowling</button>
              <button className="bg-white text-gray-600 px-6 py-2 rounded-full text-sm border shrink-0 hover:bg-gray-50 transition">Fielding</button>
              <button className="bg-white text-gray-600 px-6 py-2 rounded-full text-sm border shrink-0 hover:bg-gray-50 transition">Captain</button>
            </div>
            <div className="mt-12 p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              📊 Stats data will appear here
            </div>
          </div>
        );
      case 'Highlights':
        return (
          <div className="p-8 mt-10 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 mx-4">
            🎥 No highlights available yet.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      
      {/* 1. Full Navbar Section (Blue Theme) */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full shadow-md z-10">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>
        
        <div className="hidden md:flex gap-8 text-lg font-medium">
          <Link to="/" className="hover:text-blue-300 transition">Home</Link>
          <Link to="/" className="hover:text-blue-300 transition">Matches</Link>
          <Link to="/" className="hover:text-blue-300 transition">About</Link>
        </div>
        
        <div className="flex gap-6 text-lg items-center font-medium">
          <Link to="/" className="hover:text-blue-300 hidden md:block transition">Contact</Link>
          {/* Displaying the logout button for the logged-in user */}
          <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-full font-bold shadow-sm hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </nav>

      {/* 2. Tabs Section */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-0">
        <div className="flex overflow-x-auto hide-scrollbar max-w-4xl mx-auto">
          {['Matches', 'Tournaments', 'Teams', 'Stats', 'Highlights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 px-6 text-sm md:text-base font-bold text-center border-b-4 transition-colors duration-300 whitespace-nowrap ${
                activeTab === tab ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tab Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full mt-4 pb-10">
        {renderTabContent()}
      </main>

    </div>
  );
};

export default MyCricket;