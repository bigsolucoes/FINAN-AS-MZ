import React from 'react';
import { useAppData } from '../hooks/useAppData';
import { APP_NAME } from '../constants';

interface InitialRestScreenProps {
  onProceed: () => void;
}

const InitialRestScreen: React.FC<InitialRestScreenProps> = ({ onProceed }) => {
  const { settings } = useAppData();
  
  const bgColor = settings.splashScreenBackgroundColor || '#FFFFFF';

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="fixed inset-0 flex flex-col items-center justify-center z-[100] cursor-pointer"
      onClick={onProceed}
    >
      <div className="animate-pulse">
        {settings.customLogo ? (
          <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-24 max-h-48 max-w-xs object-contain" />
        ) : (
          <h1 className="text-7xl font-bold text-accent">{APP_NAME}</h1>
        )}
      </div>
       <p className="text-text-secondary mt-8 animate-pulse text-lg">Clique para entrar</p>
    </div>
  );
};

export default InitialRestScreen;