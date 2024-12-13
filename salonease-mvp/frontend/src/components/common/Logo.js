import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className }) => {
  return (
    <Link to="/" className={`font-bold text-xl ${className}`}>
      SalonEase
    </Link>
  );
};

export default Logo; 