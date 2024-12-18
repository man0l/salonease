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

  // Update input base styling function
  const inputClassName = (error) => `
    w-full px-4 py-3 rounded-md text-foreground
    ${error 
      ? 'border-red-500 focus:ring-red-500 bg-muted/80' 
      : 'bg-muted/80 border-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}
    transition-colors duration-200
  `;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-card max-w-md w-full border border-accent/10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {t('bookings:title.create_new_booking')}
        </h2>
        
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
                  clientMode === 'existing' 
                    ? 'bg-gradient-accent text-white' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
                  clientMode === 'new' 
                    ? 'bg-gradient-accent text-white' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t('bookings:action.new_client')}
              </button>
            </div>

            {clientMode === 'new' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {t('common:label.name')}:
                  </label>
                  <input
                    {...register('clientName')}
                    className={inputClassName(errors.clientName)}
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-500">{errors.clientName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {t('common:label.email_address')}:
                  </label>
                  <input
                    type="email"
                    {...register('clientEmail')}
                    className={inputClassName(errors.clientEmail)}
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-500">{errors.clientEmail.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    {t('common:phone_number')}:
                  </label>
                  <input
                    {...register('clientPhone')}
                    className={inputClassName(errors.clientPhone)}
                  />
                  {errors.clientPhone && (
                    <p className="mt-1 text-sm text-red-500">{errors.clientPhone.message}</p>
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
                    <div className="absolute z-10 w-full mt-1 bg-card border border-muted rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClients.map(client => (
                        <div
                          key={client.id}
                          onClick={() => selectClient(client)}
                          className="p-2 hover:bg-muted/80 cursor-pointer"
                        >
                          <div className="font-medium text-foreground">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.phone}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {watch('clientName') && (
                  <div className="mt-4 p-4 bg-card rounded-md border border-muted">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-foreground mb-2">
                        {t('common:selected_client')}
                      </h3>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                    <div className="space-y-1 text-foreground">
                      <p>{watch('clientName')}</p>
                      <p className="text-muted-foreground text-sm">{watch('clientPhone')}</p>
                      <p className="text-muted-foreground text-sm">{watch('clientEmail')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {t('common:service')}
            </label>
            <select
              {...register('serviceId')}
              className={`${inputClassName(errors.serviceId)} appearance-none cursor-pointer`}
            >
              <option value="">{t('bookings:modal.select_service')}</option>
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
            <label className="block text-sm text-gray-400 mb-1">
              {t('common:staff_member')}
            </label>
            <select
              {...register('staffId')}
              className={`${inputClassName(errors.staffId)} appearance-none cursor-pointer`}
            >
              <option value="">{t('bookings:modal.select_staff')}</option>
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
            <label className="block text-sm text-gray-400 mb-1">
              {t('common:appointment_date_time')}
            </label>
            
            <div className="grid grid-cols-2 gap-4">
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
                className={inputClassName(errors.appointmentDateTime)}
                calendarClassName="bg-card border-muted text-foreground"
                withPortal
              />

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
                className={inputClassName(errors.appointmentDateTime)}
                withPortal
                includeTimes={availableSlots}
                placeholderText={loadingSlots ? t('common:status.loading') : t('bookings:modal.select_time')}
                disabled={loadingSlots || availableSlots.length === 0 || !watch('staffId')}
              />
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
              className={`${inputClassName(errors.notes)} min-h-[100px] resize-none`}
              placeholder={t('bookings:placeholder.add_booking_notes')}
              rows="3"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-accent text-white px-4 py-2 rounded transition duration-300 hover:opacity-90"
            >
              {loading ? t('common:status.loading') : t('bookings:action.add_booking')}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded transition duration-300"
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
