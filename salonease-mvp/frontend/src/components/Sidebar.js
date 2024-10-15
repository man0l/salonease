import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon, Bars3Icon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, route: '/dashboard' },
  { name: 'Calendar', icon: CalendarDaysIcon, route: '/salons/:salonId/calendar' },
  { name: 'Bookings', icon: ClipboardDocumentListIcon, route: '/salons/:salonId/bookings' },
  { name: 'Clients', icon: UserGroupIcon, route: '/salons/:salonId/clients' },
  { name: 'Staff', icon: UserGroupIcon, route: '/salons/:salonId/staff' },
  { name: 'Services', icon: () => <span>✂️</span>, route: '/salons/:salonId/services' },
  { name: 'Billing', icon: CreditCardIcon, route: '/billing' },
  { name: 'Reports', icon: ChartBarIcon, route: '/reports' },
  { name: 'Settings', icon: Cog6ToothIcon, route: '/settings' },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button className="md:hidden p-4" onClick={() => setIsOpen(!isOpen)}>
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className={`h-full ${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-4">
          <h2 className="text-primary font-bold">Menu</h2>
        </div>
        <nav>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.route}
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-200 text-primary' : ''}`
              }
            >
              <item.icon className="h-6 w-6 mr-3" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
