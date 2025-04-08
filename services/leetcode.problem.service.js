import axios from 'axios';

const LEETCODE_GRAPHQL = process.env.LEETCODE_GRAPHQL || 'https://leetcode.com/graphql';

// GraphQL query to fetch problem details by title slug
const getProblemQuery = (titleSlug) => ({
  query: `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        topicTags {
          name
          slug
        }
        codeSnippets {
          lang
          langSlug
          code
        }
        hints
        exampleTestcases
        sampleTestCase
        metaData
        enableRunCode
        isPaidOnly
        likes
        dislikes
      }
    }
  `,
  variables: {
    titleSlug
  }
});

export const fetchProblemByTitleSlug = async (titleSlug) => {
  try {
    console.log(`Fetching problem with title slug: ${titleSlug}`);
    
    const response = await axios.post(LEETCODE_GRAPHQL, getProblemQuery(titleSlug), {
      headers: { 'Content-Type': 'application/json' },
    });

    const problem = response.data.data.question;
    if (!problem) {
      throw new Error('Problem not found');
    }
    
    console.log(`Successfully fetched problem: ${problem.title}`);
    
    // Format the response similar to daily challenge
    return {
      questionId: problem.questionId,
      questionFrontendId: problem.questionFrontendId,
      questionTitle: problem.title,
      titleSlug: problem.titleSlug,
      difficulty: problem.difficulty,
      isPaidOnly: problem.isPaidOnly,
      question: problem.content,
      exampleTestcases: problem.exampleTestcases,
      sampleTestCase: problem.sampleTestCase,
      metaData: problem.metaData,
      codeSnippets: problem.codeSnippets,
      topicTags: problem.topicTags,
      hints: problem.hints,
      likes: problem.likes,
      dislikes: problem.dislikes,
      questionLink: `https://leetcode.com/problems/${titleSlug}/`,
      enableRunCode: problem.enableRunCode
    };
  } catch (error) {
    console.error('Error in fetchProblemByTitleSlug service:', error);
    
    // Check for specific error types
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Handle 404 errors specifically
      if (error.response.status === 404) {
        throw new Error('Problem not found');
      }
    }
    
    throw error;
  }
};