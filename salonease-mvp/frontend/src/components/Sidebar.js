import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, UserGroupIcon, CreditCardIcon, ChartBarIcon, Cog6ToothIcon, Bars3Icon, BuildingStorefrontIcon, DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useSalonContext } from '../contexts/SalonContext';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation(['navigation']);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { selectedSalon } = useSalonContext();

  const navigation = [
    { name: t('navigation:sidebar.dashboard'), icon: HomeIcon, route: '/dashboard', roles: ['SalonOwner', 'SuperAdmin', 'Staff'], alwaysEnabled: true },
    { name: t('navigation:sidebar.salon_management'), icon: BuildingStorefrontIcon, route: '/salons', roles: ['SalonOwner', 'SuperAdmin'], alwaysEnabled: true },
    { name: t('navigation:sidebar.calendar'), icon: CalendarDaysIcon, route: '/salons/:salonId/bookings-calendar', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
    { name: t('navigation:sidebar.bookings'), icon: ClipboardDocumentListIcon, route: '/salons/:salonId/bookings', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
    { name: t('navigation:sidebar.clients'), icon: UserGroupIcon, route: '/salons/:salonId/clients', roles: ['SalonOwner', 'Staff'], alwaysEnabled: true },
    { name: t('navigation:sidebar.staff'), icon: UserGroupIcon, route: '/salons/:salonId/staff', roles: ['SalonOwner', 'SuperAdmin'] },
    // { name: t('navigation:sidebar.staff_availability'), icon: CalendarDaysIcon, route: '/salons/:salonId/staff-availability', roles: ['SalonOwner', 'SuperAdmin'] },
    { name: t('navigation:sidebar.services'), icon: () => <span className="text-xl">{t('common:emoji.scissors')}</span>, route: '/salons/:salonId/services', roles: ['SalonOwner'] },
    { name: t('navigation:sidebar.billing'), icon: CreditCardIcon, route: '/salons/:salonId/billing', roles: ['SalonOwner'] },
    { name: t('navigation:sidebar.financial_reports'), icon: ChartBarIcon, route: '/salons/:salonId/reports/financial', roles: ['SalonOwner'] },
    { name: t('navigation:sidebar.settings'), icon: Cog6ToothIcon, route: '/settings', roles: ['SalonOwner', 'SuperAdmin', 'Staff'] },
    { name: t('navigation:sidebar.admin_dashboard'), icon: HomeIcon, route: '/admin-dashboard', roles: ['SuperAdmin'] }
  ];

  const filteredNavigation = navigation.filter(item => 
    user && (item.roles.includes(user.role) || (user.role === 'SuperAdmin' && item.roles.includes('SalonOwner')))
  );

  const shouldDisableNavigation = () => {
    if (user.role === 'SalonOwner') {
      return !user.onboardingCompleted;
    }
    if (user.role === 'Staff') {
      return !selectedSalon;
    }
    return false;
  };

  const getRoute = (route) => {
    if (selectedSalon && route.includes(':salonId')) {
      return route.replace(':salonId', selectedSalon.id);
    }
    return route;
  };

  return (
    <>
      <button 
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-card shadow-md text-muted-foreground hover:text-primary-500 transition-colors" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div 
        className={`
          fixed top-0 left-0 w-64 bg-card h-screen overflow-auto ease-in-out transition-all duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-muted">
          <h2 className="text-foreground font-bold text-xl">{t('navigation:menu')}</h2>
        </div>
        <nav className="space-y-1 py-4">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={getRoute(item.route)}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-muted text-primary-400 border-l-4 border-primary-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary-500'
                } ${
                  shouldDisableNavigation()
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={`h-5 w-5 mr-3 ${({ isActive }) => isActive ? 'text-primary-500' : 'text-muted-foreground'}`} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/50 z-45"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
