import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { clientApi } from '../utils/api'; // Import the clientApi utility

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format'),
  phone: yup.string(),
  notes: yup.string(),
});

const ClientsPage = () => {
  const { salonId } = useParams();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState(['name', 'email', 'phone']);
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
      await clientApi.updateClient(salonId, selectedClient.id, data);
      toast.success('Client updated successfully');
      fetchClients();
      setSelectedClient(null);
      reset();
    } catch (error) {
      toast.error('Error updating client');
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

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Clients</h1>
      <input
        type="text"
        placeholder="Search clients"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={exportClients}>Export Clients</button>
      <div>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.includes('name')}
            onChange={() => setSelectedFields(prev => prev.includes('name') ? prev.filter(f => f !== 'name') : [...prev, 'name'])}
          />
          Name
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.includes('email')}
            onChange={() => setSelectedFields(prev => prev.includes('email') ? prev.filter(f => f !== 'email') : [...prev, 'email'])}
          />
          Email
        </label>
        <label>
          <input
            type="checkbox"
            checked={selectedFields.includes('phone')}
            onChange={() => setSelectedFields(prev => prev.includes('phone') ? prev.filter(f => f !== 'phone') : [...prev, 'phone'])}
          />
          Phone
        </label>
        {/* Add more fields as needed */}
      </div>
      <ul>
        {filteredClients.map(client => (
          <li key={client.id} onClick={() => setSelectedClient(client)}>
            {client.name} - {client.email} - Last Appointment: {client.lastAppointmentDate || 'N/A'}
            {client.phone ? ` - Phone: ${client.phone}` : ' - No phone number available'}
          </li>
        ))}
      </ul>
      {selectedClient && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('name')} defaultValue={selectedClient.name} placeholder="Name" />
          <p>{errors.name?.message}</p>
          <input {...register('email')} defaultValue={selectedClient.email} placeholder="Email" />
          <p>{errors.email?.message}</p>
          <input {...register('phone')} defaultValue={selectedClient.phone} placeholder="Phone" />
          <p>{errors.phone?.message}</p>
          <textarea {...register('notes')} defaultValue={selectedClient.notes} placeholder="Notes" />
          <p>{errors.notes?.message}</p>
          <button type="submit">Update Client</button>
        </form>
      )}
    </div>
  );
};

export default ClientsPage;
