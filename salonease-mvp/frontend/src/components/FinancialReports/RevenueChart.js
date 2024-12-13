import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const RevenueChart = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400"></div>
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
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">{t('reports:revenue.title')}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '2px solid #341146',
                borderRadius: '6px',
                padding: '8px',
                color: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name={t('reports:revenue.tooltip')}
              stroke="#341146" 
              strokeWidth={2}
              dot={{ fill: '#341146' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;