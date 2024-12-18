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
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [imageCaptions, setImageCaptions] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSalonUpdate = async (salonId, formData) => {
    const updatedSalon = await updateSalon(salonId, formData);
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
      const formData = new FormData();
      
      // Append basic salon data
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Append images and captions
      selectedImages.forEach((file, index) => {
        formData.append('salonImages', file);
        if (imageCaptions[index]) {
          formData.append('captions', imageCaptions[index]);
        }
      });

      // Append images to delete
      if (imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      if (editingSalon) {
        await handleSalonUpdate(editingSalon.id, formData);
      } else {
        await handleSalonCreate(formData);
      }
    } catch (err) {
      toast.error(t('error.failed_to_save_salon'));
    }
  };

  const handleEdit = (salon) => {
    setEditingSalon(salon);
    reset(salon);
    setImagesToDelete([]);
    
    if (salon.images && salon.images.length > 0) {
      const urls = salon.images.map(img => ({
        id: img.id,
        url: process.env.REACT_APP_API_URL.replace('/api', '') + img.imageUrl,
        caption: img.caption || ''
      }));
      setImagePreviewUrls(urls.map(img => img.url));
      setImageCaptions(urls.map(img => img.caption));
      setSelectedImages([]); 
    } else {
      setImagePreviewUrls([]);
      setImageCaptions([]);
      setSelectedImages([]);
    }
    
    setShowForm(true);
  };

  const handleAddNewSalon = () => {
    setEditingSalon(null);
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setImageCaptions([]);
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
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-card border border-accent/10 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">
            {t('action.confirm_deletion')}
          </h3>
          <p className="mb-4 text-muted-foreground">
            {t('action.are_you_sure_you_want_to_delete_this_salon')}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-300"
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
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border border-accent/10 rounded-lg bg-card hover:bg-muted transition duration-300"
      >
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-foreground">
              {salon.name}
              {salon.deletedAt && (
                <span className="ml-2 text-sm text-red-500 font-normal">
                  {t('salon:status.deleted')}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">{salon.address}</p>
            <p className="text-sm text-muted-foreground">{salon.contactNumber}</p>
            {salon.description && (
              <p className="text-sm text-muted-foreground mt-1">{salon.description}</p>
            )}
            
            {/* Display salon images if available */}
            {salon.images && salon.images.length > 0 && (
              <div className="mt-2 flex space-x-2 overflow-x-auto">
                {salon.images.map((image, index) => (
                  <div key={image.id} className="relative flex-shrink-0">
                    <img
                      src={process.env.REACT_APP_API_URL.replace('/api', '') + image.imageUrl}
                      alt={image.caption || `Salon image ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-accent/10"
                    />
                    {image.caption && (
                      <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-foreground text-xs p-1 truncate">
                        {image.caption}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2 sm:mt-0">
          {!salon.deletedAt && (
            <>
              <button 
                onClick={() => handleEdit(salon)} 
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
                aria-label={`${t('common:action.edit')} ${salon.name}`}
              >
                <FaEdit className="mr-2 sm:mr-0" />
                <span className="sm:hidden">{t('common:action.edit')}</span>
              </button>
              <button 
                onClick={() => handleDelete(salon.id)} 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
                aria-label={`${t('common:action.delete')} ${salon.name}`}
              >
                <FaTrash className="mr-2 sm:mr-0" />
                <span className="sm:hidden">{t('common:action.delete')}</span>
              </button>
            </>
          )}
          {salon.deletedAt && (
            <button 
              onClick={() => handleRestore(salon.id)} 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
              aria-label={`${t('common:action.restore')} ${salon.name}`}
            >
              <FaUndo className="mr-2 sm:mr-0" />
              <span className="sm:hidden">{t('common:action.restore')}</span>
            </button>
          )}
        </div>
      </li>
    );
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      const isValidType = /^image\/(jpeg|jpg|png|gif)$/.test(file.type);
      
      if (!isValidSize) {
        toast.error(t('error.file_too_large', { filename: file.name }));
      }
      if (!isValidType) {
        toast.error(t('error.invalid_file_type', { filename: file.name }));
      }
      
      return isValidSize && isValidType;
    });

    setSelectedImages(prevImages => [...prevImages, ...validFiles]);
    
    // Generate preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result]);
        setImageCaptions(prev => [...prev, '']); // Add empty caption
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageDelete = (index, imageId = null) => {
    if (imageId) {
      // This is an existing image
      setImagesToDelete(prev => [...prev, imageId]);
    }
    
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImageCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 sm:p-6 md:p-8"
        onClick={onClose}
      >
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={image.url}
              alt={image.caption || 'Salon image'}
              className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
            {image.caption && (
              <div className="p-4 bg-gray-900">
                <p className="text-center text-gray-100 text-sm sm:text-base">
                  {image.caption}
                </p>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white bg-gray-900 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-300"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-foreground">
        {isOnboarding ? t('action.set_up_your_first_salon') : t('action.salon_management')}
      </h1>
      
      {!isOnboarding && (
        <button
          onClick={showForm ? () => setShowForm(false) : handleAddNewSalon}
          className="mb-6 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
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
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                {t('label.salon_images')}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="salon-images"
              />
              <label
                htmlFor="salon-images"
                className="cursor-pointer inline-block px-4 py-2 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 transition duration-300"
              >
                {t('action.choose_images')}
              </label>
              
              {imagePreviewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage({ 
                          url: url,
                          caption: imageCaptions[index]
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index, editingSalon?.images?.[index]?.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-300"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4 text-sm sm:text-base">{error}</div>
      ) : salons.length === 0 ? (
        <p className="text-muted-foreground text-sm sm:text-base">{t('salon:error.no_salons')}</p>
      ) : (
        <ul className="space-y-3 sm:space-y-4">
          {salons.map((salon) => (
            <li 
              key={salon.id} 
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border border-accent/10 rounded-lg bg-background hover:bg-muted-background transition duration-300"
            >
              <div className="flex items-center mb-2 sm:mb-0">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-foreground">
                    {salon.name}
                    {salon.deletedAt && (
                      <span className="ml-2 text-sm text-red-500 font-normal">
                        {t('salon:status.deleted')}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{salon.address}</p>
                  <p className="text-sm text-muted-foreground">{salon.contactNumber}</p>
                  {salon.description && (
                    <p className="text-sm text-muted-foreground mt-1">{salon.description}</p>
                  )}
                  
                  {salon.images && salon.images.length > 0 && (
                    <div className="mt-2 flex space-x-2 overflow-x-auto">
                      {salon.images.map((image, index) => (
                        <div key={image.id} className="relative flex-shrink-0">
                          <img
                            src={process.env.REACT_APP_API_URL.replace('/api', '') + image.imageUrl}
                            alt={image.caption || `Salon image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-accent/10"
                            onClick={() => setSelectedImage({ 
                              url: process.env.REACT_APP_API_URL.replace('/api', '') + image.imageUrl,
                              caption: image.caption
                            })}
                          />
                          {image.caption && (
                            <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm text-foreground text-xs p-1 truncate">
                              {image.caption}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2 sm:mt-0">
                {!salon.deletedAt && (
                  <>
                    <button 
                      onClick={() => handleEdit(salon)} 
                      className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
                      aria-label={`${t('common:action.edit')} ${salon.name}`}
                    >
                      <FaEdit className="mr-2 sm:mr-0" />
                      <span className="sm:hidden">{t('common:action.edit')}</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(salon.id)} 
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
                      aria-label={`${t('common:action.delete')} ${salon.name}`}
                    >
                      <FaTrash className="mr-2 sm:mr-0" />
                      <span className="sm:hidden">{t('common:action.delete')}</span>
                    </button>
                  </>
                )}
                {salon.deletedAt && (
                  <button 
                    onClick={() => handleRestore(salon.id)} 
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center" 
                    aria-label={`${t('common:action.restore')} ${salon.name}`}
                  >
                    <FaUndo className="mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('common:action.restore')}</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination controls */}
      <div className="mt-6 flex justify-between items-center">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
          className="bg-accent-background hover:bg-accent-background/80 text-accent-foreground w-10 h-10 rounded-md transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{t('common:action.previous')}</span>
          <span className="sm:hidden">&lt;</span>
        </button>
        <span className="text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
          className="bg-accent-background hover:bg-accent-background/80 text-accent-foreground w-10 h-10 rounded-md transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="hidden sm:inline">{t('common:action.next')}</span>
          <span className="sm:hidden">&gt;</span>
        </button>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      <ImageModal 
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default SalonManagement;
