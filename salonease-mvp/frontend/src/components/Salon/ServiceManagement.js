import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEdit, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import useService from '../../hooks/useService';
import { formatCurrency } from '../../utils/currencyFormatter';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup.string().required('Service name is required'),
  categoryId: yup.number().required('Category is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  duration: yup.number().positive('Duration must be positive').required('Duration is required'),
  description: yup.string(),
  promotionalOffer: yup.string(),
});

const ServiceManagement = ({ salonId }) => {
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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await addService(data);
      }
      reset();
      setEditingService(null);
      setShowForm(false);
    } catch (err) {
      // Error handling is managed by useService
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    reset({
      ...service,
      categoryId: service.categoryId.toString(),
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
      toast.success('Service deleted successfully');
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      // Error handling is managed by useService
      toast.error('Failed to delete service');
    }
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to delete this service? This action cannot be undone.</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2 transition duration-300"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">Service Management</h1>
      
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingService(null);
          reset({ name: '', category: '', price: '', duration: '', description: '', promotionalOffer: '' });
        }}
        className="mb-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? 'Hide Form' : 'Add New Service'}
      </button>

      {showForm && (
        <div className="bg-background rounded-lg shadow-card p-6 mb-8 animate-slide-in">
          <h3 className="text-xl font-semibold mb-4 text-primary-600">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Service Name:</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category:</label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId.message}</span>}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price:</label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes):</label>
              <input
                id="duration"
                type="number"
                {...register('duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.duration && <span className="text-red-500 text-sm">{errors.duration.message}</span>}
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
              <textarea
                id="description"
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>
            <div>
              <label htmlFor="promotionalOffer" className="block text-sm font-medium text-gray-700 mb-1">Promotional Offer:</label>
              <input
                id="promotionalOffer"
                type="text"
                {...register('promotionalOffer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button type="submit" className="w-full bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 transition duration-300 flex items-center justify-center">
              <FaPlus className="mr-2" />
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-background rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-600">Current Services</h3>
        {loading ? (
          <p className="text-gray-600">Loading services...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : !services ? (
          <p className="text-gray-600">No services available.</p>
        ) : (
          <ul className="space-y-4">
            {services.map((service) => (
              <li key={service.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-300">
                <div>
                  <span className="font-semibold text-primary-600">{service.name}</span>
                  <span className="ml-2 text-sm text-gray-600">{categories.find(cat => cat.id === service.categoryId)?.name || 'Unknown Category'}</span>
                  <p className="text-sm text-gray-600">Price: {formatCurrency(service.price)} | Duration: {service.duration} minutes</p>
                  {service.promotionalOffer && <p className="text-sm text-green-600">Offer: {service.promotionalOffer}</p>}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label="Delete"
                  >
                    <FaTrash />
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
