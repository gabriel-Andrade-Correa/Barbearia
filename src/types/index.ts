export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  service_package: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface AdminSettings {
  id: string;
  working_hours: {
    start: string;
    end: string;
  };
  working_days: string[];
  blocked_dates: string[];
  blocked_time_slots: Array<{
    date: string;
    time: string;
  }>;
} 