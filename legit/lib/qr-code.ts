/**
 * QR 코드 생성 유틸리티
 * qrcode 라이브러리 사용
 */

/**
 * QR 코드 생성 (서버 사이드)
 * 
 * 참고: qrcode 패키지 설치 필요
 * npm install qrcode @types/qrcode
 */
export async function generateQRCode(
  data: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    // 동적 import로 서버 사이드에서만 로드
    const QRCode = await import('qrcode');
    
    const qrCodeDataURL = await QRCode.default.toDataURL(data, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('QR 코드 생성 오류:', error);
    throw new Error('QR 코드를 생성할 수 없습니다.');
  }
}

/**
 * 예약 QR 코드 생성
 */
export async function generateAppointmentQRCode(
  appointmentId: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<string> {
  const qrData = JSON.stringify({
    type: 'appointment',
    id: appointmentId,
    patient: patientName,
    date: appointmentDate,
    time: appointmentTime,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctorsflow.com'}/appointments/${appointmentId}`,
  });

  return generateQRCode(qrData, {
    width: 300,
    color: {
      dark: '#1e40af', // 파란색
      light: '#ffffff',
    },
  });
}

/**
 * 쿠폰 QR 코드 생성
 */
export async function generateCouponQRCode(
  couponCode: string,
  patientName: string,
  expiryDate: string
): Promise<string> {
  const qrData = JSON.stringify({
    type: 'coupon',
    code: couponCode,
    patient: patientName,
    expiry: expiryDate,
  });

  return generateQRCode(qrData, {
    width: 300,
    color: {
      dark: '#059669', // 초록색
      light: '#ffffff',
    },
  });
}

