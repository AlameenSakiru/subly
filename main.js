import { 
  siteConfig, 
  categories, 
  servicesData,
  flyerMainServices,
  specialtyOffers,
  getWhatsAppOrderUrl 
} from './data/services.js';

import { 
  xAccountsCatalog, 
  xAccountCategories, 
  getXAccountOrderUrl 
} from './data/accounts.js';

import { brandIcons, uiIcons, categoryIcons } from './data/icons.js';

// Security Helper: HTML Entity Escaping (Prevents DOM XSS)
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Security & Resilience Helper: Safe LocalStorage Wrapper
const SafeStorage = {
  getString(key, fallback = '') {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  },
  setString(key, val) {
    try {
      localStorage.setItem(key, val);
      return true;
    } catch {
      return false;
    }
  },
  getJSON(key, fallback = []) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  setJSON(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Dynamic Catalog Providers (Storefront & Admin Sync)
export function getEffectiveServices() {
  const custom = SafeStorage.getJSON('subly_custom_services', null);
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  return servicesData;
}

export function saveCustomServices(list) {
  SafeStorage.setJSON('subly_custom_services', list);
}

export function getEffectiveAccounts() {
  const custom = SafeStorage.getJSON('subly_custom_accounts', null);
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  return xAccountsCatalog;
}

export function saveCustomAccounts(list) {
  SafeStorage.setJSON('subly_custom_accounts', list);
}

// Application State
let activeCategory = 'all';
let searchQuery = '';
let activeXAccountType = 'all';
let currentGeneratedOrderId = '';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbarScroll();
  initMobileMenu();
  
  // 1. If on Homepage (index.html), render curated Featured grid
  const homepageFeaturedContainer = document.getElementById('homepage-featured-grid');
  if (homepageFeaturedContainer) {
    renderHomepageFeaturedGrid(homepageFeaturedContainer);
  }

  // 2. If on Full Services Page (services.html), render full catalog & category filters
  const fullCatalogContainer = document.getElementById('cards-grid-view');
  if (fullCatalogContainer) {
    initUrlParams();
    initCategoryFilters();
    initSearch();
    renderFullCatalogGrid();
  }

  // 3. If on X Accounts Page (accounts.html), render accounts catalog & filters
  const xAccountsGridContainer = document.getElementById('x-accounts-grid');
  if (xAccountsGridContainer) {
    initXAccountFilters();
    renderXAccountsGrid();
  }

  // 4. If on Order Page (order.html), initialize order form & summary logic
  const orderForm = document.getElementById('subscription-order-form');
  if (orderForm) {
    initOrderPage();
  }

  // 5. If on Order History Page (orders.html), render customer transactions
  const historyListContainer = document.getElementById('orders-history-list');
  if (historyListContainer) {
    initOrderHistoryPage();
  }

  // 6. If on Admin Control Panel (admin.html), initialize management dashboard
  const adminAuthScreen = document.getElementById('admin-auth-screen');
  if (adminAuthScreen) {
    initAdminPanel();
  }

  // 7. Dynamic Store Settings (Announcement Bar & WhatsApp Line)
  initStoreDynamicSettings();

  // 8. Customer Auth & Navbar State
  initNavbarAuth();
  initCustomerAuthPages();

  initFaqAccordion();
  initFaqSearch();

  // 9. Sticky Mobile CTA
  initStickyMobileCta();

  // 10. Thank You Page
  if (document.getElementById('thank-you-card')) {
    initThankYouPage();
  }
});

// Dynamic Storewide Settings (Announcement Bar & WhatsApp line sync)
function initStoreDynamicSettings() {
  const customAnnText = SafeStorage.getString('subly_announcement_text');
  const customAnnLink = SafeStorage.getString('subly_announcement_link');
  const customWa = SafeStorage.getString('subly_store_whatsapp');

  if (customAnnText) {
    document.querySelectorAll('.announcement-text').forEach(el => {
      el.textContent = customAnnText;
    });
  }

  if (customAnnLink) {
    document.querySelectorAll('.announcement-link').forEach(el => {
      el.textContent = customAnnLink;
    });
  }

  if (customWa) {
    const cleanWa = customWa.replace(/[^\d]/g, '');
    const intlWa = cleanWa.startsWith('0') ? '234' + cleanWa.substring(1) : (cleanWa.startsWith('234') ? cleanWa : '234' + cleanWa);
    
    // Update wa.me links
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      const currentHref = a.getAttribute('href');
      if (currentHref) {
        a.setAttribute('href', currentHref.replace(/wa\.me\/[0-9]+/, `wa.me/${intlWa}`));
      }
    });

    // Update phone display text
    document.querySelectorAll('.footer-phone-text, .support-phone-val').forEach(el => {
      el.textContent = customWa;
    });
  }
}

// Mobile Drawer Navigation
function initMobileMenu() {
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');

  if (!openBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

// Helper to check URL query parameters (e.g. services.html?cat=streaming)
function initUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat');
  if (catParam && categories.some(c => c.id === catParam)) {
    activeCategory = catParam;
  }
}

// 1. Theme Mode Switcher
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const savedTheme = SafeStorage.getString('subly-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
  } else {
    updateThemeIcon(false);
  }

  toggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    SafeStorage.setString('subly-theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
  });
}

function updateThemeIcon(isDark) {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;
  toggleBtn.innerHTML = isDark ? uiIcons.sun : uiIcons.moon;
}

