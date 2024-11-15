import React, { useState, useMemo } from 'react';
import { FaChevronRight, FaClock } from 'react-icons/fa';
import { formatCurrency } from '../../utils/currencyFormatter';
import UnauthorizedBookingModal from '../Modals/UnauthorizedBookingModal';

const ServiceCategories = ({ services = [], categories = [], staff = [], salonId }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const buildCategoryTree = useMemo(() => {
    const categoryMap = new Map();

    services.forEach(service => {
      let category = service.category;
      while (category) {
        if (!categoryMap.has(category.id)) {
          categoryMap.set(category.id, {
            id: category.id,
            name: category.name,
            parentId: category.parentId,
            subcategories: [],
            services: []
          });
        }
        if (category.id === service.category.id) {
          categoryMap.get(category.id).services.push(service);
        }
        category = category.parent;
      }
    });

    categoryMap.forEach(category => {
      if (category.parentId !== null) {
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          parentCategory.subcategories.push(category);
        }
      }
    });

    return Array.from(categoryMap.values()).filter(category => category.parentId === null);
  }, [services]);

  const [expandedCategories, setExpandedCategories] = useState(() => {
    const firstCategory = buildCategoryTree[0];
    if (!firstCategory) return [];
    
    const ids = [firstCategory.id];
    
    if (firstCategory.subcategories.length > 0) {
      const firstSubcat = firstCategory.subcategories[0];
      ids.push(firstSubcat.id);
      
      if (firstSubcat.subcategories.length > 0) {
        ids.push(firstSubcat.subcategories[0].id);
      }
    }
    
    return ids;
  });

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const renderCategory = (category, depth = 0) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasSubcategories = category.subcategories.length > 0;
    const hasServices = category.services.length > 0;

    return (
      <div key={category.id} className="border-b last:border-b-0">
        <button
          onClick={() => toggleCategory(category.id)}
          className={`
            w-full p-4 flex items-center justify-between
            ${depth === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'}
            ${depth === 1 ? 'pl-8 bg-white' : ''}
            ${depth === 2 ? 'pl-12 bg-white' : ''}
            transition-colors
          `}
        >
          <span className={`
            ${depth === 0 ? 'font-semibold text-lg' : ''}
            ${depth === 1 ? 'font-medium text-md' : ''}
            ${depth === 2 ? 'text-md text-gray-700' : ''}
          `}>
            {category.name}
          </span>
          {(hasSubcategories || hasServices) && (
            <FaChevronRight
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 
                ${isExpanded ? "rotate-90" : ""}
              `}
            />
          )}
        </button>
        
        {isExpanded && (
          <div className={`
            ${depth === 0 ? 'bg-white' : 'bg-white'}
            ${depth === 1 ? 'ml-4' : ''}
            ${depth === 2 ? 'ml-8' : ''}
          `}>
            {hasServices && category.services.map(service => (
              <div
                key={service.id}
                className="p-4 flex items-center justify-between border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{service.name}</div>
                  {service.description && (
                    <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                  )}
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <FaClock className="h-4 w-4" />
                    {service.duration} min.
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(service.price)}
                  </span>
                  <button 
                    onClick={() => handleServiceSelect(service)}
                    className="px-4 py-2 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
                  >
                    choose
                  </button>
                </div>
              </div>
            ))}
            {hasSubcategories && category.subcategories.map(subcat => renderCategory(subcat, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
        {buildCategoryTree.map(category => renderCategory(category))}
      </div>
      
      <UnauthorizedBookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedService(null);
        }}
        salonId={salonId}
        service={selectedService}
        staff={staff}
      />
    </>
  );
};

export default ServiceCategories;