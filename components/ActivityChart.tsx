import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LeetCodeStats } from '../types';

interface ActivityChartProps {
    data: LeetCodeStats[];
}

type TimeRange = 'days' | 'weeks' | 'months';

// Distinct colors for up to 10 users on the line chart
const USER_COLORS = [
    '#f59e0b', // amber
    '#3b82f6', // blue
    '#10b981', // emerald
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#6366f1', // indigo
];

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('weeks');

    const chartData = useMemo(() => {
        if (data.length === 0) return [];

        const now = Math.floor(Date.now() / 1000);
        const daySecs = 86400;

        let periods: number;
        let periodSecs: number;
        let formatLabel: (date: Date) => string;

        if (timeRange === 'days') {
            periods = 30; // Last 30 days
            periodSecs = daySecs;
            formatLabel = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
        } else if (timeRange === 'weeks') {
            periods = 12; // Last 12 weeks
            periodSecs = daySecs * 7;
            formatLabel = (d) => {
                const dEnd = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000);
                return `${d.getDate()}/${d.getMonth() + 1} - ${dEnd.getDate()}/${dEnd.getMonth() + 1}`;
            };
        } else { // months
            periods = 12; // Last 12 months
            periodSecs = daySecs * 30.44; // Approx month
            formatLabel = (d) => d.toLocaleString('default', { month: 'short' });
        }

        // Build empty data buckets going backwards in time
        const buckets: Record<string, any> = {};
        const labelsInOrder: string[] = [];

        // Initialize buckets representing ranges from (now - periods) to now
        for (let i = periods - 1; i >= 0; i--) {
            // Create a start timestamp for each bucket
            const startOfPeriod = now - (i * periodSecs) - periodSecs;
            const dateLabel = formatLabel(new Date(startOfPeriod * 1000));

            labelsInOrder.push(dateLabel);
            buckets[dateLabel] = { name: dateLabel, _startTs: startOfPeriod, _endTs: startOfPeriod + periodSecs };

            // Initialize count to 0 for all users in this bucket
            data.forEach(user => {
                buckets[dateLabel][user.username] = 0;
            });
        }

        // Process each user's calendar data
        data.forEach(user => {
            // Skip if they don't have a calendar
            if (!user.calendar) return;

            Object.entries(user.calendar).forEach(([timestampStr, count]) => {
                const ts = parseInt(timestampStr, 10);

                // Find which bucket this timestamp belongs to
                for (const label of labelsInOrder) {
                    const b = buckets[label];
                    if (ts >= b._startTs && ts < b._endTs) {
                        b[user.username] += count;
                        break;
                    }
                }
            });
        });

        // Clean up internal timestamps and return sorted array
        return labelsInOrder.map(label => {
            const b = { ...buckets[label] };
            delete b._startTs;
            delete b._endTs;
            return b;
        });
    }, [data, timeRange]);

    if (data.length === 0) return null;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mt-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-orange-500"></i>
                    Activity Trends
                </h2>

                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    {(["days", "weeks", "months"] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${timeRange === range
                                ? 'bg-slate-700 text-orange-400 shadow'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {data.map((user, index) => (
                            <Line
                                key={user.username}
                                type="monotone"
                                dataKey={user.username}
                                stroke={USER_COLORS[index % USER_COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className="text-center text-slate-500 text-xs mt-4">Graph shows the total number of accepted submissions during each period.</p>
        </div>
    );
};

export default ActivityChart;
