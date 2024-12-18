import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useTranslation } from 'react-i18next';

const RevenueChart = ({ data, loading }) => {
  const { t } = useTranslation(['reports']);

  if (loading) {
    return (
      <div className="bg-card p-6 rounded-lg border border-accent/10 h-80 flex items-center justify-center">
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
      <h2 className="text-xl font-semibold mb-4 text-foreground">{t('reports:revenue.title')}</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--accent-background)"
              opacity={0.2}
            />
            <XAxis 
              dataKey="date" 
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
              cursor={{ stroke: 'var(--primary-200)', strokeWidth: 1 }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name={t('reports:revenue.tooltip')}
              stroke="var(--primary-500)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'var(--primary-500)',
                stroke: 'var(--background)',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;