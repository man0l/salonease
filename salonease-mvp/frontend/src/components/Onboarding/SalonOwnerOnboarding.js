import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SalonManagement from '../Salon/SalonManagement';

const SalonOwnerOnboarding = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to SalonEase!</h2>
            <p className="mb-6 text-gray-600">Let's set up your first salon. Click next to begin.</p>
            <button 
              onClick={() => setStep(2)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return <SalonManagement isOnboarding={true} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {renderStep()}
    </div>
  );
};

export default SalonOwnerOnboarding;
