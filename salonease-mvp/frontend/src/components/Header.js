import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import SalonSelector from './SalonSelector';

function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      <button className="relative text-text hover:text-primary transition-colors">
        <BellIcon className="h-6 w-6" />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent"></span>
      </button>
      <div 
        className="relative"
        ref={dropdownRef}
      >
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
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
          >
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsDropdownOpen(false)}
            >
              Profile
            </Link>
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary">SalonEase</Link>
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
                <Link to="/login" className="text-text hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="bg-primary text-text px-4 py-2 rounded-md hover:bg-secondary transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
