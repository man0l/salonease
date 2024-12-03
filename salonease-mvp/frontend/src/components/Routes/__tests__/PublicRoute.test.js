import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicRoute from '../PublicRoute';
import { useAuth } from '../../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');

describe('PublicRoute', () => {
  const TestComponent = () => <div>Test Component</div>;
  const DashboardComponent = () => <div>Dashboard</div>;

  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/" element={component} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders children when user is not authenticated', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: false
    }));

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('redirects to dashboard when user is authenticated', () => {
    useAuth.mockImplementation(() => ({
      user: { id: '1' },
      loading: false
    }));

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('renders nothing while loading', () => {
    useAuth.mockImplementation(() => ({
      user: null,
      loading: true
    }));

    renderWithRouter(
      <PublicRoute>
        <TestComponent />
      </PublicRoute>
    );

    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
}); 