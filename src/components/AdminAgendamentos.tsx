import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { Appointment } from '../types';
import { appointmentService } from '../services/api';
import toast from 'react-hot-toast';

const AdminAgendamentos = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await appointmentService.updateStatus(appointment.id, newStatus);
      toast.success(`Status alterado para ${newStatus}`);
      loadAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAppointment) {
      try {
        await appointmentService.delete(selectedAppointment.id);
        toast.success('Agendamento excluído com sucesso');
        setOpenDialog(false);
        loadAppointments();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        toast.error('Erro ao excluir agendamento');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.appointment_date}</TableCell>
                  <TableCell>{appointment.appointment_time}</TableCell>
                  <TableCell>{appointment.client_name}</TableCell>
                  <TableCell>{appointment.client_phone}</TableCell>
                  <TableCell>{appointment.service_package}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => handleStatusChange(appointment, 'confirmed')}
                      disabled={appointment.status === 'confirmed'}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleStatusChange(appointment, 'cancelled')}
                      disabled={appointment.status === 'cancelled'}
                    >
                      <CancelIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(appointment)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={appointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este agendamento?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAgendamentos; 