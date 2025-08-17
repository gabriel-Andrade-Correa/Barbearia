import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminSettingsService } from '../services/api';
import { AdminSettings } from '../types';

const AdminConfiguracoes = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string>('');
  const [workingDays, setWorkingDays] = useState<string[]>([
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado'
  ]);

  const [workingHours, setWorkingHours] = useState({
    start: '08:00',
    end: '16:00',
  });

  const [blockedDate, setBlockedDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<Array<{ date: string; time: string }>>([]);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | null>(null);
  const [selectedBlockTime, setSelectedBlockTime] = useState('');
  const [showBlockTimeDialog, setShowBlockTimeDialog] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await adminSettingsService.get();
      if (settings) {
        setSettingsId(settings.id);
        setWorkingDays(Array.isArray(settings.working_days) ? settings.working_days : [
          'segunda-feira',
          'terça-feira',
          'quarta-feira',
          'quinta-feira',
          'sexta-feira',
          'sábado'
        ]);
        setWorkingHours(settings.working_hours || { start: '08:00', end: '18:00' });
        setBlockedDates(settings.blocked_dates || []);
        setBlockedTimeSlots(settings.blocked_time_slots || []);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingDayChange = (day: string) => {
    setWorkingDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleWorkingHoursChange = (
    type: 'start' | 'end',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [type]: event.target.value,
    }));
  };

  const handleAddBlockedDate = () => {
    if (blockedDate) {
      const formattedDate = format(blockedDate, 'yyyy-MM-dd');
      if (!blockedDates.includes(formattedDate)) {
        setBlockedDates([...blockedDates, formattedDate]);
        setBlockedDate(null);
      }
    }
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setBlockedDates(blockedDates.filter((date) => date !== dateToRemove));
  };

  const handleAddBlockedTimeSlot = () => {
    if (selectedBlockDate && selectedBlockTime) {
      const formattedDate = format(selectedBlockDate, 'yyyy-MM-dd');
      const newTimeSlot = {
        date: formattedDate,
        time: selectedBlockTime,
      };
      
      // Verifica se já existe esse horário bloqueado
      const exists = blockedTimeSlots.some(
        slot => slot.date === newTimeSlot.date && slot.time === newTimeSlot.time
      );

      if (!exists) {
        setBlockedTimeSlots([...blockedTimeSlots, newTimeSlot]);
        setSelectedBlockDate(null);
        setSelectedBlockTime('');
        setShowBlockTimeDialog(false);
      } else {
        toast.error('Este horário já está bloqueado');
      }
    }
  };

  const handleRemoveBlockedTimeSlot = (date: string, time: string) => {
    setBlockedTimeSlots(
      blockedTimeSlots.filter(
        slot => !(slot.date === date && slot.time === time)
      )
    );
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settings: Partial<AdminSettings> = {
        id: settingsId,
        working_days: workingDays,
        working_hours: workingHours,
        blocked_dates: blockedDates,
        blocked_time_slots: blockedTimeSlots,
      };

      await adminSettingsService.update(settings);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
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
        {/* Dias de funcionamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dias de Funcionamento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('segunda-feira')}
                      onChange={() => handleWorkingDayChange('segunda-feira')}
                      disabled={saving}
                    />
                  }
                  label="Segunda-feira"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('terça-feira')}
                      onChange={() => handleWorkingDayChange('terça-feira')}
                      disabled={saving}
                    />
                  }
                  label="Terça-feira"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('quarta-feira')}
                      onChange={() => handleWorkingDayChange('quarta-feira')}
                      disabled={saving}
                    />
                  }
                  label="Quarta-feira"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('quinta-feira')}
                      onChange={() => handleWorkingDayChange('quinta-feira')}
                      disabled={saving}
                    />
                  }
                  label="Quinta-feira"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('sexta-feira')}
                      onChange={() => handleWorkingDayChange('sexta-feira')}
                      disabled={saving}
                    />
                  }
                  label="Sexta-feira"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('sábado')}
                      onChange={() => handleWorkingDayChange('sábado')}
                      disabled={saving}
                    />
                  }
                  label="Sábado"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={workingDays.includes('domingo')}
                      onChange={() => handleWorkingDayChange('domingo')}
                      disabled={saving}
                    />
                  }
                  label="Domingo"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Horário de funcionamento */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Horário de Funcionamento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Horário Inicial"
                  type="time"
                  value={workingHours.start}
                  onChange={(e) => handleWorkingHoursChange('start', e as any)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Horário Final"
                  type="time"
                  value={workingHours.end}
                  onChange={(e) => handleWorkingHoursChange('end', e as any)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={saving}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bloqueio de datas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Datas Bloqueadas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Selecionar data"
                  value={blockedDate}
                  onChange={(newValue) => setBlockedDate(newValue)}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  onClick={handleAddBlockedDate}
                  disabled={!blockedDate || saving}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Adicionar Data
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {blockedDates.map((date) => (
                    <Chip
                      key={date}
                      label={format(new Date(date), 'dd/MM/yyyy')}
                      onDelete={() => handleRemoveBlockedDate(date)}
                      sx={{ m: 0.5 }}
                      disabled={saving}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bloqueio de horários específicos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Horários Bloqueados
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={() => setShowBlockTimeDialog(true)}
                  disabled={saving}
                  sx={{ mb: 2 }}
                >
                  Bloquear Novo Horário
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {blockedTimeSlots.map((slot) => (
                    <Chip
                      key={`${slot.date}-${slot.time}`}
                      label={`${format(new Date(slot.date), 'dd/MM/yyyy')} - ${slot.time}`}
                      onDelete={() => handleRemoveBlockedTimeSlot(slot.date, slot.time)}
                      sx={{ m: 0.5 }}
                      disabled={saving}
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Botão salvar */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleSaveSettings}
            fullWidth
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar Configurações'}
          </Button>
        </Grid>
      </Grid>

      {/* Dialog para adicionar horário bloqueado */}
      <Dialog open={showBlockTimeDialog} onClose={() => setShowBlockTimeDialog(false)}>
        <DialogTitle>Bloquear Horário Específico</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <DatePicker
                label="Selecionar data"
                value={selectedBlockDate}
                onChange={(newValue) => setSelectedBlockDate(newValue)}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Horário"
                type="time"
                value={selectedBlockTime}
                onChange={(e) => setSelectedBlockTime(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBlockTimeDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddBlockedTimeSlot}
            disabled={!selectedBlockDate || !selectedBlockTime}
            variant="contained"
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminConfiguracoes; 