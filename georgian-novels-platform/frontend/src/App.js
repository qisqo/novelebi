import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Reader from './pages/Reader';
import AddNovel from './pages/AddNovel';
import NovelDetails from './pages/NovelDetails';
import EditNovel from './pages/EditNovel';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import AuthModal from './pages/AuthModal';

// AppContent გამოყოფილია, რომ useNavigate-მა იმუშაოს Router-ის შიგნით
function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#1a1a1a' : '#fcfaf7';
    document.body.style.color = darkMode ? '#e0e0e0' : '#333';
  }, [darkMode]);

  const handleLoginSuccess = (username, role) => {
    setUser(username);
    localStorage.setItem('user', username);
    localStorage.setItem('role', role);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/'); // ნავიგაცია გადატვირთვის გარეშე
  };

  return (
    <>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        user={user} 
        onLogout={handleLogout} 
        onOpenLogin={() => setShowAuth(true)} 
      />
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} onOpenLogin={() => setShowAuth(true)} />} />
        <Route path="/novel/:id" element={<NovelDetails darkMode={darkMode} />} /> 
        <Route path="/edit/:id" element={<EditNovel />} />
        <Route path="/profile" element={<Profile darkMode={darkMode} />} />
        <Route path="/read/:id/:chapterIndex" element={<Reader darkMode={darkMode} fontSize={fontSize} setFontSize={setFontSize} />} />
        <Route path="/add" element={<AddNovel />} />
      </Routes>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLoginSuccess={handleLoginSuccess} />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;