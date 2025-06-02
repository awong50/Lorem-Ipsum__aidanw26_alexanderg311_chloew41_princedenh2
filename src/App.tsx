import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import LogoutButton from './components/LogoutButton';
import UserProfile from './pages/UserProfile';
import Auth from './pages/Auth';
import Lobby from './pages/Lobby';
import { FaRegKeyboard, FaRegUser, FaInfo, FaSignOutAlt, FaChartLine  } from "react-icons/fa";
import { SiLatex } from "react-icons/si";
import LogoButton from './components/LogoButton'; 
import GameLobby from './pages/GameLobby';
function App() {
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in

  const NAVBARSIZE = 20;

  return (
    <div>
      <nav
        style={{
          position: 'fixed',
          top: 0,         
          left: 0,          
          width: '100%',     
          zIndex: 1000,      
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#2e2f34', 
          paddingBottom: '0.5vh', 
        }}
      >
        <LogoButton />
        <div style={{ display: 'flex', alignItems: 'center', gap: '2vh', marginRight: 'auto', marginTop: '2vh' }}>
          <Link to="/"><FaRegKeyboard size={NAVBARSIZE} /></Link>
          <Link to="/latex"><SiLatex size={NAVBARSIZE} /></Link>
          <Link to="/about"><FaInfo size={NAVBARSIZE} /></Link>
          <Link to="/lobby"><FaInfo size={NAVBARSIZE} /></Link>
        </div>
        {isLoggedIn && (
            <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '32vh',
              marginTop: '2vh', // Use viewport height for relative margin
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
            <span style={{ marginRight: '0.5vh', fontWeight: 'bold' }}>
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
              top: '2.5vh', // Use viewport height for relative positioning
              left: 0,
              backgroundColor: '#1a1b26',
              borderRadius: '0.75vh',
              minWidth: '12vh',
              padding: '0.5vh 0',
              zIndex: 100,
              fontSize: '0.95vh',
              color: '#c0c0c0',
              border: '6px solid #2e2f34',
              marginTop: '-1.8vh', // Use viewport height for relative margin
              }}
            >
              <Link
              to="/user-profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75vh',
                padding: '0.6vh 1vh',
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
                gap: '0.75vh',
                padding: '0.6vh 1vh',
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
          <Link to="/user-profile" style={{ marginRight: '32vh', marginTop: '2vh' }}>
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
        <Route path="/lobby" element={<Lobby />} />
         <Route path="/lobby/:lobbyId" element={<GameLobby />} />
      </Routes>
    </div>
  );
}

export default App;