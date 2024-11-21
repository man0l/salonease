import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEdit, FaTrash, FaPlus, FaMinus, FaUserPlus } from 'react-icons/fa';
import useStaff from '../../hooks/useStaff';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const schema = yup.object().shape({
  email: yup.string().email(t('validation.email_invalid')).required(t('validation.email_required')),
  fullName: yup.string().required(t('validation.name_required')),
});

const StaffManagement = () => {
  const { t } = useTranslation('staff');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const {
    staff,
    loading,
    error,
    inviteStaff,
    updateStaff,
    deleteStaff,
    fetchStaff,
  } = useStaff();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, {
          ...data,
          id: editingStaff.id
        });
        toast.success(t('success.staff_updated'));
      } else {
        await inviteStaff(data);
        toast.success(t('success.staff_invited'));
      }
      reset();
      setEditingStaff(null);
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || t('error.general'));
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

  const confirmDelete = async () => {
    if (!staffToDelete) return;
    
    try {
      await deleteStaff(staffToDelete);
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
      await fetchStaff();
    } catch (err) {
      toast.error(err.message || t('error.delete'));
    }
  };

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation('staff');
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium mb-4">{t('action.confirm_deletion')}</h3>
          <p className="mb-4">{t('message.confirm_delete')}</p>
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h2 className="text-3xl font-bold mb-6 text-primary-700">
        {t('title.staff_management')}
      </h2>
      
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingStaff(null);
          reset({ email: '', fullName: '' });
        }}
        className="mb-6 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? t('action.hide_form') : t('action.add_new_staff')}
      </button>

      {showForm && (
        <div className="bg-background rounded-lg shadow-card p-6 mb-8 animate-slide-in">
          <h3 className="text-xl font-semibold mb-4 text-primary-600">
            {editingStaff ? t('title.edit_staff') : t('title.invite_staff')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.email')}
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.full_name')}
              </label>
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
              {editingStaff ? t('action.update_staff') : t('action.invite_staff')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-background rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-600">
          {t('title.current_staff')}
        </h3>
        {loading ? (
          <p className="text-gray-600">{t('message.loading')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : staff.length === 0 ? (
          <p className="text-gray-600">{t('message.no_staff')}</p>
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
                    aria-label={t('action.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label={t('action.delete')}
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
