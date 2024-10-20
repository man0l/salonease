import React, { useEffect } from 'react';
import { useSalonContext } from '../contexts/SalonContext';
import ROLES from '../utils/roles'; // Add this import

const SalonSelector = () => {
  const { salons, loading, error, selectedSalon, setSelectedSalon, userRole } = useSalonContext();

  useEffect(() => {
    if (userRole === ROLES.SALON_OWNER && salons.length > 0 && !selectedSalon) {
      setSelectedSalon(salons[0]);
    }
  }, [salons, selectedSalon, setSelectedSalon, userRole]);

  if (loading) return <div>Loading salon...</div>;
  if (error) return <div>Error loading salon: {error}</div>;

  if (userRole === ROLES.STAFF) {
    return selectedSalon ? (
      <div className="bg-white text-primary-600 border border-primary-600 rounded px-2 py-1">
        {selectedSalon.name}
      </div>
    ) : (
      <div>No associated salon found</div>
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
      >
        {salons.map(salon => (
          <option key={salon.id} value={salon.id}>{salon.name}</option>
        ))}
      </select>
    ) : (
      <div>No salons available</div>
    )
  );
};

export default SalonSelector;
