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
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
  ]);

  const [workingHours, setWorkingHours] = useState({
    start: '08:00',
    end: '16:00',
  });

  const [blockedDate, setBlockedDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await adminSettingsService.get();
      if (settings) {
        setSettingsId(settings.id);
        setWorkingDays(Array.isArray(settings.working_days) ? settings.working_days : [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday'
        ]);
        setWorkingHours(settings.working_hours || { start: '08:00', end: '18:00' });
        setBlockedDates(settings.blocked_dates || []);
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

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const settings: Partial<AdminSettings> = {
        id: settingsId,
        working_days: workingDays,
        working_hours: workingHours,
        blocked_dates: blockedDates,
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
                      checked={workingDays.includes('monday')}
                      onChange={() => handleWorkingDayChange('monday')}
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
                      checked={workingDays.includes('tuesday')}
                      onChange={() => handleWorkingDayChange('tuesday')}
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
                      checked={workingDays.includes('wednesday')}
                      onChange={() => handleWorkingDayChange('wednesday')}
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
                      checked={workingDays.includes('thursday')}
                      onChange={() => handleWorkingDayChange('thursday')}
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
                      checked={workingDays.includes('friday')}
                      onChange={() => handleWorkingDayChange('friday')}
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
                      checked={workingDays.includes('saturday')}
                      onChange={() => handleWorkingDayChange('saturday')}
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
                      checked={workingDays.includes('sunday')}
                      onChange={() => handleWorkingDayChange('sunday')}
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
    </Box>
  );
};

export default AdminConfiguracoes; 