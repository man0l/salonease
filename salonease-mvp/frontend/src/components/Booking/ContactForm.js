import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone number is required'),
  notes: yup.string(),
});

const ContactForm = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">Enter your contact details:</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('name')}
            placeholder="Your name"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email address"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('phone')}
            placeholder="Phone number"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('notes')}
            placeholder="Additional notes (optional)"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors duration-200"
        >
          Complete Booking
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
