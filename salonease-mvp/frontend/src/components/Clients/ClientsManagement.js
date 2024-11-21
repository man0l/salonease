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

const schema = yup.object().shape({
  name: yup.string().required(t('name_is_required')),
  email: yup.string().email(t('error.invalid_email_format')),
  phone: yup.string().required(t('phone_is_required')),
  notes: yup.string(),
});

const ClientsManagement = () => {
  const { salonId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState(['name', 'email', 'phone']);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const { 
    clients, 
    loading, 
    error, 
    fetchClients, 
    addClient, 
    updateClient, 
    exportClients,
    deleteClient 
  } = useClients();

  const { t } = useTranslation('clients');

  useEffect(() => {
    if (salonId) {
      if (searchTerm.length >= 3) {
        fetchClients(searchTerm);
      } else {
        fetchClients();
      }
    }
  }, [salonId, searchTerm, fetchClients]);

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
        toast.success(t('success.client_deleted'));
      }
    } catch (error) {
      toast.error(t('error.deleting_client'));
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter(client =>
    !searchTerm ||
    (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">
        {t('title.client_management')}
      </h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search_clients')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => exportClients(selectedFields)}
          className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
        >
          <FaFileExport className="mr-2" /> {t('action.export_clients')}
        </button>
        <button
          onClick={showForm ? () => setShowForm(false) : handleAddNewClient}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
        >
          {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
          {showForm ? t('action.hide_form') : t('action.add_client')}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        {['name', 'email', 'phone'].map((field) => (
          <label key={field} className="inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedFields.includes(field)}
              onChange={() => setSelectedFields(prev => 
                prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
              )}
              className="form-checkbox h-5 w-5 text-primary-600"
            />
            <span className="ml-2 text-gray-700 capitalize">{field}</span>
          </label>
        ))}
      </div>

      {showForm && (
        <div className="bg-background rounded-lg shadow-card p-6 mb-8 animate-slide-in">
          <h3 className="text-xl font-semibold mb-4 text-primary-600">
            {selectedClient ? t('title.edit_client') : t('title.add_new_client')}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.name')}:
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.email')}:
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('label.phone')}:
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                {t('notes')}:
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>
            <button type="submit" className="w-full bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 transition duration-300 flex items-center justify-center">
              <FaSave className="mr-2" />
              {selectedClient ? t('action.update_client') : t('action.add_client')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-background rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-600">
          {t('title.client_list')}
        </h3>
        {filteredClients.length === 0 ? (
          <p className="text-gray-600">{t('no_clients_found')}</p>
        ) : (
          <ul className="space-y-4">
            {filteredClients.map((client) => (
              <li key={client.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition duration-300">
                <div>
                  <span className="font-semibold text-primary-600">{client.name}</span>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  <p className="text-sm text-gray-600">{client.phone}</p>
                  {client.lastAppointmentDate && (
                    <p className="text-sm text-gray-600">Last Appointment: {new Date(client.lastAppointmentDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label={`Edit ${client.name}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                    aria-label={`Delete ${client.name}`}
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

export default ClientsManagement;
