import { NextRequest, NextResponse } from 'next/server';

export interface ScheduledCampaign {
  id: string;
  name: string;
  description: string;
  type: 'one_time' | 'recurring' | 'event_triggered' | 'ab_test';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';

  // Target audience
  audience: {
    patient_ids?: string[];
    filters?: {
      surgery_type?: string[];
      age_range?: { min: number; max: number };
      last_visit_days?: number;
      appointment_status?: string[];
    };
  };

  // Message content
  message: {
    type: 'notification' | 'marketing' | 'reminder' | 'care_instructions';
    template_id?: string;
    subject?: string;
    content: string;
    variables?: Record<string, string>;
  };

  // Scheduling
  schedule: {
    // One-time campaigns
    send_at?: string; // ISO date string

    // Recurring campaigns
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      days_of_week?: number[]; // 0-6, Sunday = 0
      time_of_day: string; // HH:MM format
      end_date?: string;
    };

    // Event-triggered campaigns
    trigger?: {
      event_type: 'surgery_completed' | 'appointment_created' | 'appointment_cancelled' | 'follow_up_due';
      delay_hours?: number;
      delay_days?: number;
    };

    // A/B testing
    ab_test?: {
      variants: {
        name: string;
        content: string;
        weight: number; // Percentage 0-100
        schedule_offset?: number; // Hours to delay this variant
      }[];
      test_duration_hours: number;
      winner_criteria: 'open_rate' | 'response_rate' | 'conversion_rate';
    };
  };

  // Smart timing
  smart_timing?: {
    enabled: boolean;
    preferred_hours: number[]; // 0-23
    avoid_weekends: boolean;
    timezone: string; // Asia/Seoul
    optimal_days: number[]; // Days since last interaction
  };

  // Delivery settings
  delivery: {
    channels: ('kakao' | 'sms' | 'email')[];
    fallback_order: ('kakao' | 'sms' | 'email')[];
    max_retries: number;
    retry_interval_minutes: number;
  };

  // Analytics
  analytics: {
    sent_count: number;
    delivered_count: number;
    open_count: number;
    response_count: number;
    cost_total: number;
    performance_score: number; // 0-100
  };

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  tags: string[];
}

// In-memory storage (replace with database in production)
export let campaigns: ScheduledCampaign[] = [
  // Sample post-surgery care campaign
  {
    id: 'lasik-post-care-001',
    name: '라식 수술 후 30일 케어',
    description: '라식 수술 후 매일 개인화된 케어 메시지 자동 발송',
    type: 'event_triggered',
    status: 'running',
    audience: {
      filters: {
        surgery_type: ['lasik', 'lasek']
      }
    },
    message: {
      type: 'care_instructions',
      template_id: 'lasik_comprehensive_care',
      content: '수술 후 {{days_post_surgery}}일차 케어 안내입니다.',
      variables: {
        patient_name: '{{patient_name}}',
        days_post_surgery: '{{days_post_surgery}}',
        care_instructions: '{{care_instructions}}',
        next_appointment: '{{next_appointment}}'
      }
    },
    schedule: {
      trigger: {
        event_type: 'surgery_completed',
        delay_days: 0
      }
    },
    smart_timing: {
      enabled: true,
      preferred_hours: [9, 10, 11, 14, 15, 16],
      avoid_weekends: false,
      timezone: 'Asia/Seoul',
      optimal_days: [1, 3, 7, 14, 30]
    },
    delivery: {
      channels: ['kakao', 'sms'],
      fallback_order: ['kakao', 'sms', 'email'],
      max_retries: 3,
      retry_interval_minutes: 5
    },
    analytics: {
      sent_count: 1247,
      delivered_count: 1240,
      open_count: 890,
      response_count: 45,
      cost_total: 87500,
      performance_score: 87
    },
    created_at: '2024-11-26T00:00:00Z',
    updated_at: '2024-11-26T00:00:00Z',
    created_by: 'admin',
    tags: ['lasik', 'post-op', 'automated']
  }
];

// GET /api/scheduling/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');

    let filteredCampaigns = campaigns;

    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }

    if (type) {
      filteredCampaigns = filteredCampaigns.filter(c => c.type === type);
    }

    if (tag) {
      filteredCampaigns = filteredCampaigns.filter(c => c.tags.includes(tag));
    }

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns,
      total: filteredCampaigns.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch campaigns'
    }, { status: 500 });
  }
}

// POST /api/scheduling/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const campaignData: Omit<ScheduledCampaign, 'id' | 'created_at' | 'updated_at' | 'analytics'> = await request.json();

    // Validate required fields
    if (!campaignData.name || !campaignData.message?.content) {
      return NextResponse.json({
        success: false,
        error: 'Campaign name and message content are required'
      }, { status: 400 });
    }

    // Create new campaign
    const newCampaign: ScheduledCampaign = {
      ...campaignData,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: campaignData.status || 'draft',
      analytics: {
        sent_count: 0,
        delivered_count: 0,
        open_count: 0,
        response_count: 0,
        cost_total: 0,
        performance_score: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    campaigns.push(newCampaign);

    return NextResponse.json({
      success: true,
      campaign: newCampaign
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create campaign'
    }, { status: 500 });
  }
}
