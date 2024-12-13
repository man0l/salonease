import React, { useState, useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useAvailability } from '../../../hooks/useAvailability';

const roundToNextFifteen = (date) => {
  const minutes = date.getMinutes();
  const remainder = minutes % 15;
  const roundedMinutes = minutes + (15 - remainder);
  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  
  if (roundedMinutes >= 60) {
    roundedDate.setHours(roundedDate.getHours() + 1);
    roundedDate.setMinutes(0);
  }
  
  return roundedDate;
};

const CreateBookingModal = ({ show, onClose, salonId, onSuccess, staff, services, initialDate }) => {
  const { t } = useTranslation(['common', 'bookings']);
  const { fetchClients, addClient } = useClients();
  const [loading, setLoading] = useState(false);
  const [clientMode, setClientMode] = useState('existing');
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  const defaultDate = useMemo(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      return roundToNextFifteen(date);
    }
    return roundToNextFifteen(new Date());
  }, [initialDate]);

  const schema = yup.object().shape({
    clientMode: yup.string().oneOf(['existing', 'new']),
    clientId: yup.string().when('clientMode', {
      is: 'existing',
      then: () => yup.string().required(t('bookings:validation.client_mode')),
      otherwise: () => yup.string()
    }),
    clientName: yup.string().when('clientMode', {
      is: 'new',
      then: () => yup.string().required(t('bookings:validation.client_name')),
      otherwise: () => yup.string()
    }),
    clientEmail: yup.string().when('clientMode', {
      is: 'new',
      then: () => yup.string().email(t('bookings:validation.client_email')),
      otherwise: () => yup.string()
    }),
    clientPhone: yup.string().when('clientMode', {
      is: 'new',
      then: () => yup.string().required(t('bookings:validation.client_phone')),
      otherwise: () => yup.string()
    }),
    serviceId: yup.string().required(t('bookings:validation.service')),
    staffId: yup.string().required(t('bookings:validation.staff')),
    notes: yup.string(),
    appointmentDateTime: yup.date().required(t('bookings:validation.appointment_date_and_time'))
      .min(new Date(), t('bookings:validation.appointment_date_and_time_future')),
  });
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      appointmentDateTime: defaultDate,
      clientMode: 'existing',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      serviceId: '',
      staffId: '',
      notes: '',
    }
  });

  const staffId = watch('staffId');
  const appointmentDateTime = watch('appointmentDateTime');

  const { availableSlots, loading: loadingSlots } = useAvailability(
    salonId,
    staffId,
    appointmentDateTime,
    show
  );

  useEffect(() => {
    if (show) {
      fetchClients();
    }
  }, [show, fetchClients]);

  useEffect(() => {
    if (show && initialDate) {
      const roundedDate = roundToNextFifteen(new Date(initialDate));
      setValue('appointmentDateTime', roundedDate, { shouldValidate: true });
    }
  }, [show]);

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
      appointmentDateTime: defaultDate
    });
    setClientMode('existing');
    setClientSearch('');
    setFilteredClients([]);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare booking data
      const bookingData = {
        serviceId: data.serviceId,
        staffId: data.staffId,
        appointmentDateTime: data.appointmentDateTime,
        notes: data.notes
      };

      // Add client information based on mode
      if (clientMode === 'existing') {
        bookingData.clientId = data.clientId;
      } else {
        // For new clients, pass the client info directly
        bookingData.clientName = data.clientName;
        bookingData.clientPhone = data.clientPhone;
        if (data.clientEmail) {
          bookingData.clientEmail = data.clientEmail;
        }
      }
      
      const response = await bookingApi.createBooking(salonId, bookingData);
      if (response.data) {
        toast.success(t('bookings:success.booking_created'));
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.error(error.message);
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
    // Preserve current values
    const currentDateTime = watch('appointmentDateTime');
    const currentServiceId = watch('serviceId');
    const currentStaffId = watch('staffId');
    const currentNotes = watch('notes');

    // Update form with client info while preserving other fields
    setValue('clientId', client.id);
    setValue('clientName', client.name);
    setValue('clientEmail', client.email);
    setValue('clientPhone', client.phone);
    
    // Ensure we keep the existing values
    setValue('appointmentDateTime', currentDateTime);
    setValue('serviceId', currentServiceId);
    setValue('staffId', currentStaffId);
    setValue('notes', currentNotes);
    
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
        <h2 className="text-2xl font-bold mb-4">{t('bookings:title.create_new_booking')}</h2>
        
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
                {t('bookings:action.select_existing_client')}
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
                {t('bookings:action.new_client')}
              </button>
            </div>

            {clientMode === 'new' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:label.name')}:
                  </label>
                  <input
                    {...register('clientName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:label.email_address')}:
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common:phone_number')}:
                  </label>
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
                    placeholder={t('common:placeholder.search_clients_by_name_email_or_phone')}
                    onChange={handleSearchChange}
                    className={inputClassName(errors.clientId)}
                  />
                  {clientSearch && clientSearch.length < 3 && (
                    <p className="mt-1 text-sm text-gray-600">
                      {t('common:message.please_enter_at_least_3_characters_to_search')}
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
                      <h3 className="font-medium text-gray-700 mb-2">
                        {t('common:selected_client')}
                      </h3>
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
              {t('common:service')}
            </label>
            <select
              {...register('serviceId')}
              className={inputClassName(errors.serviceId)}
            >
              <option value="">{t('common:form.pleaseSelect', { field: t('common:service') })}</option>
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
              {t('common:staff_member')}
            </label>
            <select
              {...register('staffId')}
              className={inputClassName(errors.staffId)}
            >
              <option value="">{t('common:form.pleaseSelect', { field: t('common:staff_member') })}</option>
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('common:appointment_date_time')}
            </label>
            
            <div className="sm:flex sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <DatePicker
                  selected={watch('appointmentDateTime')}
                  onChange={(date) => {
                    if (!date) return;
                    const currentDate = watch('appointmentDateTime');
                    const newDate = new Date(date);
                    if (currentDate) {
                      newDate.setHours(currentDate.getHours());
                      newDate.setMinutes(currentDate.getMinutes());
                    }
                    setValue('appointmentDateTime', newDate, { shouldValidate: true });
                  }}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.appointmentDateTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  calendarClassName="mobile-friendly-calendar"
                  withPortal
                />
              </div>

              <div className="flex-1">
                <DatePicker
                  selected={watch('appointmentDateTime')}
                  onChange={(date) => {
                    if (!date) return;
                    const currentDate = watch('appointmentDateTime');
                    const newDate = new Date(currentDate || defaultDate);
                    newDate.setHours(date.getHours());
                    newDate.setMinutes(date.getMinutes());
                    setValue('appointmentDateTime', newDate, { shouldValidate: true });
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.appointmentDateTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                  withPortal
                  includeTimes={availableSlots}
                  placeholderText={loadingSlots ? t('common:status.loading') : t('bookings:modal.select_time')}
                  disabled={loadingSlots || availableSlots.length === 0 || !watch('staffId')}
                />
              </div>
            </div>

            {errors.appointmentDateTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.appointmentDateTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('bookings:label.notes')}
            </label>
            <textarea
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition duration-300"
            >
              {loading ? t('common:status.loading') : t('bookings:action.add_booking')}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {t('common:action.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
