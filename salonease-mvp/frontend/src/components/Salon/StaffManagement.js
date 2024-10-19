import React, { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../../utils/api';
import { useSalonContext } from '../../contexts/SalonContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaMinus, FaUserPlus } from 'react-icons/fa';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  fullName: yup.string().required('Full name is required'),
});

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const { selectedSalon } = useSalonContext();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const fetchStaff = useCallback(async () => {
    if (!selectedSalon) return;
    try {
      setLoading(true);
      const response = await staffApi.getStaff(selectedSalon.id);
      setStaff(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch staff');
      toast.error('Failed to fetch staff');
      setLoading(false);
    }
  }, [selectedSalon]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const onSubmit = async (data) => {
    try {
      if (editingStaff) {
        const { id, ...updateData } = data;
        await staffApi.updateStaff(selectedSalon.id, editingStaff.id, updateData);
        toast.success('Staff updated successfully');
      } else {
        await staffApi.inviteStaff(selectedSalon.id, data);
        toast.success('Staff invited successfully');
      }
      reset();
      setEditingStaff(null);
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      if (err.response && err.response.data) {
        const { message, errors } = err.response.data;
        if (errors && errors.length > 0) {
          errors.forEach(errorMsg => toast.error(errorMsg));
        } else if (message) {
          toast.error(message);
        }
      } else {
        toast.error('Failed to save staff. Please try again.');
      }
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    reset(member);
    setShowForm(true);
  };

  const handleDelete = (staffId) => {
    setStaffToDelete(staffId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = useCallback(async () => {
    if (!staffToDelete) return;
    
    try {
      await staffApi.deleteStaff(selectedSalon.id, staffToDelete);
      toast.success('Staff and associated user deleted successfully');
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
      await fetchStaff();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to delete staff');
      }
    }
  }, [staffToDelete, selectedSalon, fetchStaff]);

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
          <p className="mb-4">Are you sure you want to delete this staff member? This action cannot be undone.</p>
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
      <h2 className="text-3xl font-bold mb-6 text-primary-700">Staff Management</h2>
      
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingStaff(null);
          reset({ email: '', fullName: '' });
        }}
        className="mb-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? 'Hide Form' : 'Add New Staff'}
      </button>

      {showForm && (
        <div className="bg-background rounded-lg shadow-card p-6 mb-8 animate-slide-in">
          <h3 className="text-xl font-semibold mb-4 text-primary-600">
            {editingStaff ? 'Edit Staff Member' : 'Invite New Staff Member'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name:</label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
            </div>
            <button type="submit" className="w-full bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 transition duration-300 flex items-center justify-center">
              <FaUserPlus className="mr-2" />
              {editingStaff ? 'Update Staff' : 'Invite Staff'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-background rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-600">Current Staff</h3>
        {staff.length === 0 ? (
          <p className="text-gray-600">No staff members yet.</p>
        ) : (
          <ul className="space-y-4">
            {staff.map((member) => (
              <li key={member.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-300">
                <div>
                  <span className="font-semibold text-primary-600">{member.fullName}</span>
                  <span className="ml-2 text-sm text-gray-600">({member.email})</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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

export default StaffManagement;
