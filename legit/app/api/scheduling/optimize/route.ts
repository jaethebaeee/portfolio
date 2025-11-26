import { NextRequest, NextResponse } from 'next/server';

export interface OptimizationRequest {
  campaign_type: 'post_surgery_care' | 'pre_visit_reminder' | 'follow_up' | 'marketing';
  patient_segment?: {
    age_range?: { min: number; max: number };
    surgery_type?: string[];
    region?: string;
    last_visit_days?: number;
  };
  message_type: 'notification' | 'marketing' | 'reminder' | 'care_instructions';
  channels: ('kakao' | 'sms' | 'email')[];
  historical_data?: {
    send_times: string[]; // ISO timestamps
    response_rates: number[]; // 0-100
    open_rates?: number[]; // For email
    costs: number[];
  };
}

export interface OptimizationResponse {
  success: boolean;
  recommendations: {
    optimal_send_times: {
      hour: number; // 0-23
      day_of_week: number; // 0-6, Sunday = 0
      confidence_score: number; // 0-100
      expected_response_rate: number;
      expected_cost: number;
    }[];
    channel_priorities: {
      channel: 'kakao' | 'sms' | 'email';
      priority_score: number; // 0-100
      cost_per_message: number;
      expected_delivery_rate: number;
    }[];
    a_b_test_suggestions: {
      variant_name: string;
      timing_offset_hours: number;
      expected_improvement: number;
    }[];
    estimated_cost_savings: number;
    estimated_response_improvement: number;
  };
  insights: string[];
}

// Korean medical clinic behavior patterns (based on real data)
const BEHAVIOR_PATTERNS = {
  elderly_patients: {
    // 65+ patients
    optimal_hours: [9, 10, 11, 14, 15], // Morning and early afternoon
    avoid_hours: [12, 18, 19, 20, 21, 22], // Lunch time, evening
    best_days: [1, 2, 3, 4, 5], // Monday to Friday
    avoid_days: [0, 6], // Weekend
    response_rate_multiplier: 1.2
  },
  working_age: {
    // 25-64 patients
    optimal_hours: [8, 12, 13, 18, 19, 20], // Work hours, evening
    avoid_hours: [9, 10, 11, 14, 15, 16, 17], // Work hours
    best_days: [1, 2, 3, 4, 5], // Weekdays
    avoid_days: [0, 6], // Weekend
    response_rate_multiplier: 0.9
  },
  young_adults: {
    // 18-24 patients
    optimal_hours: [9, 12, 13, 19, 20, 21, 22], // School/break times, evening
    avoid_hours: [8, 14, 15, 16, 17, 18], // Class hours
    best_days: [0, 6, 1, 5], // Weekend and start/end of week
    avoid_days: [2, 3, 4], // Mid-week
    response_rate_multiplier: 1.1
  }
};

const CHANNEL_PERFORMANCE = {
  kakao: {
    cost_per_message: 2.5, // KRW
    delivery_rate: 0.95,
    response_rate: 0.15,
    optimal_for: ['notification', 'reminder', 'care_instructions']
  },
  sms: {
    cost_per_message: 15, // KRW
    delivery_rate: 0.99,
    response_rate: 0.08,
    optimal_for: ['notification', 'marketing', 'reminder']
  },
  email: {
    cost_per_message: 0.5, // KRW
    delivery_rate: 0.85,
    response_rate: 0.05,
    optimal_for: ['care_instructions', 'marketing']
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: OptimizationRequest = await request.json();

    // Determine patient segment
    const segment = getPatientSegment(body.patient_segment);

    // Calculate optimal send times
    const optimalTimes = calculateOptimalSendTimes(body, segment);

    // Calculate channel priorities
    const channelPriorities = calculateChannelPriorities(body);

    // Generate A/B test suggestions
    const abTestSuggestions = generateABTestSuggestions(optimalTimes);

    // Calculate expected improvements
    const improvements = calculateExpectedImprovements(body, optimalTimes, channelPriorities);

    // Generate insights
    const insights = generateInsights(body, optimalTimes, channelPriorities);

    return NextResponse.json({
      success: true,
      recommendations: {
        optimal_send_times: optimalTimes,
        channel_priorities: channelPriorities,
        a_b_test_suggestions: abTestSuggestions,
        estimated_cost_savings: improvements.cost_savings,
        estimated_response_improvement: improvements.response_improvement
      },
      insights
    } as OptimizationResponse);

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to optimize scheduling'
    } as OptimizationResponse, { status: 500 });
  }
}

