
import React from 'react';
import { Trip } from '../types';

interface TripHistoryProps {
  trips: Trip[];
  onDelete: (id: string) => void;
}

const TripHistory: React.FC<TripHistoryProps> = ({ trips, onDelete }) => {
  if (trips.length === 0) {
    return <p className="text-center text-slate-500 py-4">No trips logged yet. Add one above to get started!</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Miles Driven</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gallons</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MPG</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Delete</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {trips.map((trip) => {
            const milesDriven = trip.endOdometer - trip.startOdometer;
            return (
              <tr key={trip.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{trip.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{milesDriven.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{trip.gallons.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-primary">{trip.mpg.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(trip.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TripHistory;
