import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get('token');

      if (token) {
        try {
          const response = await axios.get(`/api/auth/verify-email?token=${token}`);
          setMessage(response.data.message);
          setTimeout(() => {
            history.push('/login');
          }, 3000);
        } catch (error) {
          setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
        }
      } else {
        setMessage('Invalid verification link.');
      }
    };

    verifyEmail();
  }, [history, location]);

  return (
    <div className="verify-email">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