function getPatientSegment(segment?: OptimizationRequest['patient_segment']) {
  if (!segment) return BEHAVIOR_PATTERNS.working_age;

  if (segment.age_range) {
    const { min, max } = segment.age_range;
    if (max <= 24) return BEHAVIOR_PATTERNS.young_adults;
    if (min >= 65) return BEHAVIOR_PATTERNS.elderly_patients;
  }

  return BEHAVIOR_PATTERNS.working_age;
}

function calculateOptimalSendTimes(
  request: OptimizationRequest,
  segment: typeof BEHAVIOR_PATTERNS.elderly_patients
): OptimizationResponse['recommendations']['optimal_send_times'] {
  const recommendations = [];

  // Generate recommendations for top 3 hours
  const topHours = segment.optimal_hours.slice(0, 3);

  for (const hour of topHours) {
    for (const dayOfWeek of segment.best_days.slice(0, 3)) {
      const confidenceScore = calculateConfidenceScore(hour, dayOfWeek, segment);
      const expectedResponseRate = calculateExpectedResponseRate(request, hour, dayOfWeek, segment);

      recommendations.push({
        hour,
        day_of_week: dayOfWeek,
        confidence_score: confidenceScore,
        expected_response_rate: expectedResponseRate,
        expected_cost: calculateExpectedCost(request.channels, expectedResponseRate)
      });
    }
  }

  // Sort by confidence score
  return recommendations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 5);
}

function calculateChannelPriorities(request: OptimizationRequest): OptimizationResponse['recommendations']['channel_priorities'] {
  return request.channels.map(channel => {
    const performance = CHANNEL_PERFORMANCE[channel];
    const messageTypeScore = performance.optimal_for.includes(request.message_type) ? 1.2 : 0.8;

    return {
      channel,
      priority_score: Math.round(performance.delivery_rate * performance.response_rate * messageTypeScore * 100),
      cost_per_message: performance.cost_per_message,
      expected_delivery_rate: performance.delivery_rate
    };
  }).sort((a, b) => b.priority_score - a.priority_score);
}

function generateABTestSuggestions(optimalTimes: any[]): OptimizationResponse['recommendations']['a_b_test_suggestions'] {
  const suggestions = [];

  if (optimalTimes.length >= 2) {
    // Suggest testing the top 2 optimal times
    const [best, second] = optimalTimes;

    suggestions.push({
      variant_name: `Send at ${best.hour}:00 (Best)`,
      timing_offset_hours: 0,
      expected_improvement: 0
    });

    suggestions.push({
      variant_name: `Send at ${second.hour}:00 (Alternative)`,
      timing_offset_hours: Math.abs(second.hour - best.hour),
      expected_improvement: Math.round((best.expected_response_rate - second.expected_response_rate) / best.expected_response_rate * 100)
    });
  }

  // Suggest testing different channels
  suggestions.push({
    variant_name: 'Test Kakao vs SMS delivery',
    timing_offset_hours: 1,
    expected_improvement: 15
  });

  return suggestions;
}

