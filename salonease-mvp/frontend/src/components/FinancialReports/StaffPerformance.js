import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const StaffPerformance = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-accent/10 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const formattedData = data?.map(item => ({
    name: item.name,
    revenue: Number(item.revenue)
  })) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-accent/20 rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-base font-medium text-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-accent/10">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        {t('reports:staff_performance.title')}
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--accent-background)"
              opacity={0.2}
            />
            <XAxis 
              dataKey="name" 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickMargin={10}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickMargin={10}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                fill: 'var(--primary-50)',
                opacity: 0.2
              }}
            />
            <Bar 
              dataKey="revenue" 
              name={t('reports:staff_performance.tooltip.revenue')}
              fill="var(--primary-500)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StaffPerformance;
