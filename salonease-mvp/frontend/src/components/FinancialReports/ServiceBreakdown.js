import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

// Theme-based colors using CSS variables
const COLORS = [
  'var(--primary-500)',
  'var(--primary-400)',
  'var(--primary-300)',
  'var(--primary-200)',
  'var(--primary-100)'
];

const ServiceBreakdown = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-accent/10 h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Calculate total revenue for percentage calculations
  const totalRevenue = data?.reduce((sum, item) => sum + Number(item.revenue), 0) || 0;

  const formattedData = data?.map(item => ({
    name: item.name,
    revenue: Number(item.revenue),
    percentage: totalRevenue > 0 ? (Number(item.revenue) / totalRevenue) * 100 : 0
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Get the original data object
      return (
        <div className="bg-background border border-accent/20 rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{data.name}</p>
          <p className="text-base font-medium text-foreground">
            {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm text-muted-foreground">
            {`${data.percentage.toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }) => {
    // Skip labels for zero or very small percentages
    if (percentage < 5) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="var(--background)"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-accent/10">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        {t('reports:service_breakdown.title')}
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="revenue"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              label={(props) => <CustomLabel {...props} percentage={props.payload.percentage} />}
              labelLine={false}
            >
              {formattedData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--background)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry) => (
                <span className="text-sm text-foreground">
                  {`${value} (${entry.payload.percentage.toFixed(1)}%)`}
                </span>
              )}
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ServiceBreakdown; 