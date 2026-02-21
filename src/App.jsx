import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyCricket from './pages/MyCricket';
import Contact from './pages/Contact';
import AdminInbox from './pages/AdminInbox';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mycricket" element={<MyCricket />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/inbox" element={<AdminInbox />} />
      </Routes>
    </Router>
  );
}

export default App;