// 2. Navbar Scroll Style (Hardware-Accelerated & Throttled)
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  let isScrolled = false;
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY > 40;
        if (scrolled !== isScrolled) {
          isScrolled = scrolled;
          navbar.classList.toggle('scrolled', isScrolled);
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 3. Render Curated Featured Grid on Homepage (Exactly 6 Service Boxes)
function renderHomepageFeaturedGrid(container) {
  const allServices = getEffectiveServices();
  const featuredList = allServices.filter(s => s.featured).slice(0, 6);

  container.innerHTML = featuredList.map(service => {
    const iconSvg = brandIcons[service.icon] || brandIcons.spotify;
    const logoContent = service.logoUrl 
      ? `<img src="${service.logoUrl}" alt="${service.name} logo" class="brand-logo-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="brand-fallback-icon" style="display:none;">${iconSvg}</span>`
      : iconSvg;
    const orderUrl = `order.html?id=${encodeURIComponent(service.id)}`;
    const features = service.features || ["Instant WhatsApp Delivery", "Full Warranty Replacement", "24/7 Fast Support"];

    return `
      <div class="service-card-modern" data-id="${service.id}">
        <div>
          <div class="card-top-header">
            <div class="service-icon-box">
              ${logoContent}
            </div>
            ${service.badge ? `<span class="card-badge-tag">${service.badge}</span>` : ''}
          </div>

          <h3 class="card-title-main">${service.name}</h3>
          <p class="card-description-text">${service.description || `${service.period || 'Premium'} subscription with instant activation & warranty.`}</p>

          <ul class="card-features-list">
            ${features.map(f => `
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="card-price-bottom">
          <div>
            <div class="card-price-val">${service.priceDisplay}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">${service.period || 'Individual Plan'}</div>
          </div>
          <a href="${orderUrl}" class="btn btn-primary btn-sm" title="Order ${service.name}">
            <span>Order</span>
            ${uiIcons.arrowUpRight}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 4. Category Filter Tabs (for services.html)
function initCategoryFilters() {
  const bar = document.getElementById('category-filter-bar');
  if (!bar) return;

  const catalogCategories = categories.filter(c => c.id !== 'featured'); // On services page, show all categories

  bar.innerHTML = catalogCategories.map(cat => {
    const iconSvg = categoryIcons[cat.id] || '';
    return `
      <button class="cat-pill ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
        ${iconSvg ? `<span class="cat-pill-icon">${iconSvg}</span>` : ''}
        <span>${cat.label}</span>
      </button>
    `;
  }).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-pill');
    if (!btn) return;

    activeCategory = btn.dataset.category;
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderFullCatalogGrid();
  });
}

// 5. Live Search (for services.html)
function initSearch() {
  const searchInput = document.getElementById('service-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderFullCatalogGrid();
  });
}

// 6. Filter Logic
function matchesFilters(service) {
  const matchesCat = (activeCategory === 'all') || (service.category === activeCategory);
  const matchesSearch = !searchQuery || 
    service.name.toLowerCase().includes(searchQuery) ||
    (service.description && service.description.toLowerCase().includes(searchQuery)) ||
    (service.categoryLabel && service.categoryLabel.toLowerCase().includes(searchQuery)) ||
    (service.category && service.category.toLowerCase().includes(searchQuery));

  return matchesCat && matchesSearch;
}

// 7. Render Full Catalog Grid on services.html
function renderFullCatalogGrid() {
  const cardsContainer = document.getElementById('cards-grid-view');
  if (!cardsContainer) return;

  const allFiltered = getEffectiveServices().filter(matchesFilters);

  if (allFiltered.length === 0) {
    cardsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 24px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <div style="margin-bottom: 12px; color: var(--text-muted);">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 6px;">No subscriptions found</h4>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 16px;">Try adjusting your search query or choosing another category.</p>
        <button class="btn btn-secondary btn-sm" onclick="document.getElementById('service-search-input').value=''; document.querySelector('.cat-pill[data-category=all]').click();">
          View All Services
        </button>
      </div>
    `;
    return;
  }

  cardsContainer.innerHTML = allFiltered.map(service => {
    const iconSvg = brandIcons[service.icon] || brandIcons.spotify;
    const logoContent = service.logoUrl 
      ? `<img src="${service.logoUrl}" alt="${service.name} logo" class="brand-logo-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><span class="brand-fallback-icon" style="display:none;">${iconSvg}</span>`
      : iconSvg;
    const orderUrl = `order.html?id=${encodeURIComponent(service.id)}`;
    const features = service.features || ["Instant WhatsApp Delivery", "Full Warranty Replacement", "24/7 Fast Support"];

    return `
      <div class="service-card-modern" data-id="${service.id}">
        <div>
          <div class="card-top-header">
            <div class="service-icon-box">
              ${logoContent}
            </div>
            ${service.badge ? `<span class="card-badge-tag">${service.badge}</span>` : ''}
          </div>

          <h3 class="card-title-main">${service.name}</h3>
          <p class="card-description-text">${service.description || `${service.period || 'Premium'} subscription with instant activation & warranty.`}</p>

          <ul class="card-features-list">
            ${features.map(f => `
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="card-price-bottom">
          <div>
            <div class="card-price-val">${service.priceDisplay}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">${service.period || 'Individual Plan'}</div>
          </div>
          <a href="${orderUrl}" class="btn btn-primary btn-sm" title="Order ${service.name}">
            <span>Order</span>
            ${uiIcons.arrowUpRight}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 8. X Accounts Page Filter Tabs
function initXAccountFilters() {
  const bar = document.getElementById('x-accounts-filter-bar');
  if (!bar) return;

  bar.innerHTML = xAccountCategories.map(cat => `
    <button class="cat-pill ${cat.id === activeXAccountType ? 'active' : ''}" data-type="${cat.id}">
      <span>${cat.label}</span>
    </button>
  `).join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-pill');
    if (!btn) return;

    activeXAccountType = btn.dataset.type;
    document.querySelectorAll('#x-accounts-filter-bar .cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderXAccountsGrid();
  });
}

// 9. Render X Accounts Grid (accounts.html)
function renderXAccountsGrid() {
  const gridContainer = document.getElementById('x-accounts-grid');
  if (!gridContainer) return;

  const accounts = getEffectiveAccounts();
  const filteredAccounts = accounts.filter(acc => {
    if (activeXAccountType === 'all') return true;
    return acc.type === activeXAccountType;
  });

  gridContainer.innerHTML = filteredAccounts.map(account => {
    const orderUrl = `order.html?id=${encodeURIComponent(account.id)}&type=account`;

    return `
      <div class="service-card-modern" data-id="${account.id}">
        <div>
          <div class="card-top-header">
            <div class="service-icon-box">
              <img src="/logos/x.svg" alt="X Logo" class="brand-logo-img" onerror="this.src='/logos/x.svg'" />
            </div>
            ${account.badge ? `<span class="card-badge-tag">${account.badge}</span>` : ''}
          </div>

          <h3 class="card-title-main">${account.title}</h3>
          
          <div class="account-specs-badge-row">
            <span class="account-spec-pill">${account.followers}</span>
            <span class="account-spec-pill">${account.year}</span>
          </div>

          <p class="card-description-text">${account.description}</p>

          <ul class="card-features-list">
            ${account.features.map(f => `
              <li>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="card-price-bottom">
          <div>
            <div class="card-price-val">${account.priceDisplay}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">Instant Handover</div>
          </div>
          <a href="${orderUrl}" class="btn btn-primary btn-sm" title="Order ${account.title}">
            <span>Inquire & Buy</span>
            ${uiIcons.arrowUpRight}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

// 10. Dedicated Order Page & Dynamic Reference Generator (order.html)
function initOrderPage() {
  const selectDropdown = document.getElementById('order-service-select');
  const orderRefDisplay = document.getElementById('generated-order-id');
  const submitWaBtn = document.getElementById('submit-order-wa-btn');

  if (!selectDropdown || !submitWaBtn) return;

  // Generate Unique Order Code: #SUB-XXXXX
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  currentGeneratedOrderId = `#SUB-${randomDigits}`;
  if (orderRefDisplay) {
    orderRefDisplay.textContent = currentGeneratedOrderId;
  }

  // Populate Select Dropdown with Subscriptions + Accounts
  const allServices = getEffectiveServices();
  const allAccounts = getEffectiveAccounts();

  const servicesGroup = allServices.map(s => `<option value="${s.id}" data-type="service">${s.name} (${s.priceDisplay})</option>`).join('');
  const accountsGroup = allAccounts.map(a => `<option value="${a.id}" data-type="account">${a.title} (${a.priceDisplay})</option>`).join('');

  selectDropdown.innerHTML = `
    <optgroup label="Digital Subscriptions & VPNs">
      ${servicesGroup}
    </optgroup>
    <optgroup label="X (Twitter) Accounts">
      ${accountsGroup}
    </optgroup>
  `;

  // Read URL query parameter: ?id=...
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id');

  if (targetId) {
    const effectiveTargetId = (targetId === 'tg-premium') ? 'tg-premium-3m' : targetId;
    const matchingOption = Array.from(selectDropdown.options).find(opt => opt.value === effectiveTargetId);
    if (matchingOption) {
      selectDropdown.value = effectiveTargetId;
    }
  }

  // Initial Summary Update
  updateOrderSummary();

  // Auto-fill logged-in customer details
  initOrderPageAutoFill();

  // Listen for dropdown changes
  selectDropdown.addEventListener('change', updateOrderSummary);

  // Submit to WhatsApp Click Handler
  submitWaBtn.addEventListener('click', handleOrderSubmission);

  // Reset / Place New Order Button Handler
  const resetBtn = document.getElementById('place-new-order-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Generate fresh Order ID
      const newDigits = Math.floor(10000 + Math.random() * 90000);
      currentGeneratedOrderId = `#SUB-${newDigits}`;
      if (orderRefDisplay) orderRefDisplay.textContent = currentGeneratedOrderId;

      // Show form again
      const successBox = document.getElementById('order-success-state');
      const formEl = document.getElementById('subscription-order-form');
      const planBox = document.querySelector('.compact-plan-box');
      const headerBox = document.querySelector('.compact-card-header');

      if (successBox) successBox.style.display = 'none';
      if (formEl) formEl.style.display = 'flex';
      if (planBox) planBox.style.display = 'flex';
      if (headerBox) headerBox.style.display = 'block';

      // Clear input fields
      const nameInput = document.getElementById('customer-name');
      const notesInput = document.getElementById('customer-notes');
      if (nameInput) nameInput.value = '';
      if (notesInput) notesInput.value = '';
    });
  }
}

function getSelectedOrderTarget() {
  const selectDropdown = document.getElementById('order-service-select');
  if (!selectDropdown) return null;

  const selectedId = selectDropdown.value;
  const selectedOption = selectDropdown.options[selectDropdown.selectedIndex];
  const type = selectedOption?.dataset?.type || 'service';

  if (type === 'account') {
    const accounts = getEffectiveAccounts();
    const account = accounts.find(a => a.id === selectedId);
    return {
      type: 'account',
      id: account?.id || selectedId,
      name: account?.title || 'X Account',
      priceDisplay: account?.priceDisplay || '₦0',
      period: account?.year || 'Verified Profile',
      badge: account?.badge || 'Verified',
      description: account?.description || 'X account transfer with full credentials.',
      logoUrl: '/logos/x.svg',
      features: account?.features || ['Root email transfer', '2FA security setup']
    };
  }

  const services = getEffectiveServices();
  const service = services.find(s => s.id === selectedId) || services[0];
  return {
    type: 'service',
    id: service.id,
    name: service.name,
    priceDisplay: service.priceDisplay,
    period: service.period || 'Individual Plan',
    badge: service.badge || 'Active',
    description: service.description || 'Premium digital subscription with instant activation.',
    logoUrl: service.logoUrl || '/logos/spotify.svg',
    features: service.features || ['Instant WhatsApp Activation', '100% Replacement Warranty']
  };
}

function updateOrderSummary() {
  const item = getSelectedOrderTarget();
  if (!item) return;

  // Update all matching elements across both desktop showcase & mobile preview
  document.querySelectorAll('#summary-service-name, .summary-service-name').forEach(el => {
    el.textContent = item.name;
  });

  document.querySelectorAll('#summary-service-period, .summary-service-period').forEach(el => {
    el.textContent = item.period;
  });

  document.querySelectorAll('#summary-badge, .summary-badge').forEach(el => {
    el.textContent = item.badge;
  });

  document.querySelectorAll('#summary-service-desc, .summary-service-desc').forEach(el => {
    el.textContent = item.description;
  });

  document.querySelectorAll('#summary-brand-img, .summary-brand-img').forEach(el => {
    if (item.logoUrl) el.src = item.logoUrl;
    el.alt = `${item.name} logo`;
  });

  document.querySelectorAll('#summary-features-list, .summary-features-list').forEach(el => {
    if (item.features) {
      el.innerHTML = item.features.slice(0, 3).map(f => `
        <li>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${escapeHtml(f)}</span>
        </li>
      `).join('');
    }
  });

  document.querySelectorAll('#summary-price-subtotal, .summary-price-subtotal, #summary-total-price, .summary-total-price').forEach(el => {
    el.textContent = item.priceDisplay;
  });
}

function handleOrderSubmission() {
  const item = getSelectedOrderTarget();
  if (!item) return;

  const nameInput = document.getElementById('customer-name');
  const whatsappInput = document.getElementById('customer-whatsapp');
  const emailInput = document.getElementById('customer-email');
  const notesInput = document.getElementById('customer-notes');

  const rawName = nameInput?.value?.trim() || '';
  const rawWhatsapp = whatsappInput?.value?.trim() || '';
  const rawEmail = emailInput?.value?.trim() || 'N/A';
  const rawNotes = notesInput?.value?.trim() || 'None';

  // 1. Validate & Sanitize Name (min 2 chars, max 60 chars)
  if (!rawName || rawName.length < 2) {
    alert('Please enter your Full Name or Nickname (at least 2 characters).');
    nameInput?.focus();
    return;
  }
  const customerName = rawName.slice(0, 60);

  // 2. Validate & Sanitize WhatsApp Number (10 to 15 digits)
  const phoneDigits = rawWhatsapp.replace(/[\s\-\(\)\+]/g, '');
  if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
    alert('Please enter a valid WhatsApp phone number (e.g. 08012345678 or +234...).');
    whatsappInput?.focus();
    return;
  }
  const customerWhatsapp = rawWhatsapp.slice(0, 20);

  // 3. Sanitize Optional Fields
  const customerEmail = rawEmail !== 'N/A' ? rawEmail.slice(0, 80) : 'N/A';
  const customerNotes = rawNotes !== 'None' ? rawNotes.slice(0, 200) : 'None';

  // Format Solid Professional Order Slip for Vendor
  const emailLine = (customerEmail && customerEmail !== 'N/A') ? `\n- Email: ${customerEmail}` : '';
  const notesLine = (customerNotes && customerNotes !== 'None') ? `\n- Notes: ${customerNotes}` : '';

  const message = 
`*SUBLY ORDER — ${currentGeneratedOrderId}*

- Customer: ${customerName}
- WhatsApp: ${customerWhatsapp}${emailLine}
- Item: ${item.name} (${item.priceDisplay})${notesLine}

Hi Subly! Please send bank details for payment & instant delivery.`;

  const waUrl = `https://wa.me/2347047929177?text=${encodeURIComponent(message)}`;
  
  // 1. Save order to customer local history with exact timestamp
  const now = new Date();
  const orderRecord = {
    id: currentGeneratedOrderId,
    createdAt: now.toISOString(),
    timestamp: now.getTime(),
    date: now.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customerName,
    whatsapp: customerWhatsapp,
    email: customerEmail,
    serviceId: item.id,
    serviceName: item.name,
    price: item.priceDisplay,
    period: item.period,
    logoUrl: item.logoUrl,
    status: 'Active Subscription',
    waUrl
  };
  saveOrderToHistory(orderRecord);

  // 1b. Automatically register or update customer record in CRM with active subscription & expiry
  try {
    const allCustomers = getRegisteredCustomers();
    const cleanCustomerPhone = customerWhatsapp.replace(/[^\d]/g, '');
    let planDays = 30;
    const pStr = String(item.period || '').toLowerCase();
    if (pStr.includes('12 month') || pStr.includes('1 year') || pStr.includes('annual')) {
      planDays = 365;
    } else if (pStr.includes('6 month')) {
      planDays = 180;
    } else if (pStr.includes('3 month')) {
      planDays = 90;
    }

    const subStartDate = now.toISOString();
    const subExpiryDate = new Date(now.getTime() + (planDays * 24 * 60 * 60 * 1000)).toISOString();

    const subRecord = {
      id: 'sub-' + Date.now(),
      serviceId: item.id,
      serviceName: item.name,
      logoUrl: item.logoUrl,
      planPrice: item.priceDisplay,
      period: item.period,
      startDate: subStartDate,
      expiryDate: subExpiryDate,
      status: 'Active'
    };

    const existingCust = allCustomers.find(c => (c.whatsapp || '').replace(/[^\d]/g, '') === cleanCustomerPhone);
    if (existingCust) {
      existingCust.name = customerName;
      if (customerEmail && customerEmail !== 'N/A') existingCust.email = customerEmail;
      if (!Array.isArray(existingCust.subscriptions)) existingCust.subscriptions = [];
      existingCust.subscriptions.unshift(subRecord);
    } else {
      allCustomers.unshift({
        id: 'cust-' + Date.now(),
        name: customerName,
        whatsapp: customerWhatsapp,
        email: customerEmail !== 'N/A' ? customerEmail : '',
        subscriptions: [subRecord],
        registeredAt: subStartDate
      });
    }
    saveRegisteredCustomers(allCustomers);
  } catch (syncErr) {
    console.warn('CRM sync note:', syncErr);
  }

  // 2. Open WhatsApp in new tab securely (noopener, noreferrer)
  const newWin = window.open(waUrl, '_blank', 'noopener,noreferrer');
  if (newWin) newWin.opener = null;

  // 3. Switch page view to Order Completed Confirmation State
  const successBox = document.getElementById('order-success-state');
  const formEl = document.getElementById('subscription-order-form');
  const planBox = document.querySelector('.compact-plan-box');
  const headerBox = document.querySelector('.compact-card-header');

  const successIdEl = document.getElementById('success-order-id');
  const successCustEl = document.getElementById('success-customer-name');
  const successServiceEl = document.getElementById('success-service-name');
  const reopenWaBtn = document.getElementById('reopen-wa-btn');
  const viewTyBtn = document.getElementById('view-thankyou-btn');

  if (successIdEl) successIdEl.textContent = currentGeneratedOrderId;
  if (successCustEl) successCustEl.textContent = customerName;
  if (successServiceEl) successServiceEl.textContent = `${item.name} (${item.priceDisplay})`;
  if (reopenWaBtn) reopenWaBtn.href = waUrl;
  if (viewTyBtn) {
    viewTyBtn.href = `thank-you.html?order_id=${encodeURIComponent(currentGeneratedOrderId)}&service=${encodeURIComponent(item.name)}&price=${encodeURIComponent(item.priceDisplay)}&name=${encodeURIComponent(customerName)}`;
  }

  if (formEl) formEl.style.display = 'none';
  if (planBox) planBox.style.display = 'none';
  if (headerBox) headerBox.style.display = 'none';
  if (successBox) successBox.style.display = 'block';
}

// 11. Customer Order History Management (XSS Protected & Resilient)
const SUBLY_ORDERS_KEY = 'subly_customer_orders_v1';

function getOrderHistory() {
  return SafeStorage.getJSON(SUBLY_ORDERS_KEY, []);
}

function saveOrderToHistory(order) {
  const orders = getOrderHistory();
  orders.unshift(order); // Add newest order first
  SafeStorage.setJSON(SUBLY_ORDERS_KEY, orders.slice(0, 30)); // Keep up to 30 recent orders
}

function initOrderHistoryPage() {
  const heroContainer = document.getElementById('account-hero-container');
  const activeSubsContainer = document.getElementById('active-subscriptions-container');
  const listContainer = document.getElementById('orders-history-list');
  const searchInput = document.getElementById('order-history-search');
  const clearBtn = document.getElementById('clear-history-btn');
  const tabBtns = document.querySelectorAll('.account-tab-btn');
  const tabContents = document.querySelectorAll('.account-tab-content');

  const customer = getActiveCustomer();
  const orders = getOrderHistory();

  // 1. Account Tabs Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // 2. Render Hero Overview Card
  if (heroContainer) {
    if (customer && customer.name) {
      const firstName = customer.name.split(' ')[0];
      const initial = firstName.charAt(0).toUpperCase();
      const orderCount = orders.length;

      // Calculate total estimate spent (summing clean numbers)
      let totalSpent = 0;
      orders.forEach(o => {
        const num = parseInt(String(o.price || '').replace(/[^\d]/g, ''), 10);
        if (!isNaN(num)) totalSpent += num;
      });
      const spentDisplay = totalSpent > 0 ? `₦${totalSpent.toLocaleString()}` : '₦0';

      heroContainer.innerHTML = `
        <div class="account-hero-card">
          <div class="account-hero-header">
            <div class="account-user-meta">
              <div class="account-avatar-large">
                ${escapeHtml(initial)}
              </div>
              <div class="account-user-details">
                <div class="account-badge-row">
                  <span class="admin-status-pill">
                    <span class="pulse-green-dot"></span>
                    <span>Verified Account</span>
                  </span>
                </div>
                <h2>${escapeHtml(customer.name)}</h2>
                <div style="font-size: 0.86rem; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 14px; margin-top: 4px;">
                  <span>WhatsApp: <strong style="color: var(--text-heading);">${escapeHtml(customer.whatsapp || 'N/A')}</strong></span>
                  ${customer.email ? `<span>Email: <strong style="color: var(--text-heading);">${escapeHtml(customer.email)}</strong></span>` : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <a href="order.html" class="btn btn-primary btn-sm">
                <span>+ Place New Order</span>
              </a>
              <button type="button" class="btn btn-secondary btn-sm" id="hero-edit-profile-btn">
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div class="account-stats-grid">
            <div class="account-stat-box">
              <div class="account-stat-num">${orderCount}</div>
              <div class="account-stat-label">Total Orders Placed</div>
            </div>
            <div class="account-stat-box">
              <div class="account-stat-num">${spentDisplay}</div>
              <div class="account-stat-label">Estimated Total Volume</div>
            </div>
            <div class="account-stat-box">
              <div class="account-stat-num">${orders.length > 0 ? '100% Active' : 'None Yet'}</div>
              <div class="account-stat-label">Warranty Guarantee Status</div>
            </div>
            <div class="account-stat-box">
              <div class="account-stat-num">Active</div>
              <div class="account-stat-label">WhatsApp 1-Click Renewal</div>
            </div>
          </div>
        </div>
      `;

      const editBtn = document.getElementById('hero-edit-profile-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          const settingsBtn = document.querySelector('[data-tab="account-settings"]');
          if (settingsBtn) settingsBtn.click();
        });
      }
    } else {
      // Guest state
      heroContainer.innerHTML = `
        <div style="background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-mint) 100%); border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 26px; margin-bottom: 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 52px; height: 52px; border-radius: 16px; background: var(--bg-mint); border: 1px solid var(--green-400); display: flex; align-items: center; justify-content: center; color: var(--green-700); flex-shrink: 0;">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-heading);">Guest Shopping Mode</h3>
                <span class="admin-status-pill" style="font-size: 0.72rem;">Guest Session</span>
              </div>
              <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 540px;">Create a free Subly account or Sign In to sync your subscription warranty slips, get automated WhatsApp renewal countdowns, and 1-click auto-fill checkout.</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <a href="login.html" class="btn btn-secondary btn-sm"><span>Sign In</span></a>
            <a href="signup.html" class="btn btn-primary btn-sm"><span>Create Account</span></a>
          </div>
        </div>
      `;
    }
  }

  // 3. Render Active Plans & Renewal Countdown Cards
  if (activeSubsContainer) {
    if (orders.length === 0) {
      activeSubsContainer.innerHTML = `
        <div class="empty-history-box">
          <div style="margin-bottom: 12px; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3>No Active Subscriptions Yet</h3>
          <p>When you purchase a subscription on Subly, your countdown timer, warranty replacement badge, and 1-click renewal will appear right here.</p>
          <a href="services.html" class="btn btn-forest btn-md">
            <span>Browse Subscriptions &rarr;</span>
          </a>
        </div>
      `;
    } else {
      activeSubsContainer.innerHTML = `
        <div style="margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-heading);">Active Plans & Warranties</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Monitor your remaining days, renewal reminders, and instant warranty coverage.</p>
          </div>
          <a href="services.html" class="btn btn-secondary btn-sm">+ Add Another Service</a>
        </div>

        <div class="renewal-grid">
          ${orders.map(order => {
            const safeId = escapeHtml(order.id);
            const safeName = escapeHtml(order.serviceName);
            const safePrice = escapeHtml(order.price);
            const safePeriod = escapeHtml(order.period || 'Individual Plan');
            const safeLogo = escapeHtml(order.logoUrl || '/logos/spotify.svg');
            
            // 1. Determine start date accurately from purchase timestamp
            let startDate = new Date();
            if (order.createdAt) {
              startDate = new Date(order.createdAt);
            } else if (order.timestamp) {
              startDate = new Date(order.timestamp);
            } else if (order.date) {
              const parsed = Date.parse(order.date);
              if (!isNaN(parsed)) startDate = new Date(parsed);
            }

            // 2. Determine duration in days based on subscription plan
            const periodStr = String(order.period || '').toLowerCase();
            let totalDays = 30; // default 1 month
            if (periodStr.includes('12 month') || periodStr.includes('1 year') || periodStr.includes('annual')) {
              totalDays = 365;
            } else if (periodStr.includes('6 month')) {
              totalDays = 180;
            } else if (periodStr.includes('3 month')) {
              totalDays = 90;
            } else if (periodStr.includes('1 month') || periodStr.includes('monthly') || periodStr.includes('individual')) {
              totalDays = 30;
            }

            // 3. Exact date math from purchase date
            const nowTime = Date.now();
            const startTime = startDate.getTime();
            const expiryTime = startTime + (totalDays * 24 * 60 * 60 * 1000);
            const msRemaining = expiryTime - nowTime;
            const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / totalDays) * 100)));

            const expiryDate = new Date(expiryTime);
            const formattedStartDate = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

            const isExpired = daysRemaining <= 0;
            const isExpiringSoon = !isExpired && daysRemaining <= 3;

            let statusPillHtml = '<span class="renewal-status-pill">Active Plan</span>';
            let barClass = 'renewal-progress-bar-fill';
            let countdownLabel = `${daysRemaining} Days Remaining`;

            if (isExpired) {
              statusPillHtml = '<span class="renewal-status-pill" style="background:#fee2e2; color:#991b1b; border-color:#fecaca;">Expired</span>';
              barClass = 'renewal-progress-bar-fill warning';
              countdownLabel = `Expired (${Math.abs(daysRemaining)} days ago)`;
            } else if (isExpiringSoon) {
              statusPillHtml = `<span class="renewal-status-pill expiring">Expiring in ${daysRemaining} ${daysRemaining === 1 ? 'Day' : 'Days'}</span>`;
              barClass = 'renewal-progress-bar-fill warning';
            }

            const renewMsg = encodeURIComponent(`Hi Subly! I would like to renew my subscription for ${order.serviceName} (${order.price}) under Order ID ${order.id}. Purchased on ${formattedStartDate}. Please provide bank details.`);
            const renewUrl = `https://wa.me/2347047929177?text=${renewMsg}`;

            return `
              <div class="renewal-card">
                <div>
                  <div class="renewal-card-top">
                    <div class="renewal-brand-info">
                      <div class="renewal-brand-icon">
                        <img src="${safeLogo}" alt="${safeName} logo" class="brand-logo-img" onerror="this.src='/logos/spotify.svg'" />
                      </div>
                      <div>
                        <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-heading); margin-bottom: 2px;">${safeName}</h4>
                        <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">${safePeriod} • ${safeId}</div>
                      </div>
                    </div>
                    ${statusPillHtml}
                  </div>

                  <div class="renewal-countdown-box">
                    <div class="renewal-countdown-label">
                      <span style="color: var(--text-heading); font-weight: 800;">${countdownLabel}</span>
                      <span style="color: ${isExpired ? '#dc2626' : 'var(--green-600)'}; font-weight: 800;">${isExpired ? 'Warranty Ended' : '100% Warranty'}</span>
                    </div>
                    <div class="renewal-progress-bar-bg">
                      <div class="${barClass}" style="width: ${percentRemaining}%;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 0.74rem; color: var(--text-muted);">
                      <span>Started: <strong>${formattedStartDate}</strong></span>
                      <span>Expires: <strong>${formattedExpiryDate}</strong></span>
                    </div>
                  </div>
                </div>

                <div class="renewal-actions">
                  <a href="${renewUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="flex-grow: 1;">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
                    <span>1-Click WhatsApp Renewal</span>
                  </a>
                  <a href="order.html?id=${encodeURIComponent(order.serviceId || '')}" class="btn btn-secondary btn-sm" title="Re-order fresh account">
                    <span>Re-order</span>
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  // 4. Render All Orders List & Search Filter
  function renderHistory(query = '') {
    const cleanQuery = query.toLowerCase().trim();

    const filtered = orders.filter(o => {
      if (!cleanQuery) return true;
      const idStr = String(o.id || '').toLowerCase();
      const srvStr = String(o.serviceName || '').toLowerCase();
      const custStr = String(o.customerName || '').toLowerCase();
      const waStr = String(o.whatsapp || '').toLowerCase();
      return (
        idStr.includes(cleanQuery) ||
        srvStr.includes(cleanQuery) ||
        custStr.includes(cleanQuery) ||
        waStr.includes(cleanQuery)
      );
    });

    if (clearBtn) {
      clearBtn.style.display = orders.length > 0 ? 'inline-block' : 'none';
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-history-box">
          <div style="margin-bottom: 12px; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <h3>No Transactions Found</h3>
          <p>${orders.length === 0 ? 'You have not placed any orders on this device yet. Browse our subscriptions to get started.' : 'No orders matched your search term.'}</p>
          <a href="services.html" class="btn btn-forest btn-md">
            <span>Browse Subscriptions &rarr;</span>
          </a>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(order => {
      const safeId = escapeHtml(order.id);
      const safeName = escapeHtml(order.customerName);
      const safeWhatsapp = escapeHtml(order.whatsapp);
      const safeServiceName = escapeHtml(order.serviceName);
      const safePrice = escapeHtml(order.price);
      const safePeriod = escapeHtml(order.period || 'Individual Plan');
      const safeDate = escapeHtml(order.date || '');
      const safeStatus = escapeHtml(order.status || 'Dispatched');
      const safeLogo = escapeHtml(order.logoUrl || '/logos/spotify.svg');

      const supportMsg = encodeURIComponent(`Hi Subly! I have an inquiry about my order ${order.id} for ${order.serviceName}.`);
      const supportUrl = `https://wa.me/2347047929177?text=${supportMsg}`;

      return `
        <div class="history-card-item" data-id="${safeId}">
          <div class="history-card-top">
            <div class="history-ref-badge">
              <span class="pulse-green-dot"></span>
              <span>${safeId}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="history-status-badge">${safeStatus}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${safeDate}</span>
            </div>
          </div>

          <div class="history-service-row">
            <div class="history-service-icon">
              <img src="${safeLogo}" alt="${safeServiceName} logo" class="brand-logo-img" onerror="this.src='/logos/spotify.svg'" />
            </div>
            <div class="history-service-details">
              <h4>${safeServiceName}</h4>
              <span class="history-service-meta">${safePeriod}</span>
            </div>
            <div class="history-price-val">
              ${safePrice}
            </div>
          </div>

          <div class="history-meta-grid" style="grid-template-columns: 1fr 1fr;">
            <div>Customer: <strong>${safeName}</strong></div>
            <div>WhatsApp: <strong>${safeWhatsapp}</strong></div>
          </div>

          <div class="history-actions-row">
            <a href="${supportUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-forest btn-sm">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
              <span>WhatsApp Support for this Order</span>
            </a>
            <a href="order.html?id=${encodeURIComponent(order.serviceId || '')}" class="btn btn-secondary btn-sm">
              <span>Order Again</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initial render of orders list
  if (listContainer) renderHistory();

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderHistory(e.target.value);
    });
  }

  // Clear history handler
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your local order history?')) {
        SafeStorage.remove(SUBLY_ORDERS_KEY);
        renderHistory();
        if (activeSubsContainer) activeSubsContainer.innerHTML = '';
      }
    });
  }

  // 5. Populate Warranty Claim Order Dropdown & Form Handler
  const claimOrderSelect = document.getElementById('claim-order-select');
  const warrantyForm = document.getElementById('warranty-claim-form');

  if (claimOrderSelect) {
    if (orders.length > 0) {
      claimOrderSelect.innerHTML = `
        <option value="">-- Choose Order Slip --</option>
        ${orders.map(o => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.id)} — ${escapeHtml(o.serviceName)} (${escapeHtml(o.price)})</option>`).join('')}
      `;
    } else {
      claimOrderSelect.innerHTML = `<option value="General Warranty Inquiry">General Warranty / Account Help</option>`;
    }
  }

  if (warrantyForm) {
    warrantyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderRef = claimOrderSelect?.value || 'N/A';
      const issueType = document.getElementById('claim-issue-type')?.value || 'General Issue';
      const details = document.getElementById('claim-details')?.value?.trim() || 'Please check and provide replacement';
      const custName = customer?.name || 'Subly Customer';

      const claimMessage = 
`*SUBLY PRIORITY WARRANTY CLAIM*
- Customer: ${custName}
- Order Reference: ${orderRef}
- Issue Type: ${issueType}
- Details: ${details}

Hi Subly Support! Please help me resolve this issue under my 100% replacement warranty guarantee.`;

      const claimUrl = `https://wa.me/2347047929177?text=${encodeURIComponent(claimMessage)}`;
      window.open(claimUrl, '_blank', 'noopener,noreferrer');
      alert('Warranty ticket prepared! Redirecting you to Subly WhatsApp dispatch for immediate resolution.');
    });
  }

  // 6. Pre-fill & Handle Profile Update Form
  const profileForm = document.getElementById('customer-profile-update-form');
  const editName = document.getElementById('edit-name');
  const editWhatsapp = document.getElementById('edit-whatsapp');
  const editEmail = document.getElementById('edit-email');
  const saveStatus = document.getElementById('profile-save-status');

  if (profileForm && customer) {
    if (editName && customer.name) editName.value = customer.name;
    if (editWhatsapp && customer.whatsapp) editWhatsapp.value = customer.whatsapp;
    if (editEmail && customer.email) editEmail.value = customer.email;

    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = editName?.value?.trim() || customer.name;
      const newWhatsapp = editWhatsapp?.value?.trim() || customer.whatsapp;
      const newEmail = editEmail?.value?.trim() || '';

      // Update active customer object
      const updatedCustomer = {
        ...customer,
        name: newName,
        whatsapp: newWhatsapp,
        email: newEmail
      };

      setActiveCustomer(updatedCustomer);

      // Update registered list if existing
      const regList = getRegisteredCustomers();
      const idx = regList.findIndex(c => c.whatsapp === customer.whatsapp || c.id === customer.id);
      if (idx !== -1) {
        regList[idx] = { ...regList[idx], ...updatedCustomer };
        saveRegisteredCustomers(regList);
      }

      if (saveStatus) {
        saveStatus.style.display = 'block';
        saveStatus.textContent = '✓ Profile preferences saved! Your checkout details and navbar are now synchronized.';
        setTimeout(() => {
          saveStatus.style.display = 'none';
        }, 4000);
      }

      // Re-init navbar
      initNavbarAuth();
    });
  }

  // 7. JSON History Export Handler
  const exportBtn = document.getElementById('export-history-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `subly-orders-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // 8. Settings Logout Handler
  const settingsLogoutBtn = document.getElementById('settings-logout-btn');
  if (settingsLogoutBtn) {
    settingsLogoutBtn.addEventListener('click', logoutCustomer);
  }
}

