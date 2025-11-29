import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AuthForm } from './components/AuthForm';
import { ViewState, User } from './types';
import { getSession } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = getSession();
    if (session) {
      setUser(session);
      setView('DASHBOARD');
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    setView('LANDING');
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-400 bg-black">Loading...</div>;

  return (
    <>
      {view === 'LANDING' && <LandingPage onNavigate={setView} />}
      {(view === 'LOGIN' || view === 'SIGNUP') && (
        <AuthForm view={view} onNavigate={setView} onAuthSuccess={handleLogin} />
      )}
      {view === 'DASHBOARD' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;