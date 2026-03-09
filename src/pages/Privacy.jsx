import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-800 flex flex-col items-center">
      
      <div className="max-w-4xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border-t-8 border-blue-900 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-3xl md:text-5xl font-black text-blue-900 tracking-tight">
              Privacy <span className="text-yellow-500">Policy</span>
            </h1>
            <Link to="/" className="text-sm font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
              ⬅️ Back to Home
            </Link>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-gray-600">
            
            <section>
              <p className="font-bold text-gray-500 mb-2">Effective Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p>
                Welcome to <strong className="text-blue-900">CricTrackerPro</strong>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our cricket tournament management application.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded-r-lg text-yellow-800 font-medium text-sm">
                <strong>📌 Note:</strong> This application was designed and developed by <strong>Nisar</strong> as a demonstration project. The data collected here is strictly for simulation and educational purposes.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-blue-800 mb-3 flex items-center gap-2">
                <span>1.</span> Information We Collect
              </h2>
              <p className="mb-2">We collect personal information that you voluntarily provide to us when you register on the app. This includes:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 font-medium">
                <li><strong>Account Information:</strong> Name, Email address, and Password.</li>
                <li><strong>Profile Data:</strong> Profile pictures and user roles (Admin, Scorer, Viewer).</li>
                <li><strong>Sports Data:</strong> Team names, player details, match scores, and tournament schedules.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-blue-800 mb-3 flex items-center gap-2">
                <span>2.</span> How We Use Your Information
              </h2>
              <p className="mb-2">We use the information we collect or receive to:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 font-medium">
                <li>Facilitate account creation and logon process.</li>
                <li>Manage user accounts and provide the core functionality of scoring matches.</li>
                <li>Generate leaderboards, point tables, and player statistics (MVP, Top Scorer).</li>
                <li>Improve our application's user interface and experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-blue-800 mb-3 flex items-center gap-2">
                <span>3.</span> Data Security
              </h2>
              <p>
                We have implemented appropriate technical and organizational security measures (such as secure password hashing using bcrypt) designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet can be guaranteed to be 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-blue-800 mb-3 flex items-center gap-2">
                <span>4.</span> Contact Us
              </h2>
              <p>
                If you have questions or comments about this policy, you may contact the developer:
              </p>
              <div className="bg-gray-50 p-4 rounded-xl mt-3 border border-gray-100 inline-block">
                <p className="font-bold text-blue-900">Developer: Nisar</p>
                <p className="text-sm font-medium mt-1">Role: Full Stack Developer</p>
                <p className="text-sm font-medium mt-1">Project: CricTrackerPro</p>
              </div>
            </section>

          </div>
          
          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">© {new Date().getFullYear()} CricTrackerPro. All rights reserved.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;