// 12. FAQ Accordion Logic
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

// 13. FAQ Search Filtering (faq.html)
function initFaqSearch() {
  const searchInput = document.getElementById('faq-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll('#faq-full-container .faq-item');

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const keywords = (item.dataset.keywords || '').toLowerCase();
      
      if (!query || text.includes(query) || keywords.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
}

// 14. Admin Control Panel Controller (admin.html)
function initAdminPanel() {
  const authScreen = document.getElementById('admin-auth-screen');
  const dashboardScreen = document.getElementById('admin-dashboard-screen');
  const loginForm = document.getElementById('admin-login-form');
  const pinInput = document.getElementById('admin-pin-input');
  const authError = document.getElementById('admin-auth-error');
  const logoutBtn = document.getElementById('admin-logout-btn');

  // Check Session Auth
  const isAuth = sessionStorage.getItem('subly_admin_authenticated') === 'true';
  if (isAuth) {
    showDashboard();
  }

  function showDashboard() {
    if (authScreen) authScreen.style.display = 'none';
    if (dashboardScreen) dashboardScreen.style.display = 'flex';
    renderAdminOverview();
    renderAdminProducts();
    renderAdminAccounts();
    renderAdminCustomers();
    initAdminTabs();
    initAdminModals();
    initCustomerModals();
    initAdminSettings();
  }

  // Backward compatibility alias so any product modal call works cleanly
  function initProductModals() {
    initAdminModals();
  }

  function lockAdmin() {
    sessionStorage.removeItem('subly_admin_authenticated');
    if (dashboardScreen) dashboardScreen.style.display = 'none';
    if (authScreen) authScreen.style.display = 'flex';
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput?.value?.trim();
      const actualPin = SafeStorage.getString('subly_admin_pin', '8492');

      if (enteredPin === actualPin) {
        if (authError) authError.style.display = 'none';
        sessionStorage.setItem('subly_admin_authenticated', 'true');
        showDashboard();
      } else {
        if (authError) {
          authError.style.display = 'block';
          authError.textContent = 'Incorrect Security PIN. Please try again.';
        }
        pinInput?.select();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', lockAdmin);
  }

  // Global Escape key listener to dismiss any open admin modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.admin-modal-overlay').forEach(modal => {
        modal.style.display = 'none';
      });
    }
  });
}

