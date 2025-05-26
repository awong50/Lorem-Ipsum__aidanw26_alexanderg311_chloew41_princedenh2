import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import TypingPage from './pages/Typing';
import LogoutButton from './components/LogoutButton';
import UserProfile from './pages/UserProfile';
import Auth from './pages/Auth';

import { FaRegKeyboard, FaRegUser, FaInfo } from "react-icons/fa";
import { SiLatex } from "react-icons/si";
import LogoButton from './components/LogoButton'; 

function App() {
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in

  return (
    <div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LogoButton />
        <Link to="/typing"><FaRegKeyboard size={20} />          </Link>
        <Link to="/about"><FaInfo size={20} />                     </Link>
        <Link to="/latex"><SiLatex size={20} /></Link>
        <Link to="/user-profile"><FaRegUser size={20}/></Link>
        {isLoggedIn && <LogoutButton />}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/latex" element={<LatexPage />} />
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/user-profile" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;