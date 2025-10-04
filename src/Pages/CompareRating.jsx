import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getUserInfo, getUserRatingHistory, calculateRatingStats, getRankTitle } from '../services/codeforcesService';

function CompareRating() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [userData, setUserData] = useState({ user1: null, user2: null });
  const [ratingData, setRatingData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const compareUsers = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch both user info and rating history
      const [user1Info, user2Info, user1History, user2History] = await Promise.all([
        getUserInfo(user1),
        getUserInfo(user2),
        getUserRatingHistory(user1),
        getUserRatingHistory(user2)
      ]);

      // Calculate stats for both users
      const user1Stats = calculateRatingStats(user1History);
      const user2Stats = calculateRatingStats(user2History);

      setUserData({
        user1: {
          ...user1Info,
          stats: user1Stats,
          rankTitle: getRankTitle(user1Stats.maxRating)
        },
        user2: {
          ...user2Info,
          stats: user2Stats,
          rankTitle: getRankTitle(user2Stats.maxRating)
        }
      });

      // Prepare rating history data for graph
      const combinedData = user1History.map((entry, index) => ({
        contestId: entry.contestId,
        user1Rating: entry.newRating,
        user2Rating: user2History[index]?.newRating || null,
        contestName: entry.contestName
      }));

      setRatingData(combinedData);
    } catch (error) {
      setError('Error fetching user data. Please check the usernames and try again.');
    } finally {
      setLoading(false);
    }
  };

  const UserStats = ({ user, data }) => {
    if (!data) return null;
    return (
      <div className="user-stats">
        <h3>{user}</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Current Rating:</span>
            <span className="stat-value">{data.rating}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max Rating:</span>
            <span className="stat-value">{data.stats.maxRating} ({data.rankTitle})</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Contests:</span>
            <span className="stat-value">{data.stats.totalContests}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Rank:</span>
            <span className="stat-value">{data.stats.averageRank}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rating Increased:</span>
            <span className="stat-value">{data.stats.increased} times</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Rating Decreased:</span>
            <span className="stat-value">{data.stats.decreased} times</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h2>Compare Rating</h2>
      <form onSubmit={compareUsers}>
        <div className="input-group">
          <input
            type="text"
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            placeholder="Enter first username"
            required
          />
          <input
            type="text"
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            placeholder="Enter second username"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {userData.user1 && userData.user2 && (
        <div className="comparison-container">
          <div className="stats-container">
            <UserStats user={user1} data={userData.user1} />
            <UserStats user={user2} data={userData.user2} />
          </div>
          
          <div className="graph-container">
            <h3>Rating History Comparison</h3>
            <LineChart width={800} height={400} data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="contestId" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`Rating: ${value}`, name === 'user1Rating' ? user1 : user2]}
                labelFormatter={(contestId) => `Contest: ${ratingData.find(d => d.contestId === contestId)?.contestName}`}
              />
              <Legend />
              <Line type="monotone" dataKey="user1Rating" stroke="#8884d8" name={user1} />
              <Line type="monotone" dataKey="user2Rating" stroke="#82ca9d" name={user2} />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompareRating;
