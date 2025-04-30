import { Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import SolveProblem from './Pages/solveproblem';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<SolveProblem />} />
      </Routes>
    </>
  );
}

export default App;
