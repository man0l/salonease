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
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-card border border-accent/10">
          <h3 className="text-lg font-medium mb-4">
            {t('staff:action.confirm_deletion')}
          </h3>
          <p className="mb-4 text-muted-foreground">{t('staff:message.confirm_delete')}</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md transition duration-300"
            >
              {t('staff:action.cancel')}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              {t('staff:action.delete')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
        {t('staff:title.staff_management')}
      </h2>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingStaff(null);
          reset({ email: '', fullName: '' });
        }}
        className="w-full sm:w-auto mb-4 sm:mb-6 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center justify-center sm:justify-start"
      >
        {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
        {showForm ? t('staff:action.hide_form') : t('staff:action.add_new_staff')}
      </button>

      {showForm && (
        <div className="bg-card rounded-lg shadow-card p-4 sm:p-6 border border-accent/10 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-500">
            {t('staff:form.title')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-4 sm:mb-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={t('staff:label.profile_image')}
                    className="w-full h-full rounded-full object-cover border-4 border-accent/20"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-muted-foreground" />
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <label
                  htmlFor="staff-image"
                  className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md transition duration-300 text-sm sm:text-base"
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
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('staff:label.email')}
                </label>
                <input
                  {...register('email')}
                  className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                />
                {errors.email && <span className="text-red-500 text-xs sm:text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('staff:label.full_name')}
                </label>
                <input
                  {...register('fullName')}
                  className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                />
                {errors.fullName && <span className="text-red-500 text-xs sm:text-sm">{errors.fullName.message}</span>}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center text-sm sm:text-base"
            >
              <FaUserPlus className="mr-2" />
              {editingStaff ? t('staff:action.update_staff') : t('staff:action.invite_staff')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card p-4 sm:p-6 border border-accent/10">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-500">
          {t('staff:title.current_staff')}
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4 text-sm sm:text-base">{error}</div>
        ) : staff.length === 0 ? (
          <p className="text-muted-foreground text-sm sm:text-base">{t('staff:error.no_staff')}</p>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {staff.map((member) => (
              <li key={member.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border border-accent/10 rounded-lg bg-card hover:bg-muted transition duration-300">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mr-3">
                    {member.image ? (
                      <img
                        src={process.env.REACT_APP_API_URL.replace('/api', '') + member.image}
                        alt={member.fullName}
                        className="w-full h-full rounded-full object-cover border border-accent/20"
                      />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-foreground text-sm sm:text-base">{member.fullName}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground sm:ml-2">({member.email})</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleEdit(member)}
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center"
                    aria-label={t('staff:action.edit')}
                  >
                    <FaEdit className="mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('staff:action.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center"
                    aria-label={t('staff:action.delete')}
                  >
                    <FaTrash className="mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('staff:action.delete')}</span>
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
