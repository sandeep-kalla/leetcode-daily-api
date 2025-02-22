import express from 'express';
import { getDailyChallenge } from '../controllers/leetcode.controller.js';

const router = express.Router();

// Route to get LeetCode daily challenge
router.get('/daily', getDailyChallenge);

export default router;