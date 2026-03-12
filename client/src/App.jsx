import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/auth-context';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import History from './pages/History';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIAgent from './pages/AIAgent';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Also define a Navbar here to keep things simple
import { Link } from 'react-router-dom';
import { Bot, LogOut, LayoutDashboard, History as HistoryIcon, FileText, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <Bot size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">AI Interviewer</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><LayoutDashboard size={16} /> Dashboard</Link>
              <Link to="/agent" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><MessageSquare size={16} /> AI Agent</Link>
              <Link to="/resume" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><FileText size={16} /> Resume</Link>
              <Link to="/history" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"><HistoryIcon size={16} /> History</Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Log in</Link>
              <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/interview/:id"
            element={<ProtectedRoute><Interview /></ProtectedRoute>}
          />
          <Route
            path="/agent"
            element={<ProtectedRoute><AIAgent /></ProtectedRoute>}
          />
          <Route
            path="/history"
            element={<ProtectedRoute><History /></ProtectedRoute>}
          />
          <Route
            path="/resume"
            element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
