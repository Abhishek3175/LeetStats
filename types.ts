
export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | string;
  contestRating?: number;
  contributionPoints?: number;
  reputation?: number;
  recentActivity: {
    pastDay: number;
    pastWeek: number;
    pastMonth: number;
  };
  calendar: Record<string, number>;
  lastActiveTimestamp?: number;
  lastUpdated: number;
}

export interface UserProfile {
  username: string;
  stats?: LeetCodeStats;
  isError?: boolean;
}

export interface DashboardViewConfig {
  id: string;
  name: string;
  filter: {
    minEasy: number;
    minMedium: number;
    minHard: number;
    onlyWithContest: boolean;
  };
  sort: {
    key: 'totalSolved' | 'contestRating' | 'lastUpdated' | 'username';
    order: 'asc' | 'desc';
  };
}
