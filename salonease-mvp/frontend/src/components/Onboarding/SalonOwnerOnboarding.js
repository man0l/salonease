import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import SalonManagement from '../Salon/SalonManagement';
import { subscriptionApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SubscriptionPricing from './SubscriptionPricing';

const SalonOwnerOnboarding = () => {
  const [step, setStep] = useState(1);
  const [salonData, setSalonData] = useState(null);
  const { user, updateUser } = useAuth();
  const { t } = useTranslation(['salon']);
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSalonComplete = (salon) => {
    setSalonData(salon);
    setIsFormValid(true);
    setStep(step + 1);
  };

  const handleOnboardingComplete = async () => {
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              {t('salon:onboarding.welcome')}
            </h2>
            <p className="mb-6 text-gray-600">
              {t('salon:onboarding.setup_message')}
            </p>
          </div>
        );
      case 2:
        return <SalonManagement isOnboarding={true} onComplete={handleSalonComplete} />;
      case 3:
        return <SubscriptionPricing salonData={salonData} onComplete={() => setStep(step + 1)} />;
      default:
        return null;
    }
  };

  const TOTAL_STEPS = 3;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {renderStep()}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className={`px-4 py-2 rounded transition duration-300 ease-in-out transform hover:scale-105
            ${step === 1 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-500 hover:bg-gray-600 text-white font-bold'}`}
        >
          {t('common:action.previous')}
        </button>
        
        {step < TOTAL_STEPS && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 2 && !isFormValid}
            className={`py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105
              ${step === 2 && !isFormValid
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white font-bold hover:scale-105'}`}
          >
            {t('common:action.next')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SalonOwnerOnboarding;
