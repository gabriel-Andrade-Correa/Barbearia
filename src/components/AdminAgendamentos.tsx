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
      {/* Versão Desktop - Tabela */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
      </Box>

             {/* Versão Mobile - Cards */}
       <Box sx={{ display: { xs: 'block', md: 'none' } }}>
         {appointments
           .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
           .map((appointment) => (
                           <Paper key={appointment.id} sx={{ 
                p: 3, 
                mb: 3,
                background: 'rgba(26, 26, 26, 0.95)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  height: '100%',
                  background: appointment.status === 'confirmed' 
                    ? 'linear-gradient(135deg, #00C851, #5DFC71)'
                    : appointment.status === 'cancelled'
                    ? 'linear-gradient(135deg, #ff4444, #ff6b6b)'
                    : 'linear-gradient(135deg, #FFD700, #B8860B)',
                }
              }}>
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#FFD700' }}>
                    👤 {appointment.client_name}
                  </Typography>
                 <Chip
                   label={appointment.status}
                   color={getStatusColor(appointment.status)}
                   size="small"
                   sx={{ fontWeight: 600 }}
                 />
               </Box>
               <Box sx={{ display: 'grid', gap: 1, mb: 3 }}>
                 <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <span style={{ fontSize: '1.2rem' }}>📅</span>
                   <strong>Data:</strong> {appointment.appointment_date}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <span style={{ fontSize: '1.2rem' }}>🕐</span>
                   <strong>Horário:</strong> {appointment.appointment_time}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <span style={{ fontSize: '1.2rem' }}>📞</span>
                   <strong>Telefone:</strong> {appointment.client_phone}
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <span style={{ fontSize: '1.2rem' }}>✂️</span>
                   <strong>Serviço:</strong> {appointment.service_package}
                 </Typography>
               </Box>
               <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                 <IconButton
                   color="success"
                   onClick={() => handleStatusChange(appointment, 'confirmed')}
                   disabled={appointment.status === 'confirmed'}
                   size="medium"
                   sx={{
                     backgroundColor: appointment.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                     '&:hover': {
                       backgroundColor: 'rgba(16, 185, 129, 0.2)',
                     }
                   }}
                 >
                   <CheckCircleIcon />
                 </IconButton>
                 <IconButton
                   color="error"
                   onClick={() => handleStatusChange(appointment, 'cancelled')}
                   disabled={appointment.status === 'cancelled'}
                   size="medium"
                   sx={{
                     backgroundColor: appointment.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                     '&:hover': {
                       backgroundColor: 'rgba(239, 68, 68, 0.2)',
                     }
                   }}
                 >
                   <CancelIcon />
                 </IconButton>
                 <IconButton
                   color="error"
                   onClick={() => handleDeleteClick(appointment)}
                   size="medium"
                   sx={{
                     '&:hover': {
                       backgroundColor: 'rgba(239, 68, 68, 0.2)',
                     }
                   }}
                 >
                   <DeleteIcon />
                 </IconButton>
               </Box>
             </Paper>
           ))}
       </Box>
      {/* Paginação */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={appointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      
      {/* Paginação Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, appointments.length)} de ${appointments.length}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              size="small"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * rowsPerPage >= appointments.length}
            >
              Próximo
            </Button>
          </Box>
        </Box>
      </Box>

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