// Admin Tab Switching Logic
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      const activePane = document.getElementById(`admin-tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');

      if (targetTab === 'overview') renderAdminOverview();
      if (targetTab === 'analytics') renderAdminAnalytics();
      if (targetTab === 'customers') renderAdminCustomers();
      if (targetTab === 'products') renderAdminProducts();
      if (targetTab === 'accounts') renderAdminAccounts();
    });
  });
}

// Admin Overview & Metrics Renderer
function renderAdminOverview() {
  const orders = getOrderHistory();
  const services = getEffectiveServices();
  const accounts = getEffectiveAccounts();
  const customers = getRegisteredCustomers();

  // 1. Calculate Metrics
  const totalOrdersEl = document.getElementById('metric-total-orders');
  const estRevenueEl = document.getElementById('metric-est-revenue');
  const totalCustomersEl = document.getElementById('metric-total-customers');
  const activeAccountsEl = document.getElementById('metric-active-accounts');
  const prodTabCount = document.getElementById('admin-product-count-tab');
  const accTabCount = document.getElementById('admin-accounts-count-tab');
  const custTabCount = document.getElementById('admin-customer-count-tab');

  let totalNaira = 0;
  orders.forEach(o => {
    if (o.price) {
      const cleanNum = parseInt(o.price.replace(/[^\d]/g, ''), 10);
      if (!isNaN(cleanNum)) totalNaira += cleanNum;
    }
  });

  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
  if (estRevenueEl) estRevenueEl.textContent = `₦${totalNaira.toLocaleString('en-US')}`;
  if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
  if (activeAccountsEl) activeAccountsEl.textContent = accounts.length;
  if (prodTabCount) prodTabCount.textContent = services.length;
  if (accTabCount) accTabCount.textContent = accounts.length;
  if (custTabCount) custTabCount.textContent = customers.length;

  // 2. Render Orders Table
  const ordersTableBody = document.getElementById('admin-orders-table-body');
  const refreshOrdersBtn = document.getElementById('admin-refresh-orders-btn');

  if (refreshOrdersBtn) {
    refreshOrdersBtn.onclick = () => renderAdminOverview();
  }

  if (!ordersTableBody) return;

  if (orders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-muted);">
          No customer orders placed yet. Orders submitted on the website will automatically appear here in real time.
        </td>
      </tr>
    `;
    return;
  }

  ordersTableBody.innerHTML = orders.map(order => {
    const safeId = escapeHtml(order.id);
    const safeDate = escapeHtml(order.date);
    const safeName = escapeHtml(order.customerName);
    const safeWhatsapp = escapeHtml(order.whatsapp);
    const safeService = escapeHtml(order.serviceName);
    const safePrice = escapeHtml(order.price);
    const safeStatus = escapeHtml(order.status || 'Dispatched to WhatsApp');

    const cleanPhone = safeWhatsapp.replace(/[^\d]/g, '');
    const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${order.customerName}! Reaching out regarding your Subly order ${order.id}.`)}`;

    return `
      <tr>
        <td><strong>${safeId}</strong></td>
        <td><span style="font-size: 0.8rem; color: var(--text-muted);">${safeDate}</span></td>
        <td><strong>${safeName}</strong></td>
        <td>
          <a href="${waChatUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--green-600); font-weight: 700; text-decoration: underline;">
            ${safeWhatsapp}
          </a>
        </td>
        <td>${safeService}</td>
        <td><strong style="color: var(--flyer-green-price);">${safePrice}</strong></td>
        <td>
          <select class="form-control-compact admin-order-status-select" data-id="${safeId}" style="padding: 4px 8px; font-size: 0.78rem;">
            <option value="Dispatched to WhatsApp" ${safeStatus === 'Dispatched to WhatsApp' ? 'selected' : ''}>Dispatched</option>
            <option value="Delivered & Active" ${safeStatus === 'Delivered & Active' ? 'selected' : ''}>Delivered & Active</option>
            <option value="Order Completed" ${safeStatus === 'Order Completed' ? 'selected' : ''}>Completed</option>
            <option value="Payment Pending" ${safeStatus === 'Payment Pending' ? 'selected' : ''}>Payment Pending</option>
          </select>
        </td>
        <td>
          <a href="${waChatUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-forest btn-sm" title="Chat on WhatsApp">
            <span>Chat</span>
          </a>
        </td>
      </tr>
    `;
  }).join('');

  // Status Change Listener
  ordersTableBody.querySelectorAll('.admin-order-status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const orderId = e.target.dataset.id;
      const newStatus = e.target.value;
      const allOrders = getOrderHistory();
      const target = allOrders.find(o => o.id === orderId);
      if (target) {
        target.status = newStatus;
        SafeStorage.setJSON(SUBLY_ORDERS_KEY, allOrders);
      }
    });
  });
}

