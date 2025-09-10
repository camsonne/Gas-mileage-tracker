
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col justify-center">
      <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
      <div className="mt-1 flex items-baseline">
        <p className="text-2xl font-semibold text-brand-primary">{value}</p>
        {unit && <p className="ml-1.5 text-sm text-slate-400">{unit}</p>}
      </div>
    </div>
  );
};

export default StatCard;
