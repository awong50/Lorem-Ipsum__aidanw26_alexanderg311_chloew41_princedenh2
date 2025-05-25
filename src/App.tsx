import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import TypingPage from './pages/Typing';
import Login from './pages/Login';
import Protected from './pages/Protected';
import LogoutButton from './components/LogoutButton';
import UserProfile from './pages/UserProfile';

function App() {
  const isLoggedIn = !!localStorage.getItem('user'); // Check if user is logged in

  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/register">Register</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/about">About</Link> |{' '}
        <Link to="/latex">View LaTeX Page</Link> |{' '}
        <Link to="/typing">View Typing Page</Link> |{' '}
        <Link to="/protected">Protected</Link>
        <Link to="/user-profile">User Profile</Link>
        {isLoggedIn && <LogoutButton />} {/* Show logout button if logged in */}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/latex" element={<LatexPage />} />
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/protected" element={<Protected />} />
        <Route path="/user-profile" element={<UserProfile />} /> {/* User profile route */}
      </Routes>
    </div>
  );
}

export default App;