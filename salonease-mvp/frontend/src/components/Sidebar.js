import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon, Bars3Icon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, route: '/dashboard' },
  { name: 'Calendar', icon: CalendarDaysIcon, route: '/salons/:salonId/calendar' },
  { name: 'Bookings', icon: ClipboardDocumentListIcon, route: '/salons/:salonId/bookings' },
  { name: 'Clients', icon: UserGroupIcon, route: '/salons/:salonId/clients' },
  { name: 'Staff', icon: UserGroupIcon, route: '/salons/:salonId/staff' },
  { name: 'Services', icon: () => <span className="text-xl">✂️</span>, route: '/salons/:salonId/services' },
  { name: 'Billing', icon: CreditCardIcon, route: '/billing' },
  { name: 'Reports', icon: ChartBarIcon, route: '/reports' },
  { name: 'Settings', icon: Cog6ToothIcon, route: '/settings' },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white shadow-md">
      <button className="md:hidden p-4 text-text hover:text-primary transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-6">
          <h2 className="text-primary font-bold text-xl">Menu</h2>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.route}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-gray-100 hover:text-primary'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
