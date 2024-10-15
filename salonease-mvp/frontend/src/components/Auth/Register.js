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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-gray-700">Full Name</label>
        <input id="fullName" type="text" {...register('fullName')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        <p className="text-red-500 text-sm">{errors.fullName?.message}</p>
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700">Email</label>
        <input id="email" type="email" {...register('email')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700">Password</label>
        <input id="password" type="password" {...register('password')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>
      </div>
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
        <input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
      </div>
      <div className="mb-4">
        <input id="acceptTerms" type="checkbox" {...register('acceptTerms')} className="mr-2 leading-tight" />
        <label htmlFor="acceptTerms" className="text-gray-700">Accept Terms and Conditions</label>
        <p className="text-red-500 text-sm">{errors.acceptTerms?.message}</p>
      </div>
      <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-secondary focus:outline-none focus:bg-secondary">Register</button>
    </form>
  );
};

export default Register;
