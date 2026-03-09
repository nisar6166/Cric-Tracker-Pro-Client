import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './components/ForgotPassword';
import MyCricket from './pages/MyCricket';
import Contact from './pages/Contact';
import Inbox from './pages/Inbox';
import AdminInbox from './pages/AdminInbox';
import AddTeam from './pages/AddTeam';
import AddPlayer from './pages/AddPlayer';
import StartMatch from './pages/StartMatch';
import StartTournament from './pages/StartTournament';
import ScoreMatch from './pages/ScoreMatch';
import ViewerMatches from './pages/ViewerMatches';
import ViewerLiveMatches from './pages/ViewerLiveMatches';
import ViewScore from './pages/ViewScore';
import TournamentDashboard from './pages/TournamentDashboard';
import ViewerTournamentDetails from './pages/ViewerTournamentDetails';
import About from './pages/About';
import Privacy from './pages/Privacy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/mycricket" element={<MyCricket />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/admin/inbox" element={<AdminInbox />} />
        <Route path="/add-team" element={<AddTeam />} />
        <Route path="/add-player" element={<AddPlayer />} />
        <Route path="/start-match" element={<StartMatch />} />
        <Route path="/edit-match/:matchId" element={<StartMatch />} />
        <Route path="/start-tournament" element={<StartTournament />} />
        <Route path="/edit-tournament/:id" element={<StartTournament />} />
        <Route path="/scorematch/:id" element={<ScoreMatch />} />
        <Route path="/matches" element={<ViewerMatches />} />
        <Route path="/live-matches" element={<ViewerLiveMatches />} />
        <Route path="/view-score/:matchId" element={<ViewScore />} />
        <Route path="/tournament/:id" element={<TournamentDashboard />} />
        <Route path="/viewer/tournament/:id" element={<ViewerTournamentDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
       

      </Routes>
    </Router>
  );
}

export default App;