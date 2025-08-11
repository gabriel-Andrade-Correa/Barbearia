import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { statisticsService } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface PieDataItem {
  name: string;
  value: number;
}

interface DailyData {
  date: string;
  appointments: number;
}

const AdminEstatisticas = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('semana');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    averagePerDay: 0,
    mostPopularService: '',
    cancellationRate: 0,
  });
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [pieData, setPieData] = useState<PieDataItem[]>([]);

  useEffect(() => {
    loadStatistics();
  }, [periodoSelecionado]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate;

    switch (periodoSelecionado) {
      case 'semana':
        // Buscar dados dos últimos 30 dias para ter mais dados para mostrar
        startDate = subDays(endDate, 30);
        break;
      case 'mes':
        startDate = subMonths(endDate, 1);
        break;
      case 'ano':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subDays(endDate, 30);
    }

    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    };
  };

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      console.log('🔍 AdminEstatisticas - Carregando estatísticas...');
      console.log('📅 Período selecionado:', periodoSelecionado);
      console.log('📅 Data início:', startDate);
      console.log('📅 Data fim:', endDate);
      
      const [appointmentStats, serviceDistribution] = await Promise.all([
        statisticsService.getAppointmentStats(startDate, endDate),
        statisticsService.getServiceDistribution(),
      ]);

      console.log('📊 Estatísticas recebidas:', appointmentStats);
      console.log('📊 Distribuição de serviços:', serviceDistribution);

      setStats({
        totalAppointments: appointmentStats.total || 0,
        averagePerDay: appointmentStats.average_per_day || 0,
        mostPopularService: appointmentStats.most_popular_service || '',
        cancellationRate: appointmentStats.cancellation_rate || 0,
      });

      setDailyData(appointmentStats.daily_appointments || []);
      setPieData(serviceDistribution || []);
      
      console.log('✅ Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoChange = (event: any) => {
    setPeriodoSelecionado(event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={{ xs: 1, sm: 3 }}>
        {/* Cards de estatísticas */}
        <Grid item xs={6} sm={6} md={3}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 215, 0, 0.1)',
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              opacity: 0.9,
            }}>
              📅 Total de Agendamentos
            </Typography>
            <Typography variant="h3" sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              fontWeight: 700,
            }}>
              {stats.totalAppointments}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
            color: '#000000',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 215, 0, 0.5)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              opacity: 0.9,
            }}>
              📈 Média Diária
            </Typography>
            <Typography variant="h3" sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              fontWeight: 700,
            }}>
              {stats.averagePerDay.toFixed(1)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #00C851 0%, #5DFC71 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(0, 200, 81, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              opacity: 0.9,
            }}>
              ⭐ Serviço Mais Popular
            </Typography>
            <Typography variant="h6" sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600,
            }}>
              {stats.mostPopularService}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 600,
              opacity: 0.9,
            }}>
              📉 Taxa de Cancelamento
            </Typography>
            <Typography variant="h3" sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              fontWeight: 700,
            }}>
              {stats.cancellationRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Seletor de período */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodoSelecionado}
                label="Período"
                onChange={handlePeriodoChange}
              >
                <MenuItem value="semana">Últimos 30 Dias</MenuItem>
                <MenuItem value="mes">Último Mês</MenuItem>
                <MenuItem value="ano">Último Ano</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
              * Mostrando todos os agendamentos disponíveis
            </Typography>
          </Box>
        </Grid>

        {/* Gráfico de barras */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              color: '#FFD700',
              mb: 2,
            }}>
              📊 Agendamentos por Dia
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#cccccc', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                />
                <YAxis 
                  tick={{ fill: '#cccccc', fontSize: 12 }}
                  axisLine={{ stroke: '#333333' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
                    color: '#ffffff',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="appointments" 
                  fill="url(#barGradient)" 
                  name="Agendamentos"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#B8860B" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de pizza */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            background: 'rgba(26, 26, 26, 0.95)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 600,
              color: '#FFD700',
              mb: 2,
            }}>
              🥧 Distribuição de Serviços
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: 8,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
                    color: '#ffffff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminEstatisticas;