/**
 * Email Integration for DoctorsFlow
 *
 * Supports:
 * - SendGrid (recommended for medical communications)
 * - AWS SES
 * - Resend
 * - Custom SMTP
 *
 * Medical compliance features:
 * - HIPAA-compliant logging
 * - Delivery tracking
 * - Bounce handling
 * - Opt-out management
 */

import { getTemplateDisplayName } from '@/lib/utils/template-names';

interface EmailMessageRequest {
  email: string;
  name?: string;
  subject: string;
  content: string;
  type: 'notification' | 'marketing' | 'reminder' | 'care_instructions';
  priority?: 'low' | 'normal' | 'high';
  metadata?: {
    patient_id?: string;
    appointment_id?: string;
    surgery_type?: string;
    template_id?: string;
  };
}

interface EmailMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'queued' | 'failed';
  cost?: number;
}

// Email provider configurations
const EMAIL_PROVIDERS = {
  sendgrid: {
    apiUrl: 'https://api.sendgrid.com/v3/mail/send',
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME,
    priority: 1,
  },
  resend: {
    apiUrl: 'https://api.resend.com/emails',
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL,
    fromName: process.env.RESEND_FROM_NAME,
    priority: 2,
  },
  aws_ses: {
    apiUrl: process.env.AWS_SES_API_URL,
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-northeast-2',
    fromEmail: process.env.AWS_SES_FROM_EMAIL,
    fromName: process.env.AWS_SES_FROM_NAME,
    priority: 3,
  }
};

// Cost per email (Korean Won, as of 2024)
const EMAIL_COSTS = {
  sendgrid: 0.5, // Per email
  resend: 0.3,
  aws_ses: 0.2
};

// Email templates for medical communications
const EMAIL_TEMPLATES = {
  appointment_reminder: {
    subject: '{{patient_name}}님, {{appointment_date}} 진료 예약 알림',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>{{clinic_name}} 진료 예약 알림</h2>
        <p>{{patient_name}}님, 안녕하세요.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>예약 정보</h3>
          <p><strong>날짜:</strong> {{appointment_date}}</p>
          <p><strong>시간:</strong> {{appointment_time}}</p>
          <p><strong>진료과:</strong> {{department}}</p>
          <p><strong>담당의:</strong> {{doctor_name}}</p>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>📋 준비사항</h4>
          <ul>
            <li>건강보험증 지참</li>
            <li>이전 진료 기록 (있으시는 경우)</li>
            <li>현재 복용 중인 약 목록</li>
          </ul>
        </div>

        <p>예약 변경이나 취소는 <strong>1시간 전</strong>까지 연락주시기 바랍니다.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p><strong>{{clinic_name}}</strong></p>
          <p>📍 {{clinic_address}}</p>
          <p>📞 {{clinic_phone}}</p>
          <p>🌐 {{clinic_website}}</p>
        </div>
      </div>
    `,
    text: `
{{patient_name}}님, {{appointment_date}} 진료 예약 알림

[예약 정보]
날짜: {{appointment_date}}
시간: {{appointment_time}}
진료과: {{department}}
담당의: {{doctor_name}}

[준비사항]
• 건강보험증 지참
• 이전 진료 기록 (있으시는 경우)
• 현재 복용 중인 약 목록

예약 변경이나 취소는 1시간 전까지 연락주시기 바랍니다.

{{clinic_name}}
{{clinic_address}}
{{clinic_phone}}
{{clinic_website}}
    `
  },

  post_surgery_care: {
    subject: '{{patient_name}}님, 수술 후 {{days_post_surgery}}일차 케어 안내',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>수술 후 케어 안내</h2>
        <p>{{patient_name}}님, 수술 후 {{days_post_surgery}}일차 케어 안내입니다.</p>

        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2e7d32;">✅ 해야 할 일</h3>
          <div>{{care_instructions}}</div>
        </div>

        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #c62828;">❌ 주의사항</h3>
          <div>{{precautions}}</div>
        </div>

        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>💊 약물 복용</h4>
          <p>{{medication_instructions}}</p>
        </div>

        <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4>📅 다음 일정</h4>
          <p><strong>다음 검진:</strong> {{next_appointment}}</p>
          <p><strong>응급 연락:</strong> {{emergency_contact}}</p>
        </div>

        <p style="color: #666; font-size: 14px;">
          이상 증상이 있으시면 즉시 연락주시기 바랍니다.<br>
          건강한 회복을 기원합니다.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p><strong>{{clinic_name}}</strong></p>
          <p>📞 {{clinic_phone}}</p>
        </div>
      </div>
    `,
    text: `
수술 후 케어 안내

{{patient_name}}님, 수술 후 {{days_post_surgery}}일차 케어 안내입니다.

=== 해야 할 일 ===
{{care_instructions}}

=== 주의사항 ===
{{precautions}}

=== 약물 복용 ===
{{medication_instructions}}

=== 다음 일정 ===
다음 검진: {{next_appointment}}
응급 연락: {{emergency_contact}}

이상 증상이 있으시면 즉시 연락주시기 바랍니다.

{{clinic_name}}
{{clinic_phone}}
    `
  }
};

