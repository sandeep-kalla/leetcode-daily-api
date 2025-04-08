import axios from 'axios';

const LEETCODE_BASE_URL = 'https://leetcode.com';

export const submitSolution = async (questionTitleSlug, submissionData, headers) => {
  try {
    const submissionUrl = `${LEETCODE_BASE_URL}/problems/${questionTitleSlug}/submit/`;

    // Format the submission data according to LeetCode's API requirements
    const formattedData = {
      lang: submissionData.lang,
      question_id: submissionData.question_id,
      typed_code: submissionData.typed_code
    };
    
    console.log('Submission URL:', submissionUrl);
    console.log('Formatted submission data:', JSON.stringify(formattedData, null, 2));
    console.log('Question title slug:', questionTitleSlug);
    
    // Log available headers
    console.log('Available headers for CSRF:', {
      csrfToken: headers.csrfToken || 'missing',
      'x-csrftoken': headers['x-csrftoken'] || 'missing',
      cookieLength: headers.cookie ? headers.cookie.length : 0
    });

    // Extract the CSRF token from the cookie if it's not provided in the headers
    let csrfToken = headers.csrfToken;
    if (!csrfToken && headers.cookie) {
      const csrfCookie = headers.cookie.split(';').find(c => c.trim().startsWith('csrftoken='));
      if (csrfCookie) {
        csrfToken = csrfCookie.split('=')[1].trim();
        console.log('Extracted CSRF token from cookie:', csrfToken);
      }
    }

    // Prepare headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Cookie': headers.cookie,
      'Referer': `${LEETCODE_BASE_URL}/problems/${questionTitleSlug}/`,
      'User-Agent': headers.userAgent,
      'x-csrftoken': csrfToken,
      'Origin': headers.origin || LEETCODE_BASE_URL,
      'Host': 'leetcode.com'
    };

    console.log('Request headers:', JSON.stringify({
      'Content-Type': requestHeaders['Content-Type'],
      'Referer': requestHeaders['Referer'],
      'User-Agent': 'User agent present',
      'x-csrftoken': requestHeaders['x-csrftoken'] ? 'CSRF token present' : 'CSRF token missing',
      'Cookie': headers.cookie ? 'Cookie present (length: ' + headers.cookie.length + ')' : 'Cookie missing'
    }, null, 2));

    // Make submission request
    const response = await axios.post(submissionUrl, formattedData, {
      headers: requestHeaders
    });

    console.log('Submission response status:', response.status);
    console.log('Submission response data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('Error in submitSolution service:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
};