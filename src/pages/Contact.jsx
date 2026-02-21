import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
  const navigate = useNavigate();
  
  // to check login status
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // send message to backend
    await axios.post('http://localhost:5000/api/contact/send', formData);
    
    alert("Message Sent Successfully! We will contact you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    alert("Failed to send message. Please try again later.");
  }
};

  return (

    <div className="min-h-screen bg-gray-100 p-3 flex flex-col gap-3 font-sans text-gray-800">
      
      {/* 1. Header (Navbar) */}
      <nav className="bg-blue-900 text-white px-8 py-5 flex justify-between items-center w-full rounded-t-lg shadow-md">
        <div className="text-2xl font-bold flex items-center gap-2">
          <Link to="/">🏏 CricTrackerPro</Link>
        </div>

        <div className="hidden md:flex gap-8 text-lg font-medium">
          <Link to="/" className="hover:text-blue-300 transition">Home</Link>
          <Link to="/" className="hover:text-blue-300 transition">Matches</Link>
          <Link to="/" className="hover:text-blue-300 transition">About</Link>
        </div>

        <div className="flex gap-6 text-lg items-center font-medium">
          <Link to="/contact" className="text-blue-300 transition border-b-2 border-blue-400">Contact</Link>
          
          {token ? (
            <button 
              onClick={handleLogout} 
              className="bg-red-500 text-white px-5 py-2 rounded-full font-bold shadow-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-900 px-5 py-2 rounded-full hover:bg-blue-100 transition shadow-sm">Login</Link>
              <Link to="/signup" className="hover:text-blue-300 transition">Signup</Link>
            </>
          )}
        </div>
      </nav>

      {/* 2. Contact Form Section */}
      <main className="bg-[#f0fdf4] flex-1 flex flex-col items-center justify-center py-12 px-4 rounded-lg shadow-inner relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border-t-4 border-blue-600 z-10">
          <h2 className="text-3xl font-extrabold text-blue-900 mb-2 text-center">Contact Us</h2>
          <p className="text-gray-600 text-center mb-8 font-medium">Have questions? We'd love to hear from you.</p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Your Name</label>
              <input 
                type="text" name="name" value={formData.name} placeholder="John Doe" 
                className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
                onChange={handleChange} required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input 
                type="email" name="email" value={formData.email} placeholder="john@example.com" 
                className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
                onChange={handleChange} required 
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Subject</label>
              <input 
                type="text" name="subject" value={formData.subject} placeholder="How can we help?" 
                className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
                onChange={handleChange} required 
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Message</label>
              <textarea 
                name="message" value={formData.message} rows="4" placeholder="Type your message here..." 
                className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 resize-none" 
                onChange={handleChange} required
              ></textarea>
            </div>

            <button type="submit" className="md:col-span-2 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-bold text-lg shadow-md">
              Send Message
            </button>
          </form>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-blue-900 text-white py-10 px-8 rounded-b-lg shadow-md">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4">CricTrackerPro</h3>
            <p className="text-blue-200 text-sm">Professional cricket scoring and tournament management platform.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="text-blue-200 text-sm space-y-2">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              {token && <li><Link to="/mycricket" className="hover:text-white transition">My Cricket</Link></li>}
              <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex gap-4 text-2xl text-blue-200">
              <span className="cursor-pointer hover:text-white transition">📱</span>
              <span className="cursor-pointer hover:text-white transition">🌐</span>
              <span className="cursor-pointer hover:text-white transition">✉️</span>
            </div>
          </div>
        </div>
        <div className="text-center text-blue-400 text-xs mt-10 border-t border-blue-800 pt-5">
          © 2026 CricTrackerPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Contact;