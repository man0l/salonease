import React from 'react';
import { useTranslation } from 'react-i18next';
const StaffSelector = ({ staff, onSelect }) => {
  const { t } = useTranslation(['common']);
  return (
    <div className="p-4">
      <h3 className="mb-2 text-lg font-medium">{t('common:booking.choose_stylist')}</h3>
      <div className="space-y-2">
        {staff.map(member => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="w-full p-2 text-left hover:bg-gray-100 rounded transition-colors duration-200 flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{member.fullName}</div>
              {member.specialization && (
                <div className="text-sm text-gray-500">{member.specialization}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StaffSelector;
