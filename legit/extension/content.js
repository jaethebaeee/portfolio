// Naver Booking API Response Interceptor
// 네이버 예약 파트너센터의 API 응답을 가로채서 서버로 전송합니다.

// XHR 요청 가로채기 (Content Script 방식)
// 주의: manifest v3에서는 webRequest blocking이 제한되므로,
// 페이지 내에 스크립트를 주입하여 XHR을 오버라이딩하는 방식을 사용합니다.

const s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

// 주입된 스크립트로부터 메시지 수신
window.addEventListener("message", function(event) {
  if (event.source != window) return;

  if (event.data.type && (event.data.type == "NAVER_BOOKING_DATA")) {
    console.log("DoctorsFlow: Detected Booking Data", event.data.payload);
    
    // Background Script로 데이터 전달 (서버 전송을 위해)
    chrome.runtime.sendMessage({
        type: "SYNC_BOOKING",
        data: event.data.payload
    });
  }
}, false);

