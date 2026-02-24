import React, { useState, useMemo } from 'react';
import { LeetCodeStats } from '../types';

interface LeaderboardProps {
    users: LeetCodeStats[];
    onClose: () => void;
}

type SortMetric = 'totalSolved' | 'contestRating' | 'pastDay' | 'pastWeek' | 'pastMonth';

export const Leaderboard: React.FC<LeaderboardProps> = ({ users, onClose }) => {
    const [metric, setMetric] = useState<SortMetric>('totalSolved');

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            switch (metric) {
                case 'totalSolved': return b.totalSolved - a.totalSolved;
                case 'contestRating': return (b.contestRating || 0) - (a.contestRating || 0);
                case 'pastDay': return b.recentActivity.pastDay - a.recentActivity.pastDay;
                case 'pastWeek': return b.recentActivity.pastWeek - a.recentActivity.pastWeek;
                case 'pastMonth': return b.recentActivity.pastMonth - a.recentActivity.pastMonth;
                default: return 0;
            }
        });
    }, [users, metric]);

    const getRankStyle = (index: number) => {
        if (index === 0) return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 font-black";
        if (index === 1) return "bg-slate-300/10 border-slate-300/30 text-slate-300 font-bold";
        if (index === 2) return "bg-orange-700/10 border-orange-700/30 text-orange-600 font-bold";
        return "border-slate-800 text-slate-400";
    };

    const getTrophy = (index: number) => {
        if (index === 0) return <i className="fa-solid fa-trophy text-yellow-500 mr-2"></i>;
        if (index === 1) return <i className="fa-solid fa-medal text-slate-300 mr-2"></i>;
        if (index === 2) return <i className="fa-solid fa-medal text-orange-600 mr-2"></i>;
        return <span className="w-6 inline-block text-center mr-2">{index + 1}</span>;
    };

    const getValue = (u: LeetCodeStats) => {
        switch (metric) {
            case 'totalSolved': return u.totalSolved;
            case 'contestRating': return Math.round(u.contestRating || 0) || 'N/A';
            case 'pastDay': return u.recentActivity.pastDay;
            case 'pastWeek': return u.recentActivity.pastWeek;
            case 'pastMonth': return u.recentActivity.pastMonth;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-xl shadow-lg">
                            <i className="fa-solid fa-crown"></i>
                        </div>
                        <h2 className="text-2xl font-black text-white">Global Leaderboard</h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Controls */}
                <div className="p-6 pb-2">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'totalSolved', label: 'Most Solved' },
                            { id: 'contestRating', label: 'Highest Rating' },
                            { id: 'pastDay', label: 'Active Today' },
                            { id: 'pastWeek', label: 'Active this Week' },
                            { id: 'pastMonth', label: 'Active this Month' }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setMetric(t.id as SortMetric)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${metric === t.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    <div className="bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-sm text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 font-bold w-24">Rank</th>
                                    <th className="p-4 font-bold">User</th>
                                    <th className="p-4 font-bold text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-slate-500">No users tracked yet.</td>
                                    </tr>
                                ) : (
                                    sortedUsers.map((u, i) => (
                                        <tr key={u.username} className={`border-b border-slate-800/50 transition-colors hover:bg-slate-800/30 ${i < 3 ? 'bg-slate-900/30' : ''}`}>
                                            <td className="p-4">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-lg border ${getRankStyle(i)}`}>
                                                    {getTrophy(i)}
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-200">
                                                <a href={`https://leetcode.com/${u.username}`} target="_blank" rel="noreferrer" className="hover:text-orange-400 transition-colors">
                                                    {u.username}
                                                </a>
                                            </td>
                                            <td className="p-4 font-mono text-right text-lg text-slate-300">
                                                {getValue(u)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
