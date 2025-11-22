import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Box } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

function Home() {
  const { theme } = useTheme();

  const cards = [
    {
      title: 'Compare Rating',
      description: 'Compare your rating progress with friends and track improvements',
      icon: <CompareArrowsIcon />,
      link: '/compare',
      buttonText: 'Get Started'
    },
    {
      title: 'Your Stats',
      description: 'Analyze your performance, contest history, and problem-solving patterns',
      icon: <BarChartIcon />,
      link: '/stats',
      buttonText: 'View Stats'
    },
    {
      title: 'Solve Problems',
      description: 'Find problems by rating and tags, track your progress, and bookmark favorites',
      icon: <LightbulbIcon />,
      link: '/solve',
      buttonText: 'Find Problems'
    }
  ];

  return (
    <div className="home-page">
      {/* Premium Glassmorphism Hero Section */}
      <section className="hero-section">
        <div className="hero-gradient-bg"></div>
        <div className="hero-content fade-in-up">
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">CP World</span>
          </h1>
          <p className="hero-subtitle">
            Your ultimate companion for Competitive Programming on Codeforces
          </p>
          <div className="hero-decoration">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
          </div>
        </div>
      </section>

      {/* Premium 3-Column Grid Cards */}
      <section className="features-section">
        <div className="features-container">
          {cards.map((card, index) => (
            <div 
              key={index}
              className="feature-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="card-icon-container">
                <div className="icon-wrapper floating-icon">
                  {card.icon}
                </div>
                <div className="icon-glow"></div>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <Link to={card.link} className="card-button">
                <span>{card.buttonText}</span>
                <svg className="button-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
  