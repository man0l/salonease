import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { t } = useTranslation(['profile', 'common']);
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.image ? process.env.REACT_APP_API_URL.replace('/api', '') + user?.image : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error(t('profile:error.file_too_large'));
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const updatedUser = await updateUser(formData);
      if (updatedUser) {
        toast.success(t('profile:success.profile_updated'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || t('profile:error.update_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">{t('profile:title')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-32 h-32">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={t('profile:label.profile_image')}
                className="w-full h-full rounded-full object-cover border-4 border-gray-700"
                data-testid="profile-image"
              />
            ) : (
              <UserCircleIcon className="w-full h-full text-gray-400" />
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <label
              htmlFor="profile-image"
              className="cursor-pointer px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition duration-300"
            >
              {t('profile:action.change_image')}
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              data-testid="file-input"
            />
            <span className="text-sm text-gray-400 mt-2">
              {t('profile:action.choose_file')}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-200">
            {t('profile:label.full_name')}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-1"
            required
            data-testid="fullname-input"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            {t('profile:label.email')}
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 shadow-sm cursor-not-allowed"
            disabled
          />
        </div>

        <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition duration-300 ease-in-out"
            data-testid="submit-button"
        >
          {isSubmitting ? t('common:saving') : t('common:action.save')}
        </button>
      </form>
    </div>
  );
};

export default Profile;
