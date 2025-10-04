import { useState, useEffect } from 'react';
import { getProblemsByRating, getUserSolvedProblems, PROBLEM_TAGS } from '../services/codeforcesService';

function SolveProblem() {
  const [rating, setRating] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookmarkedProblems, setBookmarkedProblems] = useState(
    JSON.parse(localStorage.getItem('bookmarkedProblems')) || []
  );
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [username, setUsername] = useState('');

  useEffect(() => {
    localStorage.setItem('bookmarkedProblems', JSON.stringify(bookmarkedProblems));
  }, [bookmarkedProblems]);

  const fetchProblems = async () => {
    if (!rating) return;
    setLoading(true);
    setError('');
    try {
      const problems = await getProblemsByRating(rating, selectedTags);
      setProblems(problems);
    } catch (error) {
      setError('Error fetching problems');
    }
    setLoading(false);
  };

  const fetchSolvedProblems = async () => {
    if (!username) return;
    try {
      const solved = await getUserSolvedProblems(username);
      setSolvedProblems(solved);
    } catch (error) {
      setError('Error fetching solved problems');
    }
  };

  const toggleBookmark = (problem) => {
    const problemId = `${problem.contestId}-${problem.index}`;
    if (bookmarkedProblems.some(p => `${p.contestId}-${p.index}` === problemId)) {
      setBookmarkedProblems(bookmarkedProblems.filter(p => 
        `${p.contestId}-${p.index}` !== problemId
      ));
    } else {
      setBookmarkedProblems([...bookmarkedProblems, problem]);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(
      selectedTags.includes(tag)
        ? selectedTags.filter(t => t !== tag)
        : [...selectedTags, tag]
    );
  };

  return (
    <div className="solve-problem-container">
      <div className="filters-section">
        <div className="username-section">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Codeforces handle"
          />
          <button onClick={fetchSolvedProblems}>Track Progress</button>
        </div>

        <div className="rating-section">
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Select Rating</option>
            {[800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="tags-section">
          <h3>Problem Tags</h3>
          <div className="tags-grid">
            {PROBLEM_TAGS.map(tag => (
              <button
                key={tag}
                className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button onClick={fetchProblems} disabled={loading || !rating}>
          {loading ? 'Loading...' : 'Find Problems'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="problems-section">
        <h3>Problems</h3>
        <div className="problems-grid">
          {problems.map(problem => {
            const problemId = `${problem.contestId}-${problem.index}`;
            const isBookmarked = bookmarkedProblems.some(p => 
              `${p.contestId}-${p.index}` === problemId
            );
            const isSolved = solvedProblems.has(problemId);

            return (
              <div key={problemId} className={`problem-card ${isSolved ? 'solved' : ''}`}>
                <h4>{problem.name}</h4>
                <p>Rating: {problem.rating}</p>
                <div className="problem-tags">
                  {problem.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="problem-actions">
                  <a
                    href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solve
                  </a>
                  <button
                    className={`bookmark-button ${isBookmarked ? 'active' : ''}`}
                    onClick={() => toggleBookmark(problem)}
                  >
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bookmarked-section">
        <h3>Bookmarked Problems</h3>
        <div className="problems-grid">
          {bookmarkedProblems.map(problem => (
            <div key={`${problem.contestId}-${problem.index}`} className="problem-card">
              <h4>{problem.name}</h4>
              <p>Rating: {problem.rating}</p>
              <div className="problem-tags">
                {problem.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div className="problem-actions">
                <a
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solve
                </a>
                <button
                  className="bookmark-button active"
                  onClick={() => toggleBookmark(problem)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SolveProblem;
  