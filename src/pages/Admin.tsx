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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Admin = () => {
  const { isAuthenticated } = useAuth();
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

  const handleLogin = () => {
    const success = login(username, password);
    if (success) {
      setIsLoginDialogOpen(false);
    } else {
      alert('Credenciais inválidas');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isLoginDialogOpen} onClose={() => navigate('/')}>
        <DialogTitle>Login Administrativo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Usuário"
            type="text"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Senha"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/')}>Cancelar</Button>
          <Button onClick={handleLogin}>Entrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 12, pb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Painel Administrativo
        </Typography>

        <Paper sx={{ width: '100%', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            centered
          >
            <Tab label="Agendamentos" />
            <Tab label="Estatísticas" />
            <Tab label="Configurações" />
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