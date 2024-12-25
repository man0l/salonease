import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation(['common']);

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">{t('common:footer.sections.product')}</h3>
            <ul className="space-y-2">
              <li><Link to="#features" className="hover:text-white transition">
                {t('common:footer.links.features')}
              </Link></li>
              <li><Link to="#pricing" className="hover:text-white transition">
                {t('common:footer.links.pricing')}
              </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('common:footer.sections.company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition">
                {t('common:footer.links.about')}
              </Link></li>
              <li><Link to="/contact" className="hover:text-white transition">
                {t('common:footer.links.contact')}
              </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('common:footer.sections.legal')}</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition">
                {t('common:footer.links.privacy')}
              </Link></li>
              <li><Link to="/terms" className="hover:text-white transition">
                {t('common:footer.links.terms')}
              </Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('common:footer.sections.connect')}</h3>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">
                Twitter
              </a></li>
              <li><a href="https://linkedin.com" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a></li>
            </ul>
          </div>
        </div>
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
