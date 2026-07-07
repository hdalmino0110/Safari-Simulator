// ===================================================
//   iOS 26 Safari Simulator — Full Navigation Logic
// ===================================================

// ── DOM References ──────────────────────────────────
const pages = {
  search: document.getElementById('page-search'),
  product: document.getElementById('page-product'),
};
const urlText            = document.getElementById('urlText');
const browserViewport    = document.getElementById('browserViewport');
const btnBack            = document.getElementById('btnBack');
const btnFwd             = document.getElementById('btnFwd');
const reloadBtn          = document.getElementById('reloadBtn');
const urlBar             = document.getElementById('urlBar');
const tabsCountLabel     = document.getElementById('tabsCountLabel');

// Overlays
const searchOverlay      = document.getElementById('searchOverlay');
const menuOverlay        = document.getElementById('menuOverlay');
const shareSheetOverlay  = document.getElementById('shareSheetOverlay');
const tabsOverlay        = document.getElementById('tabsOverlay');
const newTabOverlay      = document.getElementById('newTabOverlay');

// Share sheet steps
const shareStep1         = document.getElementById('shareStep1');
const shareStep2         = document.getElementById('shareStep2');

// Toast
const toast              = document.getElementById('toast');

// ── History Stack ────────────────────────────────────
let navHistory   = ['search'];
let historyIndex = 0;

// ── Tab Count ────────────────────────────────────────
let tabCount = 6;

// ── Reload animation ─────────────────────────────────
let isLoading = false;

// ===================================================
//   PAGE NAVIGATION
// ===================================================
function showPage(name, pushHistory = true) {
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  if (pages[name]) {
    pages[name].classList.remove('hidden');
    browserViewport.scrollTop = 0;
  }

  if (name === 'search') {
    urlText.textContent = 'amazon.com/s?k=golf+balls';
  } else if (name === 'product') {
    urlText.textContent = 'amazon.com/dp/B08XYZ1234';
  }

  if (pushHistory) {
    navHistory = navHistory.slice(0, historyIndex + 1);
    navHistory.push(name);
    historyIndex = navHistory.length - 1;
  }
  updateNavArrows();
}

function updateNavArrows() {
  btnBack.classList.toggle('disabled', historyIndex <= 0);
  btnFwd.classList.toggle('disabled', historyIndex >= navHistory.length - 1);
}

btnBack.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    showPage(navHistory[historyIndex], false);
  }
});

btnFwd.addEventListener('click', () => {
  if (historyIndex < navHistory.length - 1) {
    historyIndex++;
    showPage(navHistory[historyIndex], false);
  }
});

// Reload button
reloadBtn.addEventListener('click', () => {
  if (isLoading) return;
  isLoading = true;
  reloadBtn.style.opacity = '0.4';
  showToast('Reloading…');
  setTimeout(() => {
    isLoading = false;
    reloadBtn.style.opacity = '1';
    showToast('Page reloaded');
  }, 1200);
});

// ===================================================
//   PRODUCT NAVIGATION
// ===================================================
document.getElementById('productCardOpen').addEventListener('click', () => {
  showPage('product');
});
document.getElementById('seeOptionsBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  showPage('product');
});

// ===================================================
//   APP BANNER
// ===================================================
document.getElementById('bannerClose').addEventListener('click', () => {
  const banner = document.getElementById('appBanner');
  banner.style.transition = 'max-height .3s ease, opacity .3s ease, padding .3s ease';
  banner.style.overflow = 'hidden';
  banner.style.opacity = '0';
  banner.style.maxHeight = '0';
  banner.style.paddingTop = '0';
  banner.style.paddingBottom = '0';
  setTimeout(() => { banner.style.display = 'none'; }, 320);
});

document.getElementById('bannerOpen').addEventListener('click', () => {
  showToast('Opening Amazon App…');
  const banner = document.getElementById('appBanner');
  banner.style.transition = 'opacity .15s';
  banner.style.opacity = '0.5';
  setTimeout(() => { banner.style.opacity = '1'; }, 300);
});

// Dismiss ship banner
document.getElementById('dismissBanner').addEventListener('click', () => {
  const sb = document.querySelector('.ship-banner');
  if (sb) {
    sb.style.transition = 'opacity .3s';
    sb.style.opacity = '0';
    setTimeout(() => sb.remove(), 300);
  }
});

// ===================================================
//   SEARCH MODAL
// ===================================================
// Open on URL bar tap
urlBar.addEventListener('click', openSearchModal);

// Also open when tapping the search row inputs
document.querySelectorAll('.search-input-wrap').forEach(el => {
  el.addEventListener('click', openSearchModal);
});

