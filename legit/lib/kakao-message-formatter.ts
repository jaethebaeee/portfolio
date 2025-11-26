/**
 * 카카오톡 메시지 포맷터
 * 예약 안내 메시지를 카카오톡에 적합한 형식으로 포맷팅
 */

export interface AppointmentMessageData {
  patientName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  type?: string;
  hospitalName?: string;
  hospitalPhone?: string;
  notes?: string;
}

export type MessageTemplate = 'appointment_confirmation' | 'appointment_reminder' | 'appointment_completed' | 'custom';

/**
 * 예약 확인 메시지 생성
 */
export function formatAppointmentMessage(
  data: AppointmentMessageData,
  template: MessageTemplate = 'appointment_confirmation'
): string {
  const hospitalName = data.hospitalName || '닥터스플로우';
  const hospitalPhone = data.hospitalPhone || '02-1234-5678';
  
  // 날짜 포맷팅 (YYYY-MM-DD -> 2024년 1월 20일)
  const formattedDate = formatKoreanDate(data.appointmentDate);
  
  // 시간 포맷팅 (HH:mm -> 오후 2시 30분)
  const formattedTime = formatKoreanTime(data.appointmentTime);
  
  switch (template) {
    case 'appointment_confirmation':
      return `[${hospitalName}] 예약 안내

안녕하세요 ${data.patientName}님,

예약하신 일정을 안내드립니다.

📅 일시: ${formattedDate} ${formattedTime}
🏥 내용: ${data.type || '진료 예약'}

내원 시 신분증을 지참해주세요.
변경 사항이 있으시면 미리 연락 부탁드립니다.

문의: ${hospitalPhone}

감사합니다.`;

    case 'appointment_reminder':
      return `[${hospitalName}] 예약 리마인더

안녕하세요 ${data.patientName}님,

내일 예약 일정을 안내드립니다.

📅 일시: ${formattedDate} ${formattedTime}
🏥 내용: ${data.type || '진료 예약'}

예약 시간에 맞춰 내원해주시기 바랍니다.
변경 사항이 있으시면 미리 연락 부탁드립니다.

문의: ${hospitalPhone}

감사합니다.`;

    case 'appointment_completed':
      return `[${hospitalName}] 방문 감사

안녕하세요 ${data.patientName}님,

오늘 방문해주셔서 감사합니다.

${data.type ? `진료 내용: ${data.type}` : ''}

회복이 잘 되시길 바랍니다.
추가 문의사항이 있으시면 언제든지 연락주세요.

문의: ${hospitalPhone}

감사합니다.`;

    default:
      return formatAppointmentMessage(data, 'appointment_confirmation');
  }
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatKoreanDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  } catch {
    return dateString;
  }
}

/**
 * 시간을 한국어 형식으로 포맷팅
 */
function formatKoreanTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? '오후' : '오전';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    
    return `${period} ${displayHour}시 ${minutes}분`;
  } catch {
    return timeString;
  }
}

/**
 * SMS 형식 메시지 생성 (90바이트 이하)
 */
export function formatSMSMessage(data: AppointmentMessageData): string {
  const hospitalName = data.hospitalName || '닥터스플로우';
  const formattedDate = formatKoreanDate(data.appointmentDate);
  const formattedTime = formatKoreanTime(data.appointmentTime);
  
  return `[${hospitalName}] ${data.patientName}님, 예약 안내드립니다. ${formattedDate} ${formattedTime} ${data.type || '진료'}`;
}