// 2. ANALYTICS DASHBOARD RENDERER
function renderAdminAnalytics() {
  const orders = getOrderHistory();
  const customers = getRegisteredCustomers();

  let totalNaira = 0;
  const categoryCounts = {
    'Streaming': 0,
    'AI & Productivity': 0,
    'VPN Plans': 0,
    'Design & Editing': 0,
    'X Accounts': 0
  };

  orders.forEach(o => {
    const cleanNum = parseInt(String(o.price || '').replace(/[^\d]/g, ''), 10);
    if (!isNaN(cleanNum)) totalNaira += cleanNum;

    const srv = String(o.serviceName || '').toLowerCase();
    if (srv.includes('netflix') || srv.includes('spotify') || srv.includes('youtube') || srv.includes('prime') || srv.includes('apple')) {
      categoryCounts['Streaming'] += cleanNum || 3500;
    } else if (srv.includes('chatgpt') || srv.includes('claude') || srv.includes('gemini')) {
      categoryCounts['AI & Productivity'] += cleanNum || 5000;
    } else if (srv.includes('vpn') || srv.includes('nord') || srv.includes('express')) {
      categoryCounts['VPN Plans'] += cleanNum || 4000;
    } else if (srv.includes('canva') || srv.includes('capcut')) {
      categoryCounts['Design & Editing'] += cleanNum || 2500;
    } else if (srv.includes('x account') || srv.includes('twitter') || srv.includes('followers')) {
      categoryCounts['X Accounts'] += cleanNum || 15000;
    } else {
      categoryCounts['Streaming'] += cleanNum || 3000;
    }
  });

  // Calculate AOV
  const aov = orders.length > 0 ? Math.round(totalNaira / orders.length) : 0;
  const aovEl = document.getElementById('analytics-aov');
  if (aovEl) aovEl.textContent = `₦${aov.toLocaleString('en-US')}`;

  // Render Category Breakdown Bars
  const breakdownContainer = document.getElementById('analytics-category-breakdown');
  if (breakdownContainer) {
    const totalVolume = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    breakdownContainer.innerHTML = Object.entries(categoryCounts).map(([cat, amount]) => {
      const pct = Math.round((amount / totalVolume) * 100);
      return `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">
            <span>${cat}</span>
            <span>₦${amount.toLocaleString('en-US')} (${pct}%)</span>
          </div>
          <div class="renewal-progress-bar-bg" style="height: 10px;">
            <div class="renewal-progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ==========================================================================
// 3. REAL-TIME EXPIRATION TIMERS & CUSTOMER SUBSCRIPTIONS CONTROLLER
// ==========================================================================

// Global Live Ticking Interval (Ticks every 1 second)
let liveTimerTicker = null;

function getLiveTimerData(expiryIsoString) {
  if (!expiryIsoString) return null;
  const expiryTs = new Date(expiryIsoString).getTime();
  if (isNaN(expiryTs)) return null;

  const now = Date.now();
  const msRemaining = expiryTs - now;
  const oneDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil(msRemaining / oneDay);
  const isExpired = msRemaining <= 0;
  const isExpiringSoon = !isExpired && msRemaining <= (5 * oneDay);

  let timeString = '';
  if (isExpired) {
    const daysAgo = Math.max(1, Math.abs(Math.floor(msRemaining / oneDay)));
    timeString = `Expired (${daysAgo}d ago)`;
  } else {
    const d = Math.floor(msRemaining / oneDay);
    const h = Math.floor((msRemaining % oneDay) / (60 * 60 * 1000));
    const m = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000));
    const s = Math.floor((msRemaining % (60 * 1000)) / 1000);
    timeString = d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  }

  return {
    expiryTs,
    msRemaining,
    daysRemaining,
    isExpired,
    isExpiringSoon,
    timeString,
    category: isExpired ? 'expired' : (isExpiringSoon ? 'expiring' : 'active')
  };
}

function startLiveTimersTick() {
  if (liveTimerTicker) clearInterval(liveTimerTicker);
  liveTimerTicker = setInterval(() => {
    document.querySelectorAll('[data-live-expiry]').forEach(el => {
      const expiryIso = el.dataset.liveExpiry;
      const timer = getLiveTimerData(expiryIso);
      if (timer) {
        el.textContent = timer.timeString;
        if (timer.isExpired) {
          el.className = el.className.replace(/\b(warning|active)\b/g, '') + ' expired';
        } else if (timer.isExpiringSoon) {
          el.className = el.className.replace(/\b(expired|active)\b/g, '') + ' warning';
        }
      }
    });
  }, 1000);
}

// WhatsApp 1-Click Renewal Reminder Message Link Generator
function createWhatsAppRenewalReminderUrl(phone, customerName, sub) {
  const cleanPhone = (phone || '').replace(/[^\d]/g, '');
  const expDate = new Date(sub.expiryDate);
  const formattedDate = expDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const timer = getLiveTimerData(sub.expiryDate);

  let urgencyText = '';
  if (!timer || timer.isExpired) {
    urgencyText = `expired on *${formattedDate}*. Would you like to renew today to restore your instant access?`;
  } else if (timer.daysRemaining <= 1) {
    urgencyText = `will expire in *${timer.timeString}* (on ${formattedDate}). Please reply here to renew now to prevent service interruption or screen lock.`;
  } else {
    urgencyText = `will expire in *${timer.daysRemaining} days* (on ${formattedDate}). Would you like to renew before it lapses?`;
  }

  const message = 
`*SUBLY SUBSCRIPTION EXPIRATION NOTICE* ⏳

Hi ${customerName}!

Notice from Subly Digital Hub regarding your active service:
Your subscription for *${sub.serviceName}* (${sub.planPrice || sub.period || 'Active Plan'}) ${urgencyText}

- Service: ${sub.serviceName}
- Plan: ${sub.period || 'Individual'} (${sub.planPrice || 'Standard'})
- Expiry Date: ${formattedDate}

Reply here on WhatsApp to proceed with instant renewal! 🚀`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// 1. Upcoming Expirations Radar Renderer
function renderAdminExpiryRadar(customers) {
  const radarBox = document.getElementById('admin-expiry-radar-box');
  const radarCards = document.getElementById('admin-expiry-radar-cards');
  const radarCount = document.getElementById('radar-count-badge');
  if (!radarBox || !radarCards) return;

  const urgentItems = [];

  customers.forEach(cust => {
    const subs = Array.isArray(cust.subscriptions) ? cust.subscriptions : [];
    subs.forEach(sub => {
      if (!sub.expiryDate) return;
      const timer = getLiveTimerData(sub.expiryDate);
      if (timer && (timer.isExpiringSoon || timer.isExpired)) {
        urgentItems.push({
          cust,
          sub,
          timer
        });
      }
    });
  });

  // Sort soonest expiring first (and expired at the very top)
  urgentItems.sort((a, b) => a.timer.msRemaining - b.timer.msRemaining);

  if (radarCount) {
    if (urgentItems.length === 0) {
      radarCount.textContent = '✓ All Subscriptions Up to Date';
      radarCount.style.background = '#dcfce7';
      radarCount.style.color = '#15803d';
      radarCount.style.borderColor = '#86efac';
    } else {
      radarCount.textContent = `⚡ ${urgentItems.length} Subscriptions Need Attention`;
      radarCount.style.background = '#fef3c7';
      radarCount.style.color = '#92400e';
      radarCount.style.borderColor = '#fde68a';
    }
  }

  if (urgentItems.length === 0) {
    radarCards.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 14px; text-align: center; font-size: 0.84rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        No customer subscriptions expiring within the next 5 days. All accounts are currently active.
      </div>
    `;
    return;
  }

  radarCards.innerHTML = urgentItems.slice(0, 6).map(({ cust, sub, timer }) => {
    const safeCustName = escapeHtml(cust.name);
    const safePhone = escapeHtml(cust.whatsapp);
    const safeSubName = escapeHtml(sub.serviceName);
    const safePrice = escapeHtml(sub.planPrice || '₦800');
    const logoSrc = sub.logoUrl || '/logos/spotify.svg';
    const waRemindUrl = createWhatsAppRenewalReminderUrl(cust.whatsapp, cust.name, sub);
    const isExp = timer.isExpired;

    return `
      <div class="radar-item-card">
        <div class="radar-item-top">
          <div class="radar-item-sub-info">
            <img src="${logoSrc}" alt="${safeSubName}" class="radar-item-sub-logo" onerror="this.src='/logos/spotify.svg'" />
            <div>
              <strong style="font-size: 0.86rem; color: var(--text-heading);">${safeSubName}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${safeCustName} • ${safePhone}</div>
            </div>
          </div>
          <span class="radar-item-timer-badge ${isExp ? 'expired' : ''}">
            <span data-live-expiry="${sub.expiryDate}">${timer.timeString}</span>
          </span>
        </div>

        <div class="radar-item-bottom">
          <span style="font-size: 0.76rem; font-weight: 700; color: var(--flyer-green-price);">${safePrice}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm btn-view-cust-subs" data-phone="${safePhone}" style="padding: 3px 8px; font-size: 0.72rem;">
              <span>View Subs</span>
            </button>
            <a href="${waRemindUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-forest btn-sm" style="padding: 3px 10px; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 4px;" title="Send 1-Click WhatsApp Expiry Reminder">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
              <span>Remind</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// 2. Registered Customers Directory CRM Table Renderer
function renderAdminCustomers() {
  const tableBody = document.getElementById('admin-customers-table-body');
  const searchInput = document.getElementById('admin-customer-search');
  const filterSelect = document.getElementById('admin-customer-filter-status');
  const exportBtn = document.getElementById('admin-export-customers-btn');
  const custTabCount = document.getElementById('admin-customer-count-tab');
  const totalCustomersEl = document.getElementById('metric-total-customers');

  if (!tableBody) return;

  const customers = getRegisteredCustomers();
  if (custTabCount) custTabCount.textContent = customers.length;
  if (totalCustomersEl) totalCustomersEl.textContent = customers.length;

  // Render Top Expiry Radar
  renderAdminExpiryRadar(customers);

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const filterStatus = filterSelect ? filterSelect.value : 'all';

  // Process customer data & enrich with computed expiration timers
  const enrichedCustomers = customers.map(cust => {
    const subs = Array.isArray(cust.subscriptions) ? cust.subscriptions : [];
    
    // Find soonest expiring subscription
    let soonestSub = null;
    let soonestTimer = null;

    subs.forEach(s => {
      if (!s.expiryDate) return;
      const timer = getLiveTimerData(s.expiryDate);
      if (!timer) return;
      if (!soonestTimer || timer.msRemaining < soonestTimer.msRemaining) {
        soonestTimer = timer;
        soonestSub = s;
      }
    });

    let overallCategory = 'none';
    if (subs.length > 0) {
      if (subs.some(s => {
        const t = getLiveTimerData(s.expiryDate);
        return t && t.isExpired;
      })) {
        overallCategory = 'expired';
      } else if (subs.some(s => {
        const t = getLiveTimerData(s.expiryDate);
        return t && t.isExpiringSoon;
      })) {
        overallCategory = 'expiring';
      } else {
        overallCategory = 'active';
      }
    }

    return {
      ...cust,
      subscriptions: subs,
      soonestSub,
      soonestTimer,
      overallCategory
    };
  });

  // Filter logic
  const filtered = enrichedCustomers.filter(c => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && c.overallCategory !== 'active') return false;
      if (filterStatus === 'expiring' && c.overallCategory !== 'expiring') return false;
      if (filterStatus === 'expired' && c.overallCategory !== 'expired') return false;
      if (filterStatus === 'none' && c.overallCategory !== 'none') return false;
    }

    if (!query) return true;
    const subNames = c.subscriptions.map(s => s.serviceName || '').join(' ').toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      subNames.includes(query)
    );
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">
          ${customers.length === 0 ? 'No registered customers yet.' : 'No customers matched your search or filter criteria.'}
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(cust => {
    const safeName = escapeHtml(cust.name);
    const safeWhatsapp = escapeHtml(cust.whatsapp);
    const safeEmail = cust.email ? escapeHtml(cust.email) : '';
    const initial = safeName.charAt(0).toUpperCase();

    const cleanPhone = safeWhatsapp.replace(/[^\d]/g, '');
    const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${cust.name}! Reaching out from Subly Customer Support.`)}`;

    // Subscriptions Column HTML
    const subCount = cust.subscriptions.length;
    let subsHtml = '';
    if (subCount > 0) {
      const tagsHtml = cust.subscriptions.slice(0, 3).map(s => `<span class="mini-sub-tag">${escapeHtml(s.serviceName)}</span>`).join('');
      const moreTag = subCount > 3 ? `<span class="mini-sub-tag">+${subCount - 3}</span>` : '';
      subsHtml = `
        <div>
          <span class="subs-count-badge">${subCount} Active ${subCount === 1 ? 'Plan' : 'Plans'}</span>
          <div class="mini-subs-preview">
            ${tagsHtml}
            ${moreTag}
          </div>
        </div>
      `;
    } else {
      subsHtml = `<span class="sub-customer-service-empty">0 Active Plans</span>`;
    }

    // Soonest Expiry Timer Column HTML
    let timerHtml = '';
    if (cust.soonestSub && cust.soonestTimer) {
      const isExp = cust.soonestTimer.isExpired;
      const isSoon = cust.soonestTimer.isExpiringSoon;
      const timerClass = isExp ? 'expired' : (isSoon ? 'warning' : '');
      const subNameShort = escapeHtml(cust.soonestSub.serviceName);

      timerHtml = `
        <div class="closest-expiry-timer">
          <div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 700;">${subNameShort}</div>
          <div class="closest-timer-val ${timerClass}">
            <span data-live-expiry="${cust.soonestSub.expiryDate}">${cust.soonestTimer.timeString}</span>
          </div>
        </div>
      `;
    } else {
      timerHtml = `<span style="font-size: 0.78rem; color: var(--text-muted);">None Active</span>`;
    }

    // Status Pill HTML
    let statusPill = '';
    if (cust.overallCategory === 'expired') {
      statusPill = `<span class="admin-status-pill danger" style="background:#fee2e2; color:#991b1b; border-color:#fca5a5;">Expired Sub</span>`;
    } else if (cust.overallCategory === 'expiring') {
      statusPill = `<span class="admin-status-pill warning" style="background:#fef3c7; color:#92400e; border-color:#fde68a;"><span class="pulse-warning-dot"></span> Expiring Soon</span>`;
    } else if (subCount > 0) {
      statusPill = `<span class="admin-status-pill"><span class="pulse-green-dot"></span> Active (${subCount})</span>`;
    } else {
      statusPill = `<span class="admin-status-pill" style="opacity: 0.6;">No Plan</span>`;
    }

    // Registered Date
    const safeRegDate = cust.registeredAt ? new Date(cust.registeredAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

    // WhatsApp Reminder for soonest expiring sub
    let waRemindUrl = '';
    if (cust.soonestSub) {
      waRemindUrl = createWhatsAppRenewalReminderUrl(cust.whatsapp, cust.name, cust.soonestSub);
    } else {
      waRemindUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${cust.name}! Reaching out from Subly regarding your account.`)}`;
    }

    return `
      <tr data-cust-phone="${safeWhatsapp}">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="nav-user-avatar" style="width: 34px; height: 34px; font-size: 0.85rem; flex-shrink: 0;">${initial}</div>
            <div>
              <strong style="color: var(--text-heading); font-size: 0.9rem;">${safeName}</strong>
              ${safeEmail ? `<div style="font-size: 0.74rem; color: var(--text-muted);">${safeEmail}</div>` : ''}
            </div>
          </div>
        </td>
        <td>
          <a href="${waChatUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--green-600); font-weight: 700; text-decoration: underline; font-size: 0.86rem;">
            ${safeWhatsapp}
          </a>
        </td>
        <td>${subsHtml}</td>
        <td>${timerHtml}</td>
        <td>${statusPill}</td>
        <td><span style="font-size: 0.8rem; color: var(--text-muted);">${safeRegDate}</span></td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn-view-customer-subs" data-phone="${safeWhatsapp}" title="View all subscriptions & live timers for this user">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>Subscriptions (${subCount})</span>
            </button>
            <a href="${waRemindUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Send WhatsApp Renewal Reminder" style="padding: 4px 8px; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
              <span>Remind</span>
            </a>
            <button type="button" class="admin-btn-icon btn-delete-customer" data-phone="${safeWhatsapp}" data-name="${safeName}" title="Delete Customer" style="width: 28px; height: 28px;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Start Live Ticking Interval
  startLiveTimersTick();

  // Search input binding
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderAdminCustomers());
  }

  // Filter select binding
  if (filterSelect && !filterSelect.dataset.bound) {
    filterSelect.dataset.bound = 'true';
    filterSelect.addEventListener('change', () => renderAdminCustomers());
  }

  // Export Customers JSON handler
  if (exportBtn && !exportBtn.dataset.bound) {
    exportBtn.dataset.bound = 'true';
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(enrichedCustomers, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `subly-customers-with-subscriptions-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // Delete Customer Handler
  tableBody.querySelectorAll('.btn-delete-customer').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPhone = btn.dataset.phone;
      const targetName = btn.dataset.name;
      if (confirm(`Are you sure you want to delete customer ${targetName} (${targetPhone})?`)) {
        const remaining = getRegisteredCustomers().filter(c => c.whatsapp !== targetPhone);
        saveRegisteredCustomers(remaining);
        renderAdminCustomers();
        renderAdminOverview();
      }
    });
  });

  // Open Customer Subscriptions Hub Handler (From table & radar)
  document.querySelectorAll('.btn-view-customer-subs, .btn-view-cust-subs').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPhone = btn.dataset.phone;
      const customers = getRegisteredCustomers();
      const cust = customers.find(c => c.whatsapp === targetPhone);
      if (cust) {
        openCustomerSubscriptionsHub(cust);
      }
    });
  });
}

// 3. Customer Subscriptions Hub Modal Controller (Shows ALL subscriptions the user is doing with live timers)
let currentHubCustomer = null;

function openCustomerSubscriptionsHub(cust) {
  currentHubCustomer = cust;
  const hubModal = document.getElementById('customer-subs-hub-modal-overlay');
  const avatarEl = document.getElementById('hub-user-avatar');
  const nameEl = document.getElementById('hub-user-name');
  const phoneLineEl = document.getElementById('hub-user-phone-line');
  const countLabel = document.getElementById('hub-subs-count-label');
  const listContainer = document.getElementById('hub-subscriptions-list');

  if (!hubModal || !listContainer) return;

  const safeName = escapeHtml(cust.name);
  const safePhone = escapeHtml(cust.whatsapp);
  const cleanPhone = safePhone.replace(/[^\d]/g, '');
  const initial = safeName.charAt(0).toUpperCase();

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = `${safeName}'s Subscriptions`;

  const waChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${cust.name}! Reaching out from Subly regarding your subscriptions.`)}`;
  if (phoneLineEl) {
    phoneLineEl.innerHTML = `
      <span>WhatsApp: <a href="${waChatUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--green-600); font-weight: 700; text-decoration: underline;">${safePhone}</a></span>
      ${cust.email ? `<span>• Email: <strong style="color: var(--text-heading);">${escapeHtml(cust.email)}</strong></span>` : ''}
    `;
  }

  const subs = Array.isArray(cust.subscriptions) ? cust.subscriptions : [];
  if (countLabel) {
    countLabel.textContent = `${subs.length} Active ${subs.length === 1 ? 'Subscription' : 'Subscriptions'}`;
  }

  if (subs.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1.5px dashed var(--border-color);">
        <div style="font-size: 1.5rem; margin-bottom: 8px;">📦</div>
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-heading); margin-bottom: 4px;">No Active Subscriptions Yet</h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); max-width: 420px; margin: 0 auto 16px auto;">This user currently has no active subscription plans assigned. Click below to add their first service.</p>
        <button type="button" class="btn btn-forest btn-sm" id="hub-empty-add-sub-btn">
          <span>+ Assign First Subscription</span>
        </button>
      </div>
    `;

    const emptyAddBtn = document.getElementById('hub-empty-add-sub-btn');
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener('click', () => openCustomerSubModal(cust, null));
    }
  } else {
    listContainer.innerHTML = subs.map((sub, index) => {
      const safeSubName = escapeHtml(sub.serviceName);
      const safePrice = escapeHtml(sub.planPrice || '₦800');
      const safePeriod = escapeHtml(sub.period || 'Individual Plan');
      const logoSrc = sub.logoUrl || '/logos/spotify.svg';
      const timer = getLiveTimerData(sub.expiryDate);

      let startDateFormatted = 'Recent';
      if (sub.startDate) {
        startDateFormatted = new Date(sub.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      let expiryDateFormatted = 'Not Set';
      if (sub.expiryDate) {
        expiryDateFormatted = new Date(sub.expiryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      // Calculate progress percentage
      let pctRemaining = 50;
      if (sub.startDate && sub.expiryDate) {
        const startTs = new Date(sub.startDate).getTime();
        const expTs = new Date(sub.expiryDate).getTime();
        const totalSpan = expTs - startTs;
        if (totalSpan > 0 && timer) {
          pctRemaining = Math.max(0, Math.min(100, Math.round((timer.msRemaining / totalSpan) * 100)));
        }
      }

      const isExp = timer ? timer.isExpired : false;
      const isSoon = timer ? timer.isExpiringSoon : false;

      let timerClass = 'active';
      let statusPillHtml = `<span class="sub-expiry-badge active">🟢 Active</span>`;
      let barClass = 'user-sub-progress-fill';

      if (isExp) {
        timerClass = 'expired';
        statusPillHtml = `<span class="sub-expiry-badge expired">🔴 Expired</span>`;
        barClass = 'user-sub-progress-fill expired';
      } else if (isSoon) {
        timerClass = 'warning';
        statusPillHtml = `<span class="sub-expiry-badge expiring-soon">🟡 Expiring Soon</span>`;
        barClass = 'user-sub-progress-fill warning';
      }

      const timeDisplay = timer ? timer.timeString : 'No Expiry Set';
      const remindUrl = createWhatsAppRenewalReminderUrl(cust.whatsapp, cust.name, sub);

      return `
        <div class="user-sub-card" data-sub-index="${index}">
          <div class="user-sub-card-header">
            <div class="user-sub-brand">
              <img src="${logoSrc}" alt="${safeSubName}" class="user-sub-logo" onerror="this.src='/logos/spotify.svg'" />
              <div>
                <div class="user-sub-title">${safeSubName}</div>
                <div class="user-sub-meta">${safePeriod} • <strong style="color: var(--flyer-green-price);">${safePrice}</strong></div>
              </div>
            </div>
            ${statusPillHtml}
          </div>

          <!-- Digital Countdown Timer Box -->
          <div class="user-sub-timer-box">
            <div class="user-sub-timer-header">
              <span>Time Remaining Until Expiration:</span>
              <span>Expires: ${expiryDateFormatted}</span>
            </div>
            <div class="user-sub-live-timer-val ${timerClass}">
              <span>⏳</span>
              <span data-live-expiry="${sub.expiryDate || ''}">${timeDisplay}</span>
            </div>
            <div class="user-sub-progress-bar">
              <div class="${barClass}" style="width: ${pctRemaining}%;"></div>
            </div>
            <div class="user-sub-dates-row">
              <span>Started: <strong>${startDateFormatted}</strong></span>
              <span>Warranty: <strong style="color: ${isExp ? '#dc2626' : 'var(--green-600)'};">${isExp ? 'Ended' : '100% Guaranteed'}</strong></span>
            </div>
          </div>

          <!-- Actions Bar: Reminder + Quick Renewals -->
          <div class="user-sub-actions-bar">
            <a href="${remindUrl}" target="_blank" rel="noopener noreferrer" class="user-sub-remind-btn" title="Send personalized WhatsApp renewal alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2Z"/></svg>
              <span>Send Expiry Reminder on WhatsApp</span>
            </a>

            <div class="user-sub-quick-renew-group">
              <button type="button" class="btn btn-secondary btn-sm btn-sub-quick-extend" data-days="30" data-sub-index="${index}" title="Extend expiration by 30 days">+30d</button>
              <button type="button" class="btn btn-secondary btn-sm btn-sub-quick-extend" data-days="90" data-sub-index="${index}" title="Extend expiration by 90 days">+90d</button>
              <button type="button" class="admin-btn-icon btn-edit-individual-sub" data-sub-index="${index}" title="Edit plan details or custom date" style="width: 30px; height: 30px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button type="button" class="admin-btn-icon btn-delete btn-remove-individual-sub" data-sub-index="${index}" data-name="${safeSubName}" title="Remove this subscription" style="width: 30px; height: 30px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Quick extend (+30d, +90d) handlers
    listContainer.querySelectorAll('.btn-sub-quick-extend').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days || '30', 10);
        const subIndex = parseInt(btn.dataset.subIndex, 10);
        const customers = getRegisteredCustomers();
        const c = customers.find(x => x.whatsapp === cust.whatsapp);
        if (c && c.subscriptions && c.subscriptions[subIndex]) {
          const targetSub = c.subscriptions[subIndex];
          const currentExp = targetSub.expiryDate ? new Date(targetSub.expiryDate).getTime() : Date.now();
          const baseTime = Math.max(Date.now(), currentExp);
          targetSub.expiryDate = new Date(baseTime + (days * 24 * 60 * 60 * 1000)).toISOString();
          targetSub.status = 'Active';
          saveRegisteredCustomers(customers);
          openCustomerSubscriptionsHub(c);
          renderAdminCustomers();
          renderAdminOverview();
        }
      });
    });

    // Edit individual sub handler
    listContainer.querySelectorAll('.btn-edit-individual-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const subIndex = parseInt(btn.dataset.subIndex, 10);
        openCustomerSubModal(cust, subIndex);
      });
    });

    // Remove individual sub handler
    listContainer.querySelectorAll('.btn-remove-individual-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const subIndex = parseInt(btn.dataset.subIndex, 10);
        const subName = btn.dataset.name;
        if (confirm(`Remove subscription "${subName}" from ${cust.name}?`)) {
          const customers = getRegisteredCustomers();
          const c = customers.find(x => x.whatsapp === cust.whatsapp);
          if (c && c.subscriptions) {
            c.subscriptions.splice(subIndex, 1);
            saveRegisteredCustomers(customers);
            openCustomerSubscriptionsHub(c);
            renderAdminCustomers();
            renderAdminOverview();
          }
        }
      });
    });
  }

  // Bind "+ Add Subscription" in toolbar
  const addSubBtn = document.getElementById('hub-add-new-sub-btn');
  if (addSubBtn) {
    addSubBtn.onclick = () => openCustomerSubModal(cust, null);
  }

  // Explicitly ensure close buttons and backdrop click close the hub immediately
  const hubClose = document.getElementById('customer-subs-hub-close');
  const hubDismiss = document.getElementById('customer-subs-hub-dismiss');
  if (hubClose) {
    hubClose.onclick = () => { hubModal.style.display = 'none'; };
  }
  if (hubDismiss) {
    hubDismiss.onclick = () => { hubModal.style.display = 'none'; };
  }
  hubModal.onclick = (e) => {
    if (e.target === hubModal) hubModal.style.display = 'none';
  };

  hubModal.style.display = 'flex';
}

