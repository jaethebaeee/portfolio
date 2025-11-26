/**
 * Template display name mappings
 * Shared utility for template name display across integrations
 */
export function getTemplateDisplayName(templateId: string): string {
  const names: Record<string, string> = {
    appointment_reminder: '예약 알림',
    surgery_reminder: '수술 사전 안내',
    post_surgery_care: '수술 후 케어',
    lab_results: '검사 결과 알림',
    cancellation_reason: '취소 사유 조사',
    patient_feedback: '환자 피드백',
    medication_reminder: '복약 리마인더',
  };

  return names[templateId] || templateId;
}