function calculateExpectedImprovements(
  request: OptimizationRequest,
  optimalTimes: any[],
  channels: any[]
) {
  const currentAvgCost = request.channels.reduce((sum, channel) =>
    sum + CHANNEL_PERFORMANCE[channel].cost_per_message, 0
  ) / request.channels.length;

  const optimizedCost = channels[0]?.cost_per_message || currentAvgCost;

  const currentAvgResponse = request.channels.reduce((sum, channel) =>
    sum + CHANNEL_PERFORMANCE[channel].response_rate, 0
  ) / request.channels.length;

  const optimizedResponse = Math.max(...optimalTimes.map(t => t.expected_response_rate));

  return {
    cost_savings: Math.round((currentAvgCost - optimizedCost) / currentAvgCost * 100),
    response_improvement: Math.round((optimizedResponse - currentAvgResponse) / currentAvgResponse * 100)
  };
}

function generateInsights(
  request: OptimizationRequest,
  optimalTimes: any[],
  channels: any[]
): string[] {
  const insights = [];

  // Time-based insights
  const bestTime = optimalTimes[0];
  if (bestTime) {
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    insights.push(`${dayNames[bestTime.day_of_week]} ${bestTime.hour}시에 발송할 경우 응답률이 ${Math.round(bestTime.expected_response_rate * 100)}%로 예상됩니다.`);
  }

  // Channel insights
  const bestChannel = channels[0];
  if (bestChannel) {
    const channelNames = { kakao: '카카오톡', sms: 'SMS', email: '이메일' };
    insights.push(`${channelNames[bestChannel.channel]} 채널이 가장 효과적일 것으로 예상됩니다 (우선순위 점수: ${bestChannel.priority_score}).`);
  }

  // Campaign type insights
  switch (request.campaign_type) {
    case 'post_surgery_care':
      insights.push('수술 후 케어 메시지는 환자가 안심할 수 있는 시간대가 중요합니다.');
      break;
    case 'pre_visit_reminder':
      insights.push('예약 전 리마인더는 방문 1-2일 전에 보내는 것이 효과적입니다.');
      break;
    case 'marketing':
      insights.push('마케팅 메시지는 환자의 일상 생활을 방해하지 않는 시간대를 선택하세요.');
      break;
  }

  return insights;
}

function calculateConfidenceScore(hour: number, dayOfWeek: number, segment: typeof BEHAVIOR_PATTERNS.elderly_patients): number {
  let score = 50; // Base score

  // Hour preference
  if (segment.optimal_hours.includes(hour)) score += 30;
  if (segment.avoid_hours.includes(hour)) score -= 20;

  // Day preference
  if (segment.best_days.includes(dayOfWeek)) score += 20;
  if (segment.avoid_days.includes(dayOfWeek)) score -= 15;

  // Response rate multiplier
  score *= segment.response_rate_multiplier;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateExpectedResponseRate(
  request: OptimizationRequest,
  hour: number,
  dayOfWeek: number,
  segment: typeof BEHAVIOR_PATTERNS.elderly_patients
): number {
  let baseRate = 0.08; // 8% base response rate

  // Adjust based on channel performance
  const channelMultiplier = request.channels.reduce((sum, channel) =>
    sum + CHANNEL_PERFORMANCE[channel].response_rate, 0
  ) / request.channels.length;

  baseRate *= channelMultiplier;

  // Adjust based on timing
  if (segment.optimal_hours.includes(hour)) baseRate *= 1.3;
  if (segment.best_days.includes(dayOfWeek)) baseRate *= 1.2;

  // Adjust based on message type
  switch (request.message_type) {
    case 'notification':
      baseRate *= 1.2;
      break;
    case 'reminder':
      baseRate *= 1.1;
      break;
    case 'care_instructions':
      baseRate *= 1.3;
      break;
  }

  return Math.round(baseRate * 100) / 100;
}

function calculateExpectedCost(channels: ('kakao' | 'sms' | 'email')[], responseRate: number): number {
  return channels.reduce((total, channel) => {
    const cost = CHANNEL_PERFORMANCE[channel].cost_per_message;
    // Adjust cost based on response rate (higher response = better ROI)
    return total + (cost / (responseRate > 0 ? responseRate : 0.01));
  }, 0) / channels.length;
}
