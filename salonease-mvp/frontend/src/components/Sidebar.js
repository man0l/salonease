import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon, Bars3Icon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useSalonContext } from '../contexts/SalonContext';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, route: '/dashboard', roles: ['SalonOwner', 'SuperAdmin', 'Staff'], alwaysEnabled: true },
  { name: 'Salon Management', icon: BuildingStorefrontIcon, route: '/salons', roles: ['SalonOwner', 'SuperAdmin'], alwaysEnabled: true },
  { name: 'Calendar', icon: CalendarDaysIcon, route: '/salons/:salonId/bookings-calendar', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
  { name: 'Bookings', icon: ClipboardDocumentListIcon, route: '/salons/:salonId/bookings', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
  { name: 'Clients', icon: UserGroupIcon, route: '/salons/:salonId/clients', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
  { name: 'Staff', icon: UserGroupIcon, route: '/salons/:salonId/staff', roles: ['SalonOwner', 'SuperAdmin'] },
  { name: 'Staff Availability', icon: CalendarDaysIcon, route: '/salons/:salonId/staff-availability', roles: ['SalonOwner', 'SuperAdmin'] },
  { name: 'Services', icon: () => <span className="text-xl">✂️</span>, route: '/salons/:salonId/services', roles: ['SalonOwner'] },
  { name: 'Billing', icon: CreditCardIcon, route: '/billing', roles: ['SalonOwner'] },
  { name: 'Financial Reports', icon: ChartBarIcon, route: '/salons/:salonId/reports/financial', roles: ['SalonOwner'] },
  { name: 'Settings', icon: Cog6ToothIcon, route: '/settings', roles: ['SalonOwner', 'SuperAdmin', 'Staff'] },
  { name: 'Admin Dashboard', icon: HomeIcon, route: '/admin-dashboard', roles: ['SuperAdmin'] },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { selectedSalon } = useSalonContext();

  const filteredNavigation = navigation.filter(item => 
    user && (item.roles.includes(user.role) || (user.role === 'SuperAdmin' && item.roles.includes('SalonOwner')))
  );

  const getRoute = (route) => {
    if (selectedSalon && route.includes(':salonId')) {
      return route.replace(':salonId', selectedSalon.id);
    }
    return route;
  };

  return (
    <div className="bg-white shadow-md lg:h-full relative z-30">
      <button className="lg:hidden p-4 text-primary-600 hover:text-primary-700 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div 
        className={`
          transform top-0 left-0 w-64 bg-white fixed h-full overflow-auto ease-in-out transition-all duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex lg:flex-col
        `}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-primary-600 font-bold text-xl">Menu</h2>
        </div>
        <nav className="space-y-1 py-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={getRoute(item.route)}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                } ${
                  (!user.onboardingCompleted && !item.alwaysEnabled && user.role !== 'Staff')
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={`h-5 w-5 mr-3 ${({ isActive }) => isActive ? 'text-primary-500' : ''}`} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-35 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Sidebar;
