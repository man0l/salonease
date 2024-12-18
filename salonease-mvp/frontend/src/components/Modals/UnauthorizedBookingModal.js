import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import { publicApi } from '../../utils/api';
import appConfig from '../../config/appConfig';
import { unauthorizedBookingSchema } from '../../utils/validationSchemas';
import BookingSuccess from '../Bookings/BookingSuccess';
import "react-datepicker/dist/react-datepicker.css";
import 'react-phone-number-input/style.css';

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

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 border border-accent/10 shadow-lg">
          <BookingSuccess booking={bookingResult} onClose={onClose} />
        </div>
      </div>
    );
  }

  const appointmentDateTime = watch('appointmentDateTime', defaultDate);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 border border-accent/10 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {t('bookings:unauthorized_booking.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-2">{service.name}</h3>
          <p className="text-muted-foreground">
            {t('bookings:duration')}: {service.duration} {t('common:minutes')} • {service.price} лв.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('common:form.fullName')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('clientName')}
              data-testid="clientName"
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-primary-500"
              placeholder={t('bookings:unauthorized_booking.form.name.placeholder')}
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-destructive">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('common:form.email')} <span className="text-destructive">*</span>
            </label>
            <input
              {...register('clientEmail')}
              type="email"
              data-testid="clientEmail"
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-primary-500"
              placeholder={t('bookings:unauthorized_booking.form.email.placeholder')}
            />
            {errors.clientEmail && (
              <p className="mt-1 text-sm text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('common:form.contactNumber')} <span className="text-destructive">*</span>
            </label>
            <PhoneInput
              defaultCountry={appConfig.phoneNumber.defaultCountry}
              value={watch('clientPhone')}
              onChange={(value) => setValue('clientPhone', value)}
              className="bg-background border border-accent/10 rounded-md text-foreground"
              numberInputProps={{
                className: "w-full px-3 py-2 bg-background border-0 text-foreground placeholder:text-muted-foreground",
              }}
            />
            {errors.clientPhone && (
              <p className="mt-1 text-sm text-destructive">{errors.clientPhone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('common:staff_member')} <span className="text-destructive">*</span>
            </label>
            <select
              {...register('staffId')}
              data-testid="staffId"
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="" className="bg-background">
                {t('common:form.pleaseSelect', { field: t('common:staff_member') })}
              </option>
              {staff.map(member => (
                <option key={member.id} value={member.id} className="bg-background">
                  {member.fullName}
                </option>
              ))}
            </select>
            {errors.staffId && (
              <p className="mt-1 text-sm text-destructive">{errors.staffId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              {t('common:appointment_date_time')} <span className="text-destructive">*</span>
            </label>
            <DatePicker
              customInput={
                <input 
                  className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-primary-500"
                  data-testid="appointmentDateTime"
                />
              }
              selected={appointmentDateTime}
              onChange={(date) => setValue('appointmentDateTime', date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              includeTimes={availableSlots}
              placeholderText={t('bookings:unauthorized_booking.form.appointment.placeholder')}
              disabled={!selectedStaffId || availableSlots.length === 0}
            />
            {availableSlots.length === 0 && selectedStaffId && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('bookings:unauthorized_booking.form.appointment.no_slots')}
              </p>
            )}
            {errors.appointmentDateTime && (
              <p className="mt-1 text-sm text-destructive">{errors.appointmentDateTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {t('common:notes')}
            </label>
            <textarea
              {...register('notes')}
              data-testid="notes"
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <button
            type="submit"
            data-testid="submitButton"
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            disabled={loading}
          >
            {loading ? t('common:form.submitting') : t('common:form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UnauthorizedBookingModal; 