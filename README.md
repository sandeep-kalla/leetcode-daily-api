# LeetCode Backend API Documentation

This backend provides a set of APIs that interact with LeetCode's services, allowing you to fetch problems, submit solutions, and check submission statuses.

## Table of Contents

- [Authentication](#authentication)
- [Daily Challenge](#daily-challenge)
- [Problem-Specific Routes](#problem-specific-routes)
- [Submission Status](#submission-status)

## Authentication

### Check Authentication Status

```
GET /api/leetcode/auth-check
```

**Description:** Checks if the user is authenticated with LeetCode.

**Headers Required:**
- `cookie` (optional): LeetCode session cookies
- `x-csrftoken` (optional): CSRF token from LeetCode

**Response:**
```json
{
  "isAuthenticated": true|false,
  "username": "username",
  "cookies": { /* cookie data if available */ },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Fetch Cookies from LeetCode

```
GET /api/leetcode/fetch-cookies
```

**Description:** Special endpoint to directly fetch cookies from LeetCode, useful for browsers with strict CORS policies.

**Response:**
```json
{
  "isAuthenticated": true|false,
  "username": "username",
  "cookies": { /* cookie data */ },
  "csrfToken": "token",
  "sessionCookie": "cookie",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Daily Challenge

### Get Daily Challenge

```
GET /api/leetcode/daily
```

**Description:** Fetches the current LeetCode daily challenge.

**Response:**
```json
{
  "titleSlug": "problem-title-slug",
  /* other problem details */
}
```

### Submit Daily Challenge Solution

```
POST /api/leetcode/daily/submit
```

**Description:** Submits a solution for the daily challenge.

**Headers Required:**
- `cookie`: LeetCode session cookies
- `x-csrftoken`: CSRF token from LeetCode
- `content-type`: application/json

**Request Body:**
```json
{
  "lang": "python3",
  "question_id": "123",
  "typed_code": "def solution(nums):\n    return sum(nums)"
}
```

**Response:**
```json
{
  "submission_id": "123456789"
}
```

### Submit Daily Challenge Solution (Proxy Method)

```
POST /api/leetcode/daily/submit-as-proxy
```

**Description:** Alternative method to submit a solution for the daily challenge using a proxy approach.

**Request Body:**
```json
{
  "leetcodePayload": {
    "lang": "python3",
    "question_id": "123",
    "typed_code": "def solution(nums):\n    return sum(nums)"
  },
  "headers": {
    "Cookie": "LEETCODE_SESSION=abc123; csrftoken=xyz789",
    "x-csrftoken": "xyz789",
    "User-Agent": "Mozilla/5.0...",
    "Origin": "https://leetcode.com",
    "Referer": "https://leetcode.com/problems/..."
  }
}
```

**Response:**
```json
{
  "submission_id": "123456789"
}
```

## Problem-Specific Routes

### Get Problem by Title Slug

```
GET /api/leetcode/problems/:titleSlug
```

**Description:** Fetches a specific LeetCode problem by its title slug.

**URL Parameters:**
- `titleSlug`: The title slug of the problem (e.g., "two-sum")

**Response:**
```json
{
  "titleSlug": "two-sum",
  /* problem details */
}
```

### Submit Problem Solution

```
POST /api/leetcode/problems/submit
```

**Description:** Submits a solution for any LeetCode problem.

**Headers Required:**
- `cookie`: LeetCode session cookies
- `x-csrftoken`: CSRF token from LeetCode
- `content-type`: application/json

**Request Body:**
```json
{
  "titleSlug": "two-sum",
  "lang": "python3",
  "question_id": "1",
  "typed_code": "def twoSum(nums, target):\n    # solution code"
}
```

**Response:**
```json
{
  "submission_id": "123456789"
}
```

### Submit Problem Solution (Proxy Method)

```
POST /api/leetcode/problems/submit-as-proxy
```

**Description:** Alternative method to submit a solution for any LeetCode problem using a proxy approach.

**Request Body:**
```json
{
  "leetcodePayload": {
    "titleSlug": "two-sum",
    "lang": "python3",
    "question_id": "1",
    "typed_code": "def twoSum(nums, target):\n    # solution code"
  },
  "headers": {
    "Cookie": "LEETCODE_SESSION=abc123; csrftoken=xyz789",
    "x-csrftoken": "xyz789",
    "User-Agent": "Mozilla/5.0...",
    "Origin": "https://leetcode.com",
    "Referer": "https://leetcode.com/problems/two-sum/"
  }
}
```

**Response:**
```json
{
  "submission_id": "123456789"
}
```

## Submission Status

### Check Submission Status

```
GET /api/leetcode/submissions/:submissionId/check
```

**Description:** Checks the status of a submission.

**URL Parameters:**
- `submissionId`: The ID of the submission to check

**Headers Required:**
- `cookie`: LeetCode session cookies
- `x-csrftoken`: CSRF token from LeetCode

**Response:**
```json
{
  "state": "SUCCESS",
  "status_code": 10,
  "lang": "python3",
  "runtime": "36 ms",
  "memory": "14.2 MB",
  "total_correct": "All test cases passed",
  "total_testcases": "57",
  "runtime_percentile": "95.21",
  "memory_percentile": "92.16",
  "status_runtime": "36 ms",
  "status_memory": "14.2 MB"
}
```

### Check Submission Status (Proxy Method)

```
POST /api/leetcode/submissions/check-as-proxy
```

**Description:** Alternative method to check the status of a submission using a proxy approach.

**Request Body:**
```json
{
  "submissionId": "123456789",
  "headers": {
    "Cookie": "LEETCODE_SESSION=abc123; csrftoken=xyz789",
    "x-csrftoken": "xyz789",
    "User-Agent": "Mozilla/5.0...",
    "Origin": "https://leetcode.com",
    "Referer": "https://leetcode.com/problems/..."
  }
}
```

**Response:**
```json
{
  "state": "SUCCESS",
  "status_code": 10,
  "lang": "python3",
  "runtime": "36 ms",
  "memory": "14.2 MB",
  "total_correct": "All test cases passed",
  "total_testcases": "57",
  "runtime_percentile": "95.21",
  "memory_percentile": "92.16",
  "status_runtime": "36 ms",
  "status_memory": "14.2 MB"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Missing required parameters
- `403 Forbidden`: Authentication issues
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side errors

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": { /* Additional error details if available */ }
}
```

## Authentication Notes

Most endpoints require LeetCode authentication. You need to:

1. Be logged into LeetCode in your browser
2. Pass the necessary cookies and CSRF token in your requests
3. For proxy methods, extract and pass these headers from your browser

The proxy methods are particularly useful for browsers with strict CORS policies or when direct cookie sharing is problematic.