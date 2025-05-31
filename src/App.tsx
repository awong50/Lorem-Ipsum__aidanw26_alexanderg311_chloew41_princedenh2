import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import LogoutButton from './components/LogoutButton';
import UserProfile from './pages/UserProfile';
import Auth from './pages/Auth';

import { FaRegKeyboard, FaRegUser, FaInfo, FaUser, FaSignOutAlt, FaChartLine  } from "react-icons/fa";
import { SiLatex } from "react-icons/si";
import LogoButton from './components/LogoButton'; 

function App() {
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in

  const NAVBARSIZE = 20;

  return (
    <div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LogoButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginRight: 'auto', marginTop: '2rem' }}>
          <Link to="/"><FaRegKeyboard size={NAVBARSIZE} /></Link>
          <Link to="/latex"><SiLatex size={NAVBARSIZE} /></Link>
          <Link to="/about"><FaInfo size={NAVBARSIZE} /></Link>
        </div>
        {isLoggedIn && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '32rem',
              marginTop: '2rem',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              const menu = e.currentTarget.querySelector('.profile-hover-menu') as HTMLElement;
              if (menu) menu.style.display = 'flex';
            }}
            onMouseLeave={(e) => {
              const menu = e.currentTarget.querySelector('.profile-hover-menu') as HTMLElement;
              if (menu) menu.style.display = 'none';
            }}
          >
            <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>
              {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
            </span>
            <Link to="/user-profile">
              <FaRegUser size={NAVBARSIZE} />
            </Link>

            <div
              className="profile-hover-menu"
              style={{
              display: 'none',
              flexDirection: 'column',
              position: 'absolute',
              top: '2.5rem',
              left: 0,
              backgroundColor: '#1a1b26',
              borderRadius: '0.75rem',
              minWidth: '12rem',
              padding: '0.5rem 0',
              zIndex: 100,
              fontSize: '0.95rem',
              color: '#c0c0c0',
              border: '6px solid #2e2f34', // <-- Set border thickness and color here
              marginTop: '-18px',
              }}
            >
              <Link
              to="/user-profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2b3d')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
              <FaChartLine size={16}/>
              User Stats
              </Link>

                <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2b3d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                <FaSignOutAlt size={16} />
                <span>
                  <LogoutButton />
                </span>
                </div>
            </div>
          </div>
        )}
        {!isLoggedIn && (
          <Link to="/user-profile" style={{ marginRight: '32rem', marginTop: '2rem' }}>
            <FaRegUser size={NAVBARSIZE} />
          </Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/latex" element={<LatexPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;