/**
 * Patient Segmentation Utilities
 * Filter patients for targeted campaigns
 */

import { createServerClient } from './supabase';
import { Patient, Appointment } from './database.types';

export interface PatientSegment {
  id: string;
  name: string;
  description?: string;
  filters: PatientFilters;
}

export interface PatientFilters {
  // Date-based filters
  lastVisitDateFrom?: string; // YYYY-MM-DD
  lastVisitDateTo?: string;
  lastSurgeryDateFrom?: string;
  lastSurgeryDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  
  // Surgery type filters
  surgeryTypes?: string[]; // e.g., ['lasik', 'rhinoplasty']
  hasSurgery?: boolean; // true = has surgery, false = no surgery
  
  // Appointment filters
  appointmentStatus?: ('scheduled' | 'completed' | 'cancelled' | 'no_show')[];
  hasUpcomingAppointment?: boolean;
  appointmentDateFrom?: string;
  appointmentDateTo?: string;
  
  // Patient attributes
  gender?: ('male' | 'female' | 'other')[];
  ageMin?: number;
  ageMax?: number;
  
  // Custom filters
  hasEmail?: boolean;
  hasPhone?: boolean;
  tags?: string[]; // Future: patient tags feature
}

/**
 * Get patients matching the segment filters
 */
export async function getPatientsBySegment(
  userId: string,
  filters: PatientFilters
): Promise<Patient[]> {
  const supabase = createServerClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  let query = supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId);

  // Date filters
  if (filters.lastVisitDateFrom) {
    query = query.gte('last_visit_date', filters.lastVisitDateFrom);
  }
  if (filters.lastVisitDateTo) {
    query = query.lte('last_visit_date', filters.lastVisitDateTo);
  }
  if (filters.lastSurgeryDateFrom) {
    query = query.gte('last_surgery_date', filters.lastSurgeryDateFrom);
  }
  if (filters.lastSurgeryDateTo) {
    query = query.lte('last_surgery_date', filters.lastSurgeryDateTo);
  }
  if (filters.createdDateFrom) {
    query = query.gte('created_at', filters.createdDateFrom);
  }
  if (filters.createdDateTo) {
    query = query.lte('created_at', filters.createdDateTo);
  }

  // Gender filter
  if (filters.gender && filters.gender.length > 0) {
    query = query.in('gender', filters.gender);
  }

  // Email/Phone filters
  if (filters.hasEmail === true) {
    query = query.not('email', 'is', null);
  } else if (filters.hasEmail === false) {
    query = query.is('email', null);
  }
  if (filters.hasPhone === true) {
    query = query.not('phone', 'is', null);
  } else if (filters.hasPhone === false) {
    query = query.is('phone', null);
  }

  const { data: patients, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch patients: ${error.message}`);
  }

  if (!patients) {
    return [];
  }

  // Filter by surgery type (requires joining with appointments)
  let filteredPatients = patients;

  if (filters.surgeryTypes || filters.hasSurgery !== undefined) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('patient_id, surgery_type')
      .eq('user_id', userId)
      .in('status', ['completed']);

    if (appointments) {
      const patientSurgeryMap = new Map<string, Set<string>>();
      appointments.forEach((apt: any) => {
        if (apt.surgery_type) {
          if (!patientSurgeryMap.has(apt.patient_id)) {
            patientSurgeryMap.set(apt.patient_id, new Set());
          }
          patientSurgeryMap.get(apt.patient_id)!.add(apt.surgery_type);
        }
      });

      filteredPatients = filteredPatients.filter((patient) => {
        const surgeries = patientSurgeryMap.get(patient.id) || new Set();

        if (filters.hasSurgery === true) {
          return surgeries.size > 0;
        } else if (filters.hasSurgery === false) {
          return surgeries.size === 0;
        }

        if (filters.surgeryTypes && filters.surgeryTypes.length > 0) {
          return filters.surgeryTypes.some((type) => surgeries.has(type));
        }

        return true;
      });
    }
  }

  // Filter by appointment status
  if (filters.appointmentStatus || filters.hasUpcomingAppointment !== undefined) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select('patient_id, status, appointment_date')
      .eq('user_id', userId);

    if (appointments) {
      const patientAppointments = new Map<string, any[]>();
      appointments.forEach((apt: any) => {
        if (!patientAppointments.has(apt.patient_id)) {
          patientAppointments.set(apt.patient_id, []);
        }
        patientAppointments.get(apt.patient_id)!.push(apt);
      });

      filteredPatients = filteredPatients.filter((patient) => {
        const apts = patientAppointments.get(patient.id) || [];

        if (filters.hasUpcomingAppointment === true) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return apts.some(
            (apt) =>
              apt.status === 'scheduled' &&
              new Date(apt.appointment_date) >= today
          );
        } else if (filters.hasUpcomingAppointment === false) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return !apts.some(
            (apt) =>
              apt.status === 'scheduled' &&
              new Date(apt.appointment_date) >= today
          );
        }

        if (filters.appointmentStatus && filters.appointmentStatus.length > 0) {
          return apts.some((apt) => filters.appointmentStatus!.includes(apt.status));
        }

        return true;
      });
    }
  }

  // Age filter (calculate from birth_date)
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
    const today = new Date();
    filteredPatients = filteredPatients.filter((patient) => {
      if (!patient.birth_date) return false;

      const birthDate = new Date(patient.birth_date);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

      if (filters.ageMin !== undefined && actualAge < filters.ageMin) {
        return false;
      }
      if (filters.ageMax !== undefined && actualAge > filters.ageMax) {
        return false;
      }
      return true;
    });
  }

  return filteredPatients;
}

/**
 * Get count of patients matching filters (for preview)
 */
export async function getPatientCountBySegment(
  userId: string,
  filters: PatientFilters
): Promise<number> {
  const patients = await getPatientsBySegment(userId, filters);
  return patients.length;
}

/**
 * Common segment presets
 */
export const SEGMENT_PRESETS: Record<string, PatientFilters> = {
  'recent_surgery_patients': {
    lastSurgeryDateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
    hasSurgery: true,
  },
  'no_show_patients': {
    appointmentStatus: ['no_show'],
  },
  'cancelled_appointments': {
    appointmentStatus: ['cancelled'],
  },
  'upcoming_appointments': {
    hasUpcomingAppointment: true,
  },
  'lasik_patients': {
    surgeryTypes: ['lasik', 'lasek'],
  },
  'rhinoplasty_patients': {
    surgeryTypes: ['rhinoplasty'],
  },
  'inactive_patients': {
    lastVisitDateTo: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // No visit in 180 days
  },
};