function openSearchModal() {
  searchOverlay.classList.remove('hidden');
  const input = document.getElementById('searchModalInput');
  setTimeout(() => input.focus(), 100);
}

function closeSearchModal() {
  searchOverlay.classList.add('hidden');
  const input = document.getElementById('searchModalInput');
  input.blur();
}

document.getElementById('searchModalCancel').addEventListener('click', closeSearchModal);

// Live suggestions update
const searchModalInput   = document.getElementById('searchModalInput');
const searchSuggestions  = document.getElementById('searchSuggestions');

searchModalInput.addEventListener('input', () => {
  const val = searchModalInput.value.trim().toLowerCase();
  if (!val) {
    renderDefaultSuggestions();
    return;
  }
  renderSearchSuggestions(val);
});

function renderDefaultSuggestions() {
  searchSuggestions.innerHTML = `
    <div class="suggestion-group-label">Bookmarks &amp; History</div>
    <div class="suggestion-item" data-url="amazon.com/s?golf+balls">
      <div class="sug-icon globe"></div>
      <div class="sug-info">
        <div class="sug-title">amazon.com — golf balls</div>
        <div class="sug-url">amazon.com</div>
      </div>
    </div>
    <div class="suggestion-group-label">Google Search</div>
    <div class="suggestion-item" data-search="golf balls">
      <div class="sug-icon mag"></div>
      <div class="sug-info"><div class="sug-title">golf balls</div></div>
    </div>
    <div class="suggestion-item" data-search="golf balls near me">
      <div class="sug-icon mag"></div>
      <div class="sug-info"><div class="sug-title">golf balls near me</div></div>
    </div>
    <div class="suggestion-item" data-search="golf balls for beginners">
      <div class="sug-icon mag"></div>
      <div class="sug-info"><div class="sug-title">golf balls for beginners</div></div>
    </div>
  `;
  attachSuggestionEvents();
}

function renderSearchSuggestions(val) {
  const suggestions = [
    val,
    val + ' near me',
    val + ' best price',
    val + ' amazon',
    val + ' reviews',
  ];
  let html = `<div class="suggestion-group-label">Google Search</div>`;
  suggestions.forEach(s => {
    html += `
      <div class="suggestion-item" data-search="${s}">
        <div class="sug-icon mag"></div>
        <div class="sug-info"><div class="sug-title">${s}</div></div>
      </div>`;
  });
  searchSuggestions.innerHTML = html;
  attachSuggestionEvents();
}

function attachSuggestionEvents() {
  searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const search = item.dataset.search;
      const url    = item.dataset.url;
      if (search) {
        urlText.textContent = search + ' — Google';
        showToast(`Searching: "${search}"`);
      } else if (url) {
        urlText.textContent = url;
        showToast(`Navigating to ${url}`);
      }
      closeSearchModal();
    });
  });
}

// Enter key on search input
searchModalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = searchModalInput.value.trim();
    if (val) {
      urlText.textContent = val.includes('.') ? val : val + ' — Google';
      showToast(val.includes('.') ? `Navigating to ${val}` : `Searching: "${val}"`);
      closeSearchModal();
    }
  }
});

// ===================================================
//   HAMBURGER SIDE MENU
// ===================================================
// Create side menu dynamically
const sideMenu = document.createElement('div');
sideMenu.className = 'side-menu';
sideMenu.innerHTML = `
  <div class="side-menu-header">
    <div class="side-menu-user">
      <div class="side-menu-avatar">H</div>
      <div>
        <div class="side-menu-name">Hello, Hanze</div>
        <div class="side-menu-sub">Account &amp; Lists</div>
      </div>
    </div>
  </div>
  <div class="side-menu-list">
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Your Orders</span>
    </button>
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Your Account</span>
    </button>
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Amazon Prime</span>
    </button>
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Your Lists</span>
    </button>
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Customer Service</span>
    </button>
    <button class="side-menu-item">
      <div class="side-menu-item-icon"></div>
      <span>Sign Out</span>
    </button>
  </div>
`;
const sideDim = document.createElement('div');
sideDim.className = 'side-dim';

document.querySelector('.phone').appendChild(sideMenu);
document.querySelector('.phone').appendChild(sideDim);

document.getElementById('hamburgerBtn').addEventListener('click', () => {
  sideMenu.classList.add('open');
  sideDim.classList.add('visible');
});
sideDim.addEventListener('click', closeSideMenu);
sideMenu.querySelectorAll('.side-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    showToast(item.querySelector('span').textContent);
    closeSideMenu();
  });
});
function closeSideMenu() {
  sideMenu.classList.remove('open');
  sideDim.classList.remove('visible');
}

