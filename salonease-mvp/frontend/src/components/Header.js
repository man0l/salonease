import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/outline';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-2">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">SalonEase</h1>
      </div>
      <div className="flex items-center">
        {user ? (
          <>
            <button className="relative mr-4">
              <BellIcon className="h-6 w-6 text-gray-600" />
              {/* Notification Badge */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="relative">
              <Link to="/profile" className="flex text-sm rounded-full">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/150"
                  alt="User avatar"
                />
              </Link>
            </div>
            <button 
              onClick={logout} 
              className="ml-4 text-primary hover:text-secondary"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center">
            <Link to="/login" className="text-primary hover:text-secondary mr-4">Login</Link>
            <Link to="/register" className="text-primary hover:text-secondary">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
