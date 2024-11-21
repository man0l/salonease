import React from 'react';
import { useParams } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebook } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ServiceCategories from './ServiceCategories.js';
import usePublicSalon from '../../hooks/usePublicSalon';

const PublicSalonPage = () => {
  const { salonId } = useParams();
  const { salon, services, categories, staff, loading, error } = usePublicSalon(salonId);
  const { t } = useTranslation(['salon', 'common']);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('salon:public_page.error.title')}</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('salon:public_page.error.not_found.title')}</h2>
          <p className="text-gray-600">{t('salon:public_page.error.not_found.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">{salon?.name}</h1>
          <p className="text-xl mb-6">{t('salon:public_page.hero.tagline')}</p>
          <div className="flex items-center space-x-6 text-lg">
            <div className="flex items-center">
              <FaMapMarkerAlt className="w-5 h-5 mr-2" />
              <span>{salon?.address}</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="w-5 h-5 mr-2" />
              <span>{salon?.contactNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('salon:public_page.about.title')}</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 leading-relaxed">
              {salon?.description || t('salon:public_page.about.default_description')}
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('salon:public_page.services.title')}</h2>
          <p className="text-lg text-gray-700 mb-8">{t('salon:public_page.services.subtitle')}</p>
          {loading ? (
            <div className="text-center py-8">{t('salon:public_page.services.loading')}</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">{t('salon:public_page.services.no_services')}</div>
          ) : (
            <ServiceCategories 
              services={services} 
              categories={categories}
              staff={staff}
              salonId={salonId}
            />
          )}
        </section>

        {/* Staff Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('salon:public_page.team.title')}</h2>
          <p className="text-lg text-gray-700 mb-8">{t('salon:public_page.team.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-white rounded-lg shadow-card p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  {member.imageUrl ? (
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">👤</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.fullName}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('salon:public_page.contact.title')}</h2>
          <p className="text-lg text-gray-700 mb-8">{t('salon:public_page.contact.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('salon:public_page.contact.business_hours')}</h3>
              <div className="space-y-2">
                {salon.businessHours?.map((hours, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span>{hours.day}</span>
                    <span>{hours.hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('salon:public_page.contact.contact_us')}</h3>
              <div className="space-y-4">
                <p className="flex items-center text-gray-600">
                  <FaPhone className="mr-2" />
                  <a href={`tel:${salon.contactNumber}`} className="underline hover:text-primary-600">
                    {salon.contactNumber}
                  </a>
                </p>
                <p className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  {salon.address}
                </p>
                {salon.socialMedia && (
                  <div className="flex space-x-4 mt-4">
                    {salon.socialMedia.instagram && (
                      <a href={salon.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <FaInstagram size={24} />
                      </a>
                    )}
                    {salon.socialMedia.facebook && (
                      <a href={salon.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                        <FaFacebook size={24} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PublicSalonPage;
