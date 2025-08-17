import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import AdminAgendamentos from '../components/AdminAgendamentos';
import AdminEstatisticas from '../components/AdminEstatisticas';
import AdminConfiguracoes from '../components/AdminConfiguracoes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

const Admin = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(!isAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    try {
      const success = await login(username, password);
      if (success) {
        setIsLoginDialogOpen(false);
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, redireciona para home
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog 
        open={isLoginDialogOpen} 
        onClose={() => navigate('/')}
        PaperProps={{
          sx: {
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFD700', fontWeight: 600 }}>
          🔐 Acesso Administrativo
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Usuário"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#FFD700',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 215, 0, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#FFD700',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => navigate('/')}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleLogin}
            sx={{ 
              background: 'linear-gradient(45deg, #FFD700, #B8860B)',
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #B8860B, #FFD700)',
              }
            }}
          >
            Entrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/Gui.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: { xs: 'scroll', sm: 'fixed' },
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '200px',
        background: 'linear-gradient(135deg, #000000 0%, rgba(255, 215, 0, 0.3) 100%)',
        zIndex: 0,
      }
    }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: { xs: 10, sm: 12 }, pb: 6, px: { xs: 1, sm: 2 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          background: 'rgba(26, 26, 26, 0.95)', 
          borderRadius: 3, 
          p: 4, 
          mb: 4,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
        }}>
          <Button
            onClick={handleLogout}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'linear-gradient(45deg, #dc3545, #c82333)',
              color: '#ffffff',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #c82333, #dc3545)',
              },
              zIndex: 1,
            }}
          >
            🚪 Sair
          </Button>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              textAlign: { xs: 'center', sm: 'left' },
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700, #B8860B)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Painel Administrativo
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              textAlign: { xs: 'center', sm: 'left' },
              mb: 3,
            }}
          >
            Gerencie seus agendamentos, visualize estatísticas e configure sua barbearia
          </Typography>
        </Box>

        <Paper sx={{ 
          width: '100%', 
          mb: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          background: 'rgba(26, 26, 26, 0.95)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          backdropFilter: 'blur(10px)',
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
              borderBottom: '1px solid rgba(255, 215, 0, 0.3)',
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: { xs: 2, sm: 4 },
                py: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                color: '#ffffff',
                '&.Mui-selected': {
                  color: '#FFD700',
                  background: 'rgba(255, 215, 0, 0.1)',
                },
                '&:hover': {
                  background: 'rgba(255, 215, 0, 0.05)',
                }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                background: 'linear-gradient(45deg, #FFD700, #B8860B)',
                borderRadius: '2px 2px 0 0',
              }
            }}
          >
            <Tab label="📅 Agendamentos" />
            <Tab label="📊 Estatísticas" />
            <Tab label="⚙️ Configurações" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <AdminAgendamentos />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <AdminEstatisticas />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <AdminConfiguracoes />
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Admin; 