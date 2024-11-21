import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ServiceBreakdown = ({ data, loading }) => {
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
    <div className="bg-white p-6 rounded-lg shadow-card">
      <h2 className="text-xl font-semibold mb-4">{t('reports:service_breakdown.title')}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {formattedData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ServiceBreakdown; 