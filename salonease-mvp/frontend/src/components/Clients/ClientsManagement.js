import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FaSearch, FaFileExport, FaEdit, FaSave, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import useClients from '../../hooks/useClients';
import DeleteConfirmationDialog from '../common/DeleteConfirmationDialog';
import { useTranslation } from 'react-i18next';

const ClientsManagement = () => {
  const { salonId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFields, setSelectedFields] = useState(['name', 'email', 'phone']);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);


  const { 
    clients, 
    fetchClients, 
    addClient, 
    updateClient, 
    exportClients,
    deleteClient 
  } = useClients();

  const { t } = useTranslation('clients', 'common');

  const schema = yup.object().shape({
    name: yup.string().required(t('clients:validation.name_required')),
    email: yup.string().email(t('clients:validation.email_invalid')),
    phone: yup.string().required(t('clients:validation.phone_required')),
    notes: yup.string(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (salonId) {
      if (searchQuery.length >= 3) {
        fetchClients(searchQuery);
      } else {
        fetchClients();
      }
    }
  }, [salonId, searchQuery, fetchClients]);

  const onSubmit = async (data) => {
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, data);
        toast.success(t('success.client_updated'));
      } else {
        await addClient(data);
      }
      fetchClients();
      setSelectedClient(null);
      setShowForm(false);
      reset();
    } catch (error) {
      toast.error(selectedClient ? t('error.updating_client') : t('error.adding_client'));
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    reset(client);
    setShowForm(true);
  };

  const handleAddNewClient = () => {
    setSelectedClient(null);
    reset({
      name: '',
      email: '',
      phone: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleDelete = (client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete || !salonId) return;
    
    try {
      const success = await deleteClient(salonId, clientToDelete.id);
      if (success) {
        await fetchClients();
      }
    } catch (error) {
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter(client =>
    !searchQuery ||
    (client.name && client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery))
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-foreground">
        {t('title.client_management')}
      </h2>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search_clients')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        <button
          onClick={() => exportClients(selectedFields)}
          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center justify-center text-sm sm:text-base"
        >
          <FaFileExport className="mr-2" />
          {t('action.export_clients')}
        </button>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setSelectedClient(null);
            reset();
          }}
          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center justify-center text-sm sm:text-base"
        >
          {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
          {showForm ? t('action.hide_form') : t('action.add_client')}
        </button>
      </div>

      <div className="mb-4 sm:mb-6 flex flex-wrap gap-4">
        {['name', 'email', 'phone'].map((field) => (
          <label key={field} className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedFields.includes(field)}
              onChange={() => setSelectedFields(prev => 
                prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
              )}
              className="form-checkbox h-5 w-5 text-primary-600 bg-background border-accent/20 rounded"
            />
            <span className="ml-2 text-foreground text-sm">{field}</span>
          </label>
        ))}
      </div>

      {showForm && (
        <div className="bg-card rounded-lg shadow-card p-4 sm:p-6 border border-accent/10 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-500">
            {selectedClient ? t('title.edit_client') : t('title.add_new_client')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('label.name')}
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
              />
              {errors.name && <span className="text-red-500 text-xs sm:text-sm">{t('name_is_required')}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('label.email')}
              </label>
              <input
                {...register('email')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
              />
              {errors.email && <span className="text-red-500 text-xs sm:text-sm">{t('error.invalid_email_format')}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('label.phone')}
              </label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
              />
              {errors.phone && <span className="text-red-500 text-xs sm:text-sm">{t('phone_is_required')}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {t('label.notes')}
              </label>
              <textarea
                {...register('notes')}
                className="w-full px-3 py-2 bg-background border border-accent/20 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                rows="3"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center text-sm sm:text-base"
            >
              <FaSave className="mr-2" />
              {selectedClient ? t('action.update_client') : t('action.add_client')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card p-4 sm:p-6 border border-accent/10">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-primary-500">
          {t('title.client_list')}
        </h3>
        
        {filteredClients.length === 0 ? (
          <p className="text-muted-foreground text-sm sm:text-base">{t('no_clients_found')}</p>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {filteredClients.map((client) => (
              <li key={client.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 border border-accent/10 rounded-lg bg-card hover:bg-muted transition duration-300">
                <div className="flex-grow">
                  <span className="font-semibold text-foreground text-sm sm:text-base">{client.name}</span>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                    {client.lastAppointmentDate && (
                      <p className="mt-1">
                        Last Appointment: {new Date(client.lastAppointmentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleEdit(client)}
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center"
                    aria-label={t('action.edit')}
                  >
                    <FaEdit className="mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('common:action.edit')}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 sm:py-1 px-3 rounded-md text-xs sm:text-sm transition duration-300 flex items-center justify-center"
                    aria-label={t('action.delete')}
                  >
                    <FaTrash className="mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('common:action.delete')}</span>
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
        title={t('action.confirm_deletion')}
        message={t('message.confirm_delete')}
      />
    </div>
  );
};

export default ClientsManagement;
