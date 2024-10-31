import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { bookingApi } from '../../../utils/api';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import useClients from '../../../hooks/useClients';

const schema = yup.object().shape({
  clientName: yup.string().required('Client name is required'),
  clientEmail: yup.string().email('Invalid email format').required('Client email is required'),
  clientPhone: yup.string().required('Client phone is required'),
  serviceId: yup.string().required('Service is required'),
  staffId: yup.string().required('Staff member is required'),
  notes: yup.string(),
});

const CreateBookingModal = ({ show, onClose, salonId, onSuccess, staff, services }) => {
  const { clients, fetchClients } = useClients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('existing');
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema)
  });

  const selectedStaffId = watch('staffId');

  useEffect(() => {
    if (show) {
      fetchClients();
    }
  }, [show, fetchClients]);

  useEffect(() => {
    if (show && selectedStaffId && selectedDate) {
      checkAvailability();
    }
  }, [show, selectedStaffId, selectedDate]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.checkAvailability(salonId, selectedStaffId, selectedDate);
      setAvailableSlots(response.data);
    } catch (error) {
      toast.error('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const bookingData = {
        ...data,
        appointmentDateTime: selectedDate,
        salonId
      };
      
      await bookingApi.createBooking(bookingData);
      toast.success('Booking created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientSearch.trim()) {
      const searchTerm = clientSearch.toLowerCase();
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [clientSearch, clients]);

  const selectClient = (client) => {
    reset({
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      serviceId: watch('serviceId'),
      staffId: watch('staffId'),
      notes: watch('notes')
    });
    setClientSearch('');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Booking</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setClientMode('existing')}
                className={`px-4 py-2 rounded-md ${
                  clientMode === 'existing' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                Select Existing Client
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={`px-4 py-2 rounded-md ${
                  clientMode === 'new' ? 'bg-primary-600 text-white' : 'bg-gray-200'
                }`}
              >
                New Client
              </button>
            </div>

            {clientMode === 'existing' ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients by name, email, or phone..."
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
                {clientSearch && (
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
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-md"
                    {...register('clientName')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border rounded-md"
                    {...register('clientPhone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-md"
                    {...register('clientEmail')}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              {...register('serviceId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              selected={selectedDate}
              onChange={setSelectedDate}
              showTimeSelect
              dateFormat="Pp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              minDate={new Date()}
              filterTime={(time) => {
                return availableSlots.some(slot => 
                  new Date(slot).getTime() === time.getTime()
                );
              }}
            />
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

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition duration-300"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