// ===================================================
//   HEART BUTTON (Like)
// ===================================================
document.getElementById('heartBtn').addEventListener('click', function() {
  this.classList.toggle('liked');
  showToast(this.classList.contains('liked') ? 'Saved to Wishlist' : 'Removed from Wishlist');
});

// ===================================================
//   SAFARI TOOLBAR — Share Button
// ===================================================
document.getElementById('shareToolbarBtn').addEventListener('click', () => {
  openShareSheet('step1');
});

// ===================================================
//   CONTEXT MENU (••• button)
// ===================================================
document.getElementById('tabsBtn').addEventListener('click', () => {
  openTabsOverlay();
});

// Long-press on URL bar shows context menu
let urlLongPress;
urlBar.addEventListener('pointerdown', () => {
  urlLongPress = setTimeout(() => {
    openContextMenu();
  }, 600);
});
urlBar.addEventListener('pointerup', () => clearTimeout(urlLongPress));
urlBar.addEventListener('pointerleave', () => clearTimeout(urlLongPress));

function openContextMenu() {
  menuOverlay.classList.remove('hidden');
  positionContextMenu();
}

function positionContextMenu() {
  const menu = document.getElementById('contextMenu');
  menu.style.bottom = '80px';
  menu.style.left   = '20px';
  menu.style.right  = '20px';
}

document.getElementById('menuDim').addEventListener('click', () => {
  menuOverlay.classList.add('hidden');
});

document.querySelectorAll('.ctx-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.dataset.action;
    menuOverlay.classList.add('hidden');
    handleContextAction(action);
  });
});

document.querySelectorAll('.ctx-bottom-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.dataset.action;
    menuOverlay.classList.add('hidden');
    handleContextAction(action);
  });
});

function handleContextAction(action) {
  switch (action) {
    case 'share':         openShareSheet('step1');  break;
    case 'bookmark':      showToast('Bookmark added'); break;
    case 'bookmarkto':    showToast('Choose bookmark folder…'); break;
    case 'addreading':    showToast('Added to Reading List'); break;
    case 'newtab':        openNewTab(); break;
    case 'newprivatetab': openPrivateTab(); break;
    case 'bookmarks':     showToast('Opening Bookmarks…'); break;
    case 'alltabs':       openTabsOverlay(); break;
    case 'addbookmark':   showToast('Bookmark added'); break;
    default: break;
  }
}

// ===================================================
//   SHARE SHEET
// ===================================================
function openShareSheet(step) {
  shareSheetOverlay.classList.remove('hidden');
  shareStep1.classList.toggle('hidden', step !== 'step1');
  shareStep2.classList.toggle('hidden', step !== 'step2');
}

function closeShareSheet() {
  shareSheetOverlay.classList.add('hidden');
}

document.getElementById('shareSheetDim').addEventListener('click', closeShareSheet);
document.getElementById('shareCloseX').addEventListener('click', closeShareSheet);
document.getElementById('shareCancel1').addEventListener('click', closeShareSheet);

// Share icon on product page
document.getElementById('shareIconBtn').addEventListener('click', () => {
  openShareSheet('step2');
});

// Share apps in step 1
document.querySelectorAll('#shareStep1 .share-app').forEach(app => {
  app.addEventListener('click', () => {
    const action = app.dataset.action;
    if (action === 'messages') {
      showToast('Opening Messages…');
    } else if (action === 'messenger') {
      showToast('Opening Messenger…');
    } else {
      showToast('Sharing…');
    }
    closeShareSheet();
  });
});

// Share apps in step 2
document.querySelectorAll('#shareStep2 .share-app').forEach(app => {
  app.addEventListener('click', () => {
    showToast('Sharing product…');
    closeShareSheet();
  });
});

// Share action rows
document.getElementById('copyLinkBtn').addEventListener('click', () => {
  showToast('Link copied to clipboard');
  closeShareSheet();
});

document.getElementById('viewMoreBtn').addEventListener('click', () => {
  showToast('Loading more actions…');
});

document.querySelectorAll('.share-action-row[data-action]').forEach(row => {
  row.addEventListener('click', () => {
    handleContextAction(row.dataset.action);
    closeShareSheet();
  });
});

// Share options btn
document.querySelector('.share-options-btn').addEventListener('click', () => {
  showToast('PDF · Web Archive · Reader View…');
});

// ===================================================
//   TAB SWITCHER
// ===================================================
function openTabsOverlay() {
  tabsOverlay.classList.remove('hidden');
}

document.getElementById('tabsDoneBtn').addEventListener('click', () => {
  tabsOverlay.classList.add('hidden');
});

