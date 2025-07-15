import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreatePollPage from './pages/CreatePollPage';
import PollPage from './pages/PollPage';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import ResultsPage from './pages/ResultsPage';
import Header from './components/Header';
import PasswordProtection from './components/PasswordProtection';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const location = useLocation();
  const isPollPage = location.pathname.startsWith('/poll/');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {!isPollPage && <Header />}
        <main className={`${isPollPage ? '' : 'container mx-auto px-4 py-8'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePollPage />} />
            <Route path="/poll/:pollId" element={<PollPage />} />
            <Route 
              path="/admin" 
              element={
                <PasswordProtection>
                  <AdminDashboard />
                </PasswordProtection>
              } 
            />
            <Route 
              path="/admin/:pollId" 
              element={
                <PasswordProtection>
                  <AdminPage />
                </PasswordProtection>
              } 
            />
            <Route path="/results/:pollId" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App; 