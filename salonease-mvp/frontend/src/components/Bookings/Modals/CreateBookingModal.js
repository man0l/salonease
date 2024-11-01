import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import useClients from '../../../hooks/useClients';
import { FaTrash } from 'react-icons/fa';
import { bookingApi } from '../../../utils/api';
import { useDebounce } from '../../../hooks/useDebounce';
const schema = yup.object().shape({
  clientMode: yup.string().oneOf(['existing', 'new']),
  clientId: yup.string().when('clientMode', {
    is: 'existing',
    then: () => yup.string().required('Please select a client'),
    otherwise: () => yup.string()
  }),
  clientName: yup.string().when('clientMode', {
    is: 'new',
    then: () => yup.string().required('Client name is required'),
    otherwise: () => yup.string()
  }),
  clientEmail: yup.string().when('clientMode', {
    is: 'new',
    then: () => yup.string().email('Invalid email format'),
    otherwise: () => yup.string()
  }),
  clientPhone: yup.string().when('clientMode', {
    is: 'new',
    then: () => yup.string().required('Client phone is required'),
    otherwise: () => yup.string()
  }),
  serviceId: yup.string().required('Service is required'),
  staffId: yup.string().required('Staff member is required'),
  notes: yup.string(),
  appointmentDateTime: yup.date().required('Appointment date and time are required')
    .min(new Date(), 'Appointment date and time must be in the future'),
});

const CreateBookingModal = ({ show, onClose, salonId, onSuccess, staff, services }) => {
  const { clients, fetchClients, addClient } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('existing');
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientMode: 'existing',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      staffId: '',
      notes: '',
      appointmentDateTime: null
    }
  });

  useEffect(() => {
    if (show) {
      fetchClients();
    }
  }, [show, fetchClients]);

  const resetForm = () => {
    reset({
      clientMode: 'existing',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      staffId: '',
      notes: '',
      appointmentDateTime: null
    });
    setClientMode('existing');
    setClientSearch('');
    setFilteredClients([]);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      let clientId = data.clientId;

      if (clientMode === 'new') {
        // Create new client first
        const clientData = {
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone
        };
        
        const newClient = await addClient(clientData);
        clientId = newClient.id;
        await fetchClients(); // Refresh clients list
      }
      
      const response = await bookingApi.createBooking(salonId, { ...data, clientId });
      if (response.data) {
        toast.success('Booking created successfully');
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(errorMessage => {
          toast.error(errorMessage);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const [debouncedSearch] = useDebounce(async (searchTerm) => {
    if (searchTerm.length >= 3) {
      try {
        const response = await fetchClients(searchTerm);
        setFilteredClients(response?.data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setFilteredClients([]);
      }
    } else {
      setFilteredClients([]);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const selectClient = (client) => {
    reset({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      serviceId: watch('serviceId'),
      staffId: watch('staffId'),
      notes: watch('notes')
    });
    setClientSearch('');
  };

  // Add this helper class for error styling
  const inputClassName = (error) => `
    w-full px-3 py-2 border rounded-md
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
  `;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Booking</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('clientId')} />

          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setClientMode('existing');
                  setValue('clientMode', 'existing');
                }}
                className={`px-4 py-2 rounded-md ${
                  clientMode === 'existing' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                Select Existing Client
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientMode('new');
                  setValue('clientMode', 'new');
                }}
                className={`px-4 py-2 rounded-md ${
                  clientMode === 'new' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                New Client
              </button>
            </div>

            {clientMode === 'new' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                  <input
                    {...register('clientName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                  <input
                    type="email"
                    {...register('clientEmail')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientEmail.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
                  <input
                    {...register('clientPhone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.clientPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientPhone.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearch}
                    placeholder="Search clients by name, email, or phone..."
                    onChange={handleSearchChange}
                    className={inputClassName(errors.clientId)}
                  />
                  {clientSearch && clientSearch.length < 3 && (
                    <p className="mt-1 text-sm text-gray-600">
                      Please enter at least 3 characters to search
                    </p>
                  )}
                  {errors.clientId && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
                  )}
                  {clientSearch.length >= 3 && filteredClients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClients.map(client => (
                        <div
                          key={client.id}
                          onClick={() => selectClient(client)}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.phone}</div>
                          <div className="text-sm text-gray-600">{client.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {watch('clientName') && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-700 mb-2">Selected Client</h3>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-800">{watch('clientName')}</p>
                      <p className="text-gray-600 text-sm">{watch('clientPhone')}</p>
                      <p className="text-gray-600 text-sm">{watch('clientEmail')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              {...register('serviceId')}
              className={inputClassName(errors.serviceId)}
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member
            </label>
            <select
              {...register('staffId')}
              className={inputClassName(errors.staffId)}
            >
              <option value="">Select a staff member</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            {errors.staffId && (
              <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date & Time
            </label>
            <DatePicker
              selected={watch('appointmentDateTime')}
              onChange={(date) => {
                setValue('appointmentDateTime', date, { shouldValidate: true });
              }}
              timeIntervals={15}
              showTimeSelect
              dateFormat="MM/dd/yyyy h:mm aa"
              className={inputClassName(errors.appointmentDateTime)}
              minDate={new Date()}
            />
            {errors.appointmentDateTime && (
              <p className="mt-1 text-sm text-red-600">{errors.appointmentDateTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary-500 rounded-md hover:bg-primary-600"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
