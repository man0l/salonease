import React from 'react';
import { Menu } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/24/outline';

function Header() {
  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-2">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">SalonEase</h1>
      </div>
      <div className="flex items-center">
        <button className="relative">
          <BellIcon className="h-6 w-6 text-gray-600" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <Menu as="div" className="ml-3 relative">
          <Menu.Button className="flex text-sm rounded-full">
            <img
              className="h-8 w-8 rounded-full"
              src="https://via.placeholder.com/150"
              alt="User avatar"
            />
          </Menu.Button>
          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 bg-white shadow-lg">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="/profile"
                  className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Profile
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}

export default Header;
