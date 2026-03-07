import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full shadow-md">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>
        <Link to="/" className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition">
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-4 tracking-tight">
            About <span className="text-green-600">CricTrackerPro</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Your Ultimate Digital Solution for Cricket Tournament Management and Live Scoring.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-blue-500 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Live Scoring</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Experience real-time, ball-by-ball updates. Our smart dashboard makes scoring matches incredibly fast and perfectly accurate.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-green-500 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tournament Management</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create tournaments, manage teams, assign pools seamlessly, and generate smart schedules with just a single click.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-yellow-500 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">In-Depth Stats</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Track individual player performances, team standings, run rates, and view comprehensive match summaries automatically.
            </p>
          </div>

        </div>

        {/* Mission Section */}
        <div className="bg-blue-900 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold mb-4">Our Mission 🚀</h2>
            <p className="text-blue-100 leading-relaxed font-medium">
              We built CricTrackerPro to replace the traditional paper-based scoring system. Whether it's a local street cricket match or a professional club tournament, our goal is to bring a premium, digital, and hassle-free experience to every cricket enthusiast.
            </p>
          </div>
          <div className="md:w-1/3 flex justify-center">

             <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-inner border-8 border-blue-800">
               <span className="text-7xl">🏏</span>
             </div>
          </div>
        </div>

        {/* Developer Info */}
        <div className="text-center mt-16 text-gray-500 text-sm font-medium">
          <p>Designed & Developed with ❤️ by <span className="font-extrabold text-blue-900 text-base">Nizar</span></p>
          <p className="mt-1">© 2026 CricTrackerPro.</p>
        </div>

      </main>
    </div>
  );
};

export default About;