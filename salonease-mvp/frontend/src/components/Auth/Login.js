import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import axios from '../../utils/api';

function Login() {
  const { register, handleSubmit, errors } = useForm();
  const history = useHistory();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      // Assuming the token is returned in the response
      document.cookie = `token=${response.data.token}; HttpOnly`;
      history.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input
            name="email"
            ref={register({ required: 'Email is required' })}
          />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            ref={register({ required: 'Password is required' })}
          />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
