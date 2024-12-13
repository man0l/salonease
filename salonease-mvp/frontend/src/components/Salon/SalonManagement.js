import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSalonContext } from '../../contexts/SalonContext';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaMinus, FaUndo, FaSave } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '../../utils/api';

const SalonManagement = ({ isOnboarding = false, onComplete }) => {
  const { t } = useTranslation(['salon', 'common']);

  const schema = yup.object().shape({
    name: yup.string().required(t('salon:salon_name_is_required')),
    address: yup.string().required(t('salon:action.address_is_required')),
    contactNumber: yup
      .string()
      .required(t('salon:contact_number_is_required'))
      .matches(/^[0-9]{5,20}$/, t('salon:invalid_phone_number')),
    description: yup.string(),
  });

  const { 
    salons, 
    loading, 
    error, 
    addSalon, 
    updateSalon, 
    deleteSalon, 
    restoreSalon,
    currentPage, 
    totalPages, 
    setCurrentPage, 
    fetchSalons 
  } = useSalonContext();
  
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

  const handleSalonUpdate = async (salonId, data) => {
    const updatedSalon = await updateSalon(salonId, data);
    if (!updatedSalon) {
      throw new Error(t('error.failed_to_update_salon'));
    }
    
    toast.success(t('success.salon_updated'));
    reset(updatedSalon);
    setEditingSalon(null);
    await fetchSalons();
    setShowForm(false);
  };

  const handleSalonCreate = async (data) => {
    const newSalon = await addSalon(data);
    if (!newSalon) {
      throw new Error(t('error.failed_to_add_salon'));
    }

    toast.success(t('success.salon_added'));
    reset();
    await fetchSalons();    
    setShowForm(false);

    if (onComplete) {
      onComplete(newSalon);
    }

    if (!isOnboarding) {
      await subscriptionApi.incrementBasePrice();
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingSalon) {
        await handleSalonUpdate(editingSalon.id, data);
      } else {
        await handleSalonCreate(data);
      }
    } catch (err) {
      toast.error(t('error.failed_to_save_salon'));
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
      toast.success(t('success.salon_deleted'));
      setIsDeleteDialogOpen(false);
      setSalonToDelete(null);
      await fetchSalons();
    } catch (err) {
      toast.error(t('error.failed_to_delete_salon'));
    }
  }, [deleteSalon, salonToDelete, fetchSalons]);

  const handleRestore = async (salonId) => {
    try {
      const restoredSalon = await restoreSalon(salonId);
      if (restoredSalon) {
        toast.success(t('success.salon_restored'));
        await fetchSalons();
      } else {
        throw new Error('Failed to restore salon');
      }
    } catch (err) {
      toast.error(t('error.failed_to_restore_salon'));
    }
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-4 text-gray-100">
            {t('action.confirm_deletion')}
          </h3>
          <p className="mb-4 text-gray-300">
            {t('action.are_you_sure_you_want_to_delete_this_salon')}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-gray-100 px-4 py-2 rounded-md transition duration-300"
            >
              {t('action.delete')}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 px-4 py-2 rounded-md transition duration-300"
            >
              {t('action.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSalonItem = (salon) => {
    const isDeleted = Boolean(salon.deletedAt);
    
    return (
      <li 
        key={salon.id} 
        className="flex justify-between items-center p-4 border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-800 transition duration-300"
      >
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-primary-600">
              {salon.name}
              {isDeleted && (
                <span className="ml-2 text-sm text-red-500 font-normal">
                  {t('salon:status.deleted')}
                </span>
              )}
            </h3>
            <p className="text-gray-600">{salon.address}</p>
            <p className="text-gray-600">{salon.contactNumber}</p>
            <p className="text-gray-600 mt-2">{salon.description}</p>
          </div>
          {isDeleted && (
            <span className="text-sm text-gray-500">
              {t('salon:deleted_at', { 
                date: new Date(salon.deletedAt).toLocaleDateString() 
              })}
            </span>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          {!isDeleted && (
            <>
              <button 
                onClick={() => handleEdit(salon)} 
                className="bg-secondary-500 hover:bg-secondary-600 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" 
                aria-label={`${t('common:action.edit')} ${salon.name}`}
              >
                <FaEdit className="mr-1" /> {t('common:action.edit')}
              </button>
              <button 
                onClick={() => handleDelete(salon.id)} 
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" 
                aria-label={`${t('common:action.delete')} ${salon.name}`}
              >
                <FaTrash className="mr-1" /> {t('common:action.delete')}
              </button>
            </>
          )}
          {isDeleted && (
            <button 
              onClick={() => handleRestore(salon.id)} 
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" 
              aria-label={`${t('common:action.restore')} ${salon.name}`}
            >
              <FaUndo className="mr-1" /> {t('common:action.restore')}
            </button>
          )}
        </div>
      </li>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-100">
        {isOnboarding ? t('action.set_up_your_first_salon') : t('action.salon_management')}
      </h1>
      
      {!isOnboarding && (
        <button
          onClick={showForm ? () => setShowForm(false) : handleAddNewSalon}
          className="mb-6 bg-primary-600 hover:bg-primary-700 text-gray-100 px-4 py-2 rounded-full transition duration-300 flex items-center"
        >
          {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
          {showForm ? t('action.hide_form') : t('action.add_new_salon')}
        </button>
      )}

      {showForm && (
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8 animate-slide-in border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-primary-400">
            {editingSalon ? t('action.edit_salon') : t('action.add_new_salon')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                {t('label.salon_name')}
              </label>
              <input 
                id="name" 
                {...register('name')} 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400" 
              />
              {errors.name && <span role="alert" className="text-red-400 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-1">
                {t('action.address')}
              </label>
              <input 
                id="address" 
                {...register('address')} 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400" 
              />
              {errors.address && <span role="alert" className="text-red-400 text-sm">{errors.address.message}</span>}
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-200 mb-1">
                {t('contact_number')}
              </label>
              <input 
                id="contactNumber" 
                {...register('contactNumber')} 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400" 
              />
              {errors.contactNumber && <span role="alert" className="text-red-400 text-sm">{errors.contactNumber.message}</span>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
                {t('label.description')}
              </label>
              <textarea 
                id="description" 
                {...register('description')} 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400" 
                rows="3" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-gray-100 px-4 py-2 rounded-md transition duration-300 flex items-center justify-center"
            >
              <FaSave className="mr-2" />
              {editingSalon ? t('action.update_salon') : t('action.add_salon')}
            </button>
          </form>
        </div>
      )}

      {!isOnboarding && (
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-primary-300">
            {t('label.your_salons')}
          </h3>
          <ul className="space-y-4" aria-label={t('salon:title.list_of_salons')}>
            {salons.map(salon => (
              <li 
                key={salon.id} 
                className="flex justify-between items-center p-4 border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-800 transition duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-primary-400">
                      {salon.name}
                      {salon.deletedAt && (
                        <span className="ml-2 text-sm text-red-500 font-normal">
                          {t('salon:status.deleted')}
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">{salon.address}</p>
                    <p className="text-gray-600">{salon.contactNumber}</p>
                    <p className="text-gray-600 mt-2">{salon.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  {!salon.deletedAt && (
                    <>
                      <button 
                        onClick={() => handleEdit(salon)} 
                        className="bg-primary-600 hover:bg-primary-700 text-gray-100 py-1 px-3 rounded-md text-sm transition duration-300 flex items-center" 
                      >
                        <FaEdit className="mr-1" title={t('common:action.edit')} />
                      </button>
                      <button 
                        onClick={() => handleDelete(salon.id)} 
                        className="bg-red-600 hover:bg-red-700 text-gray-100 py-1 px-3 rounded-md text-sm transition duration-300 flex items-center" 
                      >
                        <FaTrash className="mr-1" title={t('common:action.delete')} />
                      </button>
                    </>
                  )}
                  {salon.deletedAt && (
                    <button 
                      onClick={() => handleRestore(salon.id)} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md transition duration-300 flex items-center" 
                    >
                      <FaUndo className="mr-1" title={t('common:action.restore')} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="bg-primary-600 hover:bg-primary-700 text-gray-100 px-4 py-2 rounded-md transition duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {t('common:action.previous')}
            </button>
            <span className="text-gray-400">
              {t('common:action.page')} {currentPage} {t('common:action.of')} {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="bg-primary-600 hover:bg-primary-700 text-gray-100 px-4 py-2 rounded-md transition duration-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {t('common:action.next')}
            </button>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SalonManagement;
