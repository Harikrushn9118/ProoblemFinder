import { Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './pages/Home';
import CompareRating from './Pages/CompareRating';
import YourStats from './pages/YourStats';
import SolveProblem from './pages/solveproblem';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<CompareRating />} />
        <Route path="/stats" element={<YourStats />} />
        <Route path="/solve" element={<SolveProblem />} />
      </Routes>
    </>
  );
}

export default App;
