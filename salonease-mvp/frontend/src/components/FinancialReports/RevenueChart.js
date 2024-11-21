import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const RevenueChart = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-card h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Generate an array of dates for the current month
  const generateDateRange = () => {
    const dates = [];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= currentDate) {
        dates.push({
          date: date.toISOString().split('T')[0],
          revenue: 0
        });
      }
    }
    return dates;
  };

  // Merge API data with generated dates
  const formattedData = generateDateRange().map(dateItem => {
    const matchingData = data?.breakdown?.find(d => d.date === dateItem.date);
    return {
      date: new Date(dateItem.date).toLocaleDateString(),
      revenue: matchingData ? Number(matchingData.revenue) : 0
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-card">
      <h2 className="text-xl font-semibold mb-4">{t('reports:revenue.title')}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0EA5E9" 
              strokeWidth={2}
              dot={{ fill: '#0EA5E9' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;