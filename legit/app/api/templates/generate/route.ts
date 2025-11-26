import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TemplateGenerationRequest {
  type: 'post_surgery_care' | 'pre_visit_reminder' | 'follow_up' | 'marketing';
  surgery_type?: string;
  patient_data?: {
    name: string;
    age?: number;
    surgery_date?: string;
    next_appointment?: string;
    phone?: string;
  };
  context?: {
    days_post_surgery?: number;
    urgency_level?: 'low' | 'medium' | 'high';
    language?: 'ko' | 'en';
  };
  custom_requirements?: string;
}

export interface TemplateGenerationResponse {
  success: boolean;
  template: {
    title: string;
    content: string;
    variables: string[];
    suggested_timing: string;
    channel_preference: 'kakao' | 'sms' | 'email';
  };
  error?: string;
}

// Korean medical care instruction templates
const CARE_INSTRUCTIONS = {
  lasik: {
    day_0: `수술 당일입니다.

[✅ 해야 할 일]
• 처방받으신 안약을 정확한 시간에 점안하세요
• 보호안경을 착용하고 집에서 휴식하세요

[❌ 하지 말아야 할 일]
• TV, 스마트폰, 컴퓨터 사용 자제 (최소 4시간)
• 세안, 샤워 금지 (얼굴에 물 닿지 않게)
• 화장, 향수 사용 금지
• 무거운 물건 들기 금지

통증이나 이상 증상이 있으시면 즉시 연락주세요.`,

    day_1: `수술 후 첫날입니다.

[✅ 해야 할 일]
• 안약을 규칙적으로 점안하세요
• 보호안경 착용 유지

[❌ 하지 말아야 할 일]
• 운전 절대 금지 (시력 회복 전까지)
• 눈 비비기, 문지르기 금지
• 찬바람, 먼지 많은 곳 피하기
• 격한 운동, 사우나 금지

오늘 검진에서 회복 상태를 확인합니다.`,

    day_3: `수술 3일차 - 염증이 가장 심한 시기입니다.

[✅ 해야 할 일]
• 냉찜질로 염증 완화 (1회 10분, 1일 3-4회)
• 안약을 시간 엄수해서 점안

[❌ 하지 말아야 할 일]
• 화장품, 샴푸 사용 금지
• 헤어드라이어 뜨거운 바람 피하기
• 흡연, 음주 절대 금지
• 커피, 자극적인 음식 피하기

불편함이 심하시면 진통제 복용 후 연락주세요.`,
  },

  cataract: {
    day_0: `백내장 수술 당일입니다.

[✅ 즉시 해야 할 일]
• 보호안대를 착용하고 휴식하세요
• 처방받으신 안약을 정확히 점안하세요
• 통증 있으면 진통제 복용하세요

[❌ 절대 금지사항]
• 보호안대 벗기 금지
• 눈 비비기, 만지기 금지
• 세수, 샤워 금지
• 무거운 물건 들기 금지

수술 부위에 이상 증상(출혈, 심한 통증)이 있으면 즉시 연락주세요.`,

    day_1: `수술 후 첫날입니다.

[✅ 검진 준비사항]
• 보호안대 착용하고 내원
• 동반 보호자 동행 권장

[🛋️ 집에서 할 수 있는 일]
• 가벼운 독서나 TV 시청 가능
• 안약 규칙적으로 점안
• 충분한 수면 취하기

[🚫 여전히 금지사항]
• 운전 절대 금지
• 무거운 집안일 금지
• 목욕, 사우나 금지

오늘 검진에서 수술 상태를 확인합니다.`,
  },

  rhinoplasty: {
    day_0: `코성형 수술 당일입니다.

[🧊 즉시 해야 할 일 - 냉찜질]
• 얼음팩으로 코 부위 냉찜질 시작
• 1회 10분, 1시간 간격으로 반복
• 수술 후 3일간 냉찜질 유지

[🛏️ 수면 자세]
• 머리를 심장보다 높게 유지 (베개 2-3개 사용)
• 옆으로 누워 자지 말고 등을 대고 자세요

[❌ 절대 금지사항]
• 코 만지기, 문지르기 금지
• 세수, 샤워 금지
• 코 풀기, 재채기 세게 하기 금지
• 무거운 물건 들기 금지

통증이 심하시면 진통제 복용 후 연락주세요.`,

    day_3: `수술 3일차 - 냉찜질에서 온찜질로 전환

[🔥 이제 온찜질 시작]
• 미지근한 물수건으로 온찜질
• 1회 10분, 1일 3회
• 혈액순환 돕고 붓기 감소

[💊 약물 관리]
• 처방받으신 약 규칙적으로 복용
• 항생제, 소염제 빠뜨리지 말기

[⚠️ 모니터링 할 증상]
• 출혈이 멎지 않는 경우
• 심한 통증이나 부기
• 고열이 나는 경우

이상 증상이 있으시면 즉시 연락주세요.`,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: TemplateGenerationRequest = await request.json();

    // Validate required fields
    if (!body.type) {
      return NextResponse.json({
        success: false,
        error: 'Template type is required'
      } as TemplateGenerationResponse, { status: 400 });
    }

    let generatedTemplate;

    switch (body.type) {
      case 'post_surgery_care':
        generatedTemplate = await generatePostSurgeryCareTemplate(body);
        break;

      case 'pre_visit_reminder':
        generatedTemplate = await generatePreVisitReminderTemplate(body);
        break;

      case 'follow_up':
        generatedTemplate = await generateFollowUpTemplate(body);
        break;

      case 'marketing':
        generatedTemplate = await generateMarketingTemplate(body);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid template type'
        } as TemplateGenerationResponse, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      template: generatedTemplate
    } as TemplateGenerationResponse);

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate template'
    } as TemplateGenerationResponse, { status: 500 });
  }
}

