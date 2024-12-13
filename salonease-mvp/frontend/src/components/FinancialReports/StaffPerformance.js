import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const StaffPerformance = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-card h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const formattedData = data?.map(item => ({
    name: item.name,
    revenue: Number(item.revenue)
  })) || [];

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">{t('reports:staff_performance.title')}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
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
              cursor={{ fill: 'rgba(52, 17, 70, 0.1)' }}
            />
            <Bar 
              dataKey="revenue" 
              name={t('reports:staff_performance.tooltip.revenue')}
              fill="#341146" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffPerformance;
