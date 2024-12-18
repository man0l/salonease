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
    return <p className="text-sm text-muted-foreground">{t('loading.salon')}</p>;
  }

  if (error || !salons.length) {
    return <p className="text-sm text-muted-foreground">{t('error.no_salons')}</p>;
  }

  if (userRole === ROLES.STAFF) {
    return selectedSalon ? (
      <div className="max-w-[200px] truncate bg-card text-primary-400 border border-primary-400 rounded px-2 py-1 text-sm">
        {selectedSalon.name}
      </div>
    ) : (
      <div className="text-sm text-muted-foreground">{t('error.no_associated_salon')}</div>
    );
  }

  const handleSalonChange = (e) => {
    const selected = salons.find(salon => salon.id === e.target.value);
    if (selected) setSelectedSalon(selected);
  };

  return (
    userRole === ROLES.SALON_OWNER && salons.length > 0 ? (
      <select 
        className="max-w-[200px] text-sm bg-card text-foreground border border-muted rounded px-2 py-1 
                   focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
        value={selectedSalon?.id || ''}
        onChange={handleSalonChange}
        aria-label={t('label.select_salon')}
      >
        {salons.map(salon => (
          <option key={salon.id} value={salon.id} className="truncate">
            {salon.name}
          </option>
        ))}
      </select>
    ) : (
      <div className="text-sm text-muted-foreground">{t('error.no_salons')}</div>
    )
  );
};

export default SalonSelector;
