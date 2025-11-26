/**
 * SMS Integration for DoctorsFlow
 *
 * Supports major Korean SMS providers:
 * - NHN Cloud (Toast Cloud)
 * - Coolsms
 * - Bizppurio
 *
 * Features:
 * - Automatic provider failover
 * - Cost optimization
 * - Delivery tracking
 * - Korean medical compliance
 */

interface SMSMessageRequest {
  phone: string;
  name?: string;
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

interface SMSMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'sent' | 'queued' | 'failed';
  cost?: number;
  provider?: string;
}

// SMS Provider configurations
const SMS_PROVIDERS = {
  nhn: {
    apiUrl: process.env.NHN_SMS_API_URL || 'https://api-sms.cloud.toast.com/sms/v3.0/appKeys',
    appKey: process.env.NHN_APP_KEY,
    secretKey: process.env.NHN_SECRET_KEY,
    senderPhone: process.env.NHN_SENDER_PHONE,
    priority: 1, // Highest priority
  },
  coolsms: {
    apiUrl: process.env.COOLSMS_API_URL || 'https://api.coolsms.co.kr/sms/2/send',
    apiKey: process.env.COOLSMS_API_KEY,
    apiSecret: process.env.COOLSMS_API_SECRET,
    senderPhone: process.env.COOLSMS_SENDER_PHONE,
    priority: 2,
  },
  bizppurio: {
    apiUrl: process.env.BIZPPURIO_API_URL || 'https://api.bizppurio.com/v1/sms',
    apiKey: process.env.BIZPPURIO_API_KEY,
    apiSecret: process.env.BIZPPURIO_API_SECRET,
    senderPhone: process.env.BIZPPURIO_SENDER_PHONE,
    priority: 3,
  }
};

// Cost per message (Korean Won, as of 2024)
const SMS_COSTS = {
  nhn: { sms: 8, lms: 30 },
  coolsms: { sms: 7, lms: 25 },
  bizppurio: { sms: 9, lms: 35 }
};

export async function sendSMSMessage(request: SMSMessageRequest): Promise<SMSMessageResponse> {
  const providers = Object.entries(SMS_PROVIDERS)
    .sort(([,a], [,b]) => a.priority - b.priority); // Sort by priority

  for (const [providerName, config] of providers) {
    // Check if provider is configured
    if (!config.apiKey || !config.senderPhone) {
      continue;
    }

    try {
      let result: SMSMessageResponse;

      switch (providerName) {
        case 'nhn':
          result = await sendNHNSMS(request, config);
          break;
        case 'coolsms':
          result = await sendCoolsms(request, config);
          break;
        case 'bizppurio':
          result = await sendBizppurioSMS(request, config);
          break;
        default:
          continue;
      }

      if (result.success) {
        return {
          ...result,
          provider: providerName
        };
      }

      // Log failure but continue to next provider
      console.warn(`SMS provider ${providerName} failed:`, result.error);

    } catch (error) {
      console.warn(`SMS provider ${providerName} error:`, error);
      continue;
    }
  }

  return {
    success: false,
    error: 'All SMS providers failed',
    deliveryStatus: 'failed'
  };
}

