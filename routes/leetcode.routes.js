import express from 'express';
import { getDailyChallenge } from '../controllers/leetcode.controller.js';
import { submitDailySolution, submitDailySolutionAsProxy } from '../controllers/leetcode.submission.controller.js';
import { checkSubmission, checkSubmissionAsProxy } from '../controllers/leetcode.check.controller.js';
import { checkAuthentication, fetchCookiesFromLeetCode } from '../controllers/leetcode.auth.controller.js';
import { getProblemByTitleSlug, submitProblemSolution, submitProblemSolutionAsProxy } from '../controllers/leetcode.problem.controller.js';

const router = express.Router();

// Route to get LeetCode daily challenge
router.get('/daily', getDailyChallenge);

// Route to submit solution for daily challenge
router.post('/daily/submit', submitDailySolution);

// Route to submit solution for daily challenge using proxy approach
router.post('/daily/submit-as-proxy', submitDailySolutionAsProxy);

// Route to check submission status
router.get('/submissions/:submissionId/check', checkSubmission);

// Route to check submission status using proxy approach
router.post('/submissions/check-as-proxy', checkSubmissionAsProxy);

// Auth check route
router.get('/auth-check', checkAuthentication);

// New route to fetch LeetCode cookies
router.get('/fetch-cookies', fetchCookiesFromLeetCode);

// Routes for any LeetCode problem (not just daily challenge)
router.get('/problems/:titleSlug', getProblemByTitleSlug);
router.post('/problems/submit', submitProblemSolution);
router.post('/problems/submit-as-proxy', submitProblemSolutionAsProxy);

export default router;