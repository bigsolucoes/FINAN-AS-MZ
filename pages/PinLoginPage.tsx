
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import toast from 'react-hot-toast';
import { APP_NAME } from '../constants';
import { Lock } from 'lucide-react';

const PinLoginPage: React.FC = () => {
    const { login, settings } = useAppData();
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const [isWrong, setIsWrong] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);
    
    useEffect(() => {
        if(isWrong) {
            const timer = setTimeout(() => setIsWrong(false), 600);
            return () => clearTimeout(timer);
        }
    }, [isWrong]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);
            
            if (newPin.every(digit => digit !== '')) {
                attemptLogin(newPin.join(''));
            } else if (value !== '' && index < 3) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            const newPin = [...pin];
            if (newPin[index] === '' && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if(pastedData.length === 4) {
             const newPin = pastedData.split('');
             setPin(newPin);
             attemptLogin(pastedData);
        }
    }

    const attemptLogin = (enteredPin: string) => {
        const success = login(enteredPin);
        if (!success) {
            setIsWrong(true);
            toast.error('PIN Incorreto');
            setTimeout(() => {
                 setPin(['', '', '', '']);
                 inputRefs.current[0]?.focus();
            }, 100);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md text-center">
                {settings.customLogo ? (
                    <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-12 sm:h-16 mx-auto mb-4 object-contain" />
                  ) : (
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4">JurisFinance</h1>
                )}
                
                <div className="bg-slate-800 shadow-2xl rounded-2xl p-8">
                    <Lock size={32} className="mx-auto text-slate-400 mb-3"/>
                    <h2 className="text-2xl font-semibold text-slate-100">Acesso Seguro</h2>
                    <p className="text-slate-400 mb-8">Digite seu PIN de 4 dígitos para continuar.</p>
                    
                    <div className={`flex justify-center gap-4 ${isWrong ? 'animate-shake' : ''}`}>
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                type="password"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handlePinChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={index === 0 ? handlePaste : (e) => e.preventDefault()}
                                className="w-16 h-20 text-4xl text-center font-bold text-slate-50 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-4 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                            />
                        ))}
                    </div>
                </div>
                 <footer className="text-center text-xs text-slate-500 mt-12">
                    <p>&copy; {new Date().getFullYear()} {APP_NAME} Soluções. Todos os direitos reservados.</p>
                </footer>
            </div>
        </div>
    );
};

export default PinLoginPage;
