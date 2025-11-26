document.getElementById('saveBtn').addEventListener('click', () => {
  const userId = document.getElementById('userId').value;
  
  if (!userId) {
    showStatus('User ID를 입력해주세요', 'error');
    return;
  }

  chrome.storage.local.set({ userId: userId }, () => {
    showStatus('설정이 저장되었습니다. 네이버 예약 페이지를 새로고침하세요.', 'success');
  });
});

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status ' + type;
  el.style.display = 'block';
}

// 로드 시 저장된 값 불러오기
chrome.storage.local.get(['userId'], (result) => {
  if (result.userId) {
    document.getElementById('userId').value = result.userId;
    showStatus('연동 중입니다.', 'success');
  }
});

