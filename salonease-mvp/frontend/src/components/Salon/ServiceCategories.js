import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/currencyFormatter';
import CategoryNav from './CategoryNav';
import UnauthorizedBookingModal from '../Modals/UnauthorizedBookingModal';

const ServiceCategories = ({ services, salonId, staff = [] }) => {
  const { t } = useTranslation(['service', 'common']);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Get root categories for CategoryNav
  const rootCategories = useMemo(() => {
    return services
      .map(service => service.categoryHierarchy[0])
      .filter((category, index, self) => 
        index === self.findIndex(c => c.id === category.id)
      );
  }, [services]);

  // Initialize selectedRootCategory with the first category's ID
  const [selectedRootCategory, setSelectedRootCategory] = useState(
    rootCategories.length > 0 ? rootCategories[0].id : null
  );

  // Filter services based on selected root category
  const filteredServices = useMemo(() => {
    if (!selectedRootCategory) {
      return [];  // Return empty array instead of all services when no category is selected
    }
    return services.filter(service => 
      service.categoryHierarchy[0].id === selectedRootCategory
    );
  }, [services, selectedRootCategory]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const ServiceCard = ({ service }) => (
    <div className="bg-card text-card-foreground rounded-lg shadow-card p-4 hover:bg-muted transition-all duration-200 border border-accent/10">
      <div className="text-xs text-muted-foreground mb-2">
        {service.categoryHierarchy.map((category, index) => (
          <span key={category.id}>
            {category.name}
            {index < service.categoryHierarchy.length - 1 && (
              <span className="mx-1 text-muted-foreground/60">›</span>
            )}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-foreground">{service.name}</h4>
          {service.description && (
            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-primary-500">{formatCurrency(service.price)}</p>
          <p className="text-sm text-muted-foreground">{t('service:duration.minutes', { duration: service.duration })}</p>
          <button
            onClick={() => {
              setSelectedService(service);
              setIsBookingModalOpen(true);
            }}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            {t('service:action.book')}
          </button>
        </div>
      </div>
    </div>
  );

  const CategorySection = ({ category, isRoot = false }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = Object.keys(category.subcategories || {}).length > 0;
    const hasServices = category.services?.length > 0;

    return (
      <div className={`${isRoot ? 'mb-8' : 'ml-4 mb-4'}`}>
        <button
          onClick={() => toggleCategory(category.id)}
          className="flex items-center w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
        >
          {hasSubcategories || hasServices ? (
            isExpanded ? (
              <FaChevronDown className="w-4 h-4 text-gray-400 mr-2" />
            ) : (
              <FaChevronRight className="w-4 h-4 text-gray-400 mr-2" />
            )
          ) : (
            <span className="w-4 mr-2" />
          )}
          <span className={`font-semibold ${isRoot ? 'text-xl text-primary-300' : 'text-lg text-gray-300'}`}>
            {category.name}
          </span>
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-3">
            {Object.values(category.subcategories || {}).map(subcategory => (
              <CategorySection key={subcategory.id} category={subcategory} />
            ))}
            
            {category.services?.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-gray-900 rounded-lg p-6 border border-gray-700">
      <CategoryNav 
        categories={rootCategories}
        onCategorySelect={setSelectedRootCategory}
      />
      
      <div className="space-y-4">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {selectedService && (
        <UnauthorizedBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          salonId={salonId}
          service={selectedService}
          staff={staff}
        />
      )}
    </div>
  );
};

export default ServiceCategories;
