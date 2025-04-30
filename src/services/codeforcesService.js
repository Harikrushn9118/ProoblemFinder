// Common problem tags in Codeforces
export const PROBLEM_TAGS = [
    'implementation',
    'dp',
    'math',
    'greedy',
    'data structures',
    'brute force',
    'constructive algorithms',
    'graphs',
    'sortings',
    'binary search',
    'dfs and similar',
    'trees',
    'strings',
    'number theory',
    'combinatorics',
    'geometry',
    'bitmasks',
    'two pointers',
    'shortest paths',
    'probabilities'
];

// Fetch problems by rating and tags
export const getProblemsByRating = async (rating, tags = []) => {
    try {
        const response = await fetch('https://codeforces.com/api/problemset.problems');
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error('Failed to fetch problems');
        }

        let filteredProblems = data.result.problems.filter(problem => 
            problem.rating === parseInt(rating) &&
            (tags.length === 0 || tags.every(tag => problem.tags.includes(tag)))
        );

        // Limit to 50 problems and randomize the order
        if (filteredProblems.length > 50) {
            filteredProblems = filteredProblems
                .sort(() => Math.random() - 0.5)
                .slice(0, 50);
        }

        return filteredProblems;
    } catch (error) {
        console.error('Error fetching problems:', error);
        throw error;
    }
};

// Fetch user's solved problems
export const getUserSolvedProblems = async (username) => {
    try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
        const data = await response.json();
        
        if (data.status !== 'OK') {
            throw new Error('Failed to fetch user submissions');
        }

        const solvedProblems = new Set();
        data.result.forEach(submission => {
            if (submission.verdict === 'OK') {
                solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
            }
        });

        return solvedProblems;
    } catch (error) {
        console.error('Error fetching user solved problems:', error);
        throw error;
    }
}; 