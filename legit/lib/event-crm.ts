/**
 * 이벤트/캠페인 관리 라이브러리
 */

import { createServerClient } from './supabase';
import { EventCampaign, EventCampaignExecution } from './database.types';

export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  message: string;
  segment: any;
  schedule: any;
}

export async function getEventCampaigns(userId: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('event_campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EventCampaign[];
}

export async function getEventCampaign(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('event_campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as EventCampaign;
}

export async function createEventCampaign(userId: string, campaign: Partial<EventCampaign>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('event_campaigns')
    .insert({ ...campaign, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as EventCampaign;
}

export async function updateEventCampaign(userId: string, id: string, updates: Partial<EventCampaign>) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase
    .from('event_campaigns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as EventCampaign;
}

export async function deleteEventCampaign(userId: string, id: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase
    .from('event_campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Execute an event campaign (send messages to target segment)
 */
export async function executeEventCampaign(userId: string, campaignId: string) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  // 1. Fetch campaign details
  const campaign = await getEventCampaign(userId, campaignId);
  if (!campaign) throw new Error('Campaign not found');

  // 2. Determine target patients based on segment_config
  // Example segment: { type: 'all' } or { type: 'no_visit', months: 6 }
  let query = supabase.from('patients').select('*').eq('user_id', userId);

  if (campaign.segment_config) {
    const config = campaign.segment_config as any;
    if (config.type === 'no_visit' && config.months) {
      const dateThreshold = new Date();
      dateThreshold.setMonth(dateThreshold.getMonth() - config.months);
      query = query.lt('last_visit_date', dateThreshold.toISOString());
    }
    // Add more segment logic here
  }

  const { data: patients, error } = await query;
  if (error) throw error;

  // 3. Send messages (using Template Engine / Smart Failover)
  // For MVP, we'll just return the count of targets
  return {
    targetCount: patients?.length || 0,
    patients: patients
  };
}

/**
 * Seasonal event campaign templates
 */
export const seasonalEventTemplates = [
  {
    id: 'new_year',
    name: '새해 인사 캠페인',
    description: '새해를 맞아 환자들에게 인사와 건강 소원을 전하는 캠페인',
    message: '새해 복 많이 받으세요! 올해도 건강과 아름다움을 함께 챙기시길 바랍니다.',
    segment: { type: 'all' },
    schedule: { type: 'once', date: '2024-01-01' }
  },
  {
    id: 'valentine',
    name: '발렌타인 데이 이벤트',
    description: '발렌타인 데이를 맞아 특별한 케어를 제안하는 캠페인',
    message: '사랑하는 사람과 함께하는 날, 아름다운 미소를 선물해보세요.',
    segment: { type: 'all' },
    schedule: { type: 'once', date: '2024-02-14' }
  },
  {
    id: 'spring_cleaning',
    name: '봄맞이 피부관리 이벤트',
    description: '봄철 피부관리의 중요성을 알리는 캠페인',
    message: '봄바람과 함께 새로워지는 피부! 봄맞이 특별 케어를 시작해보세요.',
    segment: { type: 'no_visit', months: 3 },
    schedule: { type: 'once', date: '2024-03-01' }
  },
  {
    id: 'summer_care',
    name: '여름철 자외선 케어 리마인더',
    description: '여름철 자외선으로부터 피부를 보호하는 캠페인',
    message: '뜨거운 햇살 아래에서도 빛나는 피부를 유지하세요. 여름철 케어를 시작해보세요.',
    segment: { type: 'all' },
    schedule: { type: 'once', date: '2024-06-01' }
  },
  {
    id: 'back_to_school',
    name: '개학 시즌 피부관리',
    description: '개학을 맞아 자신감을 되찾는 피부관리 캠페인',
    message: '새로운 학기를 맞아 자신감 있는 피부로 시작하세요.',
    segment: { type: 'no_visit', months: 6 },
    schedule: { type: 'once', date: '2024-08-20' }
  },
  {
    id: 'halloween',
    name: '할로윈 특별 이벤트',
    description: '할로윈을 맞아 재미있는 피부관리 제안',
    message: '무서운 할로윈이지만, 피부는 항상 아름답게! 특별 할인을 놓치지 마세요.',
    segment: { type: 'all' },
    schedule: { type: 'once', date: '2024-10-31' }
  },
  {
    id: 'christmas',
    name: '크리스마스 특별 케어',
    description: '크리스마스를 맞아 연말연시 케어 제안',
    message: '메리 크리스마스! 사랑하는 사람들과 함께 아름다운 연말을 보내세요.',
    segment: { type: 'all' },
    schedule: { type: 'once', date: '2024-12-25' }
  }
];

/**
 * Create a seasonal campaign from template
 */
export async function createSeasonalCampaign(
  userId: string,
  template: typeof seasonalEventTemplates[0],
  customConfig?: any
) {
  const campaignData = {
    name: template.name,
    description: template.description,
    message_template: template.message,
    segment_config: template.segment,
    schedule_config: template.schedule,
    status: 'draft' as const,
    ...customConfig
  };

  return await createEventCampaign(userId, campaignData);
}

/**
 * Create a birthday campaign
 */
export async function createBirthdayCampaign(
  userId: string,
  daysBefore: number = 3,
  discountRate: number = 15
) {
  const message = `생일 축하드립니다! 🎂 생일을 맞아 ${discountRate}% 특별 할인을 준비했습니다. 아름다운 하루 되세요!`;

  const campaignData = {
    name: '생일 축하 캠페인',
    description: `환자의 생일 ${daysBefore}일 전에 자동으로 축하 메시지 발송`,
    message_template: message,
    segment_config: { type: 'birthday', days_before: daysBefore },
    schedule_config: { type: 'recurring', frequency: 'yearly' },
    status: 'draft' as const,
    discount_rate: discountRate
  };

  return await createEventCampaign(userId, campaignData);
}

/**
 * Get patients based on segment configuration
 */
export async function getSegmentedPatients(userId: string, segmentConfig: any) {
  const supabase = createServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  let query = supabase.from('patients').select('*').eq('user_id', userId);

  if (!segmentConfig || segmentConfig.type === 'all') {
    // Return all patients
  } else if (segmentConfig.type === 'no_visit' && segmentConfig.months) {
    // Patients who haven't visited in X months
    const dateThreshold = new Date();
    dateThreshold.setMonth(dateThreshold.getMonth() - segmentConfig.months);
    query = query.or(`last_visit_date.is.null,last_visit_date.lt.${dateThreshold.toISOString()}`);
  } else if (segmentConfig.type === 'birthday') {
    // Patients with upcoming birthdays (within X days)
    const daysBefore = segmentConfig.days_before || 7;
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysBefore);
    
    // Get current month/day and target month/day
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();
    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();
    
    // Filter patients with birth_date not null
    query = query.not('birth_date', 'is', null);
    
    // Note: This is a simplified approach. For a more accurate birthday check,
    // you'd need to extract month/day from birth_date and compare.
    // The actual filtering would need to be done in application code or using
    // Postgres date functions. For now, we'll fetch all patients with birth_date
    // and filter in application code if needed.
  } else if (segmentConfig.type === 'inactive' && segmentConfig.months) {
    // Patients inactive for X months
    const dateThreshold = new Date();
    dateThreshold.setMonth(dateThreshold.getMonth() - segmentConfig.months);
    query = query.lt('created_at', dateThreshold.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  // Filter birthday patients in application code if needed
  if (segmentConfig?.type === 'birthday' && data) {
    const daysBefore = segmentConfig.days_before || 7;
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysBefore);
    
    return data.filter(patient => {
      if (!patient.birth_date) return false;
      
      const birthDate = new Date(patient.birth_date);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      const nextYearBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
      
      // Check if birthday is within the next X days (this year or next year)
      return (thisYearBirthday >= today && thisYearBirthday <= targetDate) ||
             (nextYearBirthday >= today && nextYearBirthday <= targetDate);
    });
  }

  return data || [];
}
