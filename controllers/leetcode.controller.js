import { fetchDailyChallenge } from '../services/leetcode.service.js';

export const getDailyChallenge = async (req, res) => {
  try {
    const dailyChallenge = await fetchDailyChallenge();
    res.json(dailyChallenge);
  } catch (error) {
    console.error('Error in getDailyChallenge controller:', error);
    res.status(500).json({ error: 'Failed to fetch daily challenge' });
  }
};