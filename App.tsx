
import React, { useState, useEffect, useMemo } from 'react';
import { LeetCodeStats, DashboardViewConfig, GoogleUser } from './types';
import { fetchLeetCodeStats } from './services/leetcodeService';
import { supabase } from './lib/supabase';
import StatsCard from './components/StatsCard';
import ComparisonChart from './components/ComparisonChart';
import ActivityChart from './components/ActivityChart';
import TopicChart from './components/TopicChart';
import { Leaderboard } from './components/Leaderboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [usernames, setUsernames] = useState<string[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, LeetCodeStats>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string, isAuth?: boolean } | null>(null);

  const [selectedForDisplay, setSelectedForDisplay] = useState<string[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({ minEasy: 0, minMedium: 0, minHard: 0, onlyWithContest: false });
  const [sort, setSort] = useState<DashboardViewConfig['sort']>({ key: 'totalSolved', order: 'desc' });
  const [savedViews, setSavedViews] = useState<DashboardViewConfig[]>([]);
  const [viewName, setViewName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error("Supabase Session Error:", sessionError);
        if (sessionError.status === 403) {
          setError({ message: "Supabase connection forbidden (403). Ensure this URL is added to 'Redirect URLs' in your Supabase Dashboard.", isAuth: true });
        }
      }
      if (session?.user) syncUserSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) syncUserSession(session);
      else clearUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserSession = (session: any) => {
    setCurrentUser({
      id: session.user.id,
      name: session.user.user_metadata.full_name || 'User',
      email: session.user.email || '',
      picture: session.user.user_metadata.avatar_url || '',
    });
    fetchUserData(session.user.id);
  };

  const clearUserData = () => {
    setCurrentUser(null);
    setUsernames([]);
    setSelectedForDisplay([]);
    setStatsMap({});
    setSavedViews([]);
  };

  const fetchUserData = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data: trackedData, error: trackedError } = await supabase
        .from('tracked_users')
        .select('leetcode_username')
        .eq('user_id', userId);

      if (trackedError) throw trackedError;
      const fetchedUsernames = trackedData.map(d => d.leetcode_username);
      setUsernames(fetchedUsernames);

      const { data: viewsData, error: viewsError } = await supabase
        .from('dashboard_views')
        .select('*')
        .eq('user_id', userId);

      if (viewsError) throw viewsError;
      setSavedViews(viewsData.map(v => ({ ...v.config, id: v.id, name: v.name })));

      const results = await Promise.all(fetchedUsernames.map(u => fetchLeetCodeStats(u).catch(() => null)));
      const newStatsMap: Record<string, LeetCodeStats> = {};
      results.forEach(res => { if (res) newStatsMap[res.username] = res; });
      setStatsMap(newStatsMap);

      // Select all users for display by default upon load
      setSelectedForDisplay(fetchedUsernames);
    } catch (err: any) {
      setError({ message: "Sync failed: " + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });

    if (error) {
      console.error("Login Error:", error);
      setError({
        message: error.status === 403
          ? `403 Forbidden: ${origin} is not in Supabase "Redirect URLs" whitelist.`
          : error.message,
        isAuth: true
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUsername = inputValue.trim();
    if (!cleanUsername || !currentUser) return;
    if (usernames.includes(cleanUsername)) return setError({ message: 'User already added' });

    setIsLoading(true);
    setError(null);
    try {
      const stats = await fetchLeetCodeStats(cleanUsername);
      const { error: dbError } = await supabase.from('tracked_users').insert({ user_id: currentUser.id, leetcode_username: stats.username });
      if (dbError) throw dbError;
      setStatsMap(prev => ({ ...prev, [stats.username]: stats }));
      setUsernames(prev => [stats.username, ...prev]);
      setSelectedForDisplay(prev => [stats.username, ...prev]);
      setInputValue('');
    } catch (err: any) {
      setError({ message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (username: string) => {
    if (!currentUser) return;
    try {
      await supabase.from('tracked_users').delete().eq('user_id', currentUser.id).eq('leetcode_username', username);
      setUsernames(prev => prev.filter(u => u !== username));
      setSelectedForDisplay(prev => prev.filter(u => u !== username));
      setStatsMap(prev => {
        const next = { ...prev };
        delete next[username];
        return next;
      });
    } catch (err: any) {
      setError({ message: "Delete failed" });
    }
  };

  const saveCurrentView = async () => {
    if (!viewName.trim() || !currentUser) return;
    try {
      const { data, error: dbError } = await supabase.from('dashboard_views').insert({ user_id: currentUser.id, name: viewName, config: { filter, sort } }).select().single();
      if (dbError) throw dbError;
      setSavedViews(prev => [...prev, { id: data.id, name: viewName, filter, sort }]);
      setViewName('');
    } catch (err: any) {
      setError({ message: "Save failed" });
    }
  };

  const filteredAndSortedUsernames = useMemo(() => {
    return usernames
      .filter(u => selectedForDisplay.includes(u))
      .filter(u => {
        const s = statsMap[u];
        if (!s) return true;
        return s.easySolved >= filter.minEasy && s.mediumSolved >= filter.minMedium && s.hardSolved >= filter.minHard && (!filter.onlyWithContest || (s.contestRating || 0) > 0);
      })
      .sort((a, b) => {
        const sa = statsMap[a], sb = statsMap[b];
        if (!sa || !sb) return 0;
        let valA: any = 0, valB: any = 0;
        switch (sort.key) {
          case 'totalSolved': valA = sa.totalSolved; valB = sb.totalSolved; break;
          case 'contestRating': valA = sa.contestRating || 0; valB = sb.contestRating || 0; break;
          case 'lastUpdated': valA = sa.lastUpdated; valB = sb.lastUpdated; break;
          case 'username': valA = sa.username.toLowerCase(); valB = sb.username.toLowerCase(); break;
        }
        return sort.order === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
      });
  }, [usernames, statsMap, filter, sort, selectedForDisplay]);

  const toggleUserDisplay = (username: string) => {
    setSelectedForDisplay(prev =>
      prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]
    );
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-cloud"></i>
            </div>
            <h1 className="text-xl font-bold">LeetStats</h1>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors tooltip-trigger relative shadow-inner border border-yellow-500/20"
                title="Global Leaderboard"
              >
                <i className="fa-solid fa-trophy text-lg"></i>
              </button>
            )}

            {currentUser ? (
              <>
                <form onSubmit={handleAddUser} className="flex gap-2">
                  <input
                    type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                    placeholder="LeetCode handle..."
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none w-32 md:w-auto"
                  />
                  <button disabled={isLoading} className="bg-orange-600 px-5 py-2 rounded-lg text-sm font-bold">Add</button>
                </form>
                <button onClick={handleLogout} className="text-xs text-slate-500 font-bold uppercase hover:text-red-400">Sign Out</button>
                <img src={currentUser.picture} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
              </>
            ) : (
              <button onClick={handleLogin} className="bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold">Login</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <h2 className="text-4xl font-black mb-6">Compare & Sync Profiles</h2>
            <p className="text-slate-500 max-w-md mb-8">Login with Google to track your competition and save your views.</p>
            <button
              onClick={handleLogin}
              className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-100 transition-all shadow-xl active:scale-95"
            >
              <i className="fa-brands fa-google text-xl"></i>
              SIGN IN WITH GOOGLE
            </button>
            {error?.isAuth && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs font-mono max-w-lg text-left">
                <p className="font-bold mb-1"><i className="fa-solid fa-triangle-exclamation mr-2"></i>Auth Error (403)</p>
                <p className="mb-2">{error.message}</p>
                <p className="text-slate-400">Tip: Check Supabase Dashboard {'>'} Authentication {'>'} URL Configuration {'>'} Redirect URLs.</p>
              </div>
            )}

            <div className="mt-16 text-center text-sm text-slate-500">
              <a href="/privacy.html" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
        ) : (
          <>
            {error && !error.isAuth && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold">{error.message}</div>}

            <div className="mb-6 flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="bg-slate-800 border border-slate-700 hover:border-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                  <i className="fa-solid fa-users"></i>
                  Select Users to View ({selectedForDisplay.length}/{usernames.length})
                  <i className={`fa-solid fa-chevron-down text-xs transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}></i>
                </button>

                {showUserDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
                    <div className="p-2 border-b border-slate-700 flex justify-between gap-2">
                      <button
                        onClick={() => setSelectedForDisplay(usernames)}
                        className="flex-1 text-xs font-bold text-slate-400 hover:text-slate-200 py-1 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedForDisplay([])}
                        className="flex-1 text-xs font-bold text-slate-400 hover:text-slate-200 py-1 bg-slate-700/50 hover:bg-slate-700 rounded transition-colors"
                      >
                        Deselect All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
                      {usernames.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">No users found</p>
                      ) : (
                        usernames.map(username => (
                          <label key={username} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedForDisplay.includes(username)}
                              onChange={() => toggleUserDisplay(username)}
                              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
                            />
                            <span className="text-sm font-medium">{username}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredAndSortedUsernames.map(u => statsMap[u] && (
                <StatsCard key={u} stats={statsMap[u]} onRemove={() => handleRemove(u)} onRefresh={() => fetchUserData(currentUser.id)} isLoading={isLoading} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {filteredAndSortedUsernames.map(u => statsMap[u] && (
                <TopicChart key={`topics-${u}`} stats={statsMap[u]} />
              ))}
            </div>

            <ActivityChart data={filteredAndSortedUsernames.map(u => statsMap[u]).filter(Boolean)} />
            <ComparisonChart data={filteredAndSortedUsernames.map(u => statsMap[u]).filter(Boolean)} />

            {showLeaderboard && (
              <Leaderboard
                users={filteredAndSortedUsernames.map(u => statsMap[u]).filter(Boolean)}
                onClose={() => setShowLeaderboard(false)}
              />
            )}

            <div className="mt-16 text-center text-sm text-slate-500 pb-8 flex space-x-4 justify-center">
              <a href="/privacy.html" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