document.getElementById('amazonTabThumb').addEventListener('click', (e) => {
  if (e.target.closest('.tab-x')) return;
  tabsOverlay.classList.add('hidden');
  showPage('product');
});

// Close individual tabs
document.querySelectorAll('#tabsGrid .tab-thumb').forEach(thumb => {
  const closeBtn = thumb.querySelector('.tab-x');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    thumb.style.transition = 'opacity .2s, transform .2s';
    thumb.style.opacity    = '0';
    thumb.style.transform  = 'scale(0.85)';
    setTimeout(() => {
      thumb.remove();
      tabCount = Math.max(0, tabCount - 1);
      updateTabCount();
    }, 220);
  });

  // Click non-active tabs
  if (!thumb.id) {
    thumb.addEventListener('click', (e) => {
      if (e.target.closest('.tab-x')) return;
      tabsOverlay.classList.add('hidden');
      showToast('Switching tab…');
    });
  }
});

function updateTabCount() {
  tabsCountLabel.textContent = tabCount;
  const ntLabel = document.getElementById('ntTabsLabel');
  if (ntLabel) ntLabel.textContent = tabCount;
  const tabsCountBtn = document.getElementById('tabsCountBtn');
  if (tabsCountBtn) tabsCountBtn.textContent = tabCount + ' Tabs';
  const tabsTitle = document.querySelector('.tabs-title');
  if (tabsTitle) tabsTitle.textContent = tabCount + ' Tabs';
}

// Add new tab
document.getElementById('tabsAddBtn').addEventListener('click', openNewTab);

document.getElementById('tabsPrivateBtn').addEventListener('click', openPrivateTab);

document.getElementById('tabsCountBtn').addEventListener('click', () => {
  showToast(tabCount + ' tabs open');
});

// ===================================================
//   NEW TAB
// ===================================================
function openNewTab() {
  tabCount++;
  updateTabCount();
  tabsOverlay.classList.add('hidden');
  newTabOverlay.classList.remove('hidden');

  // Attach new tab search bar
  const ntUrlBar = document.getElementById('newTabUrlBar');
  if (ntUrlBar) {
    ntUrlBar.addEventListener('click', () => {
      newTabOverlay.classList.add('hidden');
      openSearchModal();
    }, { once: true });
  }
}

document.getElementById('ntBackBtn').addEventListener('click', () => {
  newTabOverlay.classList.add('hidden');
});

document.getElementById('ntTabsBtn').addEventListener('click', () => {
  newTabOverlay.classList.add('hidden');
  openTabsOverlay();
});

// Favorite icons in new tab
document.querySelectorAll('.nt-fav').forEach(fav => {
  fav.addEventListener('click', () => {
    const name = fav.querySelector('span').textContent;
    showToast(`Opening ${name}…`);
    newTabOverlay.classList.add('hidden');
    urlText.textContent = name.toLowerCase() + '.com';
  });
});

// ===================================================
//   PRIVATE TAB
// ===================================================
function openPrivateTab() {
  tabCount++;
  updateTabCount();
  tabsOverlay.classList.add('hidden');
  showToast('Private browsing — no history saved');
  // Could open a dark-themed new tab overlay
}

// ===================================================
//   PDF/ADD BUTTONS ON PRODUCT PAGE
// ===================================================
document.querySelector('.pdp-add-btn').addEventListener('click', () => {
  showToast('Added to Cart');
});
document.querySelector('.pdp-buy-btn').addEventListener('click', () => {
  showToast('Proceeding to checkout…');
});

// ===================================================
//   FILTER PILLS
// ===================================================
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    // Toggle active visual
    pill.style.background = pill.style.background === 'rgb(0, 113, 133)'
      ? '' : '#007185';
    pill.style.color = pill.style.color === 'rgb(255, 255, 255)'
      ? '' : '#fff';
    pill.style.borderColor = pill.style.borderColor === 'rgb(0, 113, 133)'
      ? '' : '#007185';
  });
});

// ===================================================
//   TOAST NOTIFICATION
// ===================================================
let toastTimer;
function showToast(msg) {
  toast.textContent  = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}

// ===================================================
//   CLOCK — Live time in status bar
// ===================================================
function updateClock() {
  const now = new Date();
  const h   = now.getHours();
  const m   = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${h}:${m}`;
  document.querySelectorAll('.status-time').forEach(el => {
    el.textContent = timeStr;
  });
}
updateClock();
setInterval(updateClock, 30000);

// ===================================================
//   INIT
// ===================================================
updateNavArrows();
attachSuggestionEvents();