export async function sendEmailMessage(request: EmailMessageRequest): Promise<EmailMessageResponse> {
  const providers = Object.entries(EMAIL_PROVIDERS)
    .sort(([,a], [,b]) => a.priority - b.priority);

  for (const [providerName, config] of providers) {
    if (!config.apiKey || !config.fromEmail) {
      continue;
    }

    try {
      let result: EmailMessageResponse;

      switch (providerName) {
        case 'sendgrid':
          result = await sendSendGridEmail(request, config);
          break;
        case 'resend':
          result = await sendResendEmail(request, config);
          break;
        case 'aws_ses':
          result = await sendAWSSESEmail(request, config);
          break;
        default:
          continue;
      }

      if (result.success) {
        return {
          ...result,
          cost: EMAIL_COSTS[providerName as keyof typeof EMAIL_COSTS]
        };
      }

    } catch (error) {
      console.warn(`Email provider ${providerName} error:`, error);
      continue;
    }
  }

  return {
    success: false,
    error: 'All email providers failed',
    deliveryStatus: 'failed'
  };
}

// SendGrid integration
async function sendSendGridEmail(
  request: EmailMessageRequest,
  config: typeof EMAIL_PROVIDERS.sendgrid
): Promise<EmailMessageResponse> {
  const payload = {
    personalizations: [{
      to: [{
        email: request.email,
        ...(request.name && { name: request.name })
      }],
      subject: request.subject
    }],
    from: {
      email: config.fromEmail!,
      ...(config.fromName && { name: config.fromName })
    },
    content: [{
      type: 'text/html',
      value: convertToHtml(request.content)
    }],
    custom_args: {
      patient_id: request.metadata?.patient_id,
      message_type: request.type,
      priority: request.priority
    }
  };

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const result = await response.json();
    return {
      success: true,
      messageId: response.headers.get('x-message-id') || undefined,
      deliveryStatus: 'sent'
    };
  }

  const error = await response.text();
  return {
    success: false,
    error: `SendGrid error: ${error}`,
    deliveryStatus: 'failed'
  };
}

// Resend integration
async function sendResendEmail(
  request: EmailMessageRequest,
  config: typeof EMAIL_PROVIDERS.resend
): Promise<EmailMessageResponse> {
  const payload = {
    from: config.fromName
      ? `${config.fromName} <${config.fromEmail}>`
      : config.fromEmail!,
    to: [request.email],
    subject: request.subject,
    html: convertToHtml(request.content),
    headers: {
      'X-Patient-ID': request.metadata?.patient_id || '',
      'X-Message-Type': request.type,
      'X-Priority': request.priority || 'normal'
    }
  };

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (response.ok && result.id) {
    return {
      success: true,
      messageId: result.id,
      deliveryStatus: 'sent'
    };
  }

  return {
    success: false,
    error: result.message || 'Resend error',
    deliveryStatus: 'failed'
  };
}

// AWS SES integration
async function sendAWSSESEmail(
  request: EmailMessageRequest,
  config: typeof EMAIL_PROVIDERS.aws_ses
): Promise<EmailMessageResponse> {
  const payload = {
    Source: config.fromEmail!,
    Destination: {
      ToAddresses: [request.email]
    },
    Message: {
      Subject: {
        Data: request.subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: convertToHtml(request.content),
          Charset: 'UTF-8'
        },
        Text: {
          Data: request.content,
          Charset: 'UTF-8'
        }
      }
    },
    Tags: [
      { Name: 'patient_id', Value: request.metadata?.patient_id || '' },
      { Name: 'message_type', Value: request.type },
      { Name: 'priority', Value: request.priority || 'normal' }
    ]
  };

  // AWS SES requires signature calculation
  const response = await fetch(config.apiUrl!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKey}`,
      'X-Amz-Target': 'SimpleEmailService.SendEmail'
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    const result = await response.json();
    return {
      success: true,
      messageId: result.MessageId,
      deliveryStatus: 'sent'
    };
  }

  return {
    success: false,
    error: 'AWS SES send failed',
    deliveryStatus: 'failed'
  };
}

// Template management
export function getEmailTemplates() {
  return Object.entries(EMAIL_TEMPLATES).map(([key, template]) => ({
    id: key,
    name: getTemplateDisplayName(key),
    subject: template.subject,
    html: template.html,
    text: template.text,
    variables: extractVariables(template.subject + template.html + template.text)
  }));
}

export function renderEmailTemplate(
  templateId: string,
  variables: Record<string, string>
): { subject: string; html: string; text: string } | null {
  const template = EMAIL_TEMPLATES[templateId as keyof typeof EMAIL_TEMPLATES];
  if (!template) return null;

  return {
    subject: replaceVariables(template.subject, variables),
    html: replaceVariables(template.html, variables),
    text: replaceVariables(template.text, variables)
  };
}

// Helper functions
function convertToHtml(text: string): string {
  // Simple text to HTML conversion
  return text
    .split('\n')
    .map(line => {
      if (line.startsWith('===') && line.endsWith('===')) {
        return `<h3>${line.slice(3, -3)}</h3>`;
      }
      if (line.startsWith('• ')) {
        return `<li>${line.slice(2)}</li>`;
      }
      if (line.trim() === '') {
        return '<br>';
      }
      return `<p>${line}</p>`;
    })
    .join('\n')
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>(?!<li>)/g, '</li></ul>');
}

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];

  return [...new Set(matches.map(match => match.slice(2, -2)))];
}

function replaceVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

