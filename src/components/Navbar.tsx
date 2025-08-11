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
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FFD700, #B8860B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#000000',
              }}
            >
              M
            </Box>
            Barbearia do Miguel
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{ 
                  color: 'white', 
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {item.text}
              </Button>
            ))}
            {isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleAdminClick}
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ 
                    mx: 1,
                    background: 'linear-gradient(45deg, #f57c00, #ffad42)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #bb4d00, #f57c00)',
                    }
                  }}
                >
                  Admin
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{ 
                    mx: 1,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Sair
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleAdminClick}
                startIcon={<LoginIcon />}
                sx={{ 
                  mx: 1,
                  background: 'linear-gradient(45deg, #FFD700, #B8860B)',
                  color: '#000000',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #B8860B, #FFD700)',
                  }
                }}
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