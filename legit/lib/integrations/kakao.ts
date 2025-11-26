/**
 * Kakao Business Integration for DoctorsFlow
 *
 * Supports:
 * - AlimTalk (알림톡): For medical notifications, appointment reminders, care instructions
 * - FriendTalk (친구톡): For marketing messages (health tips, promotions)
 *
 * Korean Medical Regulations Compliance:
 * - AlimTalk: Only for notifications (cannot be used for marketing)
 * - FriendTalk: Only for marketing (requires patient opt-in)
 */

import { getTemplateDisplayName } from '@/lib/utils/template-names';

interface KakaoMessageRequest {
  phone: string;
  name?: string;
  content: string;
  type: 'alim' | 'friend'; // AlimTalk vs FriendTalk
  priority?: 'low' | 'normal' | 'high';
  metadata?: {
    patient_id?: string;
    appointment_id?: string;
    surgery_type?: string;
    template_id?: string;
  };
}

interface KakaoMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'queued' | 'failed';
  cost?: number;
}

// Kakao Business API configuration
const KAKAO_CONFIG = {
  apiUrl: process.env.KAKAO_API_URL || 'https://api.kakao.com/v1/api/talk',
  appKey: process.env.KAKAO_APP_KEY,
  senderKey: process.env.KAKAO_SENDER_KEY, // For AlimTalk
  senderKeyFriend: process.env.KAKAO_SENDER_KEY_FRIEND, // For FriendTalk
  pfId: process.env.KAKAO_PF_ID, // Plus Friend ID for FriendTalk
};

// Pre-approved AlimTalk templates (Korean Medical Advertising Compliance)
const ALIM_TALK_TEMPLATES = {
  appointment_reminder: {
    templateCode: 'APPT_REMINDER_001',
    content: `{{patient_name}}님, {{appointment_date}} {{appointment_time}}에 예약되어 있습니다.

병원: {{clinic_name}}
주소: {{clinic_address}}
연락처: {{clinic_phone}}

예약 변경이나 취소는 1시간 전까지 연락주세요.`,
    variables: ['patient_name', 'appointment_date', 'appointment_time', 'clinic_name', 'clinic_address', 'clinic_phone']
  },

  surgery_reminder: {
    templateCode: 'SURGERY_REMINDER_001',
    content: `{{patient_name}}님, {{surgery_date}}에 {{surgery_type}} 수술이 예정되어 있습니다.

수술 전 준비사항:
• 금식: {{fasting_instructions}}
• 복용 약물: {{medication_instructions}}
• 동행자: {{companion_required}}

문의: {{clinic_phone}}`,
    variables: ['patient_name', 'surgery_date', 'surgery_type', 'fasting_instructions', 'medication_instructions', 'companion_required', 'clinic_phone']
  },

  post_surgery_care: {
    templateCode: 'POST_SURGERY_CARE_001',
    content: `{{patient_name}}님, 수술 후 {{days_post_surgery}}일차 케어 안내입니다.

[✅ 해야 할 일]
{{care_instructions}}

[❌ 주의사항]
{{precautions}}

다음 검진: {{next_appointment}}
응급시: {{emergency_contact}}`,
    variables: ['patient_name', 'days_post_surgery', 'care_instructions', 'precautions', 'next_appointment', 'emergency_contact']
  },

  lab_results: {
    templateCode: 'LAB_RESULTS_001',
    content: `{{patient_name}}님, 검사 결과가 도착했습니다.

결과 확인: {{results_link}}
상담 예약: {{clinic_phone}}

*본 메시지는 검사 결과를 요약한 것이 아닙니다.`,
    variables: ['patient_name', 'results_link', 'clinic_phone']
  }
};

