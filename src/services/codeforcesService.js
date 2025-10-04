import axios from 'axios';

const BASE_URL = 'https://codeforces.com/api';

export const getUserInfo = async (username) => {
  try {
    const res = await axios.get(`${BASE_URL}/user.info`, {
      params: { handles: username },
    });
    return res.data.result[0];
  } catch (error) {
    throw new Error('Error fetching user info');
  }
};

export const getUserRatingHistory = async (username) => {
  try {
    const res = await axios.get(`${BASE_URL}/user.rating`, {
      params: { handle: username },
    });
    return res.data.result;
  } catch (error) {
    throw new Error('Error fetching rating history');
  }
};

export const getUserSubmissions = async (username) => {
  try {
    const res = await axios.get(`${BASE_URL}/user.status`, {
      params: { handle: username },
    });
    return res.data.result;
  } catch (error) {
    throw new Error('Error fetching user submissions');
  }
};

export const getContestList = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/contest.list`);
    return res.data.result;
  } catch (error) {
    throw new Error('Error fetching contest list');
  }
};

// Helper function to analyze problem tags
export const analyzeProblemTags = (submissions) => {
  const tagCount = {};
  const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
  
  acceptedSubmissions.forEach(submission => {
    submission.problem.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCount).map(([tag, count]) => ({
    name: tag,
    value: count
  }));
};

// Helper function to analyze problem ratings
export const analyzeProblemRatings = (submissions) => {
  const ratingCount = {};
  const acceptedProblems = new Set();
  
  submissions.forEach(sub => {
    if (sub.verdict === 'OK') {
      const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!acceptedProblems.has(problemId) && sub.problem.rating) {
        ratingCount[sub.problem.rating] = (ratingCount[sub.problem.rating] || 0) + 1;
        acceptedProblems.add(problemId);
      }
    }
  });

  return ratingCount;
};

// Helper function to calculate rating changes statistics
export const calculateRatingStats = (ratingHistory) => {
  let increased = 0;
  let decreased = 0;
  let unchanged = 0;

  for (let i = 1; i < ratingHistory.length; i++) {
    const diff = ratingHistory[i].newRating - ratingHistory[i].oldRating;
    if (diff > 0) increased++;
    else if (diff < 0) decreased++;
    else unchanged++;
  }

  return {
    increased,
    decreased,
    unchanged,
    totalContests: ratingHistory.length,
    maxRating: Math.max(...ratingHistory.map(r => r.newRating)),
    averageRank: Math.round(
      ratingHistory.reduce((acc, curr) => acc + curr.rank, 0) / ratingHistory.length
    )
  };
};

// Helper function to get rank title based on rating
export const getRankTitle = (rating) => {
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2300) return 'Master';
  if (rating < 2400) return 'International Master';
  if (rating < 2600) return 'Grandmaster';
  if (rating < 3000) return 'International Grandmaster';
  return 'Legendary Grandmaster';
};

export const getProblemsByRating = async (rating, tags = []) => {
  try {
    const res = await axios.get(`${BASE_URL}/problemset.problems`);
    let problems = res.data.result.problems;
    
    if (rating) {
      problems = problems.filter(problem => problem.rating === parseInt(rating));
    }
    
    if (tags.length > 0) {
      problems = problems.filter(problem => 
        tags.every(tag => problem.tags.includes(tag))
      );
    }

    return problems.slice(0, 20); // Return first 20 problems
  } catch (error) {
    throw new Error('Error fetching problems');
  }
};

// Get user's solved problems
export const getUserSolvedProblems = async (username) => {
  try {
    const res = await axios.get(`${BASE_URL}/user.status`, {
      params: { handle: username },
    });
    const solvedProblems = new Set();
    res.data.result.forEach(submission => {
      if (submission.verdict === 'OK') {
        solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
      }
    });
    return solvedProblems;
  } catch (error) {
    throw new Error('Error fetching solved problems');
  }
};

// Common problem tags in Codeforces
export const PROBLEM_TAGS = [
  'implementation', 'dp', 'math', 'greedy', 'brute force',
  'data structures', 'constructive algorithms', 'dfs and similar',
  'sortings', 'binary search', 'graphs', 'trees', 'strings',
  'number theory', 'geometry', 'combinatorics', 'two pointers',
  'dsu', 'bitmasks', 'probabilities'
];
