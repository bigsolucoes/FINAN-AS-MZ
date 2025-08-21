
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppData } from '../../hooks/useAppData'; // To get settings for logo
import { APP_NAME } from '../../constants';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState(''); // Changed from email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useAppData(); // For logo
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password); // Changed from email
    setIsLoading(false);
    if (success) {
      toast.success('Login bem-sucedido!');
      navigate('/dashboard');
    } else {
      toast.error('Falha no login. Verifique seu usuário e senha.'); // Updated error message
    }
  };
  
  const commonInputClass = "w-full px-4 py-3 border border-border-color rounded-lg shadow-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-shadow bg-card-bg text-text-primary placeholder-text-secondary";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          {settings.customLogo ? (
            <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-12 sm:h-16 mx-auto mb-2 object-contain" />
          ) : (
            <h1 className="text-4xl sm:text-5xl font-bold text-accent mb-2">{APP_NAME}</h1>
          )}
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">Bem-vindo de volta!</h2>
          <p className="text-text-secondary">Acesse sua conta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card-bg shadow-xl rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">Usuário</label> {/* Changed from Email */}
            <input
              type="text" // Changed from email
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Changed from setEmail
              className={commonInputClass}
              placeholder="seu_usuario" // Changed placeholder
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={commonInputClass}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-white py-3 px-4 rounded-lg shadow-md hover:brightness-90 transition-all duration-150 ease-in-out font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-sm text-text-secondary">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Registrar-se
            </Link>
          </p>
        </form>
      </div>
      <footer className="text-center text-xs text-slate-500 mt-8 sm:mt-12">
        <p>&copy; {new Date().getFullYear()} {APP_NAME} Soluções. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
