import React from 'react';
import { Link } from 'react-router-dom';
import { useSalonContext } from '../../contexts/SalonContext';
import { FaCalendar, FaUsers, FaMoneyBill, FaClock } from 'react-icons/fa';
import useDashboard from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/currencyFormatter';

const SalonOwnerDashboard = () => {
  const { selectedSalon } = useSalonContext();
  const { dashboardStats, recentActivity, loading, error, fetchDashboardData } = useDashboard();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!selectedSalon) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Link 
          to="/salons" 
          className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
        >
          Set Up Your First Salon
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">      
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedSalon.name} Dashboard
          </h1>
          <Link 
            to={`/salon/${selectedSalon.id}`} 
            className="text-primary-600 hover:text-primary-700"
            target="_blank"
          >
            View Public Page →
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Today's Appointments</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {dashboardStats.todayAppointments}
                </h3>
              </div>
              <FaCalendar className="text-primary-500 text-2xl" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenue This Week</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.weeklyRevenue)}
                </h3>
              </div>
              <FaMoneyBill className="text-primary-500 text-2xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link to={`/salons/${selectedSalon.id}/staff`} 
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">Staff Management</h3>
            <p className="text-sm text-gray-500">Manage your team</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/services`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">Services</h3>
            <p className="text-sm text-gray-500">Manage offerings</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/bookings-calendar`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">Calendar</h3>
            <p className="text-sm text-gray-500">View schedule</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/clients`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">Clients</h3>
            <p className="text-sm text-gray-500">Manage clients</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-3 text-sm">
                  <FaClock className="text-gray-400" />
                  <span>{activity.description}</span>
                  <span className="text-gray-400">{activity.timeAgo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonOwnerDashboard;
