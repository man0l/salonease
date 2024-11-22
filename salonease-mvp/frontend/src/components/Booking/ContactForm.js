import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';


const ContactForm = ({ onSubmit }) => {
  const { t } = useTranslation(['common']); 
  const schema = yup.object().shape({
    name: yup.string().required(t('common:validation.name_required')),
    email: yup.string().email(t('common:validation.invalid_email')).required(t('common:validation.email_required')),
    phone: yup.string().required(t('common:validation.phone_required')),
    notes: yup.string(),
  });
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg font-medium">{t('common:booking.contact_details')}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('name')}
            placeholder={t('common:booking.name')}
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
            placeholder={t('common:booking.email')}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('phone')}
            placeholder={t('common:booking.phone')}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('notes')}
            placeholder={t('common:booking.notes')}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded hover:bg-primary-700 transition-colors duration-200"
        >
          {t('common:booking.complete_booking')}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