// 4. Customer Subscription Add / Edit Modal Controller (Modal 5B)
let editingCustContext = null;
let editingSubIndexContext = null;

function openCustomerSubModal(cust, subIndex = null) {
  editingCustContext = cust;
  editingSubIndexContext = subIndex;

  const subModal = document.getElementById('customer-sub-modal-overlay');
  const titleEl = document.getElementById('customer-sub-modal-title');
  const idInput = document.getElementById('customer-sub-id');
  const nameDisplay = document.getElementById('customer-sub-name-display');
  const serviceSelect = document.getElementById('customer-sub-service');
  const priceInput = document.getElementById('customer-sub-price');
  const periodInput = document.getElementById('customer-sub-period');
  const expiryInput = document.getElementById('customer-sub-expiry');
  const statusSelect = document.getElementById('customer-sub-status');

  if (!subModal) return;

  if (idInput) idInput.value = cust.whatsapp;
  if (nameDisplay) nameDisplay.value = `${cust.name} (${cust.whatsapp})`;

  const subs = Array.isArray(cust.subscriptions) ? cust.subscriptions : [];
  const existingSub = (subIndex !== null && subs[subIndex]) ? subs[subIndex] : null;

  if (titleEl) {
    titleEl.textContent = existingSub ? `Edit ${existingSub.serviceName} for ${cust.name}` : `Assign Subscription to ${cust.name}`;
  }

  // Pre-select service
  if (serviceSelect) {
    if (existingSub) {
      let matched = false;
      for (let opt of serviceSelect.options) {
        if (opt.value === existingSub.serviceId || (existingSub.serviceName && opt.text.toLowerCase().includes(existingSub.serviceName.toLowerCase()))) {
          opt.selected = true;
          matched = true;
          break;
        }
      }
      if (!matched && serviceSelect.options.length > 1) serviceSelect.selectedIndex = 1;
    } else {
      if (serviceSelect.options.length > 1) serviceSelect.selectedIndex = 1;
    }
  }

  const selectedOpt = serviceSelect?.options[serviceSelect.selectedIndex];
  if (priceInput) {
    priceInput.value = existingSub ? (existingSub.planPrice || '₦800') : (selectedOpt?.dataset?.price || '₦800');
  }
  if (periodInput) {
    periodInput.value = existingSub ? (existingSub.period || 'Individual') : (selectedOpt?.dataset?.period || 'Individual');
  }

  // Expiry date pre-fill
  if (expiryInput) {
    if (existingSub && existingSub.expiryDate) {
      const d = new Date(existingSub.expiryDate);
      expiryInput.value = d.toISOString().split('T')[0];
    } else {
      const defaultExp = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
      expiryInput.value = defaultExp.toISOString().split('T')[0];
    }
  }

  if (statusSelect) {
    statusSelect.value = existingSub ? (existingSub.status || 'Active') : 'Active';
  }

  subModal.style.display = 'flex';
}

// Initialize All Customer Modals (Hub, Assign Sub, Add Customer)
function initCustomerModals() {
  const hubModal = document.getElementById('customer-subs-hub-modal-overlay');
  const hubClose = document.getElementById('customer-subs-hub-close');
  const hubDismiss = document.getElementById('customer-subs-hub-dismiss');

  const subModal = document.getElementById('customer-sub-modal-overlay');
  const subModalClose = document.getElementById('customer-sub-modal-close');
  const subModalCancel = document.getElementById('customer-sub-modal-cancel');
  const subForm = document.getElementById('customer-sub-form');
  const subServiceSelect = document.getElementById('customer-sub-service');

  const addCustModal = document.getElementById('admin-add-customer-modal-overlay');
  const addCustBtn = document.getElementById('admin-add-customer-btn');
  const addCustClose = document.getElementById('add-customer-modal-close');
  const addCustCancel = document.getElementById('add-customer-modal-cancel');
  const addCustForm = document.getElementById('admin-add-customer-form');
  const addCustServiceSelect = document.getElementById('new-cust-service');

  // Populate Services in dropdowns
  function populateServiceDropdowns() {
    const services = getEffectiveServices();
    const accounts = getEffectiveAccounts();

    const serviceOptions = services.map(s => `<option value="${escapeHtml(s.id)}" data-type="service" data-name="${escapeHtml(s.name)}" data-price="${escapeHtml(s.priceDisplay)}" data-period="${escapeHtml(s.period || 'Individual')}" data-logo="${escapeHtml(s.logoUrl || '')}">${escapeHtml(s.name)} (${escapeHtml(s.priceDisplay)})</option>`).join('');
    const accountOptions = accounts.map(a => `<option value="${escapeHtml(a.id)}" data-type="account" data-name="${escapeHtml(a.title)}" data-price="${escapeHtml(a.priceDisplay)}" data-period="${escapeHtml(a.year || 'Account')}" data-logo="/logos/x.svg">${escapeHtml(a.title)} (${escapeHtml(a.priceDisplay)})</option>`).join('');

    if (subServiceSelect) {
      subServiceSelect.innerHTML = `
        <option value="">-- Select Subscription Service --</option>
        <optgroup label="Digital Subscriptions">
          ${serviceOptions}
        </optgroup>
        <optgroup label="Verified X Accounts">
          ${accountOptions}
        </optgroup>
      `;
    }

    if (addCustServiceSelect) {
      addCustServiceSelect.innerHTML = `
        <option value="">-- No Active Plan (Pending) --</option>
        <optgroup label="Digital Subscriptions">
          ${serviceOptions}
        </optgroup>
        <optgroup label="Verified X Accounts">
          ${accountOptions}
        </optgroup>
      `;
    }
  }

  populateServiceDropdowns();

  // Close Hub Modal Handlers
  if (hubClose) hubClose.addEventListener('click', () => { hubModal.style.display = 'none'; });
  if (hubDismiss) hubDismiss.addEventListener('click', () => { hubModal.style.display = 'none'; });
  if (hubModal) {
    hubModal.addEventListener('click', (e) => {
      if (e.target === hubModal) hubModal.style.display = 'none';
    });
  }

  // Close Sub Modal Handlers
  if (subModalClose) subModalClose.addEventListener('click', () => { subModal.style.display = 'none'; });
  if (subModalCancel) subModalCancel.addEventListener('click', () => { subModal.style.display = 'none'; });
  if (subModal) {
    subModal.addEventListener('click', (e) => {
      if (e.target === subModal) subModal.style.display = 'none';
    });
  }

  // Auto-fill price & period when changing service in Sub Modal
  if (subServiceSelect) {
    subServiceSelect.addEventListener('change', () => {
      const selected = subServiceSelect.options[subServiceSelect.selectedIndex];
      if (selected && selected.value) {
        const priceInput = document.getElementById('customer-sub-price');
        const periodInput = document.getElementById('customer-sub-period');
        if (priceInput && selected.dataset.price) priceInput.value = selected.dataset.price;
        if (periodInput && selected.dataset.period) periodInput.value = selected.dataset.period;
      }
    });
  }

  // Quick Expiry Buttons in Sub Modal (+30d, +90d, +180d, +1yr)
  document.querySelectorAll('.quick-exp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.days || '30', 10);
      const targetDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
      const expInput = document.getElementById('customer-sub-expiry');
      if (expInput) {
        expInput.value = targetDate.toISOString().split('T')[0];
      }
    });
  });

  // Save Customer Subscription Form (Adds new sub or edits existing sub)
  if (subForm) {
    subForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!editingCustContext) return;

      const selectedOption = subServiceSelect?.options[subServiceSelect.selectedIndex];
      const serviceName = selectedOption?.dataset?.name || subServiceSelect?.value || 'Subscription Plan';
      const serviceLogo = selectedOption?.dataset?.logo || '/logos/spotify.svg';
      const serviceId = subServiceSelect?.value || '';
      const price = document.getElementById('customer-sub-price')?.value?.trim() || '₦800';
      const period = document.getElementById('customer-sub-period')?.value?.trim() || 'Individual';
      const expiryDateVal = document.getElementById('customer-sub-expiry')?.value;
      const status = document.getElementById('customer-sub-status')?.value || 'Active';

      const customers = getRegisteredCustomers();
      const target = customers.find(c => c.whatsapp === editingCustContext.whatsapp);
      if (target) {
        if (!Array.isArray(target.subscriptions)) target.subscriptions = [];

        const expiryIso = expiryDateVal ? new Date(expiryDateVal + 'T23:59:59').toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();

        if (editingSubIndexContext !== null && target.subscriptions[editingSubIndexContext]) {
          // Edit existing sub
          target.subscriptions[editingSubIndexContext] = {
            ...target.subscriptions[editingSubIndexContext],
            serviceName,
            serviceId,
            logoUrl: serviceLogo,
            planPrice: price,
            period,
            status,
            expiryDate: expiryIso
          };
        } else {
          // Add new sub to customer
          target.subscriptions.unshift({
            id: 'sub-' + Date.now(),
            serviceName,
            serviceId,
            logoUrl: serviceLogo,
            planPrice: price,
            period,
            status,
            startDate: new Date().toISOString(),
            expiryDate: expiryIso
          });
        }

        saveRegisteredCustomers(customers);

        // Update hub if open
        if (currentHubCustomer && currentHubCustomer.whatsapp === target.whatsapp) {
          openCustomerSubscriptionsHub(target);
        }
      }

      if (subModal) subModal.style.display = 'none';
      renderAdminCustomers();
      renderAdminOverview();
    });
  }

  // Add Customer Modal Handlers (Modal 6)
  if (addCustBtn) {
    addCustBtn.addEventListener('click', () => {
      if (addCustForm) addCustForm.reset();
      populateServiceDropdowns();
      if (addCustModal) addCustModal.style.display = 'flex';
    });
  }

  if (addCustClose) addCustClose.addEventListener('click', () => { addCustModal.style.display = 'none'; });
  if (addCustCancel) addCustCancel.addEventListener('click', () => { addCustModal.style.display = 'none'; });
  if (addCustModal) {
    addCustModal.addEventListener('click', (e) => {
      if (e.target === addCustModal) addCustModal.style.display = 'none';
    });
  }

  if (addCustForm) {
    addCustForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-cust-name')?.value?.trim();
      const whatsapp = document.getElementById('new-cust-whatsapp')?.value?.trim();
      const email = document.getElementById('new-cust-email')?.value?.trim() || '';
      const serviceSelect = document.getElementById('new-cust-service');
      const durationDays = parseInt(document.getElementById('new-cust-duration')?.value || '30', 10);

      if (!name || !whatsapp) {
        alert('Please provide customer name and WhatsApp number.');
        return;
      }

      const customers = getRegisteredCustomers();
      const cleanPhone = whatsapp.replace(/[^\d]/g, '');
      const existing = customers.find(c => (c.whatsapp || '').replace(/[^\d]/g, '') === cleanPhone);
      if (existing) {
        alert('A customer with this WhatsApp number already exists in CRM.');
        return;
      }

      const selectedOpt = serviceSelect?.options[serviceSelect.selectedIndex];
      const initialSubs = [];

      if (selectedOpt && selectedOpt.value) {
        initialSubs.push({
          id: 'sub-' + Date.now(),
          serviceName: selectedOpt.dataset.name || selectedOpt.text,
          serviceId: selectedOpt.value,
          logoUrl: selectedOpt.dataset.logo || '/logos/spotify.svg',
          planPrice: selectedOpt.dataset.price || '₦800',
          period: selectedOpt.dataset.period || 'Individual',
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000)).toISOString(),
          status: 'Active'
        });
      }

      const newCustomer = {
        id: 'cust-' + Date.now(),
        name,
        whatsapp,
        email,
        subscriptions: initialSubs,
        registeredAt: new Date().toISOString()
      };

      customers.unshift(newCustomer);
      saveRegisteredCustomers(customers);

      if (addCustModal) addCustModal.style.display = 'none';
      renderAdminCustomers();
      renderAdminOverview();
    });
  }

  // Keyboard Escape listener to dismiss any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (hubModal && hubModal.style.display === 'flex') hubModal.style.display = 'none';
      if (subModal && subModal.style.display === 'flex') subModal.style.display = 'none';
      if (addCustModal && addCustModal.style.display === 'flex') addCustModal.style.display = 'none';
    }
  });
}

