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
import { ptBR } from 'date-fns/locale';
import { statisticsService } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const AdminEstatisticas = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('semana');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    averagePerDay: 0,
    mostPopularService: '',
    cancellationRate: 0,
  });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    loadStatistics();
  }, [periodoSelecionado]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate;

    switch (periodoSelecionado) {
      case 'semana':
        startDate = subDays(endDate, 7);
        break;
      case 'mes':
        startDate = subMonths(endDate, 1);
        break;
      case 'ano':
        startDate = subYears(endDate, 1);
        break;
      default:
        startDate = subDays(endDate, 7);
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
      const [appointmentStats, serviceDistribution] = await Promise.all([
        statisticsService.getAppointmentStats(startDate, endDate),
        statisticsService.getServiceDistribution(),
      ]);

      setStats({
        totalAppointments: appointmentStats.total || 0,
        averagePerDay: appointmentStats.average_per_day || 0,
        mostPopularService: appointmentStats.most_popular_service || '',
        cancellationRate: appointmentStats.cancellation_rate || 0,
      });

      setBarData(appointmentStats.daily_appointments || []);
      setPieData(serviceDistribution || []);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
      <Grid container spacing={3}>
        {/* Cards de estatísticas */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Total de Agendamentos
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.totalAppointments}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Média Diária
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.averagePerDay.toFixed(1)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Serviço Mais Popular
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.mostPopularService}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Taxa de Cancelamento
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.cancellationRate.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Seletor de período */}
        <Grid item xs={12}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodoSelecionado}
              label="Período"
              onChange={handlePeriodoChange}
            >
              <MenuItem value="semana">Última Semana</MenuItem>
              <MenuItem value="mes">Último Mês</MenuItem>
              <MenuItem value="ano">Último Ano</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Gráfico de barras */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agendamentos por Dia
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#f5b041" name="Agendamentos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de pizza */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Distribuição de Serviços
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
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminEstatisticas; 