
import { LeetCodeStats } from "../types";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

// Multiple proxies to cycle through if one returns a 403 or 429
const PROXY_STRATEGIES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

const PROFILE_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submissionCalendar
    }
  }
`;

const CONTEST_QUERY = `
  query userContestRankingInfo($username: String!) {
    userContestRanking(username: $username) {
      rating
    }
  }
`;

const parseCalendar = (calendarStr: string) => {
  try {
    const calendar: Record<string, number> = JSON.parse(calendarStr || '{}');
    const now = Math.floor(Date.now() / 1000);
    const day = 86400;
    const week = day * 7;
    const month = day * 30;

    let pastDay = 0, pastWeek = 0, pastMonth = 0;

    Object.entries(calendar).forEach(([timestamp, count]) => {
      const ts = parseInt(timestamp);
      if (ts >= now - day) pastDay += count;
      if (ts >= now - week) pastWeek += count;
      if (ts >= now - month) pastMonth += count;
    });

    return { pastDay, pastWeek, pastMonth, calendar };
  } catch (e) {
    return { pastDay: 0, pastWeek: 0, pastMonth: 0, calendar: {} };
  }
};

async function gqlFetch(query: string, variables: any, strategyIndex = 0): Promise<any> {
  if (strategyIndex >= PROXY_STRATEGIES.length) {
    throw new Error("All proxy services failed to reach LeetCode (403/429). Please try again later.");
  }

  const url = PROXY_STRATEGIES[strategyIndex](LEETCODE_GRAPHQL_URL);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    // If forbidden or rate limited, try the next proxy
    if (response.status === 403 || response.status === 429) {
      console.warn(`Proxy strategy ${strategyIndex} failed with ${response.status}. Retrying with fallback...`);
      return gqlFetch(query, variables, strategyIndex + 1);
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (data.errors) throw new Error(data.errors[0]?.message || "GraphQL Error");
    return data.data;
  } catch (err: any) {
    console.error(`Proxy strategy ${strategyIndex} error:`, err.message);
    return gqlFetch(query, variables, strategyIndex + 1);
  }
}

export const fetchLeetCodeStats = async (username: string): Promise<LeetCodeStats> => {
  try {
    const [profileData, contestData] = await Promise.all([
      gqlFetch(PROFILE_QUERY, { username }),
      gqlFetch(CONTEST_QUERY, { username }).catch(() => ({ userContestRanking: null }))
    ]);

    const user = profileData?.matchedUser;
    if (!user) throw new Error(`User "${username}" not found.`);

    const stats = user.submitStatsGlobal.acSubmissionNum;
    const easy = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;
    const total = stats.find((s: any) => s.difficulty === "All")?.count || 0;

    const parsedCalendar = parseCalendar(user.submissionCalendar);

    return {
      username: user.username,
      totalSolved: total,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      ranking: user.profile.ranking || "N/A",
      contestRating: contestData?.userContestRanking?.rating || 0,
      reputation: user.profile.reputation || 0,
      recentActivity: {
        pastDay: parsedCalendar.pastDay,
        pastWeek: parsedCalendar.pastWeek,
        pastMonth: parsedCalendar.pastMonth,
      },
      calendar: parsedCalendar.calendar,
      lastActiveTimestamp: Date.now(),
      lastUpdated: Date.now()
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
