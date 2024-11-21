import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import SalonSelector from './SalonSelector';

const Navbar = () => {
  const { t } = useTranslation(['common']);
  const { user } = useAuth();

  const isSalonOwner = user && user.role === 'SalonOwner';

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            {t('common:nav.brand')}
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {isSalonOwner && <SalonSelector />}
            <Link to="/features" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('common:nav.features')}
            </Link>
            <Link to="/pricing" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('common:nav.pricing')}
            </Link>
            <Link to="/contact" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              {t('common:nav.contact')}
            </Link>
            {!user && (
              <>
                <Link to="/login" className="hover:bg-secondary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('common:nav.login')}
                </Link>
                <Link to="/register" className="bg-white text-primary hover:bg-secondary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  {t('common:nav.signup')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
