import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPhone, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebook } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ServiceCategories from './ServiceCategories.js';
import usePublicSalon from '../../hooks/usePublicSalon';

const PublicSalonPage = () => {
  const { salonId } = useParams();
  const { salon, services, categories, staff, loading, error } = usePublicSalon(salonId);
  const { t } = useTranslation(['salon', 'common']);
  const [selectedImage, setSelectedImage] = useState(null);

  const ImageGallery = () => {
    if (!salon?.images || salon.images.length === 0) return null;

    return (
      <div className="bg-background py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-500 mb-8">{t('salon:public_page.gallery.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {salon.images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg aspect-w-3 aspect-h-2 border border-accent/10"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={process.env.REACT_APP_API_URL.replace('/api', '') + image.imageUrl}
                  alt={image.caption || `Salon image ${index + 1}`}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/75 text-foreground p-2 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ImageModal = ({ image, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
      if (image) {
        const index = salon.images.findIndex(img => img.id === image.id);
        setCurrentIndex(index >= 0 ? index : 0);
      }
    }, [image]);

    if (!image) return null;

    const nextSlide = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => 
        prevIndex === salon.images.length - 1 ? 0 : prevIndex + 1
      );
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const prevSlide = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? salon.images.length - 1 : prevIndex - 1
      );
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };

    return (
      <div 
        className="fixed inset-0 bg-background/90 flex justify-center items-center z-50"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
          <div className="relative max-w-6xl w-full max-h-[90vh]">
            <img
              src={process.env.REACT_APP_API_URL.replace('/api', '') + salon.images[currentIndex].imageUrl}
              alt={salon.images[currentIndex].caption || 'Salon image'}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
            {salon.images[currentIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/50 text-foreground p-4 rounded-b-lg">
                <p className="text-center">{salon.images[currentIndex].caption}</p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          {salon.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary-500 bg-opacity-75 text-white p-2 rounded-full hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-500 bg-opacity-75 text-white p-2 rounded-full hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground bg-background/80 hover:bg-accent rounded-full p-2 transition-all duration-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-[90vw] p-2">
            {salon.images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={process.env.REACT_APP_API_URL.replace('/api', '') + img.imageUrl}
                  alt={img.caption || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    if (!salon?.images || salon.images.length === 0) {
      return (
        <div className="bg-primary-900 h-96 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{salon?.name}</h1>
            <p className="text-xl">{t('salon:public_page.hero.tagline')}</p>
          </div>
        </div>
      );
    }

    const nextSlide = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => 
        prevIndex === salon.images.length - 1 ? 0 : prevIndex + 1
      );
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const prevSlide = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? salon.images.length - 1 : prevIndex - 1
      );
      setTimeout(() => setIsTransitioning(false), 300);
    };

    return (
      <div className="relative h-96 overflow-hidden bg-primary-900">
        {/* Clickable Container */}
        <div 
          className="relative h-full cursor-pointer"
          onClick={() => setSelectedImage(salon.images[currentIndex])}
        >
          {/* Image Container */}
          <div 
            className="flex transition-transform duration-300 ease-in-out h-full"
            style={{ 
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${salon.images.length * 100}%`
            }}
          >
            {salon.images.map((image, index) => (
              <div 
                key={image.id}
                className="relative w-full h-full flex-shrink-0"
              >
                <img
                  src={process.env.REACT_APP_API_URL.replace('/api', '') + image.imageUrl}
                  alt={image.caption || `Salon image ${index + 1}`}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-transparent to-transparent opacity-90" />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white z-10 px-4">
              <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{salon?.name}</h1>
              <p className="text-xl mb-6 drop-shadow-md">{t('salon:public_page.hero.tagline')}</p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="w-5 h-5 mr-2" />
                  <span className="drop-shadow-md">{salon?.address}</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="w-5 h-5 mr-2" />
                  <span className="drop-shadow-md">{salon?.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Moved outside clickable area to prevent conflict */}
        {salon.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal from opening
                prevSlide();
              }}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-primary-500 bg-opacity-75 text-white p-2 rounded-full hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal from opening
                nextSlide();
              }}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-500 bg-opacity-75 text-white p-2 rounded-full hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator - Moved outside clickable area */}
        {salon.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {salon.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal from opening
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }
                }}
                disabled={isTransitioning}
                className={`w-2 h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">{t('salon:public_page.error.title')}</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-300 mb-4">{t('salon:public_page.error.not_found.title')}</h2>
          <p className="text-gray-300">{t('salon:public_page.error.not_found.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Carousel */}
      <ImageCarousel />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-500 mb-6">{t('salon:public_page.about.title')}</h2>
          <div className="bg-card rounded-lg shadow-lg p-6 border border-accent/10">
            <p className="text-foreground leading-relaxed">
              {salon?.description || t('salon:public_page.about.default_description')}
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary-300 mb-6">{t('salon:public_page.services.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('salon:public_page.services.subtitle')}</p>
          {loading ? (
            <div className="text-center py-8 text-gray-300">{t('salon:public_page.services.loading')}</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 text-gray-300">{t('salon:public_page.services.no_services')}</div>
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
          <h2 className="text-3xl font-bold text-primary-500 mb-6">{t('salon:public_page.team.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('salon:public_page.team.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-card rounded-lg shadow-lg p-6 text-center border border-accent/10 hover:border-primary-500 transition-colors duration-300">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {member.image ? (
                    <img 
                      src={process.env.REACT_APP_API_URL.replace('/api', '') + member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-muted-foreground">👤</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-primary-500 mb-2">{member.fullName}</h3>
                <p className="text-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl font-bold text-primary-500 mb-6">{t('salon:public_page.contact.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t('salon:public_page.contact.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg shadow-lg p-6 border border-accent/10">
              <h3 className="text-2xl font-semibold text-primary-500 mb-4">
                {t('salon:public_page.contact.business_hours')}
              </h3>
              <div className="space-y-2">
                {salon.businessHours?.map((hours, index) => (
                  <div key={index} className="flex justify-between text-foreground">
                    <span>{hours.day}</span>
                    <span>{hours.hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-lg shadow-lg p-6 border border-accent/10">
              <h3 className="text-2xl font-semibold text-primary-500 mb-4">
                {t('salon:public_page.contact.contact_us')}
              </h3>
              <div className="space-y-4">
                <p className="flex items-center text-foreground">
                  <FaPhone className="mr-2" />
                  <a href={`tel:${salon.contactNumber}`} className="underline hover:text-primary-500">
                    {salon.contactNumber}
                  </a>
                </p>
                <p className="flex items-center text-foreground">
                  <FaMapMarkerAlt className="mr-2" />
                  {salon.address}
                </p>
                {salon.socialMedia && (
                  <div className="flex space-x-4 mt-4">
                    {salon.socialMedia.instagram && (
                      <a href={salon.socialMedia.instagram} target="_blank" rel="noopener noreferrer" 
                         className="text-muted-foreground hover:text-primary-500">
                        <FaInstagram size={24} />
                      </a>
                    )}
                    {salon.socialMedia.facebook && (
                      <a href={salon.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                         className="text-muted-foreground hover:text-primary-500">
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

      {/* Add Modal at the end of the component */}
      <ImageModal 
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default PublicSalonPage;
