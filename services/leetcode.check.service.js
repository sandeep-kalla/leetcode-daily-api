import axios from 'axios';

const LEETCODE_BASE_URL = 'https://leetcode.com';
const POLLING_INTERVAL = 1000; // 1 second
const MAX_RETRIES = 60; // Maximum number of retries (60 seconds timeout)

export const checkSubmissionStatus = async (submissionId, headers) => {
  try {
    let retries = 0;
    
    while (retries < MAX_RETRIES) {
      const checkUrl = `${LEETCODE_BASE_URL}/submissions/detail/${submissionId}/check/`;
      
      // Prepare headers
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Cookie': headers.cookie,
        'Referer': `${LEETCODE_BASE_URL}/`,
        'User-Agent': headers.userAgent,
        'x-csrftoken': headers.csrfToken
      };

      // Make check request
      const response = await axios.get(checkUrl, {
        headers: requestHeaders
      });

      const { data } = response;

      // If we get a final state, return the result
      if (data.state === 'SUCCESS' || data.status_msg === 'Accepted' || data.state === 'FAILED') {
        return data;
      }

      // If still pending or started, wait and try again
      if (data.state === 'PENDING' || data.state === 'STARTED') {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        retries++;
        continue;
      }

      // For any other state, return the current data
      return data;
    }

    throw new Error('Submission check timed out');
  } catch (error) {
    console.error('Error in checkSubmissionStatus service:', error);
    throw error;
  }
};