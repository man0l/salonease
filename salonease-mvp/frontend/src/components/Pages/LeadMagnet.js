import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { CheckCircleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';
import { trackFacebookEvent } from '../../utils/analytics';

const MAILERLITE_GROUP_ID = '143077200239789284';

const LeadMagnet = () => {
  const { t, i18n } = useTranslation('common');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const images = [
    '/images/guide1.png',
    '/images/guide2.png',
    '/images/guide3.png',
    '/images/guide4.png',
    '/images/guide5.png',
  ];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        'https://connect.mailerlite.com/api/subscribers',
        {
          email: formData.email,
          fields: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            first_name: formData.firstName,
            last_name: formData.lastName,
            language: i18n.language,
          },
          groups: [MAILERLITE_GROUP_ID],
          status: 'active',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_MAILERLITE_API_KEY}`,
          },
        }
      );
      
      try {
        await trackFacebookEvent('Lead', {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      } catch (fbError) {
        console.error('Facebook tracking error:', fbError);
        // Don't fail the form submission if tracking fails
      }
      
      setNotification({
        show: true,
        message: t('leadMagnet.form.success'),
        type: 'success',
      });

      setFormData({ firstName: '', lastName: '', email: '' });
    } catch (error) {
      console.error('MailerLite Error:', error.response?.data || error);
      
      let errorMessage = t('leadMagnet.form.error');
      
      if (error.response?.data?.message === 'Subscriber already exists') {
        errorMessage = t('leadMagnet.form.alreadySubscribed');
      }

      setNotification({
        show: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-6">
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 relative overflow-hidden">
        {/* Compact header section */}
        <div className="mb-6">
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-6 leading-relaxed bg-amber-50/80 p-4 sm:p-6 rounded-lg border border-amber-100 shadow-sm">
            {t('leadMagnet.audience')}
          </p>
          
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-primary-600 mb-4 opacity-90">
            {t('leadMagnet.subtitle')}
          </h2>

          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-6 leading-relaxed">
            {t('leadMagnet.mainDescription')}
          </p>

          {/* Mobile Carousel - Only visible on mobile */}
          <div className="lg:hidden relative mb-8">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
              {images.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt={`Guide preview ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transform transition-all duration-500 ${
                    index === currentImage 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentImage 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                />
              ))}
              
              {/* Mobile Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-800" />
              </button>

              {/* Mobile Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImage ? 'bg-white w-4' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Audience Section */}
          <div className="max-w-2xl mx-auto">            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const items = t('leadMagnet.audience.items', { returnObjects: true });
                return Array.isArray(items) ? items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-primary-50 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                )) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Two-column layout for content - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Benefits and Form */}
          <div>
            {/* Benefits Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-6">
                {t('leadMagnet.benefits.title')}
              </h3>
              <ul className="space-y-4">
                {(() => {
                  const items = t('leadMagnet.benefits.items', { returnObjects: true });
                  return Array.isArray(items) ? items.map((item, index) => (
                    <li key={index} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-primary-50 transition-colors duration-200">
                      <CheckCircleIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  )) : null;
                })()}
              </ul>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('form.firstName')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('form.lastName')}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('form.email')}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-300 
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('leadMagnet.form.submitting')}
                    </span>
                  ) : t('leadMagnet.form.button')}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Guide Preview (Desktop only) */}
          <div className="relative hidden lg:block">
            <div className="relative h-full flex items-center justify-center">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                {images.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Guide preview ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transform transition-all duration-500 ${
                      index === currentImage 
                        ? 'opacity-100 translate-x-0' 
                        : index < currentImage 
                          ? 'opacity-0 -translate-x-full' 
                          : 'opacity-0 translate-x-full'
                    }`}
                  />
                ))}
                
                {/* Desktop Navigation Buttons */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200"
                >
                  <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200"
                >
                  <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                </button>

                {/* Desktop Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImage ? 'bg-white w-4' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center">
              {notification.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-red-400 mr-2" />
              )}
              <p>{notification.message}</p>
              <button
                onClick={() => setNotification({ ...notification, show: false })}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadMagnet; 