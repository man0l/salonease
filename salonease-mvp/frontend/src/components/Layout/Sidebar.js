import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', alwaysEnabled: true },
    { name: 'Salon Management', path: '/salon-management', alwaysEnabled: true },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Services', path: '/services' },
    { name: 'Staff', path: '/staff' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <ul>
        {menuItems.map((item) => (
          <li key={item.name} className="mb-2">
            <Link
              to={item.path}
              className={`block p-2 rounded hover:bg-gray-700 ${
                (!user.onboardingCompleted && !item.alwaysEnabled) ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
