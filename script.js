// ===== iOS 26 Safari Simulator — Navigation Logic =====

const pages = {
  search: document.getElementById('page-search'),
  product: document.getElementById('page-product'),
};

const urlText = document.getElementById('urlText');
const browserViewport = document.getElementById('browserViewport');

let history = ['search'];
let historyIndex = 0;

function showPage(name, pushHistory = true) {
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  pages[name].classList.remove('hidden');
  browserViewport.scrollTop = 0;

  if (name === 'product') {
    urlText.textContent = 'amazon.com';
  } else {
    urlText.textContent = 'amazon.com';
  }

  if (pushHistory) {
    history = history.slice(0, historyIndex + 1);
    history.push(name);
    historyIndex = history.length - 1;
  }
  updateNavArrows();
}

function updateNavArrows() {
  const back = document.getElementById('btnBack');
  const fwd = document.getElementById('btnFwd');
  back.classList.toggle('disabled', historyIndex <= 0);
  fwd.classList.toggle('disabled', historyIndex >= history.length - 1);
}

document.getElementById('btnBack').addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    showPage(history[historyIndex], false);
    updateNavArrows();
  }
});
document.getElementById('btnFwd').addEventListener('click', () => {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    showPage(history[historyIndex], false);
    updateNavArrows();
  }
});

// Tapping product card / See options -> go to product detail page
document.getElementById('productCardOpen').addEventListener('click', () => showPage('product'));
document.getElementById('seeOptionsBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  showPage('product');
});

// ===== App Banner =====
document.getElementById('bannerClose').addEventListener('click', () => {
  document.getElementById('appBanner').style.display = 'none';
});
document.getElementById('bannerOpen').addEventListener('click', () => {
  const banner = document.getElementById('appBanner');
  banner.style.transition = 'opacity .25s';
  banner.style.opacity = '0.4';
  setTimeout(() => { banner.style.opacity = '1'; }, 350);
});

// ===== Context Menu ("•••" button = long-press style menu, image 2) =====
const menuOverlay = document.getElementById('menuOverlay');
document.getElementById('tabActionsBtn').addEventListener('click', () => {
  menuOverlay.classList.remove('hidden');
});
document.getElementById('menuDim').addEventListener('click', () => {
  menuOverlay.classList.add('hidden');
});
document.querySelectorAll('.ctx-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.dataset.action;
    menuOverlay.classList.add('hidden');
    if (action === 'share') {
      openShareSheet('step1');
    } else if (action === 'alltabs') {
      openTabsOverlay();
    }
    // bookmark / newtab / etc. are visual-only endpoints in this simulator
  });
});

// ===== Share Sheet =====
const shareSheetOverlay = document.getElementById('shareSheetOverlay');
const shareStep1 = document.getElementById('shareStep1');
const shareStep2 = document.getElementById('shareStep2');

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

// Share icon on product detail page -> opens the product share card (image 5)
document.getElementById('shareIconBtn').addEventListener('click', () => {
  openShareSheet('step2');
});

// "View More" in step1 share sheet -> just visual affordance (kept as-is)
document.getElementById('viewMoreBtn').addEventListener('click', () => {
  // Could expand further app list; kept minimal per screenshots provided
});

// ===== Tab Switcher =====
const tabsOverlay = document.getElementById('tabsOverlay');
function openTabsOverlay() {
  tabsOverlay.classList.remove('hidden');
}
document.getElementById('tabsDoneBtn').addEventListener('click', () => {
  tabsOverlay.classList.add('hidden');
});
document.getElementById('amazonTabThumb').addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-x')) return;
  tabsOverlay.classList.add('hidden');
});
document.querySelectorAll('.tab-x').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.target.closest('.tab-thumb').style.display = 'none';
  });
});
document.getElementById('tabsAdd');

// Init
updateNavArrows();
