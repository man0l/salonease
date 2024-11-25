import React from 'react';
import { Link } from 'react-router-dom';
import { useSalonContext } from '../../contexts/SalonContext';
import { FaCalendar, FaUsers, FaMoneyBill, FaClock } from 'react-icons/fa';
import useDashboard from '../../hooks/useDashboard';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const SalonOwnerDashboard = () => {
  const { t } = useTranslation(['common', 'dashboard']);
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
          {t('dashboard:action.setup_first_salon')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">      
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {selectedSalon.name} {t('dashboard:title.dashboard')}
          </h1>
          <Link 
            to={`/salon/${selectedSalon.id}`} 
            className="text-primary-600 hover:text-primary-700"
            target="_blank"
          >
            {t('dashboard:action.view_public_page')} →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{t('dashboard:today_s_appointments')}</p>
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
                <p className="text-gray-500 text-sm">{t('dashboard:revenue_this_week')}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.weeklyRevenue)}
                </h3>
              </div>
              <FaMoneyBill className="text-primary-500 text-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link to={`/salons/${selectedSalon.id}/staff`} 
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('dashboard:title.staff_management')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard:manage_your_team')}</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/services`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('dashboard:services')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard:manage_offerings')}</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/bookings-calendar`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('dashboard:calendar')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard:view_schedule')}</p>
          </Link>
          
          <Link to={`/salons/${selectedSalon.id}/clients`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition group">
            <h3 className="text-lg font-medium group-hover:text-primary-600">{t('dashboard:clients')}</h3>
            <p className="text-sm text-gray-500">{t('dashboard:manage_clients')}</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard:recent_activity')}</h2>
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
