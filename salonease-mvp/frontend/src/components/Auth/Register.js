import React from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';

const Register = () => {
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Email is invalid').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain an uppercase letter')
      .matches(/[0-9]/, 'Password must contain a number')
      .matches(/[@$!%*?&#]/, 'Password must contain a special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    acceptTerms: Yup.bool().oneOf([true], 'Accept Terms is required'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/auth/register', data);
      alert(response.data.message);
      // Redirect to email verification notice page
    } catch (error) {
      alert(error.response.data.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Full Name</label>
        <input type="text" {...register('fullName')} />
        <p>{errors.fullName?.message}</p>
      </div>
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        <p>{errors.email?.message}</p>
      </div>
      <div>
        <label>Password</label>
        <input type="password" {...register('password')} />
        <p>{errors.password?.message}</p>
      </div>
      <div>
        <label>Confirm Password</label>
        <input type="password" {...register('confirmPassword')} />
        <p>{errors.confirmPassword?.message}</p>
      </div>
      <div>
        <input type="checkbox" {...register('acceptTerms')} />
        <label>Accept Terms and Conditions</label>
        <p>{errors.acceptTerms?.message}</p>
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
