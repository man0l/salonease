import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSalon } from '../../hooks/useSalon';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  salonName: yup.string().required('Salon name is required'),
  address: yup.string().required('Address is required'),
  contactNumber: yup.string().required('Contact number is required'),
  description: yup.string(),
});

const SalonOwnerOnboarding = () => {
  const [step, setStep] = useState(1);
  const { addSalon } = useSalon();
  const { user, updateUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await addSalon(data);
      await updateUser({ ...user, onboardingCompleted: true });
      toast.success('Onboarding completed successfully!');
      // Redirect to dashboard or next step
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Welcome to SalonEase!</h2>
            <p>Let's set up your first salon. Click next to begin.</p>
            <button onClick={() => setStep(2)}>Next</button>
          </div>
        );
      case 2:
        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="salonName">Salon Name</label>
              <input id="salonName" {...register('salonName')} />
              {errors.salonName && <span>{errors.salonName.message}</span>}
            </div>
            <div>
              <label htmlFor="address">Address</label>
              <input id="address" {...register('address')} />
              {errors.address && <span>{errors.address.message}</span>}
            </div>
            <div>
              <label htmlFor="contactNumber">Contact Number</label>
              <input id="contactNumber" {...register('contactNumber')} />
              {errors.contactNumber && <span>{errors.contactNumber.message}</span>}
            </div>
            <div>
              <label htmlFor="description">Description (Optional)</label>
              <textarea id="description" {...register('description')} />
            </div>
            <button type="submit">Complete Setup</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5">Salon Owner Onboarding</h1>
      {renderStep()}
    </div>
  );
};

export default SalonOwnerOnboarding;
