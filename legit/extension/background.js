// Background Worker
// 수신된 예약 데이터를 DoctorsFlow 서버로 전송합니다.

const API_URL = "http://localhost:3000/api/integrations/naver-booking/sync"; // 프로덕션에서는 변경 필요

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SYNC_BOOKING") {
    syncToBackend(request.data);
  }
});

async function syncToBackend(bookingData) {
  try {
    // Chrome Storage에서 사용자 토큰 가져오기 (로그인 시 저장 필요)
    const storage = await chrome.storage.local.get(['authToken', 'userId']);
    
    if (!storage.userId) {
      console.warn("DoctorsFlow: Not logged in");
      return;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': storage.userId // 실제로는 안전한 Auth 헤더 사용 권장
      },
      body: JSON.stringify({
        bookings: bookingData
      })
    });

    if (response.ok) {
      console.log("DoctorsFlow: Sync success");
    } else {
      console.error("DoctorsFlow: Sync failed", await response.text());
    }
  } catch (error) {
    console.error("DoctorsFlow: Network error", error);
  }
}

