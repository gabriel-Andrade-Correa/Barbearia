import { Appointment } from '../types';

export const sendWhatsAppMessage = (appointment: Appointment) => {
  const message = `Olá ${appointment.client_name}! 
Seu agendamento foi confirmado para ${appointment.appointment_date} às ${appointment.appointment_time}.
Pacote escolhido: ${appointment.service_package}

Endereço: [Endereço da Barbearia]
Contato: [Telefone da Barbearia]

Em caso de imprevistos, por favor nos avise com antecedência.
Agradecemos a preferência!`;

  const whatsappUrl = `https://wa.me/55${appointment.client_phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}; 