

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FinancialsPage from './pages/FinancialsPage';
import ClientsPage from './pages/ClientsPage'; // Renamed to DebtorsPage conceptually
import SettingsPage from './pages/SettingsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import { useAppData } from './hooks/useAppData';
import { Toaster } from 'react-hot-toast';
import BrandingSplashScreen from './components/BrandingSplashScreen';
import PinLoginPage from './pages/PinLoginPage';
import RestScreen from './components/RestScreen';
import FloatingChatWidget from './components/FloatingChatWidget';
import ContractsPage from './pages/ContractsPage';

const MainLayout: React.FC = () => {
  return (
    <div 
      className="flex flex-col h-screen bg-slate-50 text-slate-800" 
    >
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/financeiro" replace />} />
            <Route path="/financeiro/:view?" element={<FinancialsPage />} />
            <Route path="/devedores/:view?" element={<ClientsPage />} />
            <Route path="/contratos/:view?" element={<ContractsPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/financeiro" replace />} />
          </Routes>
        </main>
      </div>
      <FloatingChatWidget />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

const AuthFlow: React.FC = () => {
  const [showPinLogin, setShowPinLogin] = useState(false);

  if (!showPinLogin) {
      return <RestScreen onWakeUp={() => setShowPinLogin(true)} message="Clique para entrar" />;
  }
  return <PinLoginPage />;
};


const App: React.FC = () => {
  const { isAuthenticated, isResting, exitRestMode, loading } = useAppData();

  if (loading) {
    return <BrandingSplashScreen isFadingOut={false} />;
  }

  if (isAuthenticated && isResting) {
    return <RestScreen onWakeUp={exitRestMode} />;
  }

  return (
      <Routes>
          {isAuthenticated ? (
              <Route path="/*" element={<MainLayout />} />
          ) : (
              <Route path="*" element={<AuthFlow />} />
          )}
      </Routes>
  );
};

export default App;