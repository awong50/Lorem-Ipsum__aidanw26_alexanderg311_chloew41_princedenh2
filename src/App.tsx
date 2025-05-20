import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import About from './pages/About';
import LatexPage from './pages/KaTeXPage';
import TypingPage from './pages/Typing';
import Login from './pages/Login';
import Protected from './pages/Protected';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{' '}
        <Link to="/register">Registration Page</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/about">About</Link> |{' '}
        <Link to="/latex">View LaTeX Page</Link> |{' '}
        <Link to="/typing">View Typing Page</Link> |{' '}
        <Link to="/protected">Protected</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/latex" element={<LatexPage />} />
        <Route path="/typing" element={<TypingPage />} />
        <Route path="/protected" element={<Protected />} />
      </Routes>
    </div>
  );
}

export default App;