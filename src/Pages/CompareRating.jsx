import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getUserInfo, getUserRatingHistory, calculateRatingStats, getRankTitle } from '../services/codeforcesService';
import { Container, Typography, TextField, Button, Grid, Card, CardContent, Box, Alert, CircularProgress, Chip, Divider } from '@mui/material';

function CompareRating() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [userData, setUserData] = useState({ user1: null, user2: null });
  const [ratingData, setRatingData] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const compareUsers = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [user1Info, user2Info, user1History, user2History] = await Promise.all([
        getUserInfo(user1),
        getUserInfo(user2),
        getUserRatingHistory(user1),
        getUserRatingHistory(user2)
      ]);

      // Calculate stats for both users
      const user1Stats = calculateRatingStats(user1History);
      const user2Stats = calculateRatingStats(user2History);

      const user1Data = {
        ...user1Info,
        stats: user1Stats,
        rankTitle: getRankTitle(user1Stats.maxRating)
      };

      const user2Data = {
        ...user2Info,
        stats: user2Stats,
        rankTitle: getRankTitle(user2Stats.maxRating)
      };

      setUserData({ user1: user1Data, user2: user2Data });

      // Prepare rating history data for graph - use time-based approach
      const allContests = new Map();
      
      user1History.forEach(entry => {
        const key = entry.contestId;
        if (!allContests.has(key)) {
          allContests.set(key, {
            contestId: entry.contestId,
            contestName: entry.contestName,
            user1Rating: null,
            user2Rating: null,
            user1Rank: null,
            user2Rank: null,
          });
        }
        const contest = allContests.get(key);
        contest.user1Rating = entry.newRating;
        contest.user1Rank = entry.rank;
      });

      user2History.forEach(entry => {
        const key = entry.contestId;
        if (!allContests.has(key)) {
          allContests.set(key, {
            contestId: entry.contestId,
            contestName: entry.contestName,
            user1Rating: null,
            user2Rating: null,
            user1Rank: null,
            user2Rank: null,
          });
        }
        const contest = allContests.get(key);
        contest.user2Rating = entry.newRating;
        contest.user2Rank = entry.rank;
      });

      // Convert to array and sort by contest ID
      const combinedData = Array.from(allContests.values()).sort((a, b) => a.contestId - b.contestId);
      setRatingData(combinedData);

      // Calculate comparison metrics
      const comparison = {
        ratingDiff: user1Data.rating - user2Data.rating,
        maxRatingDiff: user1Stats.maxRating - user2Stats.maxRating,
        contestsDiff: user1Stats.totalContests - user2Stats.totalContests,
        avgRankDiff: user1Stats.averageRank - user2Stats.averageRank,
        increasedDiff: user1Stats.increased - user2Stats.increased,
      };

      setComparisonData(comparison);
    } catch (error) {
      setError('Error fetching user data. Please check the usernames and try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ label, value, color = 'var(--text-color)' }) => (
    <Box sx={{ textAlign: 'center', p: 2 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          mb: 1,
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="h6"
        sx={{ 
          color: color,
          fontSize: '1.5rem',
          fontWeight: 700
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  const UserStats = ({ user, data, color }) => {
    if (!data) return null;
    return (
      <Card 
        sx={{ 
          height: '100%',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all var(--transition-base)',
          '&:hover': {
            boxShadow: 'var(--shadow-lg)',
            transform: 'translateY(-4px)',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: color,
                mr: 2,
                boxShadow: `0 0 10px ${color}40`
              }}
            />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: 'var(--text-color)',
                fontSize: '1.5rem'
              }}
            >
              {user}
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Current Rating:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: 'var(--text-color)',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.rating}
                </Typography>
                <Chip 
                  label={getRankTitle(data.rating)} 
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    fontSize: '0.75rem',
                    height: 20
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Max Rating:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: 'var(--text-color)',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.stats.maxRating}
                </Typography>
                <Chip 
                  label={data.rankTitle} 
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    fontSize: '0.75rem',
                    height: 20
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Total Contests:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: 'var(--text-color)',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.stats.totalContests}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Average Rank:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: 'var(--text-color)',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.stats.averageRank}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Rating Increased:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: '#4caf50',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.stats.increased} times
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    mb: 0.5,
                    fontWeight: 500
                  }}
                >
                  Rating Decreased:
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: '#f44336',
                    fontSize: '1.125rem',
                    fontWeight: 600
                  }}
                >
                  {data.stats.decreased} times
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ 
          mb: 4,
          fontWeight: 700,
          color: 'var(--text-color)',
          fontSize: '2rem'
        }}
      >
        Compare Rating
      </Typography>
      
      <Box component="form" onSubmit={compareUsers} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="First Username"
              value={user1}
              onChange={(e) => setUser1(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    display: 'none',
                  },
                  '&:hover fieldset': {
                    display: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    display: 'none',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Second Username"
              value={user2}
              onChange={(e) => setUser2(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    display: 'none',
                  },
                  '&:hover fieldset': {
                    display: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    display: 'none',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Compare'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {userData.user1 && userData.user2 && (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          {/* Comparison Summary */}
          {comparisonData && (
            <Card 
              sx={{ 
                mb: 4,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: 'var(--text-color)',
                    fontSize: '1.25rem'
                  }}
                >
                  Comparison Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <StatBox 
                      label="Rating Difference" 
                      value={comparisonData.ratingDiff > 0 ? `+${comparisonData.ratingDiff}` : comparisonData.ratingDiff}
                      color={comparisonData.ratingDiff > 0 ? '#4caf50' : comparisonData.ratingDiff < 0 ? '#f44336' : 'var(--text-color)'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <StatBox 
                      label="Max Rating Diff" 
                      value={comparisonData.maxRatingDiff > 0 ? `+${comparisonData.maxRatingDiff}` : comparisonData.maxRatingDiff}
                      color={comparisonData.maxRatingDiff > 0 ? '#4caf50' : comparisonData.maxRatingDiff < 0 ? '#f44336' : 'var(--text-color)'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <StatBox 
                      label="Contests Difference" 
                      value={comparisonData.contestsDiff > 0 ? `+${comparisonData.contestsDiff}` : comparisonData.contestsDiff}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <StatBox 
                      label="Avg Rank Diff" 
                      value={comparisonData.avgRankDiff > 0 ? `+${comparisonData.avgRankDiff}` : comparisonData.avgRankDiff}
                      color={comparisonData.avgRankDiff < 0 ? '#4caf50' : comparisonData.avgRankDiff > 0 ? '#f44336' : 'var(--text-color)'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <StatBox 
                      label="Increases Diff" 
                      value={comparisonData.increasedDiff > 0 ? `+${comparisonData.increasedDiff}` : comparisonData.increasedDiff}
                      color={comparisonData.increasedDiff > 0 ? '#4caf50' : comparisonData.increasedDiff < 0 ? '#f44336' : 'var(--text-color)'}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* User Stats Cards */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <UserStats user={user1} data={userData.user1} color="#8884d8" />
            </Grid>
            <Grid item xs={12} md={6}>
              <UserStats user={user2} data={userData.user2} color="#82ca9d" />
            </Grid>
          </Grid>

          {/* Rating History Chart */}
          <Card 
            sx={{ 
              mb: 4,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-base)',
              '&:hover': {
                boxShadow: 'var(--shadow-lg)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  color: 'var(--text-color)',
                  fontSize: '1.25rem'
                }}
              >
                Rating History Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="contestId" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-color)'
                    }}
                    formatter={(value, name) => {
                      if (value === null) return ['N/A', name === 'user1Rating' ? user1 : user2];
                      return [`Rating: ${value}`, name === 'user1Rating' ? user1 : user2];
                    }}
                    labelFormatter={(contestId) => {
                      const contest = ratingData.find(d => d.contestId === contestId);
                      return contest ? `Contest: ${contest.contestName}` : `Contest: ${contestId}`;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'var(--text-color)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="user1Rating" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name={user1}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="user2Rating" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name={user2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stats Comparison Bar Chart */}
          <Card 
            sx={{ 
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-base)',
              '&:hover': {
                boxShadow: 'var(--shadow-lg)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  fontWeight: 700,
                  color: 'var(--text-color)',
                  fontSize: '1.25rem'
                }}
              >
                Statistics Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Total Contests', [user1]: userData.user1.stats.totalContests, [user2]: userData.user2.stats.totalContests },
                  { name: 'Rating Increased', [user1]: userData.user1.stats.increased, [user2]: userData.user2.stats.increased },
                  { name: 'Rating Decreased', [user1]: userData.user1.stats.decreased, [user2]: userData.user2.stats.decreased },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-color)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'var(--text-color)' }}
                  />
                  <Bar dataKey={user1} fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={user2} fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default CompareRating;
