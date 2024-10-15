import React from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/outline';

// Mock authentication function
const isAuthenticated = () => {
  // Implement your authentication logic here
  return false; // Ensure this returns false for testing
};

function Header() {
  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-2">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">SalonEase</h1>
      </div>
      <div className="flex items-center">
        {isAuthenticated() && (
          <>
            <button className="relative">
              <BellIcon className="h-6 w-6 text-gray-600" />
              {/* Notification Badge */}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="ml-3 relative">
              <Link to="/profile" className="flex text-sm rounded-full">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/150"
                  alt="User avatar"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
