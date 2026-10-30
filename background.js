// Hàm kiểm tra và cập nhật Badge cho icon của extension
async function updateBadgeForTab(tabId, url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://')) {
    chrome.action.setBadgeText({ tabId: tabId, text: '' });
    return;
  }

  try {
    const data = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = data.bookmarks || [];
    const isSaved = bookmarks.some(b => b.url === url);

    if (isSaved) {
      // Hiển thị chữ "✓" hoặc "SAVED" màu xanh lá ngay trên icon
      chrome.action.setBadgeText({ tabId: tabId, text: '✓' });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#10b981' }); // Màu xanh lá hiện đại
    } else {
      // Xóa badge nếu chưa lưu
      chrome.action.setBadgeText({ tabId: tabId, text: '' });
    }
  } catch (error) {
    console.error("Lỗi cập nhật badge:", error);
  }
}

// 1. Khi người dùng chuyển tab (Switch Tab)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    updateBadgeForTab(activeInfo.tabId, tab.url);
  }
});

// 2. Khi trang web load xong hoặc đổi URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadgeForTab(tabId, tab.url);
  }
});

// 3. Lắng nghe sự kiện khi dữ liệu storage thay đổi (vừa lưu hoặc vừa xóa bookmark)
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes.bookmarks) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id && activeTab.url) {
      updateBadgeForTab(activeTab.id, activeTab.url);
    }
  }
});