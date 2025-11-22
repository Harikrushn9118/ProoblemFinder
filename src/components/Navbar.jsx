import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AppBar, Toolbar, Button, IconButton, Box, useTheme as muiTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';

function NavBar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const muiThemeObj = muiTheme();

  const isHome = location.pathname === '/';

  return (
    <AppBar position="static">
      <Toolbar>
        {!isHome && (
          <IconButton edge="start" color="inherit" component={Link} to="/">
            <HomeIcon />
          </IconButton>
        )}
        {isHome && (
          <>
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" component={Link} to="/compare">
              Compare Rating
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Your Stats
            </Button>
            <Button color="inherit" component={Link} to="/solve">
              Solve Problems
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
