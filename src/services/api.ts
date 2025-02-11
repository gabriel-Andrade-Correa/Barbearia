import { supabase } from './supabase';
import { Appointment, ServicePackage, AdminSettings } from '../types';

// Serviços para Agendamentos
export const appointmentService = {
  create: async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
    if (import.meta.env.DEV) {
      console.log('API - Criando agendamento:', appointment);
    }
    
    // Primeiro verifica se já existe um agendamento neste horário
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', appointment.appointment_date)
      .eq('appointment_time', appointment.appointment_time)
      .neq('status', 'cancelled');

    if (import.meta.env.DEV) {
      console.log('API - Agendamentos existentes:', existingAppointments);
    }

    if (existingAppointments && existingAppointments.length > 0) {
      throw new Error('Este horário já está ocupado');
    }

    // Garante que o horário esteja no formato correto
    const formattedAppointment = {
      ...appointment,
      appointment_time: appointment.appointment_time.substring(0, 5)
    };

    if (import.meta.env.DEV) {
      console.log('API - Salvando agendamento formatado:', formattedAppointment);
    }

    // Se não existir, cria o novo agendamento
    const { data, error } = await supabase
      .from('appointments')
      .insert(formattedAppointment)
      .select()
      .single();

    if (error) {
      console.error('API - Erro ao criar agendamento:', error);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log('API - Agendamento criado:', data);
    }
    return data;
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  getByDate: async (date: string) => {
    if (import.meta.env.DEV) {
      console.log('API - Buscando agendamentos para:', date);
    }
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', date)
      .neq('status', 'cancelled')
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('API - Erro ao buscar agendamentos:', error);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log('API - Dados brutos:', JSON.stringify(data, null, 2));
    }
    
    // Garante que os horários estejam no formato correto (HH:mm)
    const formattedData = data?.map(appointment => {
      if (import.meta.env.DEV) {
        console.log('API - Processando agendamento:', appointment);
      }
      return {
        ...appointment,
        // Se o horário não existir, usa uma string vazia
        appointment_time: appointment.appointment_time?.substring(0, 5) || ''
      };
    }) || [];
    
    if (import.meta.env.DEV) {
      console.log('API - Agendamentos encontrados (formatados):', formattedData);
    }
    return formattedData;
  }
};

// Serviços para Pacotes
export const servicePackageService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  },

  update: async (id: string, servicePackage: Partial<ServicePackage>) => {
    const { data, error } = await supabase
      .from('service_packages')
      .update(servicePackage)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Serviços para Configurações do Admin
export const adminSettingsService = {
  get: async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single();

    if (error) throw error;

    // Garante que os dados retornados estejam no formato correto
    return {
      id: data?.id || '',
      working_days: Array.isArray(data?.working_days) ? data.working_days : [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ],
      working_hours: data?.working_hours || { start: '08:00', end: '18:00' },
      blocked_dates: Array.isArray(data?.blocked_dates) ? data.blocked_dates : []
    };
  },

  update: async (settings: Partial<AdminSettings>) => {
    // Garante que os dados enviados estejam no formato correto
    const sanitizedSettings = {
      ...settings,
      working_days: Array.isArray(settings.working_days) ? settings.working_days : [],
      blocked_dates: Array.isArray(settings.blocked_dates) ? settings.blocked_dates : []
    };

    const { data, error } = await supabase
      .from('admin_settings')
      .update(sanitizedSettings)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getBlockedDates: async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('blocked_dates')
      .single();

    if (error) throw error;
    return Array.isArray(data?.blocked_dates) ? data.blocked_dates : [];
  }
};

// Serviços para Estatísticas
export const statisticsService = {
  getAppointmentStats: async (startDate: string, endDate: string) => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate);

      if (!appointments) return {
        total: 0,
        average_per_day: 0,
        most_popular_service: '',
        cancellation_rate: 0,
        daily_appointments: []
      };

      const total = appointments.length;
      const cancelled = appointments.filter(a => a.status === 'cancelled').length;
      const cancellationRate = (cancelled / total) * 100;

      // Agrupar por serviço
      const serviceCount: { [key: string]: number } = {};
      appointments.forEach(a => {
        serviceCount[a.service_package] = (serviceCount[a.service_package] || 0) + 1;
      });

      // Encontrar o serviço mais popular
      const mostPopularService = Object.entries(serviceCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      // Agrupar por dia
      const dailyAppointments = appointments.reduce((acc: any[], appointment) => {
        const date = appointment.appointment_date;
        const existingDay = acc.find(d => d.date === date);
        if (existingDay) {
          existingDay.appointments += 1;
        } else {
          acc.push({ date, appointments: 1 });
        }
        return acc;
      }, []);

      return {
        total,
        average_per_day: total / dailyAppointments.length || 0,
        most_popular_service: mostPopularService,
        cancellation_rate: cancellationRate,
        daily_appointments: dailyAppointments
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao carregar estatísticas de agendamentos');
    }
  },

  getServiceDistribution: async () => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('service_package');

      if (!appointments) return [];

      const distribution = appointments.reduce((acc: any[], appointment) => {
        const existingService = acc.find(s => s.name === appointment.service_package);
        if (existingService) {
          existingService.value += 1;
        } else {
          acc.push({ name: appointment.service_package, value: 1 });
        }
        return acc;
      }, []);

      return distribution;
    } catch (error) {
      console.error('Erro ao buscar distribuição de serviços:', error);
      throw new Error('Erro ao carregar distribuição de serviços');
    }
  }
}; 