import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { clientApi } from '../../utils/api';
import { FaSearch, FaFileExport, FaEdit, FaSave, FaPlus, FaMinus } from 'react-icons/fa';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format'),
  phone: yup.string().required('Phone is required'),
  notes: yup.string(),
});

const ClientsManagement = () => {
  const { salonId } = useParams();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState(['name', 'email', 'phone']);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchClients();
  }, [salonId]);

  const fetchClients = async () => {
    try {
      const response = await clientApi.getClients(salonId);
      setClients(response.data);
    } catch (error) {
      toast.error('Error fetching clients');
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedClient) {
        await clientApi.updateClient(salonId, selectedClient.id, data);
        toast.success('Client updated successfully');
      } else {
        await clientApi.addClient(salonId, data);
        toast.success('Client added successfully');
      }
      fetchClients();
      setSelectedClient(null);
      setShowForm(false);
      reset();
    } catch (error) {
      toast.error(selectedClient ? 'Error updating client' : 'Error adding client');
    }
  };

  const exportClients = async () => {
    try {
      const response = await clientApi.exportClients(salonId, selectedFields);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'clients.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error('Error exporting clients');
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-card">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">Client Management</h1>

      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <button
          onClick={exportClients}
          className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-md transition duration-300 flex items-center"
        >
          <FaFileExport className="mr-2" /> Export Clients
        </button>
        <button
          onClick={showForm ? () => setShowForm(false) : handleAddNewClient}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-full transition duration-300 flex items-center"
        >
          {showForm ? <FaMinus className="mr-2" /> : <FaPlus className="mr-2" />}
          {showForm ? 'Hide Form' : 'Add Client'}
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
            {selectedClient ? 'Edit Client' : 'Add New Client'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows="3"
              />
            </div>
            <button type="submit" className="w-full bg-secondary-600 text-white py-2 px-4 rounded-md hover:bg-secondary-700 transition duration-300 flex items-center justify-center">
              <FaSave className="mr-2" />
              {selectedClient ? 'Update Client' : 'Add Client'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-background rounded-lg shadow-card p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-600">Client List</h3>
        {filteredClients.length === 0 ? (
          <p className="text-gray-600">No clients found.</p>
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
                <button
                  onClick={() => handleEdit(client)}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                  aria-label={`Edit ${client.name}`}
                >
                  <FaEdit />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClientsManagement;
