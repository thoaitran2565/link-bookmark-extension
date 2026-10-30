document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('bookmark-container');
  const searchInput = document.getElementById('search-input');
  const toast = document.getElementById('toast');

  const editModal = document.getElementById('edit-modal');
  let editBookmarkId = null;

  const domainModal = document.getElementById('domain-modal');
  const editDomainInput = document.getElementById('edit-domain-input');
  let currentTargetDomain = null;

  // Set lưu lại danh sách các domain đang mở để giữ trạng thái sau khi render lại
  const openDomains = new Set();

  renderBookmarks();

  searchInput.addEventListener('input', (e) => {
    renderBookmarks(e.target.value.toLowerCase());
  });

  function getDomainFromUrl(urlString) {
    try {
      const parsed = new URL(urlString);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Khác';
    }
  }

  async function renderBookmarks(filter = '') {
    const data = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = data.bookmarks || [];

    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
      totalCountEl.innerText = `${bookmarks.length} Links`;
    }

    if (filter) {
      bookmarks = bookmarks.filter(b => 
        b.title.toLowerCase().includes(filter) || 
        b.url.toLowerCase().includes(filter) || 
        b.domain.toLowerCase().includes(filter)
      );
    }

    const groups = {};
    bookmarks.forEach(b => {
      if (!groups[b.domain]) groups[b.domain] = [];
      groups[b.domain].push(b);
    });

    container.innerHTML = '';

    if (Object.keys(groups).length === 0) {
      container.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 40px; font-weight: 700;">Chưa có bookmark nào</div>`;
      return;
    }

    for (const [domain, items] of Object.entries(groups)) {
      const groupEl = document.createElement('div');
      groupEl.className = 'domain-group';

      // Nếu trước đó domain này đang mở, khôi phục lại trạng thái mở
      if (openDomains.has(domain)) {
        groupEl.classList.add('open');
      }

      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

      groupEl.innerHTML = `
        <div class="domain-header">
          <div style="display: flex; align-items: center;">
            <span class="arrow-icon">▶</span>
            <img src="${faviconUrl}" alt="" onerror="this.style.display='none'">
            <span>${domain}</span>
            <button class="action-btn edit-domain" title="Đổi domain toàn bộ nhóm này" style="margin-left: 10px;">✏️ Đổi Domain</button>
          </div>
          <span style="font-size:12px; color:var(--text-muted); font-weight:700;">${items.length} link</span>
        </div>
        <ul class="link-list"></ul>
      `;

      // Bấm vào header nhóm để toggle mở/đóng và lưu trạng thái vào Set
      groupEl.querySelector('.domain-header').addEventListener('click', () => {
        const isOpen = groupEl.classList.toggle('open');
        if (isOpen) {
          openDomains.add(domain);
        } else {
          openDomains.delete(domain);
        }
      });

      // Bấm vào nút sửa domain nhóm
      groupEl.querySelector('.edit-domain').addEventListener('click', (e) => {
        e.stopPropagation();
        openDomainModal(domain);
      });

      const ul = groupEl.querySelector('.link-list');

      items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'link-item';
        li.innerHTML = `
          <span class="link-info" title="${item.url}">${escapeHtml(item.title)}</span>
          <div class="link-actions-group">
            <button class="action-btn edit" title="Sửa link">✏️ Sửa</button>
            <button class="action-btn delete" title="Xóa link">🗑️ Xóa</button>
          </div>
        `;

        li.querySelector('.link-info').addEventListener('click', () => {
          chrome.tabs.create({ url: item.url });
        });

        li.querySelector('.edit').addEventListener('click', (e) => {
          e.stopPropagation();
          openEditModal(item);
        });

        li.querySelector('.delete').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteBookmark(item.id);
        });

        ul.appendChild(li);
      });

      container.appendChild(groupEl);
    }
  }

  // Đổi Domain nhóm
  function openDomainModal(domain) {
    currentTargetDomain = domain;
    editDomainInput.value = domain;
    domainModal.style.display = 'flex';
  }

  document.getElementById('btn-cancel-domain').addEventListener('click', () => {
    domainModal.style.display = 'none';
  });

  document.getElementById('btn-update-domain').addEventListener('click', async () => {
    const rawNewDomain = editDomainInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    if (!rawNewDomain || !currentTargetDomain || rawNewDomain === currentTargetDomain) {
      domainModal.style.display = 'none';
      return;
    }

    const data = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = data.bookmarks || [];

    bookmarks = bookmarks.map(b => {
      if (b.domain === currentTargetDomain) {
        let updatedUrl = b.url;
        try {
          const parsedUrl = new URL(b.url);
          parsedUrl.hostname = rawNewDomain;
          updatedUrl = parsedUrl.toString();
        } catch {}

        return {
          ...b,
          domain: rawNewDomain,
          url: updatedUrl
        };
      }
      return b;
    });

    await chrome.storage.local.set({ bookmarks });
    domainModal.style.display = 'none';
    
    // Cập nhật lại danh sách openDomains nếu đổi tên domain
    openDomains.delete(currentTargetDomain);
    openDomains.add(rawNewDomain);

    showToast(`⚡ ĐÃ ĐỔI DOMAIN THÀNH CÔNG!`);
    renderBookmarks(searchInput.value.toLowerCase());
  });

  // Xóa Bookmark
  async function deleteBookmark(id) {
    const data = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = (data.bookmarks || []).filter(b => b.id !== id);
    await chrome.storage.local.set({ bookmarks });
    showToast(`⚡ ĐÃ XÓA BOOKMARK!`);
    renderBookmarks(searchInput.value.toLowerCase());
  }

  // Sửa từng Link
  function openEditModal(bookmark) {
    editBookmarkId = bookmark.id;
    document.getElementById('edit-title').value = bookmark.title;
    document.getElementById('edit-url').value = bookmark.url;
    editModal.style.display = 'flex';
  }

  document.getElementById('btn-cancel').addEventListener('click', () => {
    editModal.style.display = 'none';
  });

  document.getElementById('btn-update').addEventListener('click', async () => {
    const newTitle = document.getElementById('edit-title').value.trim();
    const newUrl = document.getElementById('edit-url').value.trim();

    if (!newUrl || !editBookmarkId) return;

    const data = await chrome.storage.local.get(['bookmarks']);
    let bookmarks = data.bookmarks || [];

    bookmarks = bookmarks.map(b => {
      if (b.id === editBookmarkId) {
        const newDomain = getDomainFromUrl(newUrl);
        // Giữ lại trạng thái mở cho domain mới nếu link chuyển domain
        if (openDomains.has(b.domain)) {
          openDomains.delete(b.domain);
          openDomains.add(newDomain);
        }

        return {
          ...b,
          title: newTitle || newUrl,
          url: newUrl,
          domain: newDomain
        };
      }
      return b;
    });

    await chrome.storage.local.set({ bookmarks });
    editModal.style.display = 'none';
    showToast(`⚡ ĐÃ CẬP NHẬT THÀNH CÔNG!`);
    renderBookmarks(searchInput.value.toLowerCase());
  });

  function showToast(msg) {
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
});