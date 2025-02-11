import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { addDays, format, isAfter, isBefore, parse, setHours, setMinutes, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { sendWhatsAppMessage } from '../services/whatsapp';
import { Appointment, ServicePackage } from '../types';
import { appointmentService, servicePackageService, adminSettingsService } from '../services/api';
import CloseIcon from '@mui/icons-material/Close';

const generateTimeSlots = (start: string, end: string) => {
  const timeSlots = [];
  const startTime = parse(start, 'HH:mm', new Date());
  const endTime = parse(end, 'HH:mm', new Date());
  
  let currentTime = startTime;
  while (currentTime <= endTime) {
    timeSlots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, 30);
  }
  
  return timeSlots;
};

const TimeSlotGrid = ({ horarios, ocupiedTimeSlots, onSelectTime, onClose }: {
  horarios: string[];
  ocupiedTimeSlots: string[];
  onSelectTime: (time: string) => void;
  onClose: () => void;
}) => {
  console.log('Frontend - Renderizando grade de horários');
  console.log('Frontend - Horários disponíveis:', horarios);
  console.log('Frontend - Horários ocupados:', ocupiedTimeSlots);
  
  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Selecione um Horário
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Legenda:
          </Typography>
          <Box display="flex" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 1 }} />
              <Typography variant="body2">Disponível</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 16, height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
              <Typography variant="body2">Ocupado</Typography>
            </Box>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {horarios.map((horario) => {
            const timeToCheck = horario.substring(0, 5);
            const isOccupied = ocupiedTimeSlots.includes(timeToCheck);
            console.log(`Frontend - Verificando horário ${timeToCheck} - Ocupado: ${isOccupied}`, 
              'Lista de ocupados:', ocupiedTimeSlots);
            return (
              <Grid item xs={4} sm={3} key={horario}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isOccupied}
                  onClick={() => {
                    if (!isOccupied) {
                      onSelectTime(horario);
                      onClose();
                    }
                  }}
                  sx={{
                    bgcolor: isOccupied ? 'grey.300' : 'success.main',
                    color: isOccupied ? 'text.secondary' : 'white',
                    '&:hover': {
                      bgcolor: isOccupied ? 'grey.300' : 'success.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'grey.300',
                      color: 'text.secondary',
                    },
                    height: '48px',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {horario}
                  {isOccupied && (
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'block', 
                        fontSize: '0.75rem',
                        mt: 0.5 
                      }}
                    >
                      (Ocupado)
                    </Box>
                  )}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

const Scheduling = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicePacotes, setServicePacotes] = useState<ServicePackage[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '18:00' });
  const [horarios, setHorarios] = useState<string[]>([]);
  const [ocupiedTimeSlots, setOcupiedTimeSlots] = useState<string[]>([]);
  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [packages, settings] = await Promise.all([
          servicePackageService.getAll(),
          adminSettingsService.get()
        ]);
        
        setServicePacotes(packages);
        setBlockedDates(settings.blocked_dates || []);
        setWorkingDays(settings.working_days || []);
        setWorkingHours(settings.working_hours || { start: '08:00', end: '18:00' });
        setHorarios(generateTimeSlots(
          settings.working_hours?.start || '08:00',
          settings.working_hours?.end || '18:00'
        ));
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Erro ao carregar dados. Por favor, recarregue a página.');
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadOccupiedTimeSlots = async () => {
      if (!selectedDate) return;

      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        console.log('Frontend - Buscando agendamentos para a data:', formattedDate);
        const appointments = await appointmentService.getByDate(formattedDate);
        console.log('Frontend - Agendamentos encontrados (bruto):', appointments);
        
        // Filtra apenas os agendamentos confirmados ou pendentes e extrai os horários
        const occupiedTimes = appointments
          .filter((app: Appointment) => {
            console.log('Frontend - Verificando agendamento:', app);
            return app.status !== 'cancelled' && app.appointment_time;
          })
          .map((app: Appointment) => {
            const time = app.appointment_time?.substring(0, 5) || '';
            console.log('Frontend - Extraindo horário:', time, 'do agendamento:', app);
            return time;
          })
          .filter(time => time); // Remove horários vazios
        
        console.log('Frontend - Horários ocupados (formatados):', occupiedTimes);
        setOcupiedTimeSlots(occupiedTimes);
      } catch (error) {
        console.error('Frontend - Erro ao carregar horários ocupados:', error);
        toast.error('Erro ao verificar disponibilidade de horários');
      }
    };

    loadOccupiedTimeSlots();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !name || !phone || !selectedPackage) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    // Verifica novamente se o horário está disponível antes de criar o agendamento
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const currentAppointments = await appointmentService.getByDate(formattedDate);
    const isTimeSlotTaken = currentAppointments
      .filter((app: Appointment) => app.status !== 'cancelled')
      .some((app: Appointment) => app.appointment_time === selectedTime);

    if (isTimeSlotTaken) {
      toast.error('Este horário já foi reservado. Por favor, escolha outro horário.');
      // Recarrega os horários ocupados
      const occupiedTimes = currentAppointments
        .filter((app: Appointment) => app.status !== 'cancelled')
        .map((app: Appointment) => app.appointment_time);
      setOcupiedTimeSlots(occupiedTimes);
      return;
    }

    setLoading(true);

    try {
      const appointment: Omit<Appointment, 'id' | 'created_at'> = {
        client_name: name,
        client_phone: phone.replace(/\D/g, ''),
        service_package: selectedPackage,
        appointment_date: formattedDate,
        appointment_time: selectedTime,
        status: 'pending'
      };

      const createdAppointment = await appointmentService.create(appointment);
      
      sendWhatsAppMessage({
        ...createdAppointment,
        appointment_date: format(selectedDate, 'dd/MM/yyyy')
      });
      
      toast.success('Agendamento realizado com sucesso!');
      
      // Limpar formulário
      setSelectedDate(null);
      setSelectedTime('');
      setName('');
      setPhone('');
      setSelectedPackage('');
    } catch (error) {
      console.error('Erro ao realizar agendamento:', error);
      toast.error('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const isDateBlocked = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE', { locale: ptBR }).toLowerCase();
    const dayMap: { [key: string]: string } = {
      'domingo': 'sunday',
      'segunda-feira': 'monday',
      'terça-feira': 'tuesday',
      'quarta-feira': 'wednesday',
      'quinta-feira': 'thursday',
      'sexta-feira': 'friday',
      'sábado': 'saturday'
    };
    
    const englishDay = dayMap[dayOfWeek];
    return blockedDates.includes(formattedDate) || !workingDays.includes(englishDay);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Agendar Horário
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  required
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Pacote de serviço"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  required
                  disabled={loading}
                >
                  {servicePacotes.map((pacote) => (
                    <MenuItem key={pacote.id} value={pacote.name}>
                      {pacote.name} - R$ {pacote.price.toFixed(2)} ({pacote.duration}min)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data"
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    setSelectedTime('');
                  }}
                  format="dd/MM/yyyy"
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 30)}
                  shouldDisableDate={(date) => {
                    const day = date.getDay();
                    return day === 0 || isDateBlocked(date);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => selectedDate && setShowTimeModal(true)}
                  disabled={!selectedDate || loading}
                  sx={{ 
                    height: '56px',
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    justifyContent: 'flex-start',
                    color: 'text.primary',
                    '&.Mui-disabled': {
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                    }
                  }}
                >
                  {selectedTime || 'Selecionar Horário'}
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {showTimeModal && (
          <TimeSlotGrid
            horarios={horarios}
            ocupiedTimeSlots={ocupiedTimeSlots}
            onSelectTime={setSelectedTime}
            onClose={() => setShowTimeModal(false)}
          />
        )}
      </Container>
    </Box>
  );
};

export default Scheduling; 