import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('sign_in_to_your_account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <label htmlFor="email-address" className="sr-only">{t('label.email_address')}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('label.email_address')}
                {...register("email", { 
                  required: t('email_is_required'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('error.invalid_email_address')
                  }
                })}
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">{t('label.password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('label.password')}
                {...register("password", { required: t('password_is_required') })}
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div className="text-sm mt-4">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              {t('label.forgot_password')}
            </Link>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? t('signing_in') : t('sign_in')}
            </button>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              {t('label.forgot_password')}
            </Link>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('message.no_account')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
