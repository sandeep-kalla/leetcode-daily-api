import { checkSubmissionStatus } from '../services/leetcode.check.service.js';

export const checkSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Extract required headers from request
    const headers = {
      cookie: req.headers.cookie,
      userAgent: req.headers['user-agent'],
      csrfToken: req.headers['x-csrftoken']
    };

    // Check submission status
    const result = await checkSubmissionStatus(submissionId, headers);
    
    res.json(result);
  } catch (error) {
    console.error('Error in checkSubmission controller:', error);
    res.status(500).json({ error: 'Failed to check submission status' });
  }
};

export const checkSubmissionAsProxy = async (req, res) => {
  try {
    // Extract the submission ID and headers from the request
    const { submissionId, headers: clientHeaders } = req.body;
    
    // Validate that all required headers are present
    if (!clientHeaders || !clientHeaders.Cookie || !clientHeaders['x-csrftoken']) {
      return res.status(400).json({ 
        error: 'Missing required authentication headers. Please ensure you are logged into LeetCode.'
      });
    }
    
    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submission ID' });
    }
    
    console.log('Proxy status check request received for submission ID:', submissionId);
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
      'Referer': clientHeaders.Referer || 'https://leetcode.com/problems/',
      'Host': 'leetcode.com'
    };

    // Make direct request to LeetCode API
    const axios = (await import('axios')).default;
    const checkUrl = `https://leetcode.com/submissions/detail/${submissionId}/check/`;
    
    console.log('Making direct request to LeetCode API for status check:', checkUrl);
    
    try {
      const response = await axios.get(checkUrl, {
        headers: axiosHeaders
      });
      
      console.log('Status check successful:', response.status);
      
      // Send the data back to the client
      res.json(response.data);
    } catch (apiError) {
      console.error('LeetCode API error during status check:', apiError.message);
      
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
          error: apiError.response.data?.error || 'LeetCode API error during status check',
          details: apiError.response.data
        });
      } else {
        res.status(500).json({ error: 'Failed to check status with LeetCode API: ' + apiError.message });
      }
    }
  } catch (error) {
    console.error('Error in proxy status check:', error);
    res.status(500).json({ error: 'Failed to process status check request: ' + error.message });
  }
};