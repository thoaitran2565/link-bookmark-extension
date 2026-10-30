document.addEventListener('DOMContentLoaded', async () => {
  const pageTitleInput = document.getElementById('page-title');
  const pageUrlInput = document.getElementById('page-url');
  const btnSave = document.getElementById('btn-save');
  const actionButtonsGroup = document.getElementById('action-buttons-group');
  const btnUpdate = document.getElementById('btn-update');
  const btnDelete = document.getElementById('btn-delete');
  const btnOpenManager = document.getElementById('btn-open-manager');
  const saveBox = document.getElementById('save-box');
  const toast = document.getElementById('toast');

  let currentBookmarkId = null;

  // Lấy thông tin tab hiện tại
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (currentTab) {
    pageTitleInput.value = currentTab.title || '';
    pageUrlInput.value = currentTab.url || '';
    await checkExistingBookmark(currentTab.url);
  }

  // Tách Domain
  function getDomainFromUrl(urlString) {
    try {
      const parsed = new URL(urlString);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Khác';
    }
  }

  // Kiểm tra xem trang hiện tại đã được lưu chưa
  async function checkExistingBookmark(url) {
    const data = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = data.bookmarks || [];
    const found = bookmarks.find(b => b.url === url);

    if (found) {
      currentBookmarkId = found.id;
      pageTitleInput.value = found.title; // Lấy tiêu đề đã lưu
      // Đã lưu -> Ẩn nút lưu, hiện nút Xóa và Sửa
      btnSave.classList.add('hidden');
      actionButtonsGroup.classList.remove('hidden');
    } else {
      currentBookmarkId = null;
      // Chưa lưu -> Hiện nút lưu, ẩn nút Xóa và Sửa
      btnSave.classList.remove('hidden');
      actionButtonsGroup.classList.add('hidden');
    }
  }

  // 1. Nút Lưu Bookmark
  btnSave.addEventListener('click', async () => {
    const title = pageTitleInput.value.trim();
    const url = pageUrlInput.value.trim();

    if (!url) return;

    const domain = getDomainFromUrl(url);
    const newBookmark = {
      id: Date.now().toString(),
      title: title || url,
      url: url,
      domain: domain,
      createdAt: new Date().toISOString()
    };

    const data = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = data.bookmarks || [];
    bookmarks.unshift(newBookmark);

    await chrome.storage.local.set({ bookmarks });

    saveBox.classList.add('flash');
    showToast('⚡ ĐÃ LƯU BOOKMARK!');
    setTimeout(() => saveBox.classList.remove('flash'), 800);

    await checkExistingBookmark(url);
  });

  // 2. Nút Cập Nhật (Sửa) thông tin trang hiện tại
  btnUpdate.addEventListener('click', async () => {
    if (!currentBookmarkId) return;
    const newTitle = pageTitleInput.value.trim();
    const newUrl = pageUrlInput.value.trim();

    if (!newUrl) return;

    const data = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = data.bookmarks || [];

    bookmarks = bookmarks.map(b => {
      if (b.id === currentBookmarkId) {
        return {
          ...b,
          title: newTitle || newUrl,
          url: newUrl,
          domain: getDomainFromUrl(newUrl)
        };
      }
      return b;
    });

    await chrome.storage.local.set({ bookmarks });
    showToast('⚡ ĐÃ CẬP NHẬT THÀNH CÔNG!');
    await checkExistingBookmark(newUrl);
  });

  // 3. Nút Xóa Bookmark trang hiện tại
  btnDelete.addEventListener('click', async () => {
    if (!currentBookmarkId) return;

    const data = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = (data.bookmarks || []).filter(b => b.id !== currentBookmarkId);
    await chrome.storage.local.set({ bookmarks });

    showToast('⚡ ĐÃ XÓA BOOKMARK!');
    await checkExistingBookmark(pageUrlInput.value.trim());
  });

  // Mở trang quản lý riêng
  btnOpenManager.addEventListener('click', () => {
    chrome.tabs.create({ url: 'manager.html' });
  });

  function showToast(msg) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
  }
});