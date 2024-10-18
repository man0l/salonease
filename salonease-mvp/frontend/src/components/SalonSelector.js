import React from 'react';
import { useSalon } from '../hooks/useSalon';

const SalonSelector = () => {
  const { salons, loading, error } = useSalon();

  if (loading) return <div>Loading salons...</div>;
  if (error) return <div>Error loading salons: {error}</div>;

  return (
    salons.length > 0 ? (
      <select className="bg-white text-primary border border-primary rounded px-2 py-1">
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
