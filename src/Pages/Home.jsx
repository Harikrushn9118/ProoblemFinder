import { useState } from 'react';
import CompareRating from './CompareRating';
import YourStats from './YourStats';
import SolveProblem from './SolveProblem';

function Home() {
  const [activeSection, setActiveSection] = useState('compare');

  return (
    <div className="container">
      <nav className="section-nav">
        <button 
          className={activeSection === 'compare' ? 'active' : ''} 
          onClick={() => setActiveSection('compare')}
        >
          Compare Rating
        </button>
        <button 
          className={activeSection === 'stats' ? 'active' : ''} 
          onClick={() => setActiveSection('stats')}
        >
          Your Stats
        </button>
        <button 
          className={activeSection === 'solve' ? 'active' : ''} 
          onClick={() => setActiveSection('solve')}
        >
          Solve Problem
        </button>
      </nav>

      <div className="section-content">
        {activeSection === 'compare' && <CompareRating />}
        {activeSection === 'stats' && <YourStats />}
        {activeSection === 'solve' && <SolveProblem />}
      </div>
    </div>
  );
}

export default Home;
  