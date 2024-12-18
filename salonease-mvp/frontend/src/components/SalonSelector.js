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
    return <p className="text-muted-foreground">{t('loading.salon')}</p>;
  }

  if (error) {
    return <p className="text-muted-foreground">{t('error.no_salon')}</p>;
  }

  if (!salons.length) {
    return <p className="text-muted-foreground">{t('error.no_salons')}</p>;
  }

  if (userRole === ROLES.STAFF) {
    return selectedSalon ? (
      <div className="bg-card text-primary-400 border border-primary-400 rounded px-2 py-1">
        {selectedSalon.name}
      </div>
    ) : (
      <div className="text-muted-foreground">{t('error.no_associated_salon')}</div>
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
        className="bg-card text-foreground border border-muted rounded py-1 focus:border-primary-500 focus:ring-primary-500"
        value={selectedSalon?.id || ''}
        onChange={handleSalonChange}
        aria-label={t('label.select_salon')}
      >
        {salons.map(salon => (
          <option key={salon.id} value={salon.id}>{salon.name}</option>
        ))}
      </select>
    ) : (
      <div className="text-muted-foreground">{t('error.no_salons')}</div>
    )
  );
};

export default SalonSelector;
