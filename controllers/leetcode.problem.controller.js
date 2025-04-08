import { fetchProblemByTitleSlug } from '../services/leetcode.problem.service.js';

export const getProblemByTitleSlug = async (req, res) => {
  try {
    const { titleSlug } = req.params;
    
    if (!titleSlug) {
      return res.status(400).json({ error: 'Problem title slug is required' });
    }
    
    console.log(`Fetching problem details for: ${titleSlug}`);
    
    const problem = await fetchProblemByTitleSlug(titleSlug);
    res.json(problem);
  } catch (error) {
    console.error('Error in getProblemByTitleSlug controller:', error);
    
    // Handle specific error cases
    if (error.message === 'Problem not found') {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch problem details' });
  }
};

export const submitProblemSolution = async (req, res) => {
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Extract and log headers for debugging
    const csrfToken = req.headers['x-csrftoken'];
    const cookiePresent = !!req.headers.cookie;
    const cookieLength = req.headers.cookie ? req.headers.cookie.length : 0;
    
    console.log('Submission request headers:', JSON.stringify({
      'Content-Type': req.headers['content-type'],
      'User-Agent': req.headers['user-agent'] ? 'User agent present' : 'User agent missing',
      'x-csrftoken': csrfToken ? 'CSRF token present' : 'CSRF token missing',
      'Cookie': cookiePresent ? `Cookie present (length: ${cookieLength})` : 'Cookie missing',
      'Origin': req.headers.origin,
      'Referer': req.headers.referer
    }, null, 2));

    // Get the title slug from the request body
    const { titleSlug } = req.body;
    if (!titleSlug) {
      return res.status(400).json({ error: 'Problem title slug is required' });
    }
    
    console.log('Problem titleSlug:', titleSlug);

    // Extract CSRF token from cookie if not in headers
    let extractedCsrfToken = csrfToken;
    if (!extractedCsrfToken && req.headers.cookie) {
      const csrfCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
      if (csrfCookie) {
        extractedCsrfToken = csrfCookie.split('=')[1].trim();
        console.log('Extracted CSRF token from cookie:', extractedCsrfToken);
      }
    }

    // Create headers object for the API call
    const headers = {
      cookie: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      csrfToken: extractedCsrfToken,
      origin: req.headers.origin || 'https://leetcode.com',
      referer: req.headers.referer || `https://leetcode.com/problems/${titleSlug}/`
    };

    console.log('Sending headers to service:', JSON.stringify({
      userAgent: headers.userAgent ? 'User agent present' : 'User agent missing',
      csrfToken: headers.csrfToken ? 'CSRF token present' : 'CSRF token missing',
      cookie: headers.cookie ? `Cookie present (length: ${headers.cookie.length})` : 'Cookie missing',
      origin: headers.origin,
      referer: headers.referer
    }, null, 2));

    // Import the submission service
    const { submitSolution } = await import('../services/leetcode.submission.service.js');
    
    // Submit the solution
    const submissionResult = await submitSolution(titleSlug, req.body, headers);
    console.log('Submission result:', JSON.stringify(submissionResult, null, 2));
    
    res.json(submissionResult);
  } catch (error) {
    console.error('Error in submitProblemSolution controller:', error);
    let errorMessage = 'Failed to submit solution';
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage += ` (Status: ${statusCode})`;
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Check for CSRF verification failure
      if (error.response.data && error.response.data.includes('CSRF verification failed')) {
        errorMessage = 'CSRF verification failed. Please ensure your browser has cookies enabled.';
        console.error('CSRF verification failed. Request headers:', JSON.stringify({
          'x-csrftoken': req.headers['x-csrftoken'] || 'missing',
          'Origin': 'https://leetcode.com',
          'Referer': 'https://leetcode.com/'
        }, null, 2));
      }
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
};

export const submitProblemSolutionAsProxy = async (req, res) => {
  try {
    // Extract the payload and headers from the request
    const { leetcodePayload, headers: clientHeaders } = req.body;
    
    // Validate that all required headers are present
    if (!clientHeaders || !clientHeaders.Cookie || !clientHeaders['x-csrftoken']) {
      return res.status(400).json({ 
        error: 'Missing required authentication headers. Please ensure you are logged into LeetCode.'
      });
    }
    
    // Get the title slug from the payload
    const { titleSlug } = leetcodePayload;
    if (!titleSlug) {
      return res.status(400).json({ error: 'Problem title slug is required' });
    }
    
    console.log('Proxy submission request received');
    console.log('LeetCode payload:', JSON.stringify(leetcodePayload));
    console.log('Client headers present:', {
      'x-csrftoken': clientHeaders['x-csrftoken'] ? 'Present' : 'Missing',
      'Cookie': clientHeaders.Cookie ? 'Present (length: ' + clientHeaders.Cookie.length + ')' : 'Missing',
      'Origin': clientHeaders.Origin || 'Missing',
      'Referer': clientHeaders.Referer || 'Missing'
    });
    
    // Make sure all required headers are properly set
    const axiosHeaders = {
      'Content-Type': 'application/json',
      'Cookie': clientHeaders.Cookie,
      'User-Agent': clientHeaders['User-Agent'] || 'Mozilla/5.0',
      'x-csrftoken': clientHeaders['x-csrftoken'],
      'Origin': clientHeaders.Origin || 'https://leetcode.com',
      'Referer': clientHeaders.Referer || `https://leetcode.com/problems/${titleSlug}/`,
      'Host': 'leetcode.com'
    };

    // Make direct request to LeetCode API
    const axios = (await import('axios')).default;
    const submissionUrl = `https://leetcode.com/problems/${titleSlug}/submit/`;
    
    console.log('Making direct request to LeetCode API:', submissionUrl);
    
    try {
      const response = await axios.post(submissionUrl, leetcodePayload, {
        headers: axiosHeaders
      });
      
      console.log('Direct submission successful:', response.status);
      
      if (response.data && response.data.submission_id) {
        console.log('Submission ID:', response.data.submission_id);
        res.json(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        res.status(500).json({ 
          error: 'Unexpected response from LeetCode API',
          details: response.data 
        });
      }
    } catch (apiError) {
      console.error('LeetCode API error:', apiError.message);
      
      if (apiError.response) {
        const statusCode = apiError.response.status;
        console.error('API response status:', statusCode);
        console.error('API response data:', JSON.stringify(apiError.response.data, null, 2));
        
        // Handle specific errors
        if (statusCode === 403) {
          return res.status(403).json({ 
            error: 'Authentication failed. Your LeetCode session may have expired. Please log in again.',
            details: apiError.response.data
          });
        }
        
        res.status(statusCode).json({ 
          error: apiError.response.data?.error || 'LeetCode API error',
          details: apiError.response.data
        });
      } else {
        res.status(500).json({ error: 'Failed to submit to LeetCode API: ' + apiError.message });
      }
    }
  } catch (error) {
    console.error('Error in proxy submission:', error);
    res.status(500).json({ error: 'Failed to process submission request: ' + error.message });
  }
};