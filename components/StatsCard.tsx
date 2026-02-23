
import React from 'react';
import { LeetCodeStats } from '../types';

interface StatsCardProps {
  stats: LeetCodeStats;
  onRemove: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, onRemove, onRefresh, isLoading }) => {
  const total = stats.easySolved + stats.mediumSolved + stats.hardSolved;
  
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg relative group transition-all hover:border-orange-500/50">
      <div className="flex justify-between items-start mb-4">
        <div className="overflow-hidden">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 truncate">
            <i className="fa-solid fa-user text-orange-500"></i>
            {stats.username}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-slate-400 text-[10px] font-medium px-1.5 py-0.5 bg-slate-700 rounded">Rank: #{stats.ranking.toLocaleString()}</p>
            {stats.contestRating && (
              <p className="text-orange-400 text-[10px] font-bold px-1.5 py-0.5 bg-orange-500/10 rounded border border-orange-500/20">
                Rating: {Math.round(stats.contestRating)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh stats"
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg bg-slate-700/50"
          >
            <i className={`fa-solid fa-rotate ${isLoading ? 'animate-spin' : ''}`}></i>
          </button>
          <button 
            onClick={onRemove}
            title="Remove user"
            className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg bg-slate-700/50"
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-[10px] text-emerald-400 font-semibold uppercase">Easy</p>
          <p className="text-lg font-bold">{stats.easySolved}</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-[10px] text-yellow-400 font-semibold uppercase">Medium</p>
          <p className="text-lg font-bold">{stats.mediumSolved}</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg text-center">
          <p className="text-[10px] text-red-400 font-semibold uppercase">Hard</p>
          <p className="text-lg font-bold">{stats.hardSolved}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Activity Level</span>
            <span className="text-orange-400 font-medium">{stats.totalSolved} Total</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden flex">
            <div 
              style={{ width: `${(stats.easySolved / total) * 100}%` }} 
              className="bg-emerald-500 h-full"
            ></div>
            <div 
              style={{ width: `${(stats.mediumSolved / total) * 100}%` }} 
              className="bg-yellow-500 h-full"
            ></div>
            <div 
              style={{ width: `${(stats.hardSolved / total) * 100}%` }} 
              className="bg-red-500 h-full"
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 border-t border-slate-700 pt-4">
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase">Past Day</p>
            <p className="text-sm font-bold text-white">+{stats.recentActivity.pastDay}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase">Past Week</p>
            <p className="text-sm font-bold text-white">+{stats.recentActivity.pastWeek}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase">Past Month</p>
            <p className="text-sm font-bold text-white">+{stats.recentActivity.pastMonth}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 border-t border-slate-700/50 pt-3">
        {stats.lastActiveTimestamp && (
          <p className="text-[9px] text-slate-500 flex items-center gap-1">
            <i className="fa-solid fa-clock"></i>
            Active: {new Date(stats.lastActiveTimestamp).toLocaleDateString()}
          </p>
        )}
        <p className="text-[9px] text-slate-500 text-right flex-1">
          Last Check: {new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
