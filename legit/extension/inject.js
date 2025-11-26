// XHR & Fetch Interceptor
// 페이지 컨텍스트에서 실행되어 실제 네트워크 응답을 가로챕니다.

(function() {
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;
    const setRequestHeader = XHR.setRequestHeader;

    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            // 네이버 예약 리스트 API 엔드포인트 패턴 확인
            // 예: https://partner.booking.naver.com/api/bookings...
            if (this._url && this._url.includes('/api/bookings')) {
                try {
                    const responseData = JSON.parse(this.responseText);
                    
                    // Content Script로 데이터 전송
                    window.postMessage({
                        type: "NAVER_BOOKING_DATA",
                        payload: responseData
                    }, "*");
                    
                } catch (err) {
                    console.error("DoctorsFlow: Failed to parse booking data", err);
                }
            }
        });
        return send.apply(this, arguments);
    };
})();

