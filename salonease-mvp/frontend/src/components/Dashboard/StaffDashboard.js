import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StaffDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Staff Dashboard</h1>

        {/* Today's Schedule */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          {/* Add today's appointments */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/availability" 
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium">Manage Availability</h3>
          </Link>
          <Link to="/appointments"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium">View Appointments</h3>
          </Link>
          <Link to="/profile"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-lg font-medium">Update Profile</h3>
          </Link>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          {/* Add upcoming appointments list */}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
