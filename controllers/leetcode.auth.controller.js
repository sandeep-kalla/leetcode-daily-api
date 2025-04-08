import axios from 'axios';

export const checkAuthentication = async (req, res) => {
  console.log('Auth check request received');
  
  try {
    // Extract credentials if they were passed from client
    const clientHeaders = req.headers;
    const csrfToken = clientHeaders['x-csrftoken'];
    const cookieHeader = clientHeaders['cookie'];
    
    // Log what we received for debugging
    console.log('Client provided headers:', {
      hasCsrfToken: !!csrfToken,
      hasCookies: !!cookieHeader,
      cookieLength: cookieHeader ? cookieHeader.length : 0
    });
    
    // Create headers for request to LeetCode
    const headers = {
      'Content-Type': 'application/json',
      'Origin': 'https://leetcode.com',
      'Referer': 'https://leetcode.com/'
    };
    
    // Add authentication headers if provided
    if (csrfToken) {
      headers['x-csrftoken'] = csrfToken;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    // Make a request to LeetCode API to check authentication status
    const response = await axios.post('https://leetcode.com/graphql/', {
      query: `query getUserProfile { userStatus { userId username isSignedIn } }`
    }, { headers });

    console.log('LeetCode auth check response status:', response.status);
    
    // Check if the user is signed in according to the response
    const userStatus = response.data?.data?.userStatus;
    const isAuthenticated = !!userStatus?.isSignedIn;
    const username = userStatus?.username || null;
    
    console.log('Auth check result:', { 
      isAuthenticated, 
      username: username || 'Not signed in' 
    });
    
    // If authenticated and we have cookies in the response, extract them to help the client
    let extractedCookies = null;
    if (isAuthenticated && response.headers['set-cookie']) {
      extractedCookies = parseCookies(response.headers['set-cookie']);
      console.log('Extracted cookies from response:', Object.keys(extractedCookies));
    }
    
    // Return the authentication status and any cookies we found
    res.json({ 
      isAuthenticated,
      username,
      cookies: extractedCookies,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error checking authentication:', error.message);
    
    let errorDetails = {
      message: error.message
    };
    
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.data = error.response.data;
      console.error('API response error:', error.response.status, error.response.data);
    }
    
    // Even if there's an error, we send a 200 response with the error details
    // This is so the client can still process the result
    res.json({ 
      isAuthenticated: false,
      error: true,
      errorDetails,
      timestamp: new Date().toISOString()
    });
  }
};

// Special endpoint to directly fetch cookies from LeetCode for Firefox users
export const fetchCookiesFromLeetCode = async (req, res) => {
  console.log('Fetch cookies request received - workaround for browsers with strict CORS policies');
  
  try {
    // This is a two-step process:
    // 1. First we fetch the main page to get a CSRF token
    // 2. Then we try to query the GraphQL API to check authentication status
    
    // Step 1: Fetch the main page
    const mainPageResponse = await axios.get('https://leetcode.com', {
      withCredentials: true,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    // Extract cookies from the response
    const mainPageCookies = mainPageResponse.headers['set-cookie'] 
      ? parseCookies(mainPageResponse.headers['set-cookie'])
      : {};
    
    console.log('Cookies from main page:', Object.keys(mainPageCookies));
    
    // Step 2: Use these cookies to make a GraphQL request to verify login status
    let csrfToken = mainPageCookies.csrftoken || '';
    let sessionCookie = mainPageCookies.LEETCODE_SESSION || '';
    
    // Create a cookie string for the next request
    const cookieString = Object.entries(mainPageCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    console.log('Cookie string length:', cookieString.length);
    
    // Make GraphQL request to check authentication
    const graphqlResponse = await axios.post('https://leetcode.com/graphql/', {
      query: `query getUserProfile { userStatus { userId username isSignedIn } }`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieString,
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com',
        'x-csrftoken': csrfToken
      }
    });
    
    // Extract any additional cookies from the GraphQL response
    const graphqlCookies = graphqlResponse.headers['set-cookie'] 
      ? parseCookies(graphqlResponse.headers['set-cookie'])
      : {};
    
    console.log('Cookies from GraphQL:', Object.keys(graphqlCookies));
    
    // Merge cookies from both requests
    const allCookies = { ...mainPageCookies, ...graphqlCookies };
    
    // Check authentication status from response
    const userStatus = graphqlResponse.data?.data?.userStatus;
    const isAuthenticated = !!userStatus?.isSignedIn;
    const username = userStatus?.username || null;
    
    console.log('Auth status from cookie fetch:', { isAuthenticated, username });
    
    // Return all extracted information
    res.json({
      isAuthenticated,
      username,
      cookies: allCookies,
      csrfToken: allCookies.csrftoken || '',
      sessionCookie: allCookies.LEETCODE_SESSION || '',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching cookies:', error.message);
    
    let errorDetails = {
      message: error.message
    };
    
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.data = error.response.data;
      console.error('API response error:', error.response.status);
    }
    
    res.json({
      isAuthenticated: false,
      error: true,
      errorDetails,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to parse cookies from Set-Cookie headers
function parseCookies(setCookieHeaders) {
  const cookies = {};
  
  if (!setCookieHeaders) return cookies;
  
  // Handle both array and string formats
  const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  
  cookieArray.forEach(cookieString => {
    const parts = cookieString.split(';')[0].trim().split('=');
    if (parts.length >= 2) {
      const name = parts[0];
      const value = parts.slice(1).join('=');
      cookies[name] = value;
    }
  });
  
  return cookies;
} 