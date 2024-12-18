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
    <div className="flex-1 p-10 bg-background">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {selectedSalon.name} {t('dashboard:title.dashboard')}
        </h1>
        <Link 
          to={`/salon/${selectedSalon.id}`} 
          className="text-primary-400 hover:text-primary-300"
          target="_blank"
        >
          {t('dashboard:action.view_public_page')} →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                {t('dashboard:today_s_appointments')}
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {dashboardStats.todayAppointments}
              </h3>
            </div>
            <FaCalendar className="text-primary-400 text-2xl" />
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                {t('dashboard:revenue_this_week')}
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {formatCurrency(dashboardStats.weeklyRevenue)}
              </h3>
            </div>
            <FaMoneyBill className="text-primary-400 text-2xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Link to={`/salons/${selectedSalon.id}/staff`} 
              className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition group">
          <h3 className="text-lg font-medium text-foreground group-hover:text-primary-400">
            {t('dashboard:staff')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard:manage_your_team')}
          </p>
        </Link>
        
        <Link to={`/salons/${selectedSalon.id}/services`}
              className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition group">
          <h3 className="text-lg font-medium text-foreground group-hover:text-primary-400">
            {t('dashboard:services')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard:manage_offerings')}
          </p>
        </Link>
        
        <Link to={`/salons/${selectedSalon.id}/bookings-calendar`}
              className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition group">
          <h3 className="text-lg font-medium text-foreground group-hover:text-primary-400">
            {t('dashboard:calendar')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard:view_schedule')}
          </p>
        </Link>
        
        <Link to={`/salons/${selectedSalon.id}/clients`}
              className="bg-card p-6 rounded-lg border border-muted shadow-sm hover:shadow transition group">
          <h3 className="text-lg font-medium text-foreground group-hover:text-primary-400">
            {t('dashboard:clients')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard:manage_clients')}
          </p>
        </Link>
      </div>

      <div className="bg-card p-6 rounded-lg border border-muted shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t('dashboard:recent_activity')}
        </h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <ul className="space-y-4">
            {recentActivity.length === 0 ? (
              <li className="text-muted-foreground text-center py-4">
                {t('dashboard:no_recent_activity')}
              </li>
            ) : (
              recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-3 text-sm text-foreground">
                  <FaClock className="text-muted-foreground" />
                  <span>{activity.description}</span>
                  <span className="text-muted-foreground">{activity.timeAgo}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SalonOwnerDashboard;
