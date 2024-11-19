import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';

const StaffPerformance = ({ data, loading }) => {
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
      <h2 className="text-xl font-semibold mb-4">Staff Performance</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => `Staff: ${label}`}
            />
            <Bar dataKey="revenue" fill="#0EA5E9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffPerformance;
