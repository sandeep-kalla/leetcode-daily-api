import axios from 'axios';

const LEETCODE_GRAPHQL = process.env.LEETCODE_GRAPHQL || 'https://leetcode.com/graphql';

const query = {
  query: `
    query questionOfToday {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          questionId
          questionFrontendId
          title
          titleSlug
          difficulty
          isPaidOnly
          content
          topicTags {
            name
            slug
          }
          hints
          solution {
            id
            canSeeDetail
            paidOnly
            hasVideoSolution
            paidOnlyVideo
          }
          exampleTestcases
          likes
          dislikes
          similarQuestions
        }
      }
    }
  `,
};

export const fetchDailyChallenge = async () => {
  try {
    const response = await axios.post(LEETCODE_GRAPHQL, query, {
      headers: { 'Content-Type': 'application/json' },
    });

    const dailyChallenge = response.data.data.activeDailyCodingChallengeQuestion;
    if (!dailyChallenge) {
      throw new Error('No daily challenge found');
    }

    const question = dailyChallenge.question;
    
    return {
      questionLink: 'https://leetcode.com' + dailyChallenge.link,
      date: dailyChallenge.date,
      questionId: question.questionId,
      questionFrontendId: question.questionFrontendId,
      questionTitle: question.title,
      titleSlug: question.titleSlug,
      difficulty: question.difficulty,
      isPaidOnly: question.isPaidOnly,
      question: question.content,
      exampleTestcases: question.exampleTestcases,
      topicTags: question.topicTags,
      hints: question.hints,
      solution: question.solution,
      likes: question.likes,
      dislikes: question.dislikes,
      similarQuestions: question.similarQuestions,
    };
  } catch (error) {
    console.error('Error in fetchDailyChallenge service:', error);
    throw error;
  }
};