import React, { useEffect } from 'react';
import { useSalonContext } from '../contexts/SalonContext';

const SalonSelector = () => {
  const { salons, loading, error, selectedSalon, setSelectedSalon } = useSalonContext();

  useEffect(() => {
    if (salons.length > 0 && !selectedSalon) {
      setSelectedSalon(salons[0]);
    }
  }, [salons, selectedSalon, setSelectedSalon]);

  if (loading) return <div>Loading salons...</div>;
  if (error) return <div>Error loading salons: {error}</div>;

  const handleSalonChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const selected = salons.find(salon => salon.id === selectedId);
    if (selected) {
      setSelectedSalon(selected);
    } else {
      console.warn('Selected salon not found:', e.target.value);
    }
  };

  return (
    salons.length > 0 ? (
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
