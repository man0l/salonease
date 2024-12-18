import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { registerSchema } from '../../utils/validationSchemas';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema)
  });

  const onSubmit = async (data) => {
    try {
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      const response = await authApi.register(data);
      toast.success(t('success.registration_success'));
      navigate('/registration-success');
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || t('error.registration_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {t('create_your_account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                {t('label.full_name')}
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  type="text"
                  {...register('fullName')}
                  className="appearance-none block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-red-600">{errors.fullName?.message}</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('label.email_address')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="appearance-none block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-red-600">{errors.email?.message}</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('label.password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="appearance-none block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-red-600">{errors.password?.message}</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('action.confirm_password')}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="appearance-none block w-full px-3 py-2 border border-muted bg-muted placeholder-muted-foreground text-foreground rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword?.message}</p>
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                {t('accept_terms_and_conditions')}
              </label>
            </div>
            <p className="mt-2 text-sm text-red-600">{errors.acceptTerms?.message}</p>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {t('register')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
