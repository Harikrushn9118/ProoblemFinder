import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#333', color: 'white' }}>
      <Link to="/" style={{ margin: '0 10px', color: 'white' }}>Home</Link>
    </nav>
  );
}

export default NavBar;
