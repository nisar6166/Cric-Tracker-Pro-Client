import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.jpg';

const Home = () => {
  const navigate = useNavigate();

  // Fetching data from local storage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profilePic = localStorage.getItem('profilePic');
  const userName = localStorage.getItem('userName');

  const [showInstructions, setShowInstructions] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Determining the correct profile photo URL
  const getProfileImg = () => {
    if (profilePic && profilePic !== "undefined") {
      return `http://localhost:5000/${profilePic}`;
    }
    return "https://placehold.co/150?text=No+Photo";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 flex flex-col gap-3 font-sans text-gray-800">

      {/* 1. Header (Navbar) - Mobile & Desktop Responsive */}
      <nav className="bg-blue-900 text-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center w-full rounded-t-lg shadow-md gap-4 md:gap-0">

        {/* Logo */}
        <div className="text-xl md:text-2xl font-bold flex items-center justify-center md:justify-start w-full md:w-auto">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>

      
        <div className="flex overflow-x-auto w-full md:w-auto justify-start md:justify-center gap-5 md:gap-8 text-sm md:text-lg font-medium items-center pb-2 md:pb-0 scrollbar-hide px-2 md:px-0">
          <Link to="/" className="hover:text-blue-300 transition border-b-2 border-blue-400 whitespace-nowrap">Home</Link>
          <Link to="/matches" className="font-bold hover:text-gray-300 transition whitespace-nowrap">Matches</Link>
          <Link to="/about" className="hover:text-blue-300 transition whitespace-nowrap">About</Link>

          {/* Admin Inbox */}
          {token && role === 'admin' && (
            <Link to="/inbox" className="text-xs md:text-sm bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center gap-1 whitespace-nowrap">
              📩 Inbox
            </Link>
          )}
        </div>

        {/* User Profile & Auth Section */}
        <div className="flex gap-4 md:gap-6 items-center justify-center w-full md:w-auto pt-2 md:pt-0 border-t border-blue-800 md:border-none">

          {/* Display contact details for Viewer/Scorer roles only */}
          {role !== 'admin' && (
            <Link to="/contact" className="hover:text-blue-300 transition font-medium text-sm md:text-base whitespace-nowrap">
              Contact
            </Link>
          )}

          {token ? (
            <div className="flex items-center gap-3 md:gap-4 border-l border-blue-800 pl-3 md:pl-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] md:text-xs font-bold text-white leading-none capitalize">{userName || role}</span>
                <span className="text-[8px] md:text-[10px] text-blue-300 uppercase">{role}</span>
              </div>

              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-green-400 overflow-hidden shadow-md bg-gray-200 flex-shrink-0">
                <img
                  src={getProfileImg()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-red-600 transition shadow-sm font-bold text-xs md:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3 items-center border-l border-blue-800 pl-3 md:pl-4">
              <Link to="/login" className="bg-white text-blue-900 px-4 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-blue-100 transition shadow-sm font-bold text-xs md:text-sm">Login</Link>
              <Link to="/signup" className="hover:text-blue-300 transition font-bold text-xs md:text-sm">Signup</Link>
            </div>
          )}
        </div>
      </nav>

     {/* 2. Main Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center min-h-[650px] md:min-h-[550px] w-full rounded-lg shadow-inner overflow-hidden bg-blue-900 py-12 md:py-0">

        {/* 🖼️ Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-80 mix-blend-overlay"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>

        {/* 🌫️ Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/40 to-[#f0fdf4] z-0"></div>

        {/* Cubes Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none z-0"></div>

        {/* Main Content (Title & Dashboard Button) */}
        <div className="flex flex-col items-center justify-center flex-1 z-10 text-center px-4 pt-10 pb-12 md:pb-32">
          <h2 className="text-4xl md:text-5xl mb-8 tracking-tight font-extrabold text-white leading-tight drop-shadow-xl">
            Track Your Cricket Matches <br /> 
            <span className="text-yellow-400">Like a Pro</span>
          </h2>

            {/* Dashboard Button */}
            <Link
              to={token ? "/mycricket" : "/login"}
              className="bg-green-600 text-white text-xl font-bold px-10 py-4 md:px-12 md:py-5 rounded-full hover:bg-green-700 transition duration-300 shadow-xl transform hover:-translate-y-1 border-b-4 border-green-800 inline-block"
            >
              {token ? "Go to My Dashboard" : "Start Scoring Now"}
            </Link>

            <button
              onClick={() => setShowInstructions(true)}
              className="bg-blue-600 text-white text-lg font-bold px-8 py-4 md:py-5 rounded-full hover:bg-blue-700 transition duration-300 shadow-xl border-b-4 border-blue-800 flex items-center gap-2 cursor-pointer"
            >
              📖 How to Use?
            </button>
          </div>

        <div className="relative md:absolute md:bottom-12 w-full px-6 flex flex-col md:flex-row justify-center gap-4 md:gap-6 max-w-4xl mx-auto z-10">

          <Link to="/live-matches" className="bg-white/95 backdrop-blur-sm py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition duration-300 border-b-4 border-blue-500 flex items-center justify-center gap-2 hover:bg-blue-50 transform hover:-translate-y-1">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> Live Matches
          </Link>

          {(role === 'admin' || role === 'scorer') && (
            <Link to="/mycricket" className="bg-white/95 backdrop-blur-sm py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition duration-300 border-b-4 border-green-500 flex items-center justify-center gap-2 hover:bg-green-50 transform hover:-translate-y-1">
              🏏 My Cricket
            </Link>
          )}

          <a
            href="https://www.amazon.in/s?k=cricket&crid=36WP91141OXH7&sprefix=cricket%2Caps%2C413&ref=nb_sb_noss_2"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/95 backdrop-blur-sm py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl transition duration-300 border-b-4 border-yellow-500 flex items-center justify-center gap-2 hover:bg-yellow-50 transform hover:-translate-y-1"
          >
            🛒 Store
          </a>
        </div>
      </main>

     {showInstructions && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border-t-8 border-blue-900 p-6 md:p-10">
      
      {/* Close Button */}
      <button 
        onClick={() => setShowInstructions(false)}
        className="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-3xl transition cursor-pointer z-50"
      >
        ✕
      </button>

      <div className="w-full">
          <h3 className="text-3xl md:text-4xl font-black text-blue-900 text-center mb-10 drop-shadow-sm">
            How to Use <span className="text-blue-600 italic">CricTrackerPro</span> 🏏
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Admin Role */}
            <div className="bg-blue-50 p-6 rounded-3xl shadow-md border-t-4 border-yellow-500 transform hover:scale-105 transition duration-300">
              <div className="text-4xl mb-4">👑</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Admin</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                Full control. Create tournaments, add teams, and schedule matches. Admins assign Scorers to specific games.
              </p>
            </div>

            {/* Scorer Role */}
            <div className="bg-green-50 p-6 rounded-3xl shadow-md border-t-4 border-green-500 transform hover:scale-105 transition duration-300">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Scorer</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                Record ball-by-ball updates and live statistics in real-time using credentials provided by the Admin.
              </p>
            </div>

            {/* Viewer Role */}
            <div className="bg-gray-50 p-6 rounded-3xl shadow-md border-t-4 border-blue-500 transform hover:scale-105 transition duration-300">
              <div className="text-4xl mb-4">📺</div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Viewer</h4>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                Public access. Watch live scores, check points tables, and track top-performing players without logging in.
              </p>
            </div>

          </div>

          <button 
            onClick={() => setShowInstructions(false)}
            className="mt-10 w-full bg-blue-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition shadow-lg cursor-pointer"
          >
            Got it, Let's Play!
          </button>
      </div>
    </div>
  </div>
)}

      {/* 4. Footer */}
      <footer className="bg-blue-950 text-white pt-12 pb-6 border-t-4 border-yellow-500 w-full mt-auto shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            
      
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-black tracking-widest text-white drop-shadow-md">
                🏏 CricTracker<span className="text-yellow-400">Pro</span>
              </h3>
              <p className="text-blue-200 text-sm font-medium leading-relaxed opacity-90">
                The ultimate platform to score, track, and manage your local cricket tournaments with international standards. Play hard, track smart!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-lg font-bold text-yellow-400 uppercase tracking-widest mb-2">Quick Links</h4>
              <Link to="/live-matches" className="text-blue-200 hover:text-white hover:translate-x-1 transition-all text-sm font-bold flex items-center gap-2">
                <span className="text-red-500 animate-pulse">●</span> Live Matches
              </Link>
              <Link to="/start-tournament" className="text-blue-200 hover:text-white hover:translate-x-1 transition-all text-sm font-bold">🏆 Host a Tournament</Link>
              <Link to="/contact" className="text-blue-200 hover:text-white hover:translate-x-1 transition-all text-sm font-bold">📞 Contact Support</Link>
              <Link to="/privacy" className="text-blue-200 hover:text-white hover:translate-x-1 transition-all text-sm font-bold">🛡️ Privacy Policy</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-lg font-bold text-yellow-400 uppercase tracking-widest mb-1">Connect With Me</h4>
              <div className="flex gap-4">
                {/* Facebook */}
                <a href="https://facebook.com/your-profile" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition shadow-lg text-xl hover:-translate-y-1">
                  📘
                  {/* Tooltip */}
                  <span className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
                    Facebook
                  </span>
                </a>

                {/* Instagram */}
                <a href="https://instagram.com/your-profile" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-80 transition shadow-lg text-xl hover:-translate-y-1">
                  📸
                  {/* Tooltip */}
                  <span className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
                    Instagram
                  </span>
                </a>

                {/* GitHub */}
                <a href="https://github.com/nisar6166" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition shadow-lg text-xl hover:-translate-y-1">
                  💻
                  {/* Tooltip */}
                  <span className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
                    GitHub
                  </span>
                </a>

                {/* LinkedIn */}
                <a href="www.linkedin.com/in/nisarvilangalil" target="_blank" rel="noopener noreferrer" className="group relative w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-500 transition shadow-lg text-xl hover:-translate-y-1">
                  💼
                  {/* Tooltip */}
                  <span className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
                    LinkedIn
                  </span>
                </a>
              </div>
              <p className="text-blue-300 text-xs font-bold mt-2">Follow for updates & new features!</p>
            </div>
          </div>

          <div className="border-t border-blue-800/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-blue-300 text-xs font-bold">
              © {new Date().getFullYear()} CricTrackerPro. All Rights Reserved.
            </p>
            
  
            <div className="flex items-center gap-2 bg-blue-900/50 py-2 px-4 rounded-full border border-blue-800">
              <span className="text-blue-200 text-xs font-bold">Designed & Developed with ❤️ by</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 font-black tracking-widest text-sm drop-shadow-lg">
                NISAR
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;