// Subscriptions Catalog Table Renderer & Search
function renderAdminProducts() {
  const tableBody = document.getElementById('admin-products-table-body');
  const searchInput = document.getElementById('admin-product-search');
  if (!tableBody) return;

  const services = getEffectiveServices();
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = services.filter(s => {
    if (!query) return true;
    return (
      s.name.toLowerCase().includes(query) ||
      (s.category && s.category.toLowerCase().includes(query)) ||
      (s.badge && s.badge.toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No subscriptions matched your search.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(service => {
    const safeId = escapeHtml(service.id);
    const safeName = escapeHtml(service.name);
    const safeCat = escapeHtml(service.category);
    const safePrice = escapeHtml(service.priceDisplay);
    const safePeriod = escapeHtml(service.period || 'Individual');
    const safeBadge = escapeHtml(service.badge || '-');
    const isFeatured = service.featured ? 'Yes' : 'No';

    return `
      <tr data-id="${safeId}">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${service.logoUrl || '/logos/spotify.svg'}" alt="${safeName} logo" style="width: 26px; height: 26px; object-fit: contain; border-radius: 4px;" onerror="this.src='/logos/spotify.svg'" />
            <strong>${safeName}</strong>
          </div>
        </td>
        <td><span class="admin-status-pill">${safeCat}</span></td>
        <td><strong style="color: var(--flyer-green-price);">${safePrice}</strong></td>
        <td>${safePeriod}</td>
        <td>${safeBadge}</td>
        <td>
          <span style="font-weight: 700; color: ${service.featured ? '#16A34A' : 'var(--text-muted)'};">
            ${isFeatured}
          </span>
        </td>
        <td>
          <div class="admin-action-btns">
            <button type="button" class="admin-btn-icon btn-edit-product" data-id="${safeId}" title="Edit Subscription">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="admin-btn-icon btn-delete btn-delete-product" data-id="${safeId}" data-name="${safeName}" title="Delete Subscription">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => renderAdminProducts());
  }
}

// X Accounts Table Renderer
function renderAdminAccounts() {
  const tableBody = document.getElementById('admin-accounts-table-body');
  if (!tableBody) return;

  const accounts = getEffectiveAccounts();

  tableBody.innerHTML = accounts.map(acc => {
    const safeId = escapeHtml(acc.id);
    const safeTitle = escapeHtml(acc.title);
    const safeType = escapeHtml(acc.type);
    const safePrice = escapeHtml(acc.priceDisplay);
    const safeYear = escapeHtml(acc.year || '2023');
    const safeFollowers = escapeHtml(acc.followers || '0');
    const safeBadge = escapeHtml(acc.badge || 'Active');

    return `
      <tr data-id="${safeId}">
        <td><strong>${safeTitle}</strong></td>
        <td><span class="admin-status-pill">${safeType}</span></td>
        <td><strong style="color: var(--flyer-green-price);">${safePrice}</strong></td>
        <td>${safeYear}</td>
        <td>${safeFollowers}</td>
        <td><span class="admin-status-pill">${safeBadge}</span></td>
        <td>
          <button type="button" class="admin-btn-icon btn-delete btn-delete-account" data-id="${safeId}" data-name="${safeTitle}" title="Delete Account Tier">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Product Modal & Delete Modal Handlers
function initAdminModals() {
  const productModal = document.getElementById('product-modal-overlay');
  const productForm = document.getElementById('product-edit-form');
  const addProductBtn = document.getElementById('admin-add-product-btn');
  const modalClose = document.getElementById('product-modal-close');
  const modalCancel = document.getElementById('product-modal-cancel');
  const deleteOverlay = document.getElementById('delete-modal-overlay');
  const deleteConfirm = document.getElementById('delete-modal-confirm');
  const deleteCancel = document.getElementById('delete-modal-cancel');

  let pendingDeleteId = null;
  let pendingDeleteType = null;

  // Open Modal to Add New Product
  if (addProductBtn) {
    addProductBtn.onclick = () => {
      if (productForm) productForm.reset();
      const idEl = document.getElementById('product-edit-id');
      const titleEl = document.getElementById('product-modal-title');
      if (idEl) idEl.value = '';
      if (titleEl) titleEl.textContent = 'Add New Subscription';
      if (productModal) productModal.style.display = 'flex';
    };
  }

  // Close Modal Handlers (Close button, Cancel button, and Backdrop clicks)
  if (modalClose) modalClose.onclick = () => { if (productModal) productModal.style.display = 'none'; };
  if (modalCancel) modalCancel.onclick = () => { if (productModal) productModal.style.display = 'none'; };
  if (productModal) {
    productModal.onclick = (e) => {
      if (e.target === productModal) productModal.style.display = 'none';
    };
  }

  if (deleteCancel) deleteCancel.onclick = () => { if (deleteOverlay) deleteOverlay.style.display = 'none'; };
  if (deleteOverlay) {
    deleteOverlay.onclick = (e) => {
      if (e.target === deleteOverlay) deleteOverlay.style.display = 'none';
    };
  }

  // Save Product Form Handler
  function handleSaveProduct(e) {
    if (e && e.preventDefault) e.preventDefault();
    const idEl = document.getElementById('product-edit-id');
    const nameEl = document.getElementById('product-edit-name');
    const catEl = document.getElementById('product-edit-category');
    const priceEl = document.getElementById('product-edit-price');
    const periodEl = document.getElementById('product-edit-period');
    const badgeEl = document.getElementById('product-edit-badge');
    const logoEl = document.getElementById('product-edit-logo');
    const descEl = document.getElementById('product-edit-desc');
    const featEl = document.getElementById('product-edit-features');
    const featuredEl = document.getElementById('product-edit-featured');

    const id = idEl ? idEl.value.trim() : '';
    const name = nameEl ? nameEl.value.trim() : '';
    if (!name) return;

    const category = catEl ? catEl.value : 'streaming';
    const priceNum = priceEl ? (parseInt(priceEl.value, 10) || 0) : 0;
    const period = periodEl ? periodEl.value.trim() : '1 Month';
    const badge = badgeEl ? badgeEl.value.trim() : '';
    const logoUrl = logoEl ? (logoEl.value.trim() || '/logos/spotify.svg') : '/logos/spotify.svg';
    const desc = descEl ? descEl.value.trim() : '';
    const rawFeatures = featEl ? featEl.value.trim() : '';
    const featured = featuredEl ? featuredEl.checked : false;

    const features = rawFeatures ? rawFeatures.split(',').map(f => f.trim()).filter(Boolean) : ['100% Replacement Warranty', 'Fast WhatsApp Delivery'];
    const priceDisplay = `₦${priceNum.toLocaleString('en-US')}`;

    const services = getEffectiveServices();

    if (id) {
      // Edit existing
      const idx = services.findIndex(s => s.id === id);
      if (idx !== -1) {
        services[idx] = {
          ...services[idx],
          name,
          category,
          price: priceNum,
          priceNum,
          priceDisplay,
          period,
          badge,
          logoUrl,
          desc,
          description: desc,
          features,
          featured
        };
      }
    } else {
      // Add new
      const newId = 'srv-' + Date.now();
      services.push({
        id: newId,
        name,
        category,
        categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
        price: priceNum,
        priceNum,
        priceDisplay,
        period,
        badge,
        logoUrl,
        desc,
        description: desc,
        features,
        featured
      });
    }

    saveCustomServices(services);
    if (productModal) productModal.style.display = 'none';
    renderAdminProducts();
    renderAdminOverview();
  }

  if (productForm) {
    productForm.addEventListener('submit', handleSaveProduct);
  }

  const saveProductBtn = document.getElementById('product-modal-save');
  if (saveProductBtn) {
    saveProductBtn.onclick = (e) => {
      if (productForm && productForm.reportValidity && !productForm.reportValidity()) {
        return;
      }
      handleSaveProduct(e);
    };
  }

  // Delegate Edit and Delete on Table
  document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-product');
    const delProdBtn = e.target.closest('.btn-delete-product');
    const delAccBtn = e.target.closest('.btn-delete-account');

    if (editBtn) {
      const srvId = editBtn.dataset.id;
      const service = getEffectiveServices().find(s => s.id === srvId);
      if (service) {
        const idInput = document.getElementById('product-edit-id');
        const nameInput = document.getElementById('product-edit-name');
        const catInput = document.getElementById('product-edit-category');
        const priceInput = document.getElementById('product-edit-price');
        const periodInput = document.getElementById('product-edit-period');
        const badgeInput = document.getElementById('product-edit-badge');
        const logoInput = document.getElementById('product-edit-logo');
        const descInput = document.getElementById('product-edit-desc');
        const featInput = document.getElementById('product-edit-features');
        const featuredInput = document.getElementById('product-edit-featured');
        const titleEl = document.getElementById('product-modal-title');

        if (idInput) idInput.value = service.id;
        if (nameInput) nameInput.value = service.name;
        if (catInput) catInput.value = service.category || 'streaming';
        if (priceInput) priceInput.value = (service.priceNum !== undefined ? service.priceNum : (service.price !== undefined ? service.price : ''));
        if (periodInput) periodInput.value = service.period || '';
        if (badgeInput) badgeInput.value = service.badge || '';
        if (logoInput) logoInput.value = service.logoUrl || '/logos/spotify.svg';
        if (descInput) descInput.value = service.desc || service.description || '';
        if (featInput) featInput.value = service.features ? (Array.isArray(service.features) ? service.features.join(', ') : service.features) : '';
        if (featuredInput) featuredInput.checked = !!service.featured;

        if (titleEl) titleEl.textContent = `Edit ${service.name}`;
        if (productModal) productModal.style.display = 'flex';
      }
    }

    if (delProdBtn) {
      pendingDeleteId = delProdBtn.dataset.id;
      pendingDeleteType = 'product';
      const descEl = document.getElementById('delete-modal-desc');
      if (descEl) descEl.textContent = `Are you sure you want to remove "${delProdBtn.dataset.name}" from the live store?`;
      if (deleteOverlay) deleteOverlay.style.display = 'flex';
    }

    if (delAccBtn) {
      pendingDeleteId = delAccBtn.dataset.id;
      pendingDeleteType = 'account';
      const descEl = document.getElementById('delete-modal-desc');
      if (descEl) descEl.textContent = `Are you sure you want to delete "${delAccBtn.dataset.name}"?`;
      if (deleteOverlay) deleteOverlay.style.display = 'flex';
    }
  });

  if (deleteConfirm) {
    deleteConfirm.addEventListener('click', () => {
      if (pendingDeleteType === 'product') {
        const services = getEffectiveServices().filter(s => s.id !== pendingDeleteId);
        saveCustomServices(services);
        renderAdminProducts();
      } else if (pendingDeleteType === 'account') {
        const accounts = getEffectiveAccounts().filter(a => a.id !== pendingDeleteId);
        saveCustomAccounts(accounts);
        renderAdminAccounts();
      }
      renderAdminOverview();
      if (deleteOverlay) deleteOverlay.style.display = 'none';
    });
  }
}

// Admin Store Settings Controller (Live Announcement, WhatsApp line, PIN Change, Export, Reset)
function initAdminSettings() {
  const pinForm = document.getElementById('admin-change-pin-form');
  const announcementForm = document.getElementById('admin-announcement-form');
  const waSettingForm = document.getElementById('admin-whatsapp-setting-form');
  const exportBtn = document.getElementById('admin-export-data-btn');
  const resetBtn = document.getElementById('admin-reset-catalog-btn');

  // Announcement Bar Form
  if (announcementForm) {
    announcementForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('announcement-text-input')?.value?.trim();
      const linkText = document.getElementById('announcement-link-text-input')?.value?.trim();
      if (text) SafeStorage.setString('subly_announcement_text', text);
      if (linkText) SafeStorage.setString('subly_announcement_link', linkText);
      alert('Announcement bar updated successfully! Live across all storefront pages.');
    });
  }

  // WhatsApp Support Number Form
  if (waSettingForm) {
    waSettingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const waNumber = document.getElementById('admin-wa-number-input')?.value?.trim();
      if (waNumber && waNumber.length >= 10) {
        SafeStorage.setString('subly_store_whatsapp', waNumber);
        alert(`Store WhatsApp dispatch line updated to: ${waNumber}`);
      } else {
        alert('Please enter a valid phone number (at least 10 digits).');
      }
    });
  }

  // PIN Form
  if (pinForm) {
    pinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPin = document.getElementById('new-admin-pin')?.value?.trim();
      if (!newPin || newPin.length < 4) {
        alert('PIN must be at least 4 digits.');
        return;
      }
      SafeStorage.setString('subly_admin_pin', newPin);
      alert(`Admin PIN successfully updated to: ${newPin}`);
      document.getElementById('new-admin-pin').value = '';
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const backup = {
        services: getEffectiveServices(),
        accounts: getEffectiveAccounts(),
        orders: getOrderHistory(),
        customers: getRegisteredCustomers(),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subly_complete_store_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the official flyer defaults? All custom additions will be cleared.')) {
        SafeStorage.remove('subly_custom_services');
        SafeStorage.remove('subly_custom_accounts');
        renderAdminOverview();
        renderAdminProducts();
        renderAdminAccounts();
        alert('Catalog reset to official flyer defaults!');
      }
    });
  }
}

