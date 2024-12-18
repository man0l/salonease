import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEdit, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import useService from '../../hooks/useService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { toast } from 'react-toastify';
import CategorySelector from '../CategorySelector';
import { useTranslation } from 'react-i18next';


const ServiceManagement = ({ salonId }) => {
  const { t } = useTranslation('service');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const {
    services,
    categories,
    loading,
    error,
    addService,
    updateService,
    deleteService,
  } = useService(salonId);

  const schema = yup.object().shape({
    name: yup.string().required(t('validation.name_required')),
    categoryId: yup.number().required(t('validation.category_required')),
    duration: yup.number().required(t('validation.duration_required')),
    price: yup.number().positive(t('validation.price_positive')).required(t('validation.price_required')),
    description: yup.string(),
  });

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      if (editingService) {
        await updateService(editingService.id, data);
        toast.success(t('success.service_updated'));
      } else {
        await addService(data);
        toast.success(t('success.service_added'));
      }
      reset();
      setEditingService(null);
      setShowForm(false);
    } catch (error) {
      toast.error(editingService ? t('error.failed_to_update') : t('error.failed_to_add'));
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    reset({
      ...service,
      categoryId: service.categoryId, // Keep this as a number
    });
    setShowForm(true);
  };

  const handleDelete = (serviceId) => {
    setServiceToDelete(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteService(serviceToDelete);      
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      // Error handling is managed by useService
      toast.error(t('error.delete_failed'));
    }
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-4">{t('modal.delete_title')}</h3>
          <p className="mb-4">{t('modal.delete_message')}</p>
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

  return (
    <div className="w-full px-2 sm:px-6 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
        {t('title.service_management')}
      </h1>
      
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingService(null);
          reset({ name: '', price: '', duration: '', description: '', promotionalOffer: '' });
        }}
        className="w-full sm:w-auto mb-4 sm:mb-6 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition duration-300 flex items-center justify-center sm:justify-start"
        data-testid="show-hide-form-button"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? t('action.hide_form') : t('action.add_new_service')}
      </button>

      {showForm && (
        <div className="bg-card border border-accent/10 rounded-lg shadow-card p-4 sm:p-6 mb-6 animate-slide-in">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-400" data-testid="add-service-title">
            {editingService ? t('action.edit_service') : t('action.add_service')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                {t('label.name')}
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              />
              {errors.name && <span className="text-red-400 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                {t('label.category')}
              </label>
              <CategorySelector
                id="category"
                categories={categories}
                value={parseInt(watch('categoryId'))}
                onChange={(value) => setValue('categoryId', value)}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.categoryId && <span className="text-red-400 text-sm">{errors.categoryId.message}</span>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                {t('label.price')}
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.price && <span className="text-red-400 text-sm">{errors.price.message}</span>}
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-1">
                {t('label.duration')}
              </label>
              <input
                id="duration"
                type="number"
                {...register('duration')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.duration && <span className="text-red-400 text-sm">{errors.duration.message}</span>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                {t('label.description')}
              </label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>           
            <button 
              type="submit" 
              data-testid="add-service-button" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              {editingService ? t('action.update_service') : t('action.add_service')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-accent/10 rounded-lg shadow-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-400">
          {t('title.current_services')}
        </h3>
        {loading ? (
          <p className="text-muted-foreground">{t('loading.services')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !services ? (
          <p className="text-muted-foreground">{t('error.no_services')}</p>
        ) : (
          <ul className="space-y-4">
            {services.map((service) => (
              <li key={service.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-accent/10 rounded-lg hover:bg-accent/5 transition duration-300">
                <div className="mb-2 sm:mb-0">
                  <span className="font-semibold text-primary-400">{service.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{service?.category?.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {t('label.price')} {formatCurrency(service.price)} | {t('label.duration')} {service.duration} {t('label.minutes')}
                  </p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md text-sm transition duration-300 flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    <span className="sm:hidden">{t('action.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm transition duration-300 flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    <span className="sm:hidden">{t('action.delete')}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ServiceManagement;
