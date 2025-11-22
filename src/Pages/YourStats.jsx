import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import {
  getUserInfo,
  getUserSubmissions,
  getUserRatingHistory,
  analyzeProblemTags,
  analyzeProblemRatings,
  getRankTitle
} from '../services/codeforcesService';
import { Container, Typography, TextField, Button, Grid, Card, CardContent, Box, Alert, CircularProgress, List, ListItem, ListItemText, Chip } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];

function YourStats() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [tagStats, setTagStats] = useState([]);
  const [ratingStats, setRatingStats] = useState({});
  const [recentContests, setRecentContests] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserStats = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [userInfo, submissions, ratingHistoryData] = await Promise.all([
        getUserInfo(username),
        getUserSubmissions(username),
        getUserRatingHistory(username)
      ]);

      // Analyze submissions
      const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'OK');
      const totalSubmissions = submissions.length;
      const solvedProblems = new Set();
      acceptedSubmissions.forEach(sub => {
        solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
      });

      // Calculate submission stats
      const verdictCount = {};
      submissions.forEach(sub => {
        verdictCount[sub.verdict] = (verdictCount[sub.verdict] || 0) + 1;
      });

      setUserData(userInfo);
      setTagStats(analyzeProblemTags(submissions).slice(0, 10)); // Top 10 tags
      setRatingStats(analyzeProblemRatings(submissions));
      setRecentContests(ratingHistoryData.slice(-5).reverse());
      setRatingHistory(ratingHistoryData);

      setSubmissionStats({
        totalSubmissions,
        acceptedSubmissions: acceptedSubmissions.length,
        solvedProblems: solvedProblems.size,
        acceptanceRate: totalSubmissions > 0 ? ((acceptedSubmissions.length / totalSubmissions) * 100).toFixed(1) : 0,
        verdictCount
      });
    } catch (error) {
      setError('Error fetching user data. Please check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ label, value, color = 'var(--text-color)', icon }) => (
    <Box 
      sx={{ 
        textAlign: 'center', 
        p: 2,
        borderRadius: 'var(--radius-md)',
        background: 'var(--input-bg)',
        border: '1px solid var(--border-color)',
        transition: 'all var(--transition-base)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--shadow-sm)',
        }
      }}
    >
      {icon && <Box sx={{ mb: 1 }}>{icon}</Box>}
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

  const UserInfoCard = ({ data }) => (
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
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: 'var(--text-color)',
            fontSize: '1.5rem'
          }}
        >
          {data.handle}
        </Typography>
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
                Current Rank:
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'var(--text-color)',
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}
              >
                {getRankTitle(data.rating)}
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
                Rating:
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
                {data.maxRating}
              </Typography>
              <Chip 
                label={getRankTitle(data.maxRating)} 
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
                Contribution:
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'var(--text-color)',
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}
              >
                {data.contribution}
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
                Friend Count:
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'var(--text-color)',
                  fontSize: '1.125rem',
                  fontWeight: 600
                }}
              >
                {data.friendOfCount}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const ProblemTagsChart = ({ data }) => (
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
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: 'var(--text-color)',
            fontSize: '1.25rem'
          }}
        >
          Problem Tags Distribution
        </Typography>
        {data.length > 0 ? (
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
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-color)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              No tag data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const RatingHeatmap = ({ data }) => {
    const sortedRatings = Object.entries(data)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .slice(0, 20); // Show top 20 ratings

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
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              mb: 3,
              fontWeight: 700,
              color: 'var(--text-color)',
              fontSize: '1.25rem'
            }}
          >
            Problems Solved by Rating
          </Typography>
          {sortedRatings.length > 0 ? (
            <Grid container spacing={2}>
              {sortedRatings.map(([rating, count]) => (
                <Grid item xs={6} sm={4} md={3} key={rating}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5, 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--input-bg)',
                      transition: 'all var(--transition-base)',
                      '&:hover': {
                        borderColor: 'var(--border-focus)',
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-sm)',
                      }
                    }}
                  >
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'var(--text-color)',
                        fontWeight: 500
                      }}
                    >
                      {rating}:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ 
                        color: 'var(--border-focus)',
                        fontSize: '1rem'
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                No rating data available
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const RecentContests = ({ contests }) => (
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
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            mb: 3,
            fontWeight: 700,
            color: 'var(--text-color)',
            fontSize: '1.25rem'
          }}
        >
          Last 5 Contests
        </Typography>
        {contests.length > 0 ? (
          <List sx={{ p: 0 }}>
            {contests.map((contest, index) => (
              <ListItem 
                key={contest.contestId} 
                divider={index < contests.length - 1}
                sx={{
                  py: 2,
                  px: 0,
                  borderBottom: index < contests.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'all var(--transition-base)',
                  '&:hover': {
                    backgroundColor: 'var(--input-bg)',
                    borderRadius: 'var(--radius-sm)',
                    px: 1,
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: 'var(--text-color)',
                        fontWeight: 500,
                        mb: 0.5
                      }}
                    >
                      {contest.contestName}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                      }}
                    >
                      Rank: {contest.rank}
                    </Typography>
                  }
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: contest.newRating - contest.oldRating > 0 ? '#4caf50' : '#f44336',
                    fontWeight: 700,
                    fontSize: '1rem',
                    ml: 2
                  }}
                >
                  {contest.newRating - contest.oldRating > 0 ? '+' : ''}{contest.newRating - contest.oldRating}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              No contest history available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const RatingHistoryChart = ({ data }) => {
    const chartData = data.slice(-20).map(entry => ({
      contestId: entry.contestId,
      rating: entry.newRating,
      contestName: entry.contestName
    }));

    return (
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
            Rating History (Last 20 Contests)
          </Typography>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                  formatter={(value) => [`Rating: ${value}`, '']}
                  labelFormatter={(contestId) => {
                    const contest = chartData.find(d => d.contestId === contestId);
                    return contest ? `Contest: ${contest.contestName}` : `Contest: ${contestId}`;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                No rating history available
              </Typography>
            </Box>
          )}
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
        Your Stats
      </Typography>
      <Box component="form" onSubmit={fetchUserStats} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Your Codeforces Handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              {loading ? <CircularProgress size={24} /> : 'Get Stats'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {userData && (
        <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
          {/* Submission Stats */}
          {submissionStats && (
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
                  Submission Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <StatBox 
                      label="Total Submissions" 
                      value={submissionStats.totalSubmissions.toLocaleString()}
                      color="var(--text-color)"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatBox 
                      label="Accepted" 
                      value={submissionStats.acceptedSubmissions.toLocaleString()}
                      color="#4caf50"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatBox 
                      label="Solved Problems" 
                      value={submissionStats.solvedProblems.toLocaleString()}
                      color="#2196f3"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatBox 
                      label="Acceptance Rate" 
                      value={`${submissionStats.acceptanceRate}%`}
                      color="var(--border-focus)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* User Info and Tags */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <UserInfoCard data={userData} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProblemTagsChart data={tagStats} />
            </Grid>
          </Grid>

          {/* Rating Heatmap and Recent Contests */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <RatingHeatmap data={ratingStats} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RecentContests contests={recentContests} />
            </Grid>
          </Grid>

          {/* Rating History Chart */}
          {ratingHistory.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <RatingHistoryChart data={ratingHistory} />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default YourStats;