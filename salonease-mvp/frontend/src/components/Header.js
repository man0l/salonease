import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
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
      <button 
        className="relative text-text hover:text-primary transition-colors"
        aria-label={t('common:header.notifications')}
      >
        <BellIcon className="h-6 w-6" />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent"></span>
      </button>
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center space-x-2 text-text hover:text-primary transition-colors"
          onClick={handleToggleDropdown}
        >
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user.avatar || "https://via.placeholder.com/150"}
            alt={`${user.name}'s avatar`}
          />
          <span className="font-medium hidden lg:inline">{user.name}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              {t('common:header.profile')}
            </Link>
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        className="flex items-center space-x-2 text-text hover:text-primary transition-colors"
        onClick={handleToggleLangDropdown}
      >
        <LanguageIcon className="h-6 w-6" />
        <span className="hidden lg:inline">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>
      {isLangDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentLanguage === lang.code ? 'text-primary-600 font-medium' : 'text-gray-700'
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
    <header className="bg-white shadow-custom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary-600">
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
                <Link to="/login" className="text-text hover:text-primary-600 transition-colors">
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
