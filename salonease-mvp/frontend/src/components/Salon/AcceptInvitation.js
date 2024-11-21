import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { staffApi } from '../../utils/api';
import { acceptInvitationSchema } from '../../utils/validationSchemas';
import { useTranslation } from 'react-i18next';

const AcceptInvitation = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['salon']);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(acceptInvitationSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const token = new URLSearchParams(location.search).get('token');

    try {
      await staffApi.acceptInvitation({ token, password: data.password });
      toast.success(t('salon:accept_invitation.success'));
      navigate('/login');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      if (error.response?.data?.message) {
        toast.error(`${t('common:status.error')}: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`${t('common:status.error')}: ${error.message}`);
      } else {
        toast.error(t('salon:accept_invitation.error.unexpected'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-card">
      <h2 className="text-2xl font-bold mb-6 text-primary-700">
        {t('salon:accept_invitation.title')}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t('salon:accept_invitation.form.password')}:
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            {t('salon:accept_invitation.form.confirm_password')}:
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
        </div>
        <button 
          type="submit" 
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300"
          disabled={loading}
        >
          {loading ? t('salon:accept_invitation.action.accepting') : t('salon:accept_invitation.action.accept')}
        </button>
      </form>
    </div>
  );
};

export default AcceptInvitation;
