import * as yup from 'yup';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import appConfig from '../config/appConfig';

export const passwordSchema = yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/^[a-zA-Z0-9]{8,}$/, 'Password must contain only letters and numbers')
  .required('Password is required');

export const emailSchema = yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const registerSchema = yup.object().shape({
  fullName: yup.string().required('Full Name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  acceptTerms: yup.bool().oneOf([true], 'Accept Terms is required'),
});

export const acceptInvitationSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const unauthorizedBookingSchema = yup.object({
  clientName: yup.string().required('Name is required').max(100),
  clientEmail: yup.string().email('Invalid email').nullable(),
  clientPhone: yup.string()
    .required('Phone number is required')
    .test('phone', 'Invalid phone number', value => 
      value ? 
        isPossiblePhoneNumber(value, appConfig.phoneNumber.defaultCountry) &&
        value.replace(/\D/g, '').length === appConfig.phoneNumber.length &&
        value.startsWith(appConfig.phoneNumber.defaultCallingCode)
      : false
    )
    .max(20),
  staffId: yup.string()
    .required('Staff selection is required')
    .uuid('Invalid staff member selection'),
  appointmentDateTime: yup.date().required('Appointment time is required'),
  notes: yup.string().max(500).nullable()
});
