
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { APP_NAME } from '../constants';

interface RestScreenProps {
  onWakeUp: () => void;
  message?: string;
}

const RestScreen: React.FC<RestScreenProps> = ({ onWakeUp, message = "Clique para voltar" }) => {
  const { settings } = useAppData();
  
  const bgColor = '#FFFFFF'; // Default to white

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] cursor-pointer"
      onClick={onWakeUp}
    >
      <div className="animate-pulse">
        {settings.customLogo ? (
          <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-24 max-h-48 max-w-xs object-contain" />
        ) : (
          <h1 className="text-7xl font-bold text-blue-600">JurisFinance</h1>
        )}
      </div>
       <p className="text-slate-500 mt-8 animate-pulse text-lg">{message}</p>
    </div>
  );
};

export default RestScreen;