// ==========================================================================
// 15. CUSTOMER AUTHENTICATION & ACCOUNT PORTAL CONTROLLER
// ==========================================================================
const SUBLY_CUSTOMER_KEY = 'subly_active_customer';
const SUBLY_USERS_KEY = 'subly_registered_customers_v1';

export function getActiveCustomer() {
  return SafeStorage.getJSON(SUBLY_CUSTOMER_KEY, null);
}

export function setActiveCustomer(customer) {
  SafeStorage.setJSON(SUBLY_CUSTOMER_KEY, customer);
}

export function logoutCustomer() {
  SafeStorage.remove(SUBLY_CUSTOMER_KEY);
  window.location.reload();
}

// One-time clear of previous dummy/mock seed user data
if (SafeStorage.getString('subly_cleaned_users_v4') !== 'true') {
  SafeStorage.setJSON(SUBLY_USERS_KEY, []);
  SafeStorage.setJSON(SUBLY_ORDERS_KEY, []);
  SafeStorage.remove(SUBLY_CUSTOMER_KEY);
  SafeStorage.setString('subly_cleaned_users_v4', 'true');
}

export function getRegisteredCustomers() {
  const saved = SafeStorage.getJSON(SUBLY_USERS_KEY, null);
  if (Array.isArray(saved) && saved.length > 0) {
    // Normalize customer records ensuring subscriptions array is always present
    return saved.map(cust => {
      if (!Array.isArray(cust.subscriptions)) {
        cust.subscriptions = [];
      }
      return cust;
    });
  }
  return [];
}

export function saveRegisteredCustomers(list) {
  SafeStorage.setJSON(SUBLY_USERS_KEY, list);
}

// 1. Dynamic Navbar Customer Auth State
function initNavbarAuth() {
  const navActions = document.querySelector('.nav-actions');
  const drawerTop = document.querySelector('.drawer-top');
  const drawer = document.getElementById('mobile-drawer');
  if (!navActions) return;

  const currentCustomer = getActiveCustomer();

  // Desktop Nav Auth Container
  let authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'nav-auth-container';
    authContainer.className = 'nav-auth-desktop';
    authContainer.style.display = 'inline-flex';
    authContainer.style.alignItems = 'center';
    authContainer.style.gap = '8px';
    navActions.insertBefore(authContainer, navActions.firstChild);
  }

  // Mobile Drawer Dedicated Account Box
  let drawerAccountBox = document.getElementById('drawer-account-box');
  if (!drawerAccountBox && drawer) {
    drawerAccountBox = document.createElement('div');
    drawerAccountBox.id = 'drawer-account-box';
    if (drawerTop && drawerTop.nextSibling) {
      drawerTop.parentNode.insertBefore(drawerAccountBox, drawerTop.nextSibling);
    } else if (drawer) {
      drawer.insertBefore(drawerAccountBox, drawer.firstChild);
    }
  }

  if (currentCustomer && currentCustomer.name) {
    const firstName = currentCustomer.name.split(' ')[0];
    const initial = firstName.charAt(0).toUpperCase();

    // Desktop Header Pill
    authContainer.innerHTML = `
      <a href="orders.html" class="nav-user-badge" title="My Account & Order History (${escapeHtml(currentCustomer.name)})">
        <span class="nav-user-avatar">${initial}</span>
        <span>Account (${escapeHtml(firstName)})</span>
      </a>
      <button type="button" id="customer-logout-btn" class="btn btn-secondary btn-sm" style="padding: 5px 10px; font-size: 0.78rem;" title="Sign out of account">
        <span>Logout</span>
      </button>
    `;

    const logoutBtn = document.getElementById('customer-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutCustomer);

    // Mobile Drawer Card
    if (drawerAccountBox) {
      drawerAccountBox.innerHTML = `
        <div class="drawer-account-card">
          <div class="drawer-account-header">
            <div class="drawer-account-avatar">${initial}</div>
            <div class="drawer-account-info">
              <div class="drawer-account-name">${escapeHtml(currentCustomer.name)}</div>
              <div class="drawer-account-phone">${escapeHtml(currentCustomer.whatsapp || '')}</div>
            </div>
          </div>
          <div class="drawer-account-actions">
            <a href="orders.html" class="drawer-account-btn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>My Account & Orders</span>
            </a>
            <button type="button" id="drawer-logout-btn" class="drawer-logout-btn" title="Sign out">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      `;
      const dLogout = document.getElementById('drawer-logout-btn');
      if (dLogout) dLogout.addEventListener('click', logoutCustomer);
    }
  } else {
    // Desktop Header
    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-secondary btn-sm" style="padding: 5px 14px; font-size: 0.84rem; display: inline-flex; align-items: center; gap: 6px;" title="Customer Account & Orders">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Account</span>
      </a>
    `;

    // Mobile Drawer Card
    if (drawerAccountBox) {
      drawerAccountBox.innerHTML = `
        <div class="drawer-guest-card">
          <div class="drawer-guest-header">
            <div class="drawer-guest-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div>
              <div class="drawer-guest-title">Customer Account</div>
              <div class="drawer-guest-desc">Track orders & active plans</div>
            </div>
          </div>
          <div class="drawer-guest-btns">
            <a href="login.html" class="btn btn-secondary btn-sm">Sign In</a>
            <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
          </div>
        </div>
      `;
    }
  }
}

// 2. Customer Auth Pages (login.html & signup.html)
function initCustomerAuthPages() {
  const loginForm = document.getElementById('customer-login-form');
  const signupForm = document.getElementById('customer-signup-form');
  const loginError = document.getElementById('login-error-msg');
  const signupError = document.getElementById('signup-error-msg');

  // Customer Sign In Page Handler
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('login-identifier')?.value?.trim().toLowerCase();
      const password = document.getElementById('login-password')?.value?.trim();

      if (!identifier || !password) {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = 'Please enter your WhatsApp phone/email and password.';
        }
        return;
      }

      const users = getRegisteredCustomers();
      const cleanIdent = identifier.replace(/[\s\-\(\)\+]/g, '');

      const matchedUser = users.find(u => {
        const uPhoneClean = (u.whatsapp || '').replace(/[\s\-\(\)\+]/g, '');
        const uEmail = (u.email || '').toLowerCase();
        return (uPhoneClean === cleanIdent || uEmail === identifier || u.whatsapp === identifier) && u.password === password;
      });

      if (matchedUser) {
        setActiveCustomer({
          name: matchedUser.name,
          whatsapp: matchedUser.whatsapp,
          email: matchedUser.email || ''
        });
        window.location.href = 'orders.html';
      } else {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = 'Invalid credentials. If this is your first time, please click "Create Account".';
        }
      }
    });
  }

  // Customer Sign Up Page Handler
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name')?.value?.trim();
      const rawWhatsapp = document.getElementById('signup-whatsapp')?.value?.trim();
      const email = document.getElementById('signup-email')?.value?.trim() || '';
      const password = document.getElementById('signup-password')?.value?.trim();

      if (!name || name.length < 2) {
        if (signupError) {
          signupError.style.display = 'block';
          signupError.textContent = 'Please enter your full name (at least 2 characters).';
        }
        return;
      }

      const phoneDigits = (rawWhatsapp || '').replace(/[\s\-\(\)\+]/g, '');
      if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15 || !/^\d+$/.test(phoneDigits)) {
        if (signupError) {
          signupError.style.display = 'block';
          signupError.textContent = 'Please enter a valid WhatsApp phone number (10 to 15 digits).';
        }
        return;
      }

      if (!password || password.length < 4) {
        if (signupError) {
          signupError.style.display = 'block';
          signupError.textContent = 'Password must be at least 4 characters long.';
        }
        return;
      }

      const users = getRegisteredCustomers();
      const existingUser = users.find(u => (u.whatsapp || '').replace(/[^\d]/g, '') === phoneDigits);

      if (existingUser) {
        if (signupError) {
          signupError.style.display = 'block';
          signupError.textContent = 'An account with this WhatsApp number already exists. Please Sign In.';
        }
        return;
      }

      const newUser = {
        id: 'cust-' + Date.now(),
        name,
        whatsapp: rawWhatsapp,
        email,
        password,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      saveRegisteredCustomers(users);

      // Set active session
      setActiveCustomer({
        name: newUser.name,
        whatsapp: newUser.whatsapp,
        email: newUser.email
      });

      alert(`Welcome to Subly, ${name}! Your account is now active.`);
      window.location.href = 'order.html';
    });
  }
}

// 3. Order Page Auto-Fill for Logged-In Customers
function initOrderPageAutoFill() {
  const currentCustomer = getActiveCustomer();
  if (!currentCustomer) return;

  const nameInput = document.getElementById('customer-name');
  const whatsappInput = document.getElementById('customer-whatsapp');
  const emailInput = document.getElementById('customer-email');
  const formEl = document.getElementById('subscription-order-form');

  if (nameInput && currentCustomer.name) nameInput.value = currentCustomer.name;
  if (whatsappInput && currentCustomer.whatsapp) whatsappInput.value = currentCustomer.whatsapp;
  if (emailInput && currentCustomer.email) emailInput.value = currentCustomer.email;

  // Insert Auto-Fill Banner above the form if not present
  if (formEl && !document.getElementById('autofill-customer-banner')) {
    const banner = document.createElement('div');
    banner.id = 'autofill-customer-banner';
    banner.className = 'autofill-banner';
    banner.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg>
      <span>Auto-filled for <strong>${escapeHtml(currentCustomer.name)}</strong> (${escapeHtml(currentCustomer.whatsapp)})</span>
    `;
    formEl.insertBefore(banner, formEl.firstChild);
  }
}

// 4. Sticky Mobile CTA Interaction (Throttled & Hardware-Friendly)
function initStickyMobileCta() {
  const ctaBar = document.querySelector('.mobile-sticky-cta');
  if (!ctaBar) return;
  let isVisible = false;
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const visible = window.scrollY > 200;
        if (visible !== isVisible) {
          isVisible = visible;
          ctaBar.classList.toggle('visible', isVisible);
          document.body.classList.toggle('has-sticky-cta', isVisible);
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

// 5. Dedicated Thank You Confirmation Page Handler
function initThankYouPage() {
  const params = new URLSearchParams(window.location.search);
  const recentOrders = SafeStorage.getJSON('subly_customer_orders_v1', []);
  const latestOrder = recentOrders[0] || {};

  const orderId = params.get('order_id') || latestOrder.id || 'SBL-' + Math.floor(10000 + Math.random() * 90000);
  const serviceName = params.get('service') || latestOrder.serviceName || 'Premium Subscription Plan';
  const price = params.get('price') || latestOrder.price || 'Direct Quote';
  const customerName = params.get('name') || latestOrder.customerName || 'Valued Customer';
  const waUrl = latestOrder.waUrl || `https://wa.me/2347047929177?text=${encodeURIComponent(`Hi Subly! I submitted order ${orderId} for ${serviceName}. Please activate my account.`)}`;

  const idEl = document.getElementById('ty-order-id');
  const serviceEl = document.getElementById('ty-service-name');
  const priceEl = document.getElementById('ty-order-price');
  const nameEl = document.getElementById('ty-customer-name');
  const waBtn = document.getElementById('ty-whatsapp-action-btn');
  const copyBtn = document.getElementById('ty-copy-order-btn');

  if (idEl) idEl.textContent = orderId;
  if (serviceEl) serviceEl.textContent = serviceName;
  if (priceEl) priceEl.textContent = price;
  if (nameEl) nameEl.textContent = customerName;
  if (waBtn) waBtn.href = waUrl;

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(orderId).then(() => {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span style="color:#22C55E; font-size: 0.75rem; font-weight:700;">Copied!</span>';
        setTimeout(() => { copyBtn.innerHTML = originalHtml; }, 2000);
      }).catch(() => {
        alert(`Order Reference: ${orderId}`);
      });
    });
  }
}