// NHN Cloud (Toast Cloud) SMS
async function sendNHNSMS(
  request: SMSMessageRequest,
  config: typeof SMS_PROVIDERS.nhn
): Promise<SMSMessageResponse> {
  const isLMS = request.content.length > 90; // Korean SMS vs LMS threshold

  const payload = {
    senderNo: config.senderPhone,
    recipientList: [{
      recipientNo: formatPhoneNumberForSMS(request.phone),
      ...(request.name && { recipientName: request.name })
    }],
    message: {
      text: request.content,
      useSmsFailover: true // Use SMS if LMS fails
    },
    metadata: {
      patient_id: request.metadata?.patient_id,
      message_type: request.type,
      priority: request.priority
    }
  };

  const response = await fetch(`${config.apiUrl}/${config.appKey}/sender/sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Secret-Key': config.secretKey!,
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (response.ok && result.header.isSuccessful) {
    const cost = isLMS ? SMS_COSTS.nhn.lms : SMS_COSTS.nhn.sms;

    return {
      success: true,
      messageId: result.body.requestId,
      deliveryStatus: 'sent',
      cost
    };
  }

  return {
    success: false,
    error: result.header.resultMessage || 'NHN SMS send failed',
    deliveryStatus: 'failed'
  };
}

// Coolsms
async function sendCoolsms(
  request: SMSMessageRequest,
  config: typeof SMS_PROVIDERS.coolsms
): Promise<SMSMessageResponse> {
  const isLMS = request.content.length > 90;

  const payload = {
    to: formatPhoneNumber(request.phone),
    from: config.senderPhone,
    text: request.content,
    type: isLMS ? 'LMS' : 'SMS',
    subject: request.name ? `${request.name}님` : '메시지',
    customFields: {
      patient_id: request.metadata?.patient_id,
      message_type: request.type
    }
  };

  // Create authorization header
  const authHeader = btoa(`${config.apiKey}:${config.apiSecret}`);

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (response.ok && result.success_count > 0) {
    const cost = isLMS ? SMS_COSTS.coolsms.lms : SMS_COSTS.coolsms.sms;

    return {
      success: true,
      messageId: result.group_id,
      deliveryStatus: 'sent',
      cost
    };
  }

  return {
    success: false,
    error: result.error_list?.[0]?.message || 'Coolsms send failed',
    deliveryStatus: 'failed'
  };
}

// Bizppurio
async function sendBizppurioSMS(
  request: SMSMessageRequest,
  config: typeof SMS_PROVIDERS.bizppurio
): Promise<SMSMessageResponse> {
  const isLMS = request.content.length > 90;

  const payload = {
    send_type: isLMS ? 'lms' : 'sms',
    sender: config.senderPhone,
    receiver: formatPhoneNumber(request.phone),
    message: request.content,
    ...(request.name && { title: `${request.name}님` }),
    metadata: {
      patient_id: request.metadata?.patient_id,
      message_type: request.type
    }
  };

  const response = await fetch(`${config.apiUrl}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (response.ok && result.code === 'success') {
    const cost = isLMS ? SMS_COSTS.bizppurio.lms : SMS_COSTS.bizppurio.sms;

    return {
      success: true,
      messageId: result.message_id,
      deliveryStatus: 'sent',
      cost
    };
  }

  return {
    success: false,
    error: result.description || 'Bizppurio send failed',
    deliveryStatus: 'failed'
  };
}

// Get SMS delivery status
export async function getSMSDeliveryStatus(
  messageId: string,
  provider: string
): Promise<{
  status: 'sent' | 'delivered' | 'failed';
  timestamp?: string;
}> {
  try {
    const config = SMS_PROVIDERS[provider as keyof typeof SMS_PROVIDERS];
    if (!config) {
      return { status: 'failed' };
    }

    let statusUrl: string;
    let headers: Record<string, string> = {};

    switch (provider) {
      case 'nhn':
        statusUrl = `${SMS_PROVIDERS.nhn.apiUrl}/${SMS_PROVIDERS.nhn.appKey}/sender/sms/${messageId}`;
        headers = { 'X-Secret-Key': SMS_PROVIDERS.nhn.secretKey! };
        break;
      case 'coolsms':
        statusUrl = `https://api.coolsms.co.kr/sms/2/sent/${messageId}`;
        headers = { 'Authorization': `Basic ${btoa(`${SMS_PROVIDERS.coolsms.apiKey}:${SMS_PROVIDERS.coolsms.apiSecret}`)}` };
        break;
      case 'bizppurio':
        statusUrl = `${SMS_PROVIDERS.bizppurio.apiUrl}/status/${messageId}`;
        headers = { 'Authorization': `Bearer ${SMS_PROVIDERS.bizppurio.apiKey}` };
        break;
      default:
        return { status: 'failed' };
    }

    const response = await fetch(statusUrl, { headers });
    const result = await response.json();

    // Parse status based on provider response format
    return parseSMSStatus(result, provider);

  } catch (error) {
    console.error('SMS status check error:', error);
    return { status: 'failed' };
  }
}

// Get cost estimate for a message
export function estimateSMSCost(content: string): {
  sms: number;
  lms: number;
  recommended: 'sms' | 'lms';
} {
  const isLMS = content.length > 90;
  const recommended = isLMS ? 'lms' : 'sms';

  // Get minimum cost across providers
  const costs = Object.values(SMS_COSTS).map(provider =>
    isLMS ? provider.lms : provider.sms
  );

  return {
    sms: Math.min(...Object.values(SMS_COSTS).map(p => p.sms)),
    lms: Math.min(...Object.values(SMS_COSTS).map(p => p.lms)),
    recommended
  };
}

// Helper functions
function formatPhoneNumberForSMS(phone: string): string {
  // Ensure Korean mobile format for SMS API
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('82')) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('+82')) {
    cleaned = '0' + cleaned.substring(3);
  }

  return cleaned;
}

function parseSMSStatus(result: any, provider: string): {
  status: 'sent' | 'delivered' | 'failed';
  timestamp?: string;
} {
  switch (provider) {
    case 'nhn':
      return {
        status: result.body?.sendResultList?.[0]?.sendResult === 'success' ? 'delivered' : 'failed',
        timestamp: result.body?.sendResultList?.[0]?.sentTime
      };

    case 'coolsms':
      return {
        status: result.status === '완료' ? 'delivered' : result.status === '실패' ? 'failed' : 'sent',
        timestamp: result.sent_time
      };

    case 'bizppurio':
      return {
        status: result.status === 'delivered' ? 'delivered' : result.status === 'failed' ? 'failed' : 'sent',
        timestamp: result.sent_at
      };

    default:
      return { status: 'failed' };
  }
}
