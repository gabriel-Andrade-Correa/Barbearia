import { Box, Button, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from '../components/Navbar';

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1 }}>
        <div className="hero-section">
          <Container maxWidth="md">
            <div className="hero-content">
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Barbearia do Miguel
              </Typography>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                gutterBottom
                sx={{ mb: 4 }}
              >
                Estilo e qualidade para o seu visual
              </Typography>
              <StyledLink to="/agendar">
                <Button
                  variant="contained"
                  color="secondary"
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    margin: '16px',
                    padding: '12px 32px',
                    fontSize: '1.2rem',
                  }}
                >
                  Agendar Horário
                </Button>
              </StyledLink>
            </div>
          </Container>
        </div>
      </Box>
    </Box>
  );
};

export default Home; 