async function generatePostSurgeryCareTemplate(body: TemplateGenerationRequest) {
  const { surgery_type, patient_data, context } = body;
  const days_post_surgery = context?.days_post_surgery || 0;
  const language = context?.language || 'ko';

  // Try to use pre-built templates first
  if (surgery_type && CARE_INSTRUCTIONS[surgery_type as keyof typeof CARE_INSTRUCTIONS]) {
    const instructions = CARE_INSTRUCTIONS[surgery_type as keyof typeof CARE_INSTRUCTIONS];

    // Find the most appropriate instruction based on days post-surgery
    let content = '';
    if (days_post_surgery === 0) content = instructions.day_0;
    else if (days_post_surgery === 1) content = instructions.day_1;
    else if (days_post_surgery >= 3) content = instructions.day_3;
    else content = instructions.day_0; // fallback

    if (content) {
      return {
        title: `${surgery_type} 수술 후 ${days_post_surgery}일차 케어 안내`,
        content: patient_data?.name ? `${patient_data.name}님, ${content}` : content,
        variables: ['patient_name', 'surgery_date', 'next_appointment'],
        suggested_timing: getSuggestedTiming(days_post_surgery),
        channel_preference: 'kakao' as const,
      };
    }
  }

  // Fall back to AI generation
  const prompt = `Generate a personalized post-surgery care message for a ${surgery_type || 'general surgery'} patient who is ${days_post_surgery} days post-operation.

Patient details: ${patient_data ? JSON.stringify(patient_data) : 'No specific patient data'}

Create a message that includes:
1. Current recovery status and what's normal at this stage
2. Specific do's and don'ts for this day
3. Warning signs to watch for
4. Next steps or appointments
5. Encouraging and supportive tone

Format as a Korean medical care message suitable for KakaoTalk.
Keep it concise but comprehensive.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a Korean medical clinic assistant specializing in post-operative care instructions. Create clear, compassionate, and medically accurate care messages.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const aiContent = completion.choices[0]?.message?.content || 'AI 생성에 실패했습니다.';

  return {
    title: `${surgery_type || '수술'} 후 ${days_post_surgery}일차 케어 안내`,
    content: aiContent,
    variables: ['patient_name', 'surgery_date', 'next_appointment', 'clinic_phone'],
    suggested_timing: getSuggestedTiming(days_post_surgery),
    channel_preference: 'kakao' as const,
  };
}

async function generatePreVisitReminderTemplate(body: TemplateGenerationRequest) {
  const { patient_data, context } = body;
  const language = context?.language || 'ko';

  const prompt = `Create a pre-visit reminder message for a patient appointment.

Patient details: ${patient_data ? JSON.stringify(patient_data) : 'General patient'}

Include:
1. Appointment confirmation
2. What to bring (insurance, records, etc.)
3. Preparation instructions
4. Clinic location/contact info
5. Friendly, reassuring tone

Format for KakaoTalk messaging.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a friendly Korean medical clinic receptionist creating appointment reminders.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 600,
  });

  const aiContent = completion.choices[0]?.message?.content || 'AI 생성에 실패했습니다.';

  return {
    title: '진료 예약 사전 안내',
    content: aiContent,
    variables: ['patient_name', 'appointment_date', 'appointment_time', 'clinic_address', 'clinic_phone'],
    suggested_timing: '1일 전 오전 9시',
    channel_preference: 'kakao' as const,
  };
}

async function generateFollowUpTemplate(body: TemplateGenerationRequest) {
  const { patient_data, context } = body;

  const prompt = `Create a follow-up message for a patient after their recent visit or surgery.

Patient details: ${patient_data ? JSON.stringify(patient_data) : 'General patient'}
Context: ${context ? JSON.stringify(context) : 'General follow-up'}

Include:
1. Check on their recovery/progress
2. Remind about any follow-up appointments
3. Ask about concerns or questions
4. Offer contact information
5. Supportive and caring tone

Format for Korean medical communication.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a caring Korean medical professional following up with patients about their care.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const aiContent = completion.choices[0]?.message?.content || 'AI 생성에 실패했습니다.';

  return {
    title: '진료 경과 확인 및 안내',
    content: aiContent,
    variables: ['patient_name', 'last_visit_date', 'next_appointment', 'clinic_phone'],
    suggested_timing: '방문 후 3일',
    channel_preference: 'kakao' as const,
  };
}

async function generateMarketingTemplate(body: TemplateGenerationRequest) {
  const { custom_requirements, context } = body;

  const prompt = `Create a marketing message for a Korean medical clinic that complies with Korean medical advertising regulations.

Requirements: ${custom_requirements || 'General health promotion'}
Context: ${context ? JSON.stringify(context) : 'General marketing'}

Important: Korean medical advertising laws prohibit:
- Claims of "best", "guaranteed success"
- Before/after photos without consent
- Comparison with other clinics
- Patient testimonials
- Exaggerated efficacy claims

Focus on:
1. Factual information about services
2. General health tips
3. Appointment booking encouragement
4. Professional, trustworthy tone

Keep under 200 characters for optimal delivery.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a compliance-focused Korean medical marketing specialist. All content must comply with Korean medical advertising laws (Medical Service Act).'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 300,
  });

  const aiContent = completion.choices[0]?.message?.content || 'AI 생성에 실패했습니다.';

  return {
    title: '건강 관리 정보',
    content: aiContent,
    variables: ['clinic_name', 'promotion_details', 'booking_link'],
    suggested_timing: '주 1회',
    channel_preference: 'kakao' as const,
  };
}

function getSuggestedTiming(daysPostSurgery: number): string {
  if (daysPostSurgery === 0) return '수술 당일 저녁 6시';
  if (daysPostSurgery === 1) return '수술 다음날 오전 9시';
  if (daysPostSurgery <= 3) return '오전 9시';
  if (daysPostSurgery <= 7) return '오전 10시';
  if (daysPostSurgery <= 14) return '오후 2시';
  return '오전 11시';
}
