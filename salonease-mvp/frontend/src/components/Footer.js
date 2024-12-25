import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation(['common']);

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center md:text-left mb-4 md:mb-0">
            {t('common:footer.copyright')}
          </p>
          <div className="flex space-x-4">
            <Link to="/terms" className="hover:text-white transition-colors">
              {t('common:footer.links.terms')}
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              {t('common:footer.links.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
