import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import useDashboard from '../../hooks/useDashboard';
import { useTranslation } from 'react-i18next';

const StaffDashboard = () => {
  const { t } = useTranslation(['dashboard']);
  const { dashboardStats, recentActivity, loading, error, fetchDashboardData } = useDashboard();

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="flex h-screen bg-gray-100">      
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('title.staff_dashboard')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('today_s_appointments')}</p>
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
                <p className="text-gray-500 text-sm">{t('next_appointment')}</p>
                {dashboardStats.nextAppointment ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {dashboardStats.nextAppointment.clientName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dashboardStats.nextAppointment.service} • {dashboardStats.nextAppointment.time}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600">{t('no_upcoming_appointments')}</p>
                )}
              </div>
              <FaUser className="text-primary-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/availability" 
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('manage_availability')}</h3>
            <p className="text-sm text-gray-500">{t('set_your_schedule')}</p>
          </Link>
          
          <Link to="/appointments"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('view_appointments')}</h3>
            <p className="text-sm text-gray-500">{t('check_your_bookings')}</p>
          </Link>
          
          <Link to="/profile"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('action.update_profile')}</h3>
            <p className="text-sm text-gray-500">{t('manage_your_details')}</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('recent_activity')}</h2>
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

export default StaffDashboard;
