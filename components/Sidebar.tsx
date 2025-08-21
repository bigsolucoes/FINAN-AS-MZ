
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME, ExternalLinkIcon } from '../constants';
import { LucideProps } from 'lucide-react';
import { useAppData } from '../hooks/useAppData';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<LucideProps>;
}

const Sidebar: React.FC = () => {
  const { settings, logout } = useAppData();
  
  return (
    <div className={`w-64 p-5 hidden md:flex md:flex-col h-full shadow-lg 
                    bg-slate-800 bg-opacity-75 backdrop-filter backdrop-blur-lg 
                    text-slate-100 border-r border-slate-700`}>
      <div className="flex-grow">
        <nav className="mt-4"> 
          <ul>
            {(NAVIGATION_ITEMS as NavigationItem[]).map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.name} className="mb-2">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-200 ease-in-out filter hover:brightness-100 ${
                        isActive ? `bg-blue-600 text-white shadow-md` : 'hover:text-slate-50'
                      }`
                    }
                  >
                    {IconComponent && <IconComponent size={20} />}
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* External Links Section */}
        <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase">Links Úteis</p>
          <a
            href="https://www.tjpr.jus.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out"
          >
            <ExternalLinkIcon size={20} />
            <span>TJPR</span>
          </a>
          <a
            href="https://www.stj.jus.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out"
          >
            <ExternalLinkIcon size={20} />
            <span>STJ</span>
          </a>
           <a
            href="https://www.conjur.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out"
          >
            <ExternalLinkIcon size={20} />
            <span>Conjur</span>
          </a>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="mt-auto pt-4 border-t border-slate-600">
        <div className="text-center text-xs text-slate-400 mt-4 pb-2">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
          <p>Powered by BIG Soluções</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
