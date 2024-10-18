import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../utils/api';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get('token');

      if (token) {
        try {
          const response = await authApi.verifyEmail(token);
          setMessage(response.data.message);
          setIsRedirecting(true);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } catch (error) {
          setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
        }
      } else {
        setMessage('Invalid verification link.');
      }
    };

    verifyEmail();
  }, [navigate, location]);

  return (
    <div className="verify-email">
      <h2>Email Verification</h2>
      <p>{message}</p>
      {isRedirecting && <p>Redirecting to login...</p>}
    </div>
  );
};

export default VerifyEmail;
