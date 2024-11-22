import React, { useEffect } from 'react';
import { useSalonContext } from '../contexts/SalonContext';
import ROLES from '../utils/roles';
import { useTranslation } from 'react-i18next';

const SalonSelector = () => {
  const { salons, loading, error, selectedSalon, setSelectedSalon, userRole } = useSalonContext();
  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (userRole === ROLES.SALON_OWNER && salons.length > 0 && !selectedSalon) {
      setSelectedSalon(salons[0]);
    }
  }, [salons, selectedSalon, setSelectedSalon, userRole]);

  if (loading) {
    return <p>{t('loading.salon')}</p>;
  }

  if (error) {
    return <p>{t('error.no_salon')}</p>;
  }

  if (!salons.length) {
    return <p>{t('error.no_salons')}</p>;
  }

  if (userRole === ROLES.STAFF) {
    return selectedSalon ? (
      <div className="bg-white text-primary-600 border border-primary-600 rounded px-2 py-1">
        {selectedSalon.name}
      </div>
    ) : (
      <div>{t('error.no_associated_salon')}</div>
    );
  }

  const handleSalonChange = (e) => {
    const selectedId = e.target.value;
    const selected = salons.find(salon => salon.id === selectedId);
    if (selected) {
      setSelectedSalon(selected);
    } else {
      console.warn('Selected salon not found:', selectedId);
    }
  };

  return (
    userRole === ROLES.SALON_OWNER && salons.length > 0 ? (
      <select 
        className="bg-white text-primary border border-primary rounded px-2 py-1"
        value={selectedSalon?.id || ''}
        onChange={handleSalonChange}
        aria-label={t('label.select_salon')}
      >
        {salons.map(salon => (
          <option key={salon.id} value={salon.id}>{salon.name}</option>
        ))}
      </select>
    ) : (
      <div>{t('error.no_salons')}</div>
    )
  );
};

export default SalonSelector;
