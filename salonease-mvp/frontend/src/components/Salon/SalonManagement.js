import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSalonContext } from '../../contexts/SalonContext';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const schema = yup.object().shape({
  name: yup.string().required(t('salon_name_is_required')),
  address: yup.string().required(t('action.address_is_required')),
  contactNumber: yup.string().required(t('contact_number_is_required')),
  description: yup.string(),
});

const SalonManagement = ({ isOnboarding = false }) => {
  const { salons, loading, error, addSalon, updateSalon, deleteSalon, currentPage, totalPages, setCurrentPage, fetchSalons, selectedSalon } = useSalonContext();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editingSalon, setEditingSalon] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState(null);
  const [showForm, setShowForm] = useState(isOnboarding);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data) => {
    try {
      if (editingSalon) {
        const updatedSalon = await updateSalon(editingSalon.id, data);
        if (updatedSalon) {
          toast.success('Salon updated successfully');
          reset(updatedSalon);
          setEditingSalon(null);
          await fetchSalons();
          setShowForm(false);
        } else {
          throw new Error('Failed to update salon');
        }
      } else {
        const newSalon = await addSalon(data);
        if (newSalon) {
          toast.success('Salon added successfully');
          reset();
          await fetchSalons();
          setShowForm(false);
          if (isOnboarding) {
            await updateUser({ ...user, onboardingCompleted: true });
            toast.success('Onboarding completed successfully!');
            navigate('/dashboard');
          }
        } else {
          throw new Error('Failed to add salon');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save salon. Please try again.');
    }
  };

  const handleEdit = (salon) => {
    setEditingSalon(salon);
    reset(salon);
    setShowForm(true);
  };

  const handleAddNewSalon = () => {
    setEditingSalon(null);
    reset({
      name: '',
      address: '',
      contactNumber: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleDelete = (salonId) => {
    setSalonToDelete(salonId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = useCallback(async () => {
    if (!salonToDelete) return;
    
    try {
      await deleteSalon(salonToDelete);
      toast.success('Salon deleted successfully');
      setIsDeleteDialogOpen(false);
      setSalonToDelete(null);
      await fetchSalons();
    } catch (err) {
      toast.error(err.message || 'Failed to delete salon. Please try again.');
    }
  }, [deleteSalon, salonToDelete, fetchSalons]);

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-4">
            {t('action.confirm_deletion')}
          </h3>
          <p className="mb-4">
            {t('action.are_you_sure_you_want_to_delete_this_salon')}
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2 transition duration-300"
            >
              {t('action.delete')}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
            >
              {t('action.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">{isOnboarding ? t('action.set_up_your_first_salon') : t('action.salon_management')}</h1>
      
      {!isOnboarding && (
        <button
          onClick={showForm ? () => setShowForm(false) : handleAddNewSalon}
          className="mb-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
        >
          {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
          {showForm ? t('action.hide_form') : t('action.add_new_salon')}
        </button>
      )}

      {showForm && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-primary-600">{editingSalon ? t('action.edit_salon') : t('action.add_new_salon')}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-slide-in">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                {t('label.salon_name')}
              </label>
              <input id="name" {...register('name')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" aria-invalid={errors.name ? "true" : "false"} />
              {errors.name && <span role="alert" className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
                {t('action.address')}
              </label>
              <input id="address" {...register('address')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" aria-invalid={errors.address ? "true" : "false"} />
              {errors.address && <span role="alert" className="text-red-500 text-sm">{errors.address.message}</span>}
            </div>
            <div>
              <label htmlFor="contactNumber" className="block mb-1 text-sm font-medium text-gray-700">
                {t('contact_number')}
              </label>
              <input id="contactNumber" {...register('contactNumber')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" aria-invalid={errors.contactNumber ? "true" : "false"} />
              {errors.contactNumber && <span role="alert" className="text-red-500 text-sm">{errors.contactNumber.message}</span>}
            </div>
            <div>
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                {t('label.description')}
              </label>
              <textarea id="description" {...register('description')} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" rows="3" />
            </div>
            <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition duration-300">
              {editingSalon ? t('action.update_salon') : t('action.add_salon')}
            </button>
          </form>
        </>
      )}

      {!isOnboarding && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-700">
            {t('label.your_salons')}
          </h2>
          <ul className="space-y-4" aria-label="List of salons">
            {salons.map((salon) => (
              <li key={salon.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <h3 className="text-xl font-semibold text-primary-600">{salon.name}</h3>
                <p className="text-gray-600">{salon.address}</p>
                <p className="text-gray-600">{salon.contactNumber}</p>
                <p className="text-gray-600 mt-2">{salon.description}</p>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => handleEdit(salon)} className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" aria-label={`${t('action.edit')} ${salon.name}`}>
                    <FaEdit className="mr-1" /> {t('action.edit')}
                  </button>
                  <button onClick={() => handleDelete(salon.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" aria-label={`${t('action.delete')} ${salon.name}`}>
                    <FaTrash className="mr-1" /> {t('action.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t('action.previous')}
            </button>
            <span className="text-gray-600">{t('action.page')} {currentPage} {t('action.of')} {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t('action.next')}
            </button>
          </div>

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default SalonManagement;
