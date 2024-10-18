import React, { act } from 'react';
import { render } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { api, authApi } from '../utils/api';

jest.mock('../utils/api', () => ({
  api: {
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  },
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides user and auth methods', () => {
    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(contextValue).toHaveProperty('user', null);
    expect(contextValue).toHaveProperty('loading', true);
    expect(contextValue).toHaveProperty('login');
    expect(contextValue).toHaveProperty('logout');
    expect(contextValue).toHaveProperty('register');
  });

  test('login sets user and tokens', async () => {
    const mockUser = { id: 1, fullName: 'Test User', role: 'SalonOwner' };
    const mockResponse = { data: { token: 'mockToken', refreshToken: 'mockRefreshToken', user: mockUser } };
    authApi.login.mockResolvedValue(mockResponse);
    api.get.mockResolvedValue({ data: mockUser });

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await contextValue.login('test@example.com', 'password123');
    });

    expect(localStorage.getItem('token')).toBe('mockToken');
    expect(localStorage.getItem('refreshToken')).toBe('mockRefreshToken');
    expect(contextValue.user).toEqual(mockUser);
  });

  test('logout clears user and tokens', async () => {
    localStorage.setItem('token', 'mockToken');
    localStorage.setItem('refreshToken', 'mockRefreshToken');

    let contextValue;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await contextValue.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  // Add more tests for register and other functionalities
});
