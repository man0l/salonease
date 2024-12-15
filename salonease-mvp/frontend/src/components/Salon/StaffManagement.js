import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEdit, FaTrash, FaPlus, FaMinus, FaUserPlus } from 'react-icons/fa';
import useStaff from '../../hooks/useStaff';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const StaffManagement = () => {
  const { t } = useTranslation(['staff', 'common']);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    staff,
    loading,
    error,
    inviteStaff,
    updateStaff,
    deleteStaff,
    fetchStaff,
  } = useStaff();

  const schema = yup.object().shape({
    email: yup.string()
      .email(t('staff:validation.email_invalid'))
      .required(t('staff:validation.email_required')),
    fullName: yup.string()
      .required(t('staff:validation.name_required')),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('fullName', data.fullName);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        
      } else {
        const result = await inviteStaff(formData);        
      }
      
      reset();
      setEditingStaff(null);
      setShowForm(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      await fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || t('staff:error.operation_failed'));
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    reset(member);
    setPreviewUrl(member.image ? process.env.REACT_APP_API_URL.replace('/api', '') + member.image : null);
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
      toast.error(err.message || t('staff:error.failed_to_delete'));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error(t('staff:error.file_too_large'));
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('staff:error.invalid_file_type'));
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

  const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useTranslation('staff');
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-800">
          <h3 className="text-lg font-medium mb-4 text-gray-100">
            {t('staff:action.confirm_deletion')}
          </h3>
          <p className="mb-4 text-gray-300">{t('staff:message.confirm_delete')}</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-gray-100 px-4 py-2 rounded mr-2 transition duration-300"
            >
              {t('staff:action.delete')}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded transition duration-300"
            >
              {t('staff:action.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">
        {t('staff:title.staff_management')}
      </h2>
      
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingStaff(null);
          reset({ email: '', fullName: '' });
        }}
        className="mb-6 bg-primary-600 hover:bg-primary-700 text-gray-100 px-4 py-2 rounded-full transition duration-300 flex items-center"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? t('staff:action.hide_form') : t('staff:action.add_new_staff')}
      </button>

      {showForm && (
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-8 animate-slide-in border border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-primary-400">
            {editingStaff ? t('staff:title.edit_staff') : t('staff:title.add_staff')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative w-32 h-32">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={t('staff:label.profile_image')}
                    className="w-full h-full rounded-full object-cover border-4 border-gray-700"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-400" />
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <label
                  htmlFor="staff-image"
                  className="cursor-pointer px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition duration-300"
                >
                  {t('staff:action.change_image')}
                </label>
                <input
                  id="staff-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-400 mt-2">
                  {t('staff:action.choose_file')}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                {t('staff:label.email')}
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              {errors.email && <span className="text-red-400 text-sm">{errors.email.message}</span>}
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
                {t('staff:label.full_name')}
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              {errors.fullName && <span className="text-red-400 text-sm">{errors.fullName.message}</span>}
            </div>
            <button 
              data-testid="submit-button-invite-staff" 
              type="submit" 
              className="w-full bg-primary-600 text-gray-100 py-2 px-4 rounded-md hover:bg-primary-700 transition duration-300 flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" />
              {editingStaff ? t('staff:action.update_staff') : t('staff:action.invite_staff')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold mb-4 text-primary-400">
          {t('title.current_staff')}
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-4">{error}</div>
        ) : staff.length === 0 ? (
          <p className="text-gray-400">{t('error.no_staff')}</p>
        ) : (
          <ul className="space-y-4">
            {staff.map((member) => (
              <li key={member.id} className="flex justify-between items-center p-4 border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-800 transition duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 mr-3">
                    {member.image ? (
                      <img
                        src={process.env.REACT_APP_API_URL.replace('/api', '') + member.image}
                        alt={member.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-primary-400">{member.fullName}</span>
                    <span className="ml-2 text-sm text-gray-400">({member.email})</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="bg-primary-600 hover:bg-primary-700 text-gray-100 py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label={t('action.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="bg-red-600 hover:bg-red-700 text-gray-100 py-1 px-3 rounded-md text-sm transition duration-300"
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
