import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import SalonSelector from './SalonSelector';

function Header() {
  const { t } = useTranslation(['common']);
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'bg', name: 'Български' }
  ];

  const handleToggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderUserMenu = () => (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
          onClick={handleToggleDropdown}
        >
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user.image ? process.env.REACT_APP_API_URL.replace('/api', '') + user.image : "https://via.placeholder.com/150"}
            alt={`${user.name}'s avatar`}
          />
          <span className="font-medium hidden lg:inline">{user.name}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-card py-1 z-50 border border-muted">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsDropdownOpen(false)}
            >
              {t('common:header.profile')}
            </Link>
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              {t('common:header.logout')}
            </button>
          </div>
        )}
      </div>
    </>
  );

  const renderLanguageSwitcher = () => (
    <div className="relative" ref={langDropdownRef}>
      <button
        className="flex items-center space-x-2 text-gray-300 hover:text-primary-400 transition-colors"
        onClick={handleToggleLangDropdown}
      >
        <LanguageIcon className="h-6 w-6" />
        <span className="hidden lg:inline">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>
      {isLangDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-800">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${
                currentLanguage === lang.code ? 'text-primary-400 font-medium' : 'text-gray-300'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header className="bg-card border-b border-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary-400">
              {t('common:header.brand')}
            </Link>
          </div>
          {user && user.role === 'SalonOwner' && (
            <div className="flex-grow flex justify-center">
              <SalonSelector />
            </div>
          )}
          <div className="flex items-center space-x-4">
            {user ? (
              renderUserMenu()
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-muted-foreground hover:text-primary-400 transition-colors">
                  {t('common:header.login')}
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  {t('common:header.signup')}
                </Link>
              </div>
            )}
            {renderLanguageSwitcher()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
