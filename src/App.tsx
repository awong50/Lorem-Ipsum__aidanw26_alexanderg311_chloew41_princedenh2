import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import TypingPage from './pages/Typing';
import LogoutButton from './components/LogoutButton';
import UserProfile from './pages/UserProfile';
import Auth from './pages/Auth';

function App() {
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <span>|</span>
        <Link to="/about">About</Link>
        <span>|</span>
        <Link to="/latex">LaTeX</Link>
        <span>|</span>
        <Link to="/typing">Typing</Link>
        <span>|</span>
        <Link to="/user-profile">Profile</Link>
        <span>|</span>
        <Link to="/auth">Auth</Link>
        {isLoggedIn && <LogoutButton />}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/latex" element={<LatexPage />} />
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/auth" element={<Auth />} /> 
        <Route path="/user-profile" element={<UserProfile />} /> {/* User profile route */}
      </Routes>
    </div>
  );
}

export default App;