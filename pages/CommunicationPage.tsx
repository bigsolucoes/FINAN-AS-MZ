

import React, { useState, useEffect } from 'react';

const WHATSAPP_WARNING_KEY = 'big_whatsapp_warning_shown';

const CommunicationPage: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const warningShown = localStorage.getItem(WHATSAPP_WARNING_KEY);
    if (!warningShown) {
      setShowWarning(true);
    }
  }, []);

  const handleCloseWarning = () => {
    setShowWarning(false);
    localStorage.setItem(WHATSAPP_WARNING_KEY, 'true');
  };

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">Comunicação (WhatsApp Web)</h1>

      {showWarning && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md shadow" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
            </div>
            <div>
              <p className="font-bold">Aviso Importante</p>
              <p className="text-sm">Esta é uma integração para conveniência. A conexão pode ser instável e depende do WhatsApp. Mantenha seu celular conectado à internet.</p>
              <button 
                onClick={handleCloseWarning}
                className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden">
        <iframe
          src="https://web.whatsapp.com/"
          title="WhatsApp Web"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation" // Consider security implications
        ></iframe>
      </div>
    </div>
  );
};

export default CommunicationPage;