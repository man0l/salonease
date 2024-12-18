import React, { useState } from 'react';
import ChatBot from 'react-chatbotify';
import DateSelector from './DateSelector'
import TimeSelector from './TimeSelector'
import StaffSelector from './StaffSelector'

import { bookingApi } from '../../utils/api';

const ChatBooking = ({ isOpen, onClose, salonId, services, selectedService, staff }) => {


  const [clearDateSelector, setClearDateSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleClear = () => {
    setClearDateSelector(true);
    // Reset the clear trigger after it's been used
    setTimeout(() => setClearDateSelector(false), 100);
  };

  if (!selectedService) {
    return null;
  }  

  const flow = {
    start: {
      message: () => `👋 Welcome! I'll help you book your ${selectedService.name} appointment.`,
      transition: 1000,
      path: "select_date"
    },
    select_date: {
      message: "Please select a date for your appointment:",
      component: ({ actions }) => (
        <DateSelector
          onSelect={(date) => {
            if (!date) {
              actions.updateCustomState({ selectedDate: null });
              return;
            }
            setSelectedDate(date);
          }}
          salonId={salonId}
          staffId={selectedStaff?.id}
          shouldClear={clearDateSelector}
          actions={actions}
        />
      ),
      transition: (params) => {
        if (params.userInput) {
          return params.goToPath('select_time');
        }
        return { duration: 0 };
      },
      path: 'select_time'
    },
    select_time: {
      message: "Great! Now choose a time that works for you:",
      component: ({ actions }) => (
        <TimeSelector
          date={selectedDate}
          duration={selectedService.duration}
          onSelect={(time) => {
            actions.updateCustomState({ selectedTime: time });            
          }}
        />
      ),
      path: 'select_staff',
      chatDisabled: true
    },
    select_staff: {
      message: "Would you like to choose a specific stylist?",
      component: (params) => (
        <StaffSelector
          staff={staff}
          onSelect={(staff) => params.goToPath('contact_info', { staffId: staff.id })}
        />
      ),
      path: "contact_info"
    },
    contact_info: {
      message: "Almost done! Please provide your contact information:",
      function: async (params) => {
        try {
          const bookingData = {
            salonId,
            serviceId: selectedService.id,
            staffId: params.staffId,
            clientInfo: {
              name: params.name,
              email: params.email,
              phone: params.phone
            },
            appointmentDateTime: new Date(
              params.date.setHours(
                parseInt(params.time.split(':')[0]),
                parseInt(params.time.split(':')[1])
              )
            ).toISOString()
          };

          const response = await bookingApi.createManychatBooking(bookingData);
          return params.goToPath('confirmation', { booking: response.data.booking });
        } catch (error) {
          params.showToast({
            content: error.response?.data?.message || 'Booking failed. Please try again.',
            timeout: 5000
          });
          return params.goToPath('error');
        }
      },
      path: "confirmation"
    },
    confirmation: {
      message: (params) => `
        🎉 Booking confirmed!
        
        Service: ${selectedService.name}
        Date: ${new Date(params.booking.appointmentDateTime).toLocaleDateString()}
        Time: ${new Date(params.booking.appointmentDateTime).toLocaleTimeString()}
        Stylist: ${params.booking.staff.name}
        
        We'll send you a confirmation email shortly.
      `,
      chatDisabled: true
    },
    error: {
      message: "Sorry, something went wrong with your booking. Please try again or contact us directly.",
      path: "start"
    }
  };

  const flow2 = {
    start: {
      message: "Hello",
      path: "select_date"
    },
    select_date: {
      message: "Please select a date for your appointment:",
      component: ({ actions }) => (
        <DateSelector
          onSelect={(date) => {
            setSelectedDate(date);
          }}
        />
      ),
      transition: (params) => {
        if (params.userInput) {
          return params.goToPath('select_time');
        }
        return params.goToPath('select_date');
      },
    },
    select_time: {
      message: "Great! Now choose a time that works for you:",
      path: "select_staff"
    },
    select_staff: {
      message: "Would you like to choose a specific stylist?",
      path: "contact_info"
    }
  }

  const settings = {
    general: {
      embedded: false,
      primaryColor: 'var(--primary-500)',
      backgroundColor: 'var(--background)',
      textColor: 'var(--foreground)',
      fontFamily: 'Inter, sans-serif'
    },
    chatWindow: {
      defaultOpen: true,
      autoJumpToBottom: true,
      backgroundColor: 'var(--card-background)',
      tooltip: {
        mode: "CLOSE",
        text: "Book your appointment! 💇‍♀️",
        backgroundColor: 'var(--accent-background)',
        textColor: 'var(--accent-foreground)'
      }
    },
    chatHistory: {
      storageKey: "salon_booking_chat"
    },
    chatInput: {
      disabled: false,
      blockSpam: true,
      backgroundColor: 'var(--muted-background)',
      textColor: 'var(--foreground)',
      placeholderColor: 'var(--muted-foreground)'
    }
  };

  return (<ChatBot flow={flow} settings={settings} />
  );
};

export default ChatBooking;
