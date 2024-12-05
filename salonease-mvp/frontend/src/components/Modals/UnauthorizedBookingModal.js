import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import "react-datepicker/dist/react-datepicker.css";
import { bookingApi, publicApi } from '../../utils/api';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import appConfig from '../../config/appConfig';
import { unauthorizedBookingSchema } from '../../utils/validationSchemas';
import BookingSuccess from '../Bookings/BookingSuccess';

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

const UnauthorizedBookingModal = ({ isOpen, onClose, salonId, service, staff }) => {
  const { t } = useTranslation(['bookings', 'common']);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const defaultDate = roundToNextFifteen(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(unauthorizedBookingSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      staffId: '',
      notes: '',
      appointmentDateTime: defaultDate,
    }
  });

  const selectedStaffId = watch('staffId');
  const selectedDate = watch('appointmentDateTime');

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedStaffId || !selectedDate) return;

      try {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const response = await publicApi.checkSalonAvailability(
          salonId,
          selectedStaffId,
          formattedDate
        );
        
        const availableTimes = response.data.availableSlots.map(timeStr => {
          const [hours, minutes] = timeStr.split(':');
          const date = new Date(selectedDate);
          date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return date;
        });
        
        setAvailableSlots(availableTimes);
      } catch (error) {
        console.error('Failed to fetch available slots:', error);
        toast.error(t('bookings:error.failed_to_load_slots'));
      }
    };

    fetchAvailableSlots();
  }, [selectedStaffId, selectedDate, salonId]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const bookingData = {
        ...data,
        serviceId: service.id,
      };
      
      const response = await publicApi.createBooking(salonId, bookingData);
      if (response.data) {
        setBookingResult(response.data);
        setShowSuccess(true);
        reset();
      }
    } catch (error) {
      if (error.response?.data?.errors?.length > 0) {
        error.response.data.errors.forEach(errorMessage => {
          toast.error(errorMessage);
        });
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess && bookingResult) {
    return (
      <BookingSuccess 
        booking={bookingResult} 
        onClose={() => {
          setShowSuccess(false);
          setBookingResult(null);
          onClose();
        }} 
      />
    );
  }

  const appointmentDateTime = watch('appointmentDateTime', defaultDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('common:close_modal')}
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">{t('bookings:unauthorized_booking.title')}</h2>
        
        {service && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-700">{t('bookings:unauthorized_booking.selected_service')}</h3>
            <p className="text-gray-800">{service.name}</p>
            <p className="text-gray-600 text-sm mt-1">
              {t('bookings:unauthorized_booking.duration', { minutes: service.duration })}
            </p>
            <p className="text-gray-600 text-sm">
              {t('bookings:unauthorized_booking.price', { amount: service.price })}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" role="form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common:label.name')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('clientName')}
              data-testid="clientName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Виктория Иванова"
            />
            <p className="mt-1 text-xs text-gray-500">{t('common:form.required', { field: t('common:label.name') })}</p>
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common:form.email')}
            </label>
            <input
              type="email"
              data-testid="clientEmail"
              {...register('clientEmail')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="salon@example.com"
            />
            {errors.clientEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.clientEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('common:form.contactNumber')} <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              data-testid="clientPhone"
              international
              defaultCountry={appConfig.phoneNumber.defaultCountry}
              value={watch('clientPhone')}
              onChange={(value) => setValue('clientPhone', value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              numberInputProps={{
                className: "w-full px-3 py-2 border border-gray-300 rounded-md",
              }}
              format={appConfig.phoneNumber.defaultFormat}
              placeholder={appConfig.phoneNumber.defaultPlaceholder}
            />
            <p className="mt-1 text-xs text-gray-500">{t('common:form.required', { field: t('common:form.contactNumber') })}</p>
            {errors.clientPhone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.clientPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common:staff_member')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('staffId')}
              data-testid="staffId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('common:form.pleaseSelect', { field: t('common:staff_member') })}</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{t('common:form.required', { field: t('common:staff_member') })}</p>
            {errors.staffId && (
              <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('common:appointment_date_time')} <span className="text-red-500">*</span>
            </label>
            
            <div className="sm:flex sm:space-x-4 space-y-4 sm:space-y-0">
              <DatePicker
                customInput={<input data-testid="appointmentDateTime" />}
                selected={appointmentDateTime}
                onChange={(date) => setValue('appointmentDateTime', date)}
                showTimeSelect
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                minDate={new Date()}
                includeTimes={availableSlots}
                placeholderText={t('bookings:unauthorized_booking.form.appointment.placeholder')}
                disabled={!selectedStaffId || availableSlots.length === 0}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('common:form.required', { field: t('common:appointment_date_time') })}</p>
            {availableSlots.length === 0 && selectedStaffId && (
              <p className="mt-1 text-sm text-gray-600">
                {t('bookings:unauthorized_booking.form.appointment.no_slots')}
              </p>
            )}
            {errors.appointmentDateTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.appointmentDateTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:notes')}</label>
            <textarea
              {...register('notes')}
              data-testid="notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              data-testid="submitButton"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnauthorizedBookingModal; 