import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  getUserInfo, 
  getUserSubmissions, 
  getUserRatingHistory,
  analyzeProblemTags,
  analyzeProblemRatings,
  getRankTitle
} from '../services/codeforcesService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function YourStats() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [tagStats, setTagStats] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [recentContests, setRecentContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserStats = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [userInfo, submissions, ratingHistory] = await Promise.all([
        getUserInfo(username),
        getUserSubmissions(username),
        getUserRatingHistory(username)
      ]);

      setUserData(userInfo);
      setTagStats(analyzeProblemTags(submissions));
      setRatingStats(analyzeProblemRatings(submissions));
      setRecentContests(ratingHistory.slice(-5).reverse());
    } catch (error) {
      setError('Error fetching user data. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const UserInfoCard = ({ data }) => (
    <div className="user-info-card">
      <h3>{data.handle}</h3>
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Current Rank:</span>
          <span className="info-value">{getRankTitle(data.rating)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Rating:</span>
          <span className="info-value">{data.rating}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Max Rating:</span>
          <span className="info-value">{data.maxRating}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Contribution:</span>
          <span className="info-value">{data.contribution}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Friend Count:</span>
          <span className="info-value">{data.friendOfCount}</span>
        </div>
      </div>
    </div>
  );

  const ProblemTagsChart = ({ data }) => (
    <div className="chart-container">
      <h3>Problem Tags Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const RatingHeatmap = ({ data }) => (
    <div className="heatmap-container">
      <h3>Problems Solved by Rating</h3>
      <div className="rating-grid">
        {Object.entries(data).map(([rating, count]) => (
          <div key={rating} className="rating-item">
            <span className="rating-label">{rating}</span>
            <span className="rating-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const RecentContests = ({ contests }) => (
    <div className="recent-contests">
      <h3>Last 5 Contests</h3>
      <div className="contests-list">
        {contests.map((contest) => (
          <div key={contest.contestId} className="contest-item">
            <span className="contest-name">{contest.contestName}</span>
            <span className="contest-rank">Rank: {contest.rank}</span>
            <span className={`contest-delta ${contest.newRating - contest.oldRating > 0 ? 'positive' : 'negative'}`}>
              {contest.newRating - contest.oldRating > 0 ? '+' : ''}{contest.newRating - contest.oldRating}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h2>Your Stats</h2>
      <form onSubmit={fetchUserStats}>
        <div className="input-group">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Codeforces handle"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Get Stats'}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {userData && (
        <div className="stats-container">
          <UserInfoCard data={userData} />
          
          <ProblemTagsChart data={tagStats} />
          
          <div className="stats-row">
            <RatingHeatmap data={ratingStats} />
            <RecentContests contests={recentContests} />
          </div>
        </div>
      )}
    </div>
  );
}

export default YourStats;
  