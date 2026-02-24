import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { LeetCodeStats } from '../types';

interface TopicChartProps {
    stats: LeetCodeStats;
}

// A vibrant, distinct color palette for the top 8 tags + 'Other' (gray)
const COLORS = [
    '#f97316', // Orange
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#eab308', // Yellow
    '#14b8a6', // Teal
    '#f43f5e', // Rose
    '#475569', // Slate (Other)
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-white font-bold">{payload[0].name}</p>
                <p className="text-slate-300 text-sm">{payload[0].value} problems</p>
            </div>
        );
    }
    return null;
};

const TopicChart: React.FC<TopicChartProps> = ({ stats }) => {
    if (!stats.topics || stats.topics.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 flex items-center justify-center">
                <p className="text-slate-500 text-sm">No topic data available for {stats.username}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col items-center">
            <h3 className="font-bold text-lg self-start w-full whitespace-nowrap overflow-hidden text-ellipsis mb-2">
                {stats.username}'s Topics
            </h3>

            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.topics}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="problemsSolved"
                            nameKey="tagName"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            {stats.topics.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.tagName === 'Other' ? COLORS[8] : COLORS[index % (COLORS.length - 1)]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-full">
                {stats.topics.slice(0, 4).map((topic, index) => (
                    <div key={topic.tagName} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.tagName === 'Other' ? COLORS[8] : COLORS[index % (COLORS.length - 1)] }}></span>
                        <span className="text-slate-400 whitespace-nowrap">{topic.tagName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicChart;
