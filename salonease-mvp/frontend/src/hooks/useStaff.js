import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../utils/api';
import { toast } from 'react-toastify';
import { useSalonContext } from '../contexts/SalonContext';
import { useTranslation } from 'react-i18next';

const useStaff = () => {
  const { t } = useTranslation(['staff']);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedSalon } = useSalonContext();

  const fetchStaff = useCallback(async () => {
    if (!selectedSalon) return;
    try {
      setLoading(true);
      const response = await staffApi.getStaff(selectedSalon.id);
      setStaff(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('error.no_staff'));
      toast.error(t('error.no_staff'));
      setLoading(false);
    }
  }, [selectedSalon, t]);

  const fetchStaffAndAvailability = useCallback(async () => {
    if (!selectedSalon) return;
    try {
      setLoading(true);
      const [staffResponse, availabilityResponse] = await Promise.all([
        staffApi.getStaff(selectedSalon.id),
        staffApi.getStaffAvailability(selectedSalon.id)
      ]);
      setStaff(staffResponse.data);
      const formattedEvents = formatAvailabilityToEvents(availabilityResponse.data);
      setEvents(formattedEvents);
      setLoading(false);
    } catch (error) {
      setError(t('error.no_staff'));
      toast.error(t('error.no_staff'));
      setLoading(false);
    }
  }, [selectedSalon, t]);

  useEffect(() => {
    fetchStaffAndAvailability();
  }, [fetchStaffAndAvailability]);

  const formatAvailabilityToEvents = (availability) => {
    return availability.map(slot => {
      const currentDate = new Date();
      const dayDiff = slot.dayOfWeek - currentDate.getDay();
      const targetDate = new Date(currentDate.setDate(currentDate.getDate() + dayDiff));

      const startDateTime = new Date(targetDate.setHours(
        parseInt(slot.startTime.split(':')[0]),
        parseInt(slot.startTime.split(':')[1]),
        0
      ));

      const endDateTime = new Date(targetDate.setHours(
        parseInt(slot.endTime.split(':')[0]),
        parseInt(slot.endTime.split(':')[1]),
        0
      ));

      return {
        id: slot.id,
        title: `${slot.staff.fullName} - ${slot.type}`,
        start: startDateTime,
        end: endDateTime,
        staffId: slot.staffId,
        type: slot.type,
        resourceId: slot.staffId,
      };
    });
  };

  const inviteStaff = async (formData) => {
    try {
      const response = await staffApi.inviteStaff(selectedSalon.id, formData);
      if (response.data) {
        await fetchStaff();
        toast.success(t('success.staff_added'));
        return response.data;
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  const updateStaff = async (staffId, updateData) => {
    try {
      await staffApi.updateStaff(selectedSalon.id, staffId, updateData);
      toast.success(t('success.staff_updated'));
      await fetchStaff();
    } catch (err) {
      handleApiError(err);
    }
  };

  const deleteStaff = async (staffId) => {
    try {
      await staffApi.deleteStaff(selectedSalon.id, staffId);
      toast.success(t('success.staff_deleted'));
      await fetchStaff();
    } catch (err) {
      handleApiError(err);
    }
  };

  const createStaffAvailability = async (availabilityData) => {
    try {
      await staffApi.createStaffAvailability(selectedSalon.id, availabilityData);
      toast.success(t('success.availability_saved'));
      await fetchStaffAndAvailability();
    } catch (err) {
      handleApiError(err);
    }
  };

  const updateStaffAvailability = async (availabilityId, availabilityData) => {
    try {
      await staffApi.updateStaffAvailability(selectedSalon.id, availabilityId, availabilityData);
      toast.success(t('success.availability_saved'));
      await fetchStaffAndAvailability();
    } catch (err) {
      handleApiError(err);
    }
  };

  const deleteStaffAvailability = async (availabilityId) => {
    try {
      await staffApi.deleteStaffAvailability(selectedSalon.id, availabilityId);
      toast.success(t('success.availability_deleted'));
      await fetchStaffAndAvailability();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleApiError = (err) => {
    if (err.response && err.response.data) {
      const { message, errors } = err.response.data;
      if (errors && errors.length > 0) {
        errors.forEach(errorMsg => toast.error(t(`error.${errorMsg}`)));
      } else if (message) {
        toast.error(t(`error.${message}`));
      }
    } else {
      toast.error(t('error.failed_to_update'));
    }
  };

  return {
    staff,
    events,
    loading,
    error,
    fetchStaff,
    fetchStaffAndAvailability,
    inviteStaff,
    updateStaff,
    deleteStaff,
    createStaffAvailability,
    updateStaffAvailability,
    deleteStaffAvailability,
    formatAvailabilityToEvents,
  };
};

export default useStaff;
