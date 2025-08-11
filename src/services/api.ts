import { supabase } from './supabase';
import { Appointment, ServicePackage, AdminSettings } from '../types';

// Serviços para Agendamentos
export const appointmentService = {
  create: async (appointment: Omit<Appointment, 'id' | 'created_at'>) => {
    console.log('API - Criando agendamento:', appointment);
    
    // Primeiro verifica se já existe um agendamento neste horário
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', appointment.appointment_date)
      .eq('appointment_time', appointment.appointment_time)
      .neq('status', 'cancelled');

    console.log('API - Agendamentos existentes:', existingAppointments);

    if (existingAppointments && existingAppointments.length > 0) {
      throw new Error('Este horário já está ocupado');
    }

    // Verifica se o horário está bloqueado
    const { blocked_time_slots } = await adminSettingsService.getBlockedDates();
    const isTimeBlocked = blocked_time_slots.some(
      slot => slot.date === appointment.appointment_date && slot.time === appointment.appointment_time
    );

    if (isTimeBlocked) {
      throw new Error('Este horário está bloqueado pelo administrador');
    }

    // Garante que o horário esteja no formato correto
    const formattedAppointment = {
      ...appointment,
      appointment_time: appointment.appointment_time.substring(0, 5)
    };

    console.log('API - Salvando agendamento formatado:', formattedAppointment);

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

    console.log('API - Agendamento criado:', data);
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
    console.log('API - Buscando agendamentos para:', date);
    
    // Busca agendamentos e horários bloqueados
    const [appointments, settings] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', date)
        .neq('status', 'cancelled')
        .order('appointment_time', { ascending: true }),
      adminSettingsService.getBlockedDates()
    ]);

    if (appointments.error) {
      console.error('API - Erro ao buscar agendamentos:', appointments.error);
      throw appointments.error;
    }

    // Filtra os horários bloqueados para a data específica
    const blockedTimes = settings.blocked_time_slots
      .filter(slot => slot.date === date)
      .map(slot => slot.time);

    console.log('API - Horários bloqueados:', blockedTimes);

    // Combina os horários ocupados com os bloqueados
    const occupiedTimes = [
      ...appointments.data.map(app => app.appointment_time?.substring(0, 5) || ''),
      ...blockedTimes
    ];

    console.log('API - Horários ocupados (incluindo bloqueados):', occupiedTimes);

    // Retorna os agendamentos e também os horários bloqueados como se fossem agendamentos
    const blockedAppointments = blockedTimes.map(time => ({
      id: `blocked-${date}-${time}`,
      appointment_date: date,
      appointment_time: time,
      client_name: 'BLOQUEADO',
      client_phone: '',
      service_package: 'Horário Bloqueado',
      status: 'cancelled',
      created_at: new Date().toISOString()
    }));

    return [...appointments.data, ...blockedAppointments].map(appointment => ({
      ...appointment,
      appointment_time: appointment.appointment_time?.substring(0, 5) || ''
    }));
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
      blocked_dates: Array.isArray(data?.blocked_dates) ? data.blocked_dates : [],
      blocked_time_slots: Array.isArray(data?.blocked_time_slots) ? data.blocked_time_slots : [],
    };
  },

  update: async (settings: Partial<AdminSettings>) => {
    // Garante que os dados enviados estejam no formato correto
    const sanitizedSettings = {
      ...settings,
      working_days: Array.isArray(settings.working_days) ? settings.working_days : [],
      blocked_dates: Array.isArray(settings.blocked_dates) ? settings.blocked_dates : [],
      blocked_time_slots: Array.isArray(settings.blocked_time_slots) ? settings.blocked_time_slots : [],
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
      .select('blocked_dates, blocked_time_slots')
      .single();

    if (error) throw error;
    return {
      blocked_dates: Array.isArray(data?.blocked_dates) ? data.blocked_dates : [],
      blocked_time_slots: Array.isArray(data?.blocked_time_slots) ? data.blocked_time_slots : [],
    };
  }
};

// Serviços para Estatísticas
export const statisticsService = {
  getAppointmentStats: async (startDate: string, endDate: string) => {
    try {
      console.log('📊 Buscando estatísticas para período:', startDate, 'até', endDate);
      
      // Primeiro tenta buscar no período especificado
      let { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate);

      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error);
        throw error;
      }

      console.log('📋 Agendamentos no período:', appointments?.length || 0);

      // Se não encontrou agendamentos no período, busca todos os agendamentos
      if (!appointments || appointments.length === 0) {
        console.log('📊 Nenhum agendamento no período, buscando todos os agendamentos...');
        const { data: allAppointments, error: allError } = await supabase
          .from('appointments')
          .select('*');

        if (allError) {
          console.error('❌ Erro ao buscar todos os agendamentos:', allError);
          throw allError;
        }

        appointments = allAppointments;
        console.log('📋 Total de agendamentos encontrados:', appointments?.length || 0);
      }

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
      console.log('📊 Buscando distribuição de serviços...');
      
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('service_package');

      if (error) {
        console.error('❌ Erro ao buscar serviços:', error);
        throw error;
      }

      console.log('📋 Total de serviços encontrados:', appointments?.length || 0);

      if (!appointments || appointments.length === 0) return [];

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