import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSalon } from '../../hooks/useSalon';
import { toast } from 'react-toastify';
import { Dialog, Transition } from '@headlessui/react';

const schema = yup.object().shape({
  name: yup.string().required('Salon name is required'),
  address: yup.string().required('Address is required'),
  contactNumber: yup.string().required('Contact number is required'),
  description: yup.string(),
});

const SalonManagement = () => {
  const { salons, loading, error, addSalon, updateSalon, deleteSalon, currentPage, totalPages, setCurrentPage } = useSalon();
  const [editingSalon, setEditingSalon] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState(null);

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
        await updateSalon(editingSalon.id, data);
        toast.success('Salon updated successfully');
      } else {
        await addSalon(data);
        toast.success('Salon added successfully');
      }
      reset();
      setEditingSalon(null);
    } catch (err) {
      // The error is already handled in the useSalon hook, so we don't need to set it here
      toast.error('Failed to save salon. Please try again.');
    }
  };

  const handleEdit = (salon) => {
    setEditingSalon(salon);
    reset(salon);
  };

  const handleDelete = async (salonId) => {
    setSalonToDelete(salonId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSalon(salonToDelete);
      toast.success('Salon deleted successfully');
      setIsDeleteDialogOpen(false);
      setSalonToDelete(null);
    } catch (err) {
      // The error is already handled in the useSalon hook, so we don't need to set it here
      toast.error('Failed to delete salon. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Salon Management</h1>
      <h2 className="text-2xl font-bold mb-4">{editingSalon ? 'Edit Salon' : 'Add New Salon'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Salon Name</label>
          <input id="name" {...register('name')} className="w-full border rounded px-2 py-1" aria-invalid={errors.name ? "true" : "false"} />
          {errors.name && <span role="alert" className="text-red-500">{errors.name.message}</span>}
        </div>
        <div>
          <label htmlFor="address" className="block mb-1">Address</label>
          <input id="address" {...register('address')} className="w-full border rounded px-2 py-1" aria-invalid={errors.address ? "true" : "false"} />
          {errors.address && <span role="alert" className="text-red-500">{errors.address.message}</span>}
        </div>
        <div>
          <label htmlFor="contactNumber" className="block mb-1">Contact Number</label>
          <input id="contactNumber" {...register('contactNumber')} className="w-full border rounded px-2 py-1" aria-invalid={errors.contactNumber ? "true" : "false"} />
          {errors.contactNumber && <span role="alert" className="text-red-500">{errors.contactNumber.message}</span>}
        </div>
        <div>
          <label htmlFor="description" className="block mb-1">Description</label>
          <textarea id="description" {...register('description')} className="w-full border rounded px-2 py-1" />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {editingSalon ? 'Update Salon' : 'Add Salon'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-8 mb-4">Your Salons</h2>
      <ul className="space-y-4" aria-label="List of salons">
        {salons.map((salon) => (
          <li key={salon.id} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">{salon.name}</h3>
            <p>{salon.address}</p>
            <p>{salon.contactNumber}</p>
            <p>{salon.description}</p>
            <div className="mt-2">
              <button onClick={() => handleEdit(salon)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2" aria-label={`Edit ${salon.name}`}>
                Edit
              </button>
              <button onClick={() => handleDelete(salon.id)} className="bg-red-500 text-white px-2 py-1 rounded" aria-label={`Delete ${salon.name}`}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      <Transition show={isDeleteDialogOpen} as={React.Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Confirm Deletion
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this salon? This action cannot be undone.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default SalonManagement;
