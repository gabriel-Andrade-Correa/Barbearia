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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { addDays, format, parse, addMinutes } from 'date-fns';
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
                                                       PaperProps={{
           sx: {
             background: 'rgba(26, 26, 26, 0.4)',
             border: '1px solid rgba(255, 215, 0, 0.3)',
             backdropFilter: 'blur(10px)',
             color: '#ffffff',
           }
         }}
    >
      <DialogTitle sx={{ color: '#FFD700', fontWeight: 600 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          🕐 Selecione um Horário
          <IconButton onClick={onClose} sx={{ color: '#FFD700' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600 }}>
            📋 Legenda:
          </Typography>
          <Box display="flex" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                background: 'linear-gradient(45deg, #FFD700, #B8860B)', 
                borderRadius: 1 
              }} />
              <Typography variant="body2" sx={{ color: '#ffffff' }}>Disponível</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: 1 
              }} />
              <Typography variant="body2" sx={{ color: '#ffffff' }}>Ocupado/Bloqueado</Typography>
            </Box>
          </Box>
        </Box>
        <Grid container spacing={1}>
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
                     background: isOccupied ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, #FFD700, #B8860B)',
                     color: isOccupied ? 'rgba(255, 255, 255, 0.5)' : '#000000',
                     '&:hover': {
                       background: isOccupied ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, #B8860B, #FFD700)',
                       transform: isOccupied ? 'none' : 'translateY(-1px)',
                     },
                     '&.Mui-disabled': {
                       background: 'rgba(255, 255, 255, 0.1)',
                       color: 'rgba(255, 255, 255, 0.5)',
                     },
                     height: isOccupied ? '64px' : '48px',
                     textTransform: 'none',
                     fontSize: '1rem',
                     fontWeight: 600,
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     padding: '8px 4px',
                     overflow: 'hidden',
                   }}
                >
                  <Box sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {horario}
                  </Box>
                  {isOccupied && (
                    <Box 
                      component="span" 
                      sx={{ 
                        fontSize: '0.7rem',
                        lineHeight: 1,
                        textAlign: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      (Indisponível)
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicePacotes, setServicePacotes] = useState<ServicePackage[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
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
        
        // Filtra apenas os agendamentos confirmados, pendentes e horários bloqueados
        const occupiedTimes = appointments
          .filter((app: Appointment) => {
            console.log('Frontend - Verificando agendamento:', app);
            // Considera ocupado se: não for cancelado E tem horário
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
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/Gui.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
    }}>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 12, pb: 6, position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #FFD700, #B8860B)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', sm: '3rem' },
          }}
        >
          ✂️ Agendar Horário
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            background: 'rgba(26, 26, 26, 0.3)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
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
                      sx: {
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
                      },
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
                    borderColor: 'rgba(255, 215, 0, 0.5)',
                    justifyContent: 'flex-start',
                    color: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    },
                    '&.Mui-disabled': {
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'rgba(255, 215, 0, 0.5)',
                    }
                  }}
                >
                  🕐 {selectedTime || 'Selecionar Horário'}
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ 
                    mt: 2,
                    background: 'linear-gradient(45deg, #FFD700, #B8860B)',
                    color: '#000000',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #B8860B, #FFD700)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(255, 215, 0, 0.3)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 215, 0, 0.3)',
                      color: 'rgba(0, 0, 0, 0.5)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    '✨ Confirmar Agendamento'
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