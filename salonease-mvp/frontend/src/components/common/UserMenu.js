import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const UserMenu = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 text-gray-300 hover:text-primary-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
          {user?.name?.[0] || 'U'}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-800">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            {t('profile')}
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            {t('settings')}
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 