export async function sendKakaoMessage(request: KakaoMessageRequest): Promise<KakaoMessageResponse> {
  try {
    // Validate configuration
    if (!KAKAO_CONFIG.appKey) {
      return {
        success: false,
        error: 'Kakao API key not configured'
      };
    }

    // Determine message type and validate compliance
    const isAlimTalk = request.type === 'alim';
    const isFriendTalk = request.type === 'friend';

    if (!isAlimTalk && !isFriendTalk) {
      return {
        success: false,
        error: 'Invalid message type. Must be "alim" or "friend"'
      };
    }

    // Korean medical regulations compliance check
    if (isAlimTalk && request.metadata?.template_id) {
      // Verify template exists for AlimTalk
      const template = ALIM_TALK_TEMPLATES[request.metadata.template_id as keyof typeof ALIM_TALK_TEMPLATES];
      if (!template) {
        return {
          success: false,
          error: 'Invalid AlimTalk template. Must use pre-approved templates.'
        };
      }
    }

    // Prepare message payload
    const payload = {
      senderKey: isAlimTalk ? KAKAO_CONFIG.senderKey : KAKAO_CONFIG.senderKeyFriend,
      messageType: isAlimTalk ? 'AT' : 'FT', // AT = AlimTalk, FT = FriendTalk
      recipient: {
        recipientNo: formatPhoneNumberForKakao(request.phone),
        ...(request.name && { recipientName: request.name })
      },
      message: {
        text: request.content,
        ...(isAlimTalk && request.metadata?.template_id && {
          templateCode: ALIM_TALK_TEMPLATES[request.metadata.template_id as keyof typeof ALIM_TALK_TEMPLATES]?.templateCode
        }),
        ...(isFriendTalk && KAKAO_CONFIG.pfId && {
          sender: { senderNo: KAKAO_CONFIG.pfId }
        })
      },
      // Metadata for tracking
      customFields: {
        patient_id: request.metadata?.patient_id,
        appointment_id: request.metadata?.appointment_id,
        surgery_type: request.metadata?.surgery_type,
        message_type: request.type,
        priority: request.priority || 'normal'
      }
    };

    // Send message via Kakao API
    const response = await fetch(`${KAKAO_CONFIG.apiUrl}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `KakaoAK ${KAKAO_CONFIG.appKey}`,
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.code === '0000') {
      // Calculate cost (Korean Won)
      const cost = calculateKakaoCost(request.content.length, isAlimTalk);

      return {
        success: true,
        messageId: result.messageId || result.msgId,
        deliveryStatus: 'sent',
        cost
      };
    } else {
      return {
        success: false,
        error: result.message || `Kakao API error: ${result.code}`,
        deliveryStatus: 'failed'
      };
    }

  } catch (error) {
    console.error('Kakao message send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Kakao API error',
      deliveryStatus: 'failed'
    };
  }
}

// Get available AlimTalk templates
export function getAlimTalkTemplates() {
  return Object.entries(ALIM_TALK_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: getTemplateDisplayName(key),
    templateCode: template.templateCode,
    content: template.content,
    variables: template.variables
  }));
}

// Validate if content complies with template
export function validateAlimTalkContent(templateId: string, content: string): boolean {
  const template = ALIM_TALK_TEMPLATES[templateId as keyof typeof ALIM_TALK_TEMPLATES];
  if (!template) return false;

  // Check if all required variables are present
  return template.variables.every(variable => content.includes(`{{${variable}}}`));
}

// Get delivery status for a message
export async function getKakaoMessageStatus(messageId: string): Promise<{
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
}> {
  try {
    const response = await fetch(`${KAKAO_CONFIG.apiUrl}/message/status/${messageId}`, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_CONFIG.appKey}`,
      }
    });

    const result = await response.json();

    return {
      status: result.status === '완료' ? 'delivered' : result.status === '실패' ? 'failed' : 'sent',
      timestamp: result.timestamp
    };
  } catch (error) {
    return { status: 'failed' };
  }
}

// Helper functions
function formatPhoneNumberForKakao(phone: string): string {
  // Remove all non-numeric characters and ensure Korean format for Kakao API
  let cleaned = phone.replace(/\D/g, '');

  // Add +82 prefix if not present
  if (!cleaned.startsWith('82') && !cleaned.startsWith('+82')) {
    cleaned = '82' + cleaned;
  }

  return cleaned;
}

function calculateKakaoCost(messageLength: number, isAlimTalk: boolean): number {
  // Korean pricing (as of 2024)
  const basePrice = isAlimTalk ? 10 : 20; // Won per message
  const longMessageMultiplier = messageLength > 1000 ? Math.ceil(messageLength / 1000) : 1;

  return basePrice * longMessageMultiplier;
}
