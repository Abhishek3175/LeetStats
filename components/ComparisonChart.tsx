
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LeetCodeStats } from '../types';

interface ComparisonChartProps {
  data: LeetCodeStats[];
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  const chartData = data.map(user => ({
    name: user.username,
    Easy: user.easySolved,
    Medium: user.mediumSolved,
    Hard: user.hardSolved,
    Total: user.totalSolved
  }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <i className="fa-solid fa-chart-simple text-orange-500"></i>
        Comparison Breakdown
      </h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Bar dataKey="Easy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Hard" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
