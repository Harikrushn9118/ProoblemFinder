import { Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import Home from './Pages/Home';
import CompareRating from './Pages/CompareRating';
import YourStats from './Pages/YourStats';
import SolveProblem from './Pages/solveproblem';

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
