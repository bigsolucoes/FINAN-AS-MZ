
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { APP_NAME, SettingsIcon, EyeOpenIcon, EyeClosedIcon, LogOutIcon } from '../constants';

const Header: React.FC = () => {
  const { settings, updateSettings, logout, enterRestMode } = useAppData();

  const togglePrivacyMode = () => {
    updateSettings({ privacyModeEnabled: !settings.privacyModeEnabled });
  };

  return (
    <header className="bg-white text-slate-800 p-4 shadow-md flex justify-between items-center h-16 sticky top-0 z-30">
      <div 
        className="flex items-center cursor-pointer"
        onClick={enterRestMode}
        title="Entrar em modo de descanso"
      >
        {settings.customLogo ? (
          <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-8 max-h-full max-w-xs object-contain" />
        ) : (
          <span className="text-2xl font-bold text-blue-600">JurisFinance</span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={togglePrivacyMode}
          className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
          title={settings.privacyModeEnabled ? "Mostrar Valores" : "Ocultar Valores (Modo Sigilo)"}
        >
          {settings.privacyModeEnabled ? <EyeClosedIcon size={20} /> : <EyeOpenIcon size={20} />}
        </button>
        <Link 
          to="/settings" 
          className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
          title="Configurações"
        >
          <SettingsIcon size={20} />
        </Link>
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-red-500 transition-colors"
          title="Sair"
        >
          <LogOutIcon size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
