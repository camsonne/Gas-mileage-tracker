
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trip } from '../types';

interface MpgChartProps {
  data: Trip[];
}

const MpgChart: React.FC<MpgChartProps> = ({ data }) => {
  // We want to show the data in chronological order, but it's stored in reverse.
  const chartData = [...data].reverse().map(trip => ({
    name: trip.date,
    mpg: trip.mpg,
  }));

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
          />
          <Legend />
          <Line type="monotone" dataKey="mpg" stroke="#1d4ed8" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MpgChart;
