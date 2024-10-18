import React from 'react';
import { useSalon } from '../hooks/useSalon';

const SalonSelector = () => {
  const { salons, loading, error } = useSalon();

  return (
    salons.length > 0 &&
    <select className="bg-white text-primary border border-primary rounded px-2 py-1">
      {salons.map(salon => (
        <option key={salon.id} value={salon.id}>{salon.name}</option>
      ))}
    </select>
  );
};

export default SalonSelector;
