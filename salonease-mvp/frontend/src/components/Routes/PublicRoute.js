import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While checking authentication status, show nothing
  if (loading) {
    return null;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the protected component
  return children;
};

export default PublicRoute; 