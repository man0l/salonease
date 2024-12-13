import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pendingSetupIntent = sessionStorage.getItem('pendingSetupIntent');
    if (user && pendingSetupIntent) {
      sessionStorage.removeItem('pendingSetupIntent');
      const { returnUrl } = JSON.parse(pendingSetupIntent);
      navigate(returnUrl);
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success(t('success.login_successful'));
        navigate('/dashboard');
      } else {
        toast.error(t('error.invalid_email_or_password'));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || t('error.general'));
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
          {t('sign_in_to_your_account')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <input
                {...register("email")}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-100 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('email')}
              />
            </div>

            <div>
              <input
                {...register("password")}
                type="password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-100 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('password')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isSubmitting ? t('signing_in') : t('sign_in')}
            </button>
          </form>

          <div className="mt-6">
            <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
              {t('label.forgot_password')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
