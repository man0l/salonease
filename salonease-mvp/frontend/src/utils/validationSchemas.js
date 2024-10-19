import * as yup from 'yup';

export const passwordSchema = yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain a lowercase letter')
  .matches(/[A-Z]/, 'Password must contain an uppercase letter')
  .matches(/[0-9]/, 'Password must contain a number')
  .matches(/[@$!%*?&#]/, 'Password must contain a special character')
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
