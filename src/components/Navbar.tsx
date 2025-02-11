import { AppBar, Toolbar, Typography, Button, IconButton, Box, Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Início', path: '/' },
    { text: 'Agendar', path: '/agendar' },
  ];

  const drawer = (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton component={Link} to={item.path} onClick={handleDrawerToggle}>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
      {isAuthenticated ? (
        <>
          <ListItem disablePadding>
            <ListItemButton onClick={handleAdminClick}>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </>
      ) : (
        <ListItem disablePadding>
          <ListItemButton onClick={handleAdminClick}>
            <ListItemText primary="Login" />
          </ListItemButton>
        </ListItem>
      )}
    </List>
  );

  return (
    <>
      <AppBar position="fixed" color="transparent" sx={{ background: 'rgba(0, 0, 0, 0.8)' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Barbearia do Miguel
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{ color: 'white', mx: 1 }}
              >
                {item.text}
              </Button>
            ))}
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleAdminClick}
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ mx: 1 }}
                >
                  Admin
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ mx: 1 }}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                onClick={handleAdminClick}
                startIcon={<LoginIcon />}
                sx={{ mx: 1 }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Toolbar />
    </>
  );
};

export default Navbar; 