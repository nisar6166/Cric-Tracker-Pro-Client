import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Fetching data from local storage
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const profilePic = localStorage.getItem('profilePic');
  const userName = localStorage.getItem('userName');

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

      {/* 1. Header (Navbar) */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full rounded-t-lg shadow-md">
        
        {/* Logo */}
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-lg font-medium items-center">
          <Link to="/" className="hover:text-blue-300 transition border-b-2 border-blue-400">Home</Link>
          <Link to="/" className="hover:text-blue-300 transition">Matches</Link>
          <Link to="/" className="hover:text-blue-300 transition">About</Link>
          
          {/* Admin Inbox */}
          {token && role === 'admin' && (
            <Link to="/admin/inbox" className="text-sm bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center gap-1">
              📩 Inbox
            </Link>
          )}
        </div>

        {/* User Profile & Auth Section */}
        <div className="flex gap-6 items-center">
          <Link to="/contact" className="hover:text-blue-300 hidden lg:block transition font-medium">Contact</Link>

          {token ? (
            <div className="flex items-center gap-4 border-l border-blue-800 pl-4">
              {/* profile photo circle */}
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-white leading-none capitalize">{userName || role}</span>
                <span className="text-[10px] text-blue-300 uppercase">{role}</span>
              </div>
              
              <div className="w-10 h-10 rounded-full border-2 border-green-400 overflow-hidden shadow-md bg-gray-200">
                <img
                  src={getProfileImg()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition shadow-sm font-bold text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <Link to="/login" className="bg-white text-blue-900 px-5 py-2 rounded-full hover:bg-blue-100 transition shadow-sm font-bold text-sm">Login</Link>
              <Link to="/signup" className="hover:text-blue-300 transition font-bold text-sm">Signup</Link>
            </div>
          )}
        </div>
      </nav>

      {/* 2. Main Hero Section */}
      <main className="bg-[#f0fdf4] flex-1 flex flex-col items-center relative min-h-[550px] w-full rounded-lg shadow-inner overflow-hidden">
        
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

        <div className="flex flex-col items-center justify-center flex-1 mt-8 z-10 text-center px-4">
          <h2 className="text-4xl md:text-5xl mb-8 tracking-tight font-extrabold text-blue-900 leading-tight">
            Track Your Cricket Matches <br /> Like a Pro
          </h2>

          <Link
            to={token ? "/mycricket" : "/login"}
            className="bg-green-600 text-white text-xl font-bold px-12 py-5 rounded-full hover:bg-green-700 transition duration-300 shadow-lg transform hover:-translate-y-1"
          >
            {token ? "Go to My Dashboard" : "Start Scoring Now"}
          </Link>
        </div>

        {/* 3. three cards */}
        <div className="absolute bottom-12 w-full px-6 flex flex-col md:flex-row justify-center gap-6 max-w-4xl mx-auto z-10">
          
          <div className="bg-white py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition duration-300 border-b-4 border-blue-500 flex items-center justify-center gap-2 hover:bg-blue-50">
            🔴 Live Matches
          </div>

          {(role === 'admin' || role === 'scorer') && (
            <Link to="/mycricket" className="bg-white py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition duration-300 border-b-4 border-green-500 flex items-center justify-center gap-2 hover:bg-green-50 animate-bounce-short">
              🏏 My Cricket
            </Link>
          )}

          <div className="bg-white py-4 px-6 w-full md:w-64 text-center text-lg font-bold text-blue-900 rounded-xl shadow-md cursor-pointer hover:shadow-xl transition duration-300 border-b-4 border-yellow-500 flex items-center justify-center gap-2 hover:bg-yellow-50">
            🛒 Store
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="bg-blue-900 text-white py-6 text-center text-lg font-medium w-full rounded-b-lg shadow-md">
        © 2026 CricTrackerPro. All rights reserved.
      </footer>
      
    </div>
  );
};

export default Home;