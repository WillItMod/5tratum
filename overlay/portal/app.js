(function () {
  const navButtons = Array.from(document.querySelectorAll('[data-view]'));
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const statusPill = document.getElementById('status-pill');
  const hostIp = document.getElementById('host-ip');
  const trustedNetworksEl = document.getElementById('trusted-networks');
  const tailscaleStatusEl = document.getElementById('tailscale-status');
  const metricCpu = document.getElementById('metric-cpu');
  const metricMem = document.getElementById('metric-mem');
	  const metricDisk = document.getElementById('metric-disk');
	  const metricIp = document.getElementById('metric-ip');
    const metricCpuSub = document.getElementById('metric-cpu-sub');
    const metricCpuCores = document.getElementById('metric-cpu-cores');
    const metricMemBar = document.getElementById('metric-mem-bar');
    const metricMemSub = document.getElementById('metric-mem-sub');
    const metricDiskBar = document.getElementById('metric-disk-bar');
    const metricDiskSub = document.getElementById('metric-disk-sub');
	  const dashboardAppsEl = document.getElementById('dashboard-apps');
	  const dashboardAppsEmptyEl = document.getElementById('dashboard-apps-empty');
	  const dashboardWidgetsEl = document.getElementById('dashboard-widgets');
	  const dashboardWidgetsEmptyEl = document.getElementById('dashboard-widgets-empty');
    const dashboardWidgetsUpdatedEl = document.getElementById('dashboard-widgets-updated');

  const views = {
    dashboard: document.getElementById('view-dashboard'),
    store: document.getElementById('view-store'),
    settings: document.getElementById('view-settings'),
  };

  const viewMeta = {
    dashboard: { title: 'Dashboard', subtitle: 'System summary' },
    store: { title: 'App Store', subtitle: 'WillItMod MAIN' },
    settings: { title: 'Settings', subtitle: 'Global control' },
  };

  const installedAppsEl = document.getElementById('installed-apps');
  const installedEmptyEl = document.getElementById('installed-empty');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnPower = document.getElementById('btn-power');
  const sidebarClockEl = document.getElementById('sidebar-clock');
  const btnSidebarCollapse = document.getElementById('btn-sidebar-collapse');
  const btnMetrics = document.getElementById('btn-metrics');
    const btnWidgetsRefresh = document.getElementById('btn-widgets-refresh');
  const storeSearchInput = document.getElementById('store-search');
  const storeCategorySelect = document.getElementById('store-category');
  const storeHideInstalledInput = document.getElementById('store-hide-installed');
  const btnStoreClear = document.getElementById('btn-store-clear');
  const btnStoreSync = document.getElementById('btn-store-sync');
  const storeSourceLabel = document.getElementById('store-source-label');
  const storeSourceDesc = document.getElementById('store-source-desc');
  const storeChannelButtons = Array.from(document.querySelectorAll('[data-store-channel]'));
  const workspaceEl = document.getElementById('workspace');
  const workspaceEmptyEl = document.getElementById('workspace-empty');
  const btnResumeWorkspace = document.getElementById('btn-resume-workspace');
  const settingSidebarSelect = document.getElementById('setting-sidebar');
  const btnOpenTerminal = document.getElementById('btn-open-terminal');
  const settingsWidgetsEl = document.getElementById('settings-widgets');
  const settingsWidgetsEmptyEl = document.getElementById('settings-widgets-empty');
  const settingSshToggle = document.getElementById('setting-ssh');
  const updateInstalledEl = document.getElementById('update-installed');
  const updateChannelEl = document.getElementById('update-channel');
  const updateAvailableEl = document.getElementById('update-available');
  const updateStatusEl = document.getElementById('update-status');
  const updateProgressEl = document.getElementById('update-progress');
  const updateProgressBarEl = document.getElementById('update-progress-bar');
  const updateNotesEl = document.getElementById('update-notes');
  const btnUpdateCheck = document.getElementById('btn-update-check');
  const btnUpdateApply = document.getElementById('btn-update-apply');

  // Legacy "selected app" controls (removed from UI; keep null-safe until context menus land)
  const selectedControlsEl = document.getElementById('selected-app-controls');
  const selectedAppNameEl = document.getElementById('selected-app-name');
  const selectedAppStatusEl = document.getElementById('selected-app-status');
  const btnSelectedStart = document.getElementById('selected-app-start');
  const btnSelectedStop = document.getElementById('selected-app-stop');
  const btnSelectedRestart = document.getElementById('selected-app-restart');

  const modalEl = document.getElementById('modal');
  const modalTitleEl = document.getElementById('modal-title');
  const modalBodyEl = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');
    const toastEl = document.getElementById('toast');
  const contextMenuEl = document.getElementById('context-menu');
  // Legacy windowing (keep dormant for now)
  const windowLayer = document.getElementById('window-layer');
  const taskbarAppsEl = document.getElementById('taskbar-apps');
  const taskbarClockEl = document.getElementById('taskbar-clock');
  const btnShowDesktop = document.getElementById('btn-show-desktop');

  let dashboardShowHome = false;

  let selectedAppId = null;
  let installedAppsCache = [];
  let installedById = new Map();
  let storeAppsCache = [];
  let storeById = new Map();
	  let storeQuery = '';
	  let storeHideInstalled = false;
    let activeStoreChannel = 'main';
    let storeCategory = '';
    let storeRenderLimit = 72;
    let storeLastOk = false;
    let storeLastError = '';
	  let lastMetrics = null;
	  let lastWidgets = null;
    let hasLoadedInstalled = false;
    let hasLoadedStore = false;
    let hasLoadedWidgets = false;
    let healthCache = { ok: false, checkedAt: 0 };
    let refreshInstalledInFlight = false;
    let refreshStoreInFlight = false;
    let refreshMetricsInFlight = false;
    let refreshWidgetsInFlight = false;
    let systemUpdateCheckCache = null;
    let systemUpdateStatusCache = null;
    let systemUpdateCheckAt = 0;
    let systemUpdatePollTimer = null;
    let systemUpdatePollInFlight = false;
  let openAppIds = [];
  const OPEN_APPS_KEY = 'forgeos.openApps';
  const INSTALLED_CACHE_KEY = 'forgeos.installedCache.v1';
  const STORE_CHANNEL_KEY = 'forgeos.storeChannel';
  const SIDEBAR_MODE_KEY = 'forgeos.sidebarMode';
  const WIDGET_PREFS_KEY = 'forgeos.widgetPrefs';
  const STORE_RENDER_STEP = 72;
  let dragAppId = null;
  const openWindows = new Map();
  let activeWindowId = null;
  let zCounter = 20;
    const pendingAppActions = new Map();
  const appProgress = new Map();
  let widgetPrefs = {};

  function loadOpenApps() {
    try {
      const raw = window.localStorage.getItem(OPEN_APPS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.map((v) => String(v || '').trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  function loadInstalledCache() {
    try {
      const raw = String(window.localStorage.getItem(INSTALLED_CACHE_KEY) || '').trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const apps = parsed.apps;
      if (!Array.isArray(apps)) return null;
      return { time: parsed.time || null, apps };
    } catch {
      return null;
    }
  }

  function saveInstalledCache(apps) {
    try {
      window.localStorage.setItem(
        INSTALLED_CACHE_KEY,
        JSON.stringify({ time: new Date().toISOString(), apps: Array.isArray(apps) ? apps : [] }),
      );
    } catch {}
  }

  function saveOpenApps() {
    try {
      window.localStorage.setItem(OPEN_APPS_KEY, JSON.stringify(openAppIds));
    } catch {}
  }

  function loadSidebarMode() {
    try {
      const raw = String(window.localStorage.getItem(SIDEBAR_MODE_KEY) || '').trim().toLowerCase();
      if (raw === 'static' || raw === 'collapsed' || raw === 'auto') return raw;
    } catch {}
    return 'static';
  }

  function applySidebarMode(mode) {
    const m = String(mode || 'static').toLowerCase();
    document.body.classList.toggle('forgeos-sidebar-collapsed', m === 'collapsed');
    document.body.classList.toggle('forgeos-sidebar-auto', m === 'auto');
    if (settingSidebarSelect) settingSidebarSelect.value = m;
  }

  function setSidebarMode(mode) {
    const next = String(mode || '').trim().toLowerCase();
    if (!['static', 'collapsed', 'auto'].includes(next)) return;
    try {
      window.localStorage.setItem(SIDEBAR_MODE_KEY, next);
    } catch {}
    applySidebarMode(next);
  }

  function loadWidgetPrefs() {
    try {
      const raw = String(window.localStorage.getItem(WIDGET_PREFS_KEY) || '').trim();
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch {
      return {};
    }
  }

  function saveWidgetPrefs() {
    try {
      window.localStorage.setItem(WIDGET_PREFS_KEY, JSON.stringify(widgetPrefs || {}));
    } catch {}
  }

  function isWidgetEnabled(appId) {
    const id = String(appId || '').trim();
    if (!id) return true;
    const v = widgetPrefs && typeof widgetPrefs === 'object' ? widgetPrefs[id] : undefined;
    if (v === false) return false;
    return true;
  }

  function setWidgetEnabled(appId, enabled) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (!widgetPrefs || typeof widgetPrefs !== 'object') widgetPrefs = {};
    widgetPrefs[id] = !!enabled;
    saveWidgetPrefs();
  }

  function applyInstalled(apps, opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const fromCache = !!options.fromCache;

    const installed = Array.isArray(apps) ? apps : [];

    installedAppsCache = installed;
    installedById = new Map(installed.map((a) => [a.id, a]));

    for (const app of installed) {
      if (!app || typeof app !== 'object') continue;
      if (!app.id) continue;
      if (!app.store || typeof app.store !== 'object') continue;
      storeById.set(app.id, app.store);
    }

    if (selectedAppId && !installedById.has(selectedAppId)) selectedAppId = null;

    // Keep the workspace focused: only keep running/restarting apps open.
    openAppIds = openAppIds.filter((appId) => {
      const st = installedById.get(appId);
      return st && isLaunchableStatus(st.status);
    });
    saveOpenApps();

    const umbrelEnabled = installedById.has('umbrel-store');
    if (!umbrelEnabled && String(activeStoreChannel || '').toLowerCase() === 'umbrel') {
      activeStoreChannel = 'main';
      saveStoreChannel();
      storeRenderLimit = STORE_RENDER_STEP;
      storeCategory = '';
      storeLastOk = false;
      storeLastError = '';
      hasLoadedStore = false;
      storeAppsCache = [];
      syncStoreCategoryOptions([]);
      refreshStore().catch(() => {});
    }
    applyStoreChannelUi();

    const installedSet = new Set(installed.map((a) => a.id));
    renderInstalledApps(installed);
    renderDashboardApps(installed);
    renderStore(storeAppsCache, installedSet);
    renderWorkspace();
    syncInstalledSelection();
    updateAppHeader();
    renderWidgetSettings();

    if (fromCache && !healthCache.ok) setStatus('Cached');
  }

  function loadStoreChannel() {
    try {
      const raw = String(window.localStorage.getItem(STORE_CHANNEL_KEY) || '').trim().toLowerCase();
      if (raw === 'main' || raw === 'dev' || raw === 'umbrel') return raw;
    } catch {}
    return 'main';
  }

  function saveStoreChannel() {
    try {
      window.localStorage.setItem(STORE_CHANNEL_KEY, String(activeStoreChannel || 'main'));
    } catch {}
  }

  function applyStoreChannelUi() {
    const ch = String(activeStoreChannel || 'main').toLowerCase();
    const umbrelEnabled = installedById && typeof installedById.has === 'function' ? installedById.has('umbrel-store') : false;

    if (storeChannelButtons && storeChannelButtons.length) {
      for (const btn of storeChannelButtons) {
        if (!(btn instanceof HTMLElement)) continue;
        const btnCh = String(btn.dataset.storeChannel || '').trim().toLowerCase();
        if (btnCh === 'umbrel') {
          btn.classList.toggle('hidden', !umbrelEnabled);
          btn.toggleAttribute('disabled', !umbrelEnabled);
        }
        btn.classList.toggle('forgeos-segment__btn--active', btnCh === ch);
      }
    }

    if (storeCategorySelect) {
      const showCategory = ch === 'umbrel';
      storeCategorySelect.classList.toggle('hidden', !showCategory);
      storeCategorySelect.disabled = !showCategory;
    }

    if (storeSourceLabel) {
      storeSourceLabel.textContent =
        ch === 'umbrel' ? 'Umbrel App Store' : ch === 'dev' ? 'AxeSuite DEV' : 'AxeSuite MAIN';
    }

    if (storeSourceDesc) {
      storeSourceDesc.textContent =
        ch === 'umbrel'
          ? 'Browse Umbrel app templates and install them into 5tratumOS.'
          : ch === 'dev'
            ? 'Preview channel for AxeSuite apps (use with caution).'
            : 'Stable releases for AxeSuite apps.';
    }

    if (storeSearchInput) {
      storeSearchInput.placeholder = ch === 'umbrel' ? 'Search Umbrel apps...' : 'Search apps...';
    }
  }

  function syncStoreCategoryOptions(apps) {
    if (!storeCategorySelect) return;
    const ch = String(activeStoreChannel || 'main').toLowerCase();
    if (ch !== 'umbrel') return;

    const categories = new Set();
    for (const app of Array.isArray(apps) ? apps : []) {
      if (!app || typeof app !== 'object') continue;
      const c = String(app.category || '').trim();
      if (c) categories.add(c);
    }

    const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    storeCategorySelect.innerHTML = '';

    const optAll = document.createElement('option');
    optAll.value = '';
    optAll.textContent = 'All categories';
    storeCategorySelect.appendChild(optAll);

    if (!sorted.length) {
      storeCategory = '';
      storeCategorySelect.disabled = true;
      storeCategorySelect.value = '';
      return;
    }

    storeCategorySelect.disabled = false;
    for (const c of sorted) {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      storeCategorySelect.appendChild(opt);
    }

    if (storeCategory && sorted.includes(storeCategory)) {
      storeCategorySelect.value = storeCategory;
    } else {
      storeCategory = '';
      storeCategorySelect.value = '';
    }
  }

  function setStoreChannel(next) {
    const ch = String(next || '').trim().toLowerCase();
    if (!ch || !['main', 'dev', 'umbrel'].includes(ch)) return;
    if (ch === 'umbrel' && !(installedById && typeof installedById.has === 'function' && installedById.has('umbrel-store'))) return;
    if (activeStoreChannel === ch) return;

    activeStoreChannel = ch;
    storeRenderLimit = STORE_RENDER_STEP;
    storeCategory = '';
    storeLastOk = false;
    storeLastError = '';
    hasLoadedStore = false;
    storeAppsCache = [];

    saveStoreChannel();
    applyStoreChannelUi();
    syncStoreCategoryOptions([]);

    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
    refreshStore().catch(() => {});
  }

  function svgDataUri(svg) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function makeLogo(letter, name, accentA, accentB) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accentA}"/>
      <stop offset="1" stop-color="${accentB}"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="84" height="84" rx="22" fill="#0b1020"/>
  <rect x="6" y="6" width="84" height="84" rx="22" fill="none" stroke="url(#g)" stroke-width="4"/>
  <text x="48" y="54" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="30" font-weight="900" fill="#ffffff">${letter}</text>
  <text x="48" y="74" text-anchor="middle" font-family="ui-sans-serif,system-ui" font-size="10" font-weight="700" fill="rgba(255,255,255,0.75)">${name}</text>
</svg>`;
    return svgDataUri(svg);
  }

  function makeShot(title, subtitle) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05080f"/>
      <stop offset="1" stop-color="#0b1020"/>
    </linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00e5ff"/>
      <stop offset="0.55" stop-color="#ff2bd6"/>
      <stop offset="1" stop-color="#ff9a00"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="40" y="40" width="1200" height="640" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="62" y="62" width="1156" height="60" rx="18" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="92" y="82" width="10" height="10" rx="5" fill="#ff5f57"/>
  <rect x="112" y="82" width="10" height="10" rx="5" fill="#febc2e"/>
  <rect x="132" y="82" width="10" height="10" rx="5" fill="#28c840"/>
  <text x="120" y="112" font-family="ui-sans-serif,system-ui" font-size="18" font-weight="800" fill="#ffffff">${title}</text>
  <text x="120" y="140" font-family="ui-sans-serif,system-ui" font-size="14" font-weight="600" fill="rgba(255,255,255,0.7)">${subtitle}</text>
  <rect x="62" y="160" width="1156" height="520" rx="22" fill="rgba(0,0,0,0.35)" stroke="url(#g)" stroke-width="2" opacity="0.85"/>
  <g opacity="0.6">
    <rect x="110" y="210" width="340" height="140" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <rect x="110" y="380" width="340" height="140" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <rect x="480" y="210" width="700" height="310" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
    <rect x="480" y="540" width="700" height="120" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)"/>
  </g>
</svg>`;
    return svgDataUri(svg);
  }

  const FALLBACK_LOGO_PALETTE = [
    ['#00e5ff', '#ff2bd6'],
    ['#ff9a00', '#00e5ff'],
    ['#8a5cff', '#ff2bd6'],
    ['#00ff8a', '#00e5ff'],
    ['#ff2bd6', '#ff9a00'],
    ['#22c55e', '#06b6d4'],
    ['#38bdf8', '#a78bfa'],
  ];

  const fallbackLogoCache = new Map();

  function hash32(value) {
    const str = String(value || '');
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function normalizeGallery(gallery) {
    const list = Array.isArray(gallery) ? gallery : [];
    return list
      .map((v) => String(v || '').trim())
      .filter(Boolean)
      .filter((v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'));
  }

  function fallbackLogoFor(appId, name) {
    const id = String(appId || '').trim();
    const label = String(name || id || '?').trim() || '?';
    const key = id || label;
    const cached = fallbackLogoCache.get(key);
    if (cached) return cached;
    const letter = label.slice(0, 1).toUpperCase() || '?';
    const pair = FALLBACK_LOGO_PALETTE[hash32(key) % FALLBACK_LOGO_PALETTE.length] || FALLBACK_LOGO_PALETTE[0];
    const url = makeLogo(letter, '', pair[0], pair[1]);
    fallbackLogoCache.set(key, url);
    return url;
  }

  const APP_CATALOG = {
    axelive: {
      id: 'axelive',
      name: 'AxeLive',
      desc: 'Bitaxe device management (fan/work modes, groups, live control).',
      tag: 'AxeSuite',
      logo: makeLogo('L', 'AxeLive', '#00e5ff', '#ff2bd6'),
      screenshots: [
        makeShot('AxeLive', 'Device list + live control'),
        makeShot('AxeLive', 'Groups, profiles, and tuning'),
      ],
    },
    axebench: {
      id: 'axebench',
      name: 'AxeBench',
      desc: 'Fleet benchmarking + management (web UI).',
      tag: 'AxeSuite',
      logo: makeLogo('B', 'AxeBench', '#00e5ff', '#ff9a00'),
      screenshots: [
        makeShot('AxeBench', 'Benchmark + monitoring dashboard'),
        makeShot('AxeBench', 'Profiles, sessions, and pool scheduler'),
      ],
    },
    axebch: {
      id: 'axebch',
      name: 'AxeBCH',
      desc: 'BCH full node + solo pool (large disk).',
      tag: 'Node + Pool',
      logo: makeLogo('B', 'AxeBCH', '#00e5ff', '#00ff8a'),
      screenshots: [makeShot('AxeBCH', 'Node + pool overview')],
    },
    axedgb: {
      id: 'axedgb',
      name: 'AxeDGB',
      desc: 'DGB full node + solo pool (large disk).',
      tag: 'Node + Pool',
      logo: makeLogo('D', 'AxeDGB', '#00e5ff', '#8a5cff'),
      screenshots: [makeShot('AxeDGB', 'Node + pool overview')],
    },
    axebtc: {
      id: 'axebtc',
      name: 'AxeBTC',
      desc: 'BTC full node + solo pool (alpha).',
      tag: 'Node + Pool',
      logo: makeLogo('B', 'AxeBTC', '#ff9a00', '#ff2bd6'),
      screenshots: [makeShot('AxeBTC', 'Node + pool overview')],
    },
  };

  function metaFor(id) {
    const store = storeById.get(id) || null;
    if (store && typeof store === 'object') {
      const name = String(store.name || id);
      const tagline = String(store.tagline || '').trim();
      const description = String(store.description || '').trim();
      const category = String(store.category || '').trim();
      const logo = String(store.icon || '').trim() || fallbackLogoFor(id, name);
      const repo = String(store.repo || '').trim();
      const gallery = normalizeGallery(store.gallery);
      return {
        id,
        name,
        tagline,
        desc: tagline || description || '',
        longDesc: description || '',
        tag: category || 'App',
        logo,
        screenshots: gallery,
        storeId: String(store.store_id || ''),
        channel: String(store.channel || ''),
        version: String(store.version || ''),
        developer: String(store.developer || ''),
        website: String(store.website || ''),
        repo,
        support: String(store.support || ''),
        installable: !!store.installable,
      };
    }

    const fallback = APP_CATALOG[id] || null;
    const channel = String(activeStoreChannel || 'main');
    if (fallback) return { ...fallback, channel, installable: true };
    return { id, name: id, desc: '', tag: 'App', logo: null, screenshots: [], channel, installable: true };
  }

  function setStatus(text) {
    if (statusPill) statusPill.textContent = text;
  }

  function setHostIp() {
    try {
      const h = window.location.hostname || '';
      if (hostIp) hostIp.textContent = h || '-';
      if (metricIp) metricIp.textContent = h || '-';
    } catch {
      if (hostIp) hostIp.textContent = '-';
      if (metricIp) metricIp.textContent = '-';
    }
  }

  function setView(viewKey) {
    Object.entries(views).forEach(([k, el]) => {
      if (!el) return;
      if (k === viewKey) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    navButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-view') === viewKey;
      btn.classList.toggle('forgeos-nav-item--active', isActive);
    });

    const meta = viewMeta[viewKey] || { title: viewKey, subtitle: '' };
    if (viewTitle) viewTitle.textContent = meta.title;
    if (viewSubtitle) viewSubtitle.textContent = meta.subtitle || '';

    if (viewKey === 'settings') {
      refreshSshStatus().catch(() => {});
      refreshSystemUpdateStatus().catch(() => {});
      refreshSystemUpdateCheck().catch(() => {});
      renderWidgetSettings();
    }
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  let toastTimer = null;
  function showToast(message, kind) {
    if (!toastEl) return;
    const text = String(message || '').trim();
    if (!text) return;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.remove('hidden', 'forgeos-toast--warn', 'forgeos-toast--error');
    if (kind === 'warn') toastEl.classList.add('forgeos-toast--warn');
    if (kind === 'error') toastEl.classList.add('forgeos-toast--error');
    toastTimer = window.setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 2600);
  }

  function closeContextMenu() {
    if (!contextMenuEl) return;
    contextMenuEl.classList.add('hidden');
    contextMenuEl.setAttribute('aria-hidden', 'true');
    contextMenuEl.innerHTML = '';
  }

  function openContextMenu(items, x, y) {
    if (!contextMenuEl) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return;

    contextMenuEl.innerHTML = '';

    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      if (item.type === 'sep') {
        const sep = document.createElement('div');
        sep.className = 'forgeos-menu__sep';
        contextMenuEl.appendChild(sep);
        continue;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `forgeos-menu__item${item.danger ? ' forgeos-menu__item--danger' : ''}`;
      btn.textContent = String(item.label || '').trim() || '-';
      btn.disabled = !!item.disabled;
      if (item.hint) btn.title = String(item.hint);
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeContextMenu();
        if (btn.disabled) return;
        try {
          await item.onClick?.();
        } catch (err) {
          showToast('Action failed', 'error');
          alert(err && err.message ? err.message : String(err));
        }
      });
      contextMenuEl.appendChild(btn);
    }

    contextMenuEl.classList.remove('hidden');
    contextMenuEl.setAttribute('aria-hidden', 'false');

    const margin = 10;
    const r = contextMenuEl.getBoundingClientRect();
    const maxX = window.innerWidth - r.width - margin;
    const maxY = window.innerHeight - r.height - margin;
    const left = clamp(Number(x) || 0, margin, Math.max(margin, maxX));
    const top = clamp(Number(y) || 0, margin, Math.max(margin, maxY));
    contextMenuEl.style.left = `${Math.round(left)}px`;
    contextMenuEl.style.top = `${Math.round(top)}px`;
  }

  function updateClock() {
    const d = new Date();
    const timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateText = d.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });

    if (sidebarClockEl) {
      let t = sidebarClockEl.querySelector('.forgeos-clock__time');
      let sub = sidebarClockEl.querySelector('.forgeos-clock__date');
      if (!(t instanceof HTMLElement)) {
        sidebarClockEl.textContent = '';
        t = document.createElement('div');
        t.className = 'forgeos-clock__time';
        sidebarClockEl.appendChild(t);
        sub = document.createElement('div');
        sub.className = 'forgeos-clock__date';
        sidebarClockEl.appendChild(sub);
      }
      t.textContent = timeText;
      if (sub instanceof HTMLElement) sub.textContent = dateText;
      sidebarClockEl.title = dateText;
    }

    if (taskbarClockEl) {
      taskbarClockEl.textContent = timeText;
      taskbarClockEl.title = dateText;
    }
  }

  function workspaceBox() {
    const r = (windowLayer || document.documentElement).getBoundingClientRect();
    return { width: Math.max(0, Math.floor(r.width)), height: Math.max(0, Math.floor(r.height)) };
  }

  function isWorkspaceActive() {
    if (openWindows.size === 0) return false;
    for (const entry of openWindows.values()) {
      if (!entry.isMinimized) return true;
    }
    return false;
  }

  function updateWorkspaceMode() {
    document.body.classList.toggle('forgeos-workspace', isWorkspaceActive());
  }

  function setActiveWindow(id) {
    activeWindowId = id || null;
    for (const [wid, entry] of openWindows.entries()) {
      entry.el.classList.toggle('forgeos-window--active', !!activeWindowId && wid === activeWindowId);
      entry.taskBtn.classList.toggle('forgeos-taskbar__app--active', !!activeWindowId && wid === activeWindowId);
    }
  }

  function focusWindow(id) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    if (entry.isMinimized) {
      entry.isMinimized = false;
      entry.el.classList.remove('forgeos-window--minimized');
    }

    zCounter += 1;
    entry.el.style.zIndex = String(zCounter);
    setActiveWindow(id);
    selectedAppId = id;
    syncInstalledSelection();
    updateAppHeader();
    updateWorkspaceMode();
  }

  function minimizeWindow(id) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    entry.isMinimized = true;
    entry.el.classList.add('forgeos-window--minimized');
    if (activeWindowId === id) setActiveWindow(null);
    updateWorkspaceMode();
  }

  function closeWindow(id) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    entry.el.remove();
    entry.taskBtn.remove();
    openWindows.delete(id);
    if (activeWindowId === id) setActiveWindow(null);
    if (selectedAppId === id) {
      selectedAppId = null;
      syncInstalledSelection();
      updateAppHeader();
    }
    updateWorkspaceMode();
  }

  function toggleMaximizeWindow(id) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    const box = workspaceBox();

    if (!entry.isMaximized) {
      entry.prevRect = {
        left: parseFloat(entry.el.style.left) || 0,
        top: parseFloat(entry.el.style.top) || 0,
        width: parseFloat(entry.el.style.width) || 0,
        height: parseFloat(entry.el.style.height) || 0,
      };
      const pad = 10;
      entry.el.style.left = `${pad}px`;
      entry.el.style.top = `${pad}px`;
      entry.el.style.width = `${Math.max(320, box.width - pad * 2)}px`;
      entry.el.style.height = `${Math.max(220, box.height - pad * 2)}px`;
      entry.isMaximized = true;
    } else if (entry.prevRect) {
      entry.el.style.left = `${entry.prevRect.left}px`;
      entry.el.style.top = `${entry.prevRect.top}px`;
      entry.el.style.width = `${entry.prevRect.width}px`;
      entry.el.style.height = `${entry.prevRect.height}px`;
      entry.isMaximized = false;
    }

    focusWindow(id);
  }

  function startDrag(titlebar, id, e) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    if (entry.isMaximized) return;

    const box = workspaceBox();
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseFloat(entry.el.style.left) || 0;
    const startTop = parseFloat(entry.el.style.top) || 0;

    titlebar.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const rectW = parseFloat(entry.el.style.width) || 0;
      const rectH = parseFloat(entry.el.style.height) || 0;
      const left = clamp(startLeft + dx, 0, Math.max(0, box.width - rectW));
      const top = clamp(startTop + dy, 0, Math.max(0, box.height - rectH));
      entry.el.style.left = `${Math.round(left)}px`;
      entry.el.style.top = `${Math.round(top)}px`;
    };

    const onUp = () => {
      titlebar.removeEventListener('pointermove', onMove);
      titlebar.removeEventListener('pointerup', onUp);
      titlebar.removeEventListener('pointercancel', onUp);
    };

    titlebar.addEventListener('pointermove', onMove);
    titlebar.addEventListener('pointerup', onUp);
    titlebar.addEventListener('pointercancel', onUp);
  }

  function startResize(handle, id, e) {
    const entry = openWindows.get(id) || null;
    if (!entry) return;
    if (entry.isMaximized) return;

    const box = workspaceBox();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = parseFloat(entry.el.style.width) || entry.el.getBoundingClientRect().width;
    const startH = parseFloat(entry.el.style.height) || entry.el.getBoundingClientRect().height;
    const startLeft = parseFloat(entry.el.style.left) || 0;
    const startTop = parseFloat(entry.el.style.top) || 0;

    handle.setPointerCapture(e.pointerId);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const maxW = Math.max(320, box.width - startLeft);
      const maxH = Math.max(220, box.height - startTop);
      const w = clamp(startW + dx, 320, maxW);
      const h = clamp(startH + dy, 220, maxH);
      entry.el.style.width = `${Math.round(w)}px`;
      entry.el.style.height = `${Math.round(h)}px`;
    };

    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  function docLooksLikeNotFound(doc) {
    if (!doc) return false;
    const bodyText = String((doc.body && doc.body.innerText) || '').toLowerCase();
    if (bodyText.includes('page not found') && bodyText.includes('404')) return true;
    return false;
  }

  function attachCompatFallback(iframe, appId, pathUrl, fallbackUrl) {
    if (!iframe) return;
    if (!fallbackUrl || fallbackUrl === 'about:blank') return;

    const check = () => {
      try {
        if (!iframe.src || !iframe.src.startsWith(window.location.origin)) return;
        if (!iframe.contentDocument) return;
        if (!docLooksLikeNotFound(iframe.contentDocument)) return;
        iframe.src = fallbackUrl;
      } catch {}
    };

    iframe.addEventListener('load', () => {
      // Some SPAs render a 404 view after boot; check twice.
      window.setTimeout(check, 250);
      window.setTimeout(check, 900);
    });

    // If the proxied path doesn't exist yet, swap to fallback.
    window.setTimeout(async () => {
      try {
        const res = await fetch(pathUrl, { method: 'HEAD' });
        if (res.ok) return;
        if (res.status === 405 || res.status === 501) return;
      } catch {}
      iframe.src = fallbackUrl;
    }, 450);
  }

  function openAppWindow(app) {
    if (!windowLayer || !taskbarAppsEl) return false;

    const id = app.id || '';
    if (!id) return false;

    setView('dashboard');

    const existing = openWindows.get(id) || null;
    if (existing) {
      focusWindow(id);
      return true;
    }

    const meta = metaFor(id);
    const name = meta.name || app.name || id;
    const installed = installedById.get(id) || null;
    const status = (installed && installed.status) || app.status || 'installed';

    const win = document.createElement('div');
    win.className = 'forgeos-window';
    win.dataset.appId = id;

    const box = workspaceBox();
    const w = Math.min(1400, Math.max(420, Math.round(box.width * 0.92)));
    const h = Math.min(920, Math.max(360, Math.round(box.height * 0.92)));
    const margin = 12;
    const baseLeft = Math.round((box.width - w) / 2);
    const baseTop = Math.round((box.height - h) / 2);
    const offset = Math.min(openWindows.size * 18, 72);
    const left = clamp(baseLeft + offset, margin, Math.max(margin, box.width - w - margin));
    const top = clamp(baseTop + offset, margin, Math.max(margin, box.height - h - margin));
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.style.width = `${w}px`;
    win.style.height = `${h}px`;
    zCounter += 1;
    win.style.zIndex = String(zCounter);

    const titlebar = document.createElement('div');
    titlebar.className = 'forgeos-window__titlebar';

    const title = document.createElement('div');
    title.className = 'forgeos-window__title';

    const logo = document.createElement('img');
    logo.className = 'forgeos-window__logo';
    logo.alt = '';
    if (meta.logo) logo.src = meta.logo;

    const nameEl = document.createElement('div');
    nameEl.className = 'forgeos-window__name';
    nameEl.textContent = name;

    const statusPill = document.createElement('span');
    statusPill.className = 'axe-pill';
    statusPill.textContent = status;

    title.appendChild(logo);
    title.appendChild(nameEl);
    title.appendChild(statusPill);

    const controls = document.createElement('div');
    controls.className = 'forgeos-window__controls';

    const btnMin = document.createElement('button');
    btnMin.type = 'button';
    btnMin.className = 'forgeos-window-btn forgeos-window-btn--min';
    btnMin.setAttribute('aria-label', 'Minimize');
    btnMin.title = 'Minimize';
    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });

    const btnMax = document.createElement('button');
    btnMax.type = 'button';
    btnMax.className = 'forgeos-window-btn forgeos-window-btn--max';
    btnMax.setAttribute('aria-label', 'Maximize');
    btnMax.title = 'Maximize';
    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximizeWindow(id);
    });

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'forgeos-window-btn forgeos-window-btn--close';
    btnClose.setAttribute('aria-label', 'Close');
    btnClose.title = 'Close';
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id);
    });

    controls.appendChild(btnMin);
    controls.appendChild(btnMax);
    controls.appendChild(btnClose);

    titlebar.appendChild(title);
    titlebar.appendChild(controls);

    titlebar.addEventListener('pointerdown', (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.closest('button')) return;
      e.preventDefault();
      focusWindow(id);
      startDrag(titlebar, id, e);
    });

    win.addEventListener('pointerdown', () => focusWindow(id));

    const content = document.createElement('div');
    content.className = 'forgeos-window__content';

    const iframe = document.createElement('iframe');
    iframe.className = 'forgeos-window__frame';
    iframe.title = name;
    const pathUrl = `${window.location.origin}/apps/${encodeURIComponent(id)}/`;
    iframe.src = pathUrl;
    content.appendChild(iframe);

    const resize = document.createElement('div');
    resize.className = 'forgeos-window__resize';
    resize.title = 'Resize';
    resize.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(id);
      startResize(resize, id, e);
    });

    win.appendChild(titlebar);
    win.appendChild(content);
    win.appendChild(resize);

    const taskBtn = document.createElement('button');
    taskBtn.type = 'button';
    taskBtn.className = 'forgeos-taskbar__app';
    taskBtn.dataset.appId = id;
    taskBtn.setAttribute('role', 'listitem');

    const taskLogo = document.createElement('img');
    taskLogo.className = 'forgeos-taskbar__app-logo';
    taskLogo.alt = '';
    if (meta.logo) taskLogo.src = meta.logo;

    const taskName = document.createElement('span');
    taskName.className = 'forgeos-taskbar__app-name';
    taskName.textContent = name;

    taskBtn.appendChild(taskLogo);
    taskBtn.appendChild(taskName);

    taskBtn.addEventListener('click', () => {
      const entry = openWindows.get(id) || null;
      if (!entry) return;
      if (entry.isMinimized) {
        focusWindow(id);
        return;
      }
      if (activeWindowId === id) {
        minimizeWindow(id);
        return;
      }
      focusWindow(id);
    });

    taskbarAppsEl.appendChild(taskBtn);
    windowLayer.appendChild(win);

    openWindows.set(id, {
      id,
      el: win,
      iframe,
      taskBtn,
      statusPill,
      isMinimized: false,
      isMaximized: false,
      prevRect: null,
    });

    focusWindow(id);

    const host = window.location.hostname;
    const portMap = { axelive: 5210, axebench: 5000 };
    const fallbackUrl = portMap[id] ? `http://${host}:${portMap[id]}/` : 'about:blank';
    attachCompatFallback(iframe, id, pathUrl, fallbackUrl);

    return true;
  }

  function updateOpenWindows() {
    for (const [id, entry] of openWindows.entries()) {
      const installed = installedById.get(id) || null;
      const status = installed ? installed.status || 'installed' : 'installed';
      if (entry.statusPill) entry.statusPill.textContent = status;
    }
    if (activeWindowId) setActiveWindow(activeWindowId);
  }

  function safeJson(r) {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  async function apiJson(path, opts) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401) {
        try {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/login.html?next=${encodeURIComponent(next)}`;
        } catch {}
      }
      const msg = (data && (data.error || data.stderr)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  }

  async function apiJsonTimeout(path, opts, timeoutMs) {
    const t = Number(timeoutMs) || 0;
    if (!t) return apiJson(path, opts);
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), t);
    try {
      return await apiJson(path, { ...opts, signal: ctl.signal });
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function ensureHealthy() {
    const now = Date.now();
    if (healthCache.checkedAt && now - healthCache.checkedAt < 8000) return healthCache.ok;
    healthCache.checkedAt = now;
    try {
      await apiJsonTimeout('/api/v0/health', {}, 2000);
      healthCache.ok = true;
      setStatus('Online');
      return true;
    } catch {
      healthCache.ok = false;
      setStatus('UI only');
      return false;
    }
  }

  function setMetricsPlaceholder() {
    if (metricCpu) metricCpu.textContent = '-';
    if (metricMem) metricMem.textContent = '-';
    if (metricDisk) metricDisk.textContent = '-';
    if (metricCpuSub) metricCpuSub.textContent = '-';
    if (metricMemSub) metricMemSub.textContent = '-';
    if (metricDiskSub) metricDiskSub.textContent = '-';
    if (metricMemBar) metricMemBar.style.width = '0%';
    if (metricDiskBar) metricDiskBar.style.width = '0%';
    if (metricCpuCores) metricCpuCores.innerHTML = '';
    if (trustedNetworksEl) trustedNetworksEl.textContent = 'Setup wizard (coming soon)';
    if (tailscaleStatusEl) tailscaleStatusEl.textContent = 'Optional';
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let v = bytes;
    let u = 0;
    while (v >= 1024 && u < units.length - 1) {
      v /= 1024;
      u += 1;
    }
    const decimals = u <= 1 ? 0 : v >= 100 ? 0 : v >= 10 ? 1 : 2;
    return `${v.toFixed(decimals)} ${units[u]}`;
  }

  function applyMetrics(metrics) {
    if (!metrics || metrics.ok !== true) return;

    const cpu = metrics.cpu || {};
    const cores = Number(cpu.cores) || 1;
    const load1 = Number(cpu.load1) || 0;
    const cpuTotal = Number.isFinite(Number(cpu.total_perc)) ? Number(cpu.total_perc) : NaN;
    const cpuPct = Number.isFinite(cpuTotal) ? Math.max(0, Math.round(cpuTotal)) : Math.max(0, Math.round((load1 / cores) * 100));
    if (metricCpu) {
      metricCpu.textContent = `${cpuPct}%`;
      metricCpu.title = `cores=${cores} load1=${load1.toFixed(2)}`;
    }
    if (metricCpuSub) {
      metricCpuSub.textContent = `${cores} cores \u2022 load1 ${load1.toFixed(2)}`;
    }

    if (metricCpuCores) {
      const perCore = Array.isArray(cpu.per_core_perc) ? cpu.per_core_perc : [];
      metricCpuCores.innerHTML = '';
      if (perCore.length) {
        for (const v of perCore.slice(0, 64)) {
          const pct = Math.max(0, Math.min(100, Number(v) || 0));
          const bar = document.createElement('div');
          bar.className = 'forgeos-corebar';
          bar.title = `${pct.toFixed(0)}%`;

          const fill = document.createElement('div');
          fill.className = 'forgeos-corebar__fill';
          fill.style.height = `${pct}%`;
          if (pct >= 90) fill.style.background = 'rgba(248, 113, 113, 0.9)';
          else if (pct >= 70) fill.style.background = 'rgba(251, 191, 36, 0.9)';
          else fill.style.background = 'rgba(0, 229, 255, 0.9)';

          bar.appendChild(fill);
          metricCpuCores.appendChild(bar);
        }
      } else {
        metricCpuCores.innerHTML = '';
      }
    }

    const mem = metrics.memory || {};
    const total = Number(mem.total_bytes) || 0;
    const used = Number(mem.used_bytes) || 0;
    const memPct = total > 0 ? Math.max(0, Math.round((used / total) * 100)) : 0;
    if (metricMem) {
      metricMem.textContent = `${memPct}%`;
      metricMem.title = `${formatBytes(used)} / ${formatBytes(total)}`;
    }
    if (metricMemBar) metricMemBar.style.width = `${Math.max(0, Math.min(100, memPct))}%`;
    if (metricMemSub) metricMemSub.textContent = `${formatBytes(used)} / ${formatBytes(total)}`;

    const disks = Array.isArray(metrics.disks) ? metrics.disks : [];
    const preferred =
      disks.find((d) => d && d.path === '/srv/forgeos-data') || disks.find((d) => d && d.path === '/') || null;
    if (preferred && metricDisk) {
      const dTotal = Number(preferred.total_bytes) || 0;
      const dUsed = Number(preferred.used_bytes) || 0;
      const diskPct = dTotal > 0 ? Math.max(0, Math.round((dUsed / dTotal) * 100)) : 0;
      metricDisk.textContent = `${diskPct}%`;
      metricDisk.title = `${preferred.path}: ${formatBytes(dUsed)} / ${formatBytes(dTotal)}`;
      if (metricDiskBar) metricDiskBar.style.width = `${Math.max(0, Math.min(100, diskPct))}%`;
      if (metricDiskSub) metricDiskSub.textContent = `${preferred.path}: ${formatBytes(dUsed)} / ${formatBytes(dTotal)}`;
    }
  }

  function uniqOrder(ids) {
    const out = [];
    const seen = new Set();
    for (const raw of Array.isArray(ids) ? ids : []) {
      const id = String(raw || '').trim();
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  }

  function normalizeOpenApps() {
    openAppIds = uniqOrder(openAppIds);
    if (installedById && installedById.size) {
      openAppIds = openAppIds.filter((id) => installedById.has(id));
    }
    saveOpenApps();
  }

  function isAppOpen(id) {
    return openAppIds.includes(id);
  }

  function isLaunchableStatus(status) {
    const s = String(status || '').toLowerCase();
    return s === 'running' || s === 'restarting';
  }

  function isAppLaunchable(id) {
    const appId = String(id || '').trim();
    if (!appId) return false;
    if (pendingAppActions.has(appId)) return false;
    const installed = installedById.get(appId) || null;
    if (!installed) return false;
    return isLaunchableStatus(installed.status);
  }

  function progressLabel(kind, pct) {
    const k = String(kind || '').toLowerCase();
    const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    if (k === 'install') return `Installing ${p}%`;
    if (k === 'update') return `Updating ${p}%`;
    if (k === 'sync') return `Syncing ${p}%`;
    return `Working ${p}%`;
  }

  function ensureProgressElements(appId) {
    const id = String(appId || '').trim();
    if (!id) return;

    const card = document.querySelector(`.forgeos-store-item[data-app-id=\"${id}\"]`);
    if (card) {
      const btn = card.querySelector('.forgeos-store-item__actions .axe-btn');
      if (btn) btn.dataset.progressId = id;

      const actions = card.querySelector('.forgeos-store-item__actions');
      if (actions && !actions.querySelector(`.forgeos-progress__bar[data-progress-id=\"${id}\"]`)) {
        const wrap = document.createElement('div');
        wrap.className = 'forgeos-progress';
        const bar = document.createElement('div');
        bar.className = 'forgeos-progress__bar';
        bar.dataset.progressId = id;
        wrap.appendChild(bar);
        actions.appendChild(wrap);
      }
    }
  }

  function updateProgressDom(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    const st = appProgress.get(id);
    if (!st) return;

    ensureProgressElements(id);

    const pct = Math.max(0, Math.min(100, Math.round(Number(st.pct) || 0)));
    for (const bar of Array.from(document.querySelectorAll(`.forgeos-progress__bar[data-progress-id=\"${id}\"]`))) {
      if (!(bar instanceof HTMLElement)) continue;
      bar.style.width = `${pct}%`;
    }

    for (const btn of Array.from(document.querySelectorAll(`button[data-progress-id=\"${id}\"]`))) {
      if (!(btn instanceof HTMLButtonElement)) continue;
      btn.textContent = progressLabel(st.kind, pct);
    }
  }

  function cancelProgress(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    const st = appProgress.get(id);
    if (st && st.timer) window.clearInterval(st.timer);
    appProgress.delete(id);
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
  }

  function startProgress(appId, kind) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (appProgress.has(id)) cancelProgress(id);

    const st = { kind: String(kind || '').trim() || 'working', pct: 1, timer: null };
    appProgress.set(id, st);

    st.timer = window.setInterval(() => {
      const cur = Number(st.pct) || 0;
      let next = cur;
      if (cur < 70) next = cur + 3 + Math.random() * 4;
      else if (cur < 88) next = cur + 1 + Math.random() * 2;
      else if (cur < 94) next = cur + Math.random();
      st.pct = Math.min(94, next);
      updateProgressDom(id);
    }, 650);

    updateProgressDom(id);
    return st;
  }

  function finishProgress(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    const st = appProgress.get(id);
    if (!st) return;
    if (st.timer) window.clearInterval(st.timer);
    st.timer = null;
    st.pct = 100;
    updateProgressDom(id);
    window.setTimeout(() => cancelProgress(id), 900);
  }

  function setWorkspaceLayout(count) {
    if (!workspaceEl) return;
    workspaceEl.classList.remove('forgeos-workspace--1', 'forgeos-workspace--2', 'forgeos-workspace--3', 'forgeos-workspace--4');
    const n = Math.min(4, Math.max(0, Number(count) || 0));
    if (n >= 1) workspaceEl.classList.add(`forgeos-workspace--${n}`);
  }

  function moveOpenAppBefore(fromId, toId) {
    if (!fromId || !toId) return;
    if (fromId === toId) return;
    const ids = openAppIds.slice();
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1) return;
    ids.splice(fromIdx, 1);
    const nextTo = ids.indexOf(toId);
    ids.splice(Math.max(0, nextTo), 0, fromId);
    openAppIds = ids;
    saveOpenApps();
  }

  function makeTile(app) {
    const id = String(app && app.id ? app.id : '').trim();
    if (!id) return null;

    const meta = metaFor(id);
    const installed = installedById.get(id) || null;
    const status = installed ? installed.status || 'installed' : 'installed';

    const tile = document.createElement('section');
    tile.className = 'forgeos-tile';
    tile.dataset.appId = id;
    tile.setAttribute('role', 'group');
    tile.setAttribute('aria-label', meta.name || id);

    const bar = document.createElement('div');
    bar.className = 'forgeos-tile__bar';

    const brand = document.createElement('div');
    brand.className = 'forgeos-tile__brand';

    const logo = document.createElement('img');
    logo.className = 'forgeos-tile__logo';
    logo.alt = '';
    if (meta.logo) logo.src = meta.logo;

    const name = document.createElement('div');
    name.className = 'forgeos-tile__name';
    name.textContent = meta.name || id;

    const pill = document.createElement('span');
    pill.className = 'axe-pill';
    pill.textContent = status;

    brand.appendChild(logo);
    brand.appendChild(name);

    const actions = document.createElement('div');
    actions.className = 'forgeos-tile__actions';

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'forgeos-tile__close';
    btnClose.title = 'Close';
    btnClose.textContent = '×';
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAppOpen({ id });
    });

    actions.appendChild(btnClose);

    bar.appendChild(brand);
    bar.appendChild(pill);
    bar.appendChild(actions);

    const frameWrap = document.createElement('div');
    frameWrap.className = 'forgeos-tile__frame-wrap';

    const iframe = document.createElement('iframe');
    iframe.className = 'forgeos-tile__frame';
    iframe.title = meta.name || id;
    iframe.loading = 'lazy';
    const pathUrl = `${window.location.origin}/apps/${encodeURIComponent(id)}/`;
    iframe.src = pathUrl;

    const ui = installed && installed.ui && typeof installed.ui === 'object' ? installed.ui : null;
    const port = ui && ui.port ? Number(ui.port) : 0;
    const host = window.location.hostname;
    const fallbackUrl = port ? `http://${host}:${port}/` : 'about:blank';
    attachCompatFallback(iframe, id, pathUrl, fallbackUrl);

    frameWrap.appendChild(iframe);

    tile.draggable = true;
    tile.addEventListener('dragstart', (e) => {
      dragAppId = id;
      tile.classList.add('forgeos-tile--dragging');
      document.body.classList.add('forgeos-dnd');
      try {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      } catch {}
    });
    tile.addEventListener('dragend', () => {
      dragAppId = null;
      tile.classList.remove('forgeos-tile--dragging');
      document.body.classList.remove('forgeos-dnd');
    });

    tile.addEventListener('dragover', (e) => {
      if (!dragAppId) return;
      e.preventDefault();
      tile.classList.add('forgeos-tile--drop');
    });
    tile.addEventListener('dragleave', () => tile.classList.remove('forgeos-tile--drop'));
    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      tile.classList.remove('forgeos-tile--drop');
      const from = dragAppId || '';
      if (!from) return;
      moveOpenAppBefore(from, id);
      renderWorkspace();
    });

    tile.addEventListener('click', () => {
      selectedAppId = id;
      syncInstalledSelection();
      updateAppHeader();
    });

    tile.appendChild(bar);
    tile.appendChild(frameWrap);
    return tile;
  }

  function renderWorkspace() {
    if (!workspaceEl) return;

    normalizeOpenApps();

    const apps = openAppIds.map((id) => installedById.get(id) || { id });
    workspaceEl.innerHTML = '';

    const count = apps.length;
    if (btnResumeWorkspace) {
      btnResumeWorkspace.classList.toggle('hidden', count === 0);
      btnResumeWorkspace.textContent = count ? `Workspace (${count})` : 'Workspace';
    }

    const showWorkspace = count > 0 && !dashboardShowHome;
    setWorkspaceLayout(showWorkspace ? count : 0);
    if (workspaceEmptyEl) workspaceEmptyEl.style.display = showWorkspace ? 'none' : 'block';
    workspaceEl.style.display = showWorkspace ? 'grid' : 'none';
    if (!showWorkspace) return;

    for (const app of apps) {
      const tile = makeTile(app);
      if (tile) workspaceEl.appendChild(tile);
    }
  }

  function ensureAppOpen(app) {
    const id = app && app.id ? String(app.id || '').trim() : '';
    if (!id) return;
    if (id === 'umbrel-store') {
      setView('store');
      setStoreChannel('umbrel');
      return;
    }
    setView('dashboard');
    dashboardShowHome = false;
    selectedAppId = id;
    syncInstalledSelection();
    updateAppHeader();

    if (!isAppLaunchable(id)) {
      showToast('App is not running. Start it first.', 'warn');
      return;
    }
    if (!isAppOpen(id)) {
      openAppIds = [...openAppIds, id];
      saveOpenApps();
    }
    renderWorkspace();
    syncInstalledSelection();
    updateAppHeader();
  }

  function toggleAppOpen(app) {
    const id = app && app.id ? String(app.id || '').trim() : '';
    if (!id) return;
    if (id === 'umbrel-store') {
      setView('store');
      setStoreChannel('umbrel');
      return;
    }
    setView('dashboard');
    if (isAppOpen(id)) {
      openAppIds = openAppIds.filter((x) => x !== id);
    } else {
      dashboardShowHome = false;
      selectedAppId = id;
      syncInstalledSelection();
      updateAppHeader();
      if (!isAppLaunchable(id)) {
        showToast('App is not running. Start it first.', 'warn');
        return;
      }
      openAppIds = [...openAppIds, id];
    }
    saveOpenApps();
    selectedAppId = id;
    renderWorkspace();
    syncInstalledSelection();
    updateAppHeader();
  }

  function syncInstalledSelection() {
    if (!installedAppsEl) return;
    for (const node of Array.from(installedAppsEl.children)) {
      if (!(node instanceof HTMLElement)) continue;
      const id = node.dataset.appId || '';
      node.classList.toggle('forgeos-app-item--open', isAppOpen(id));
      node.classList.toggle('forgeos-app-item--active', !!selectedAppId && id === selectedAppId);
    }
  }

  function updateAppHeader() {
    const id = selectedAppId || '';
    const installed = id ? installedById.get(id) : null;
    const status = installed ? installed.status || 'installed' : '-';

    if (!selectedControlsEl || !selectedAppNameEl || !selectedAppStatusEl) return;

    if (!installed) {
      selectedControlsEl.classList.add('hidden');
      return;
    }

    selectedControlsEl.classList.remove('hidden');

    const meta = metaFor(id);
    selectedAppNameEl.textContent = meta.name || installed.name || id;
    selectedAppStatusEl.textContent = status;

    const isRunning = status === 'running';
    const canControl = !!installed;
    if (btnSelectedStart) btnSelectedStart.disabled = !canControl || isRunning;
    if (btnSelectedStop) btnSelectedStop.disabled = !canControl || !isRunning;
    if (btnSelectedRestart) btnSelectedRestart.disabled = !canControl;
  }

  async function apiAppAction(id, kind) {
    if (!id) return;
    if (kind === 'restart') {
      await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/down`, { method: 'POST', body: '{}' });
      await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/up`, { method: 'POST', body: '{}' });
      return;
    }
    await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/${encodeURIComponent(kind)}`, { method: 'POST', body: '{}' });
  }

  async function runAppAction(appId, kind) {
    const id = String(appId || '').trim();
    if (!id) return;

    const k = String(kind || '').trim();
    if (!k) return;

    if (k === 'down') {
      const label = metaFor(id).name || id;
      if (!confirm(`Stop ${label}?`)) return;
    }

    pendingAppActions.set(id, k);

    if (k === 'down') {
      openAppIds = openAppIds.filter((x) => x !== id);
      saveOpenApps();
      renderWorkspace();
      syncInstalledSelection();
    }

    try {
      await apiAppAction(id, k);
      showToast(`${k === 'up' ? 'Starting' : k === 'down' ? 'Stopping' : k === 'restart' ? 'Restarting' : 'Running'} ${metaFor(id).name || id}`, null);
      await refresh();
    } catch (e) {
      showToast('App action failed', 'error');
      alert(`App action failed: ${e && e.message ? e.message : e}`);
    } finally {
      pendingAppActions.delete(id);
      updateAppHeader();
    }
  }

  async function runSelectedAppAction(kind) {
    const id = selectedAppId;
    if (!id) return;
    await runAppAction(id, kind);
  }

  function formatTimeShort(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function setWidgetsUpdated(iso) {
    if (!dashboardWidgetsUpdatedEl) return;
    const t = formatTimeShort(iso);
    dashboardWidgetsUpdatedEl.textContent = t ? `Updated ${t}` : '-';
  }

  async function refreshMetrics() {
    if (refreshMetricsInFlight) return;
    refreshMetricsInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const metrics = await apiJsonTimeout('/api/v0/system/metrics', {}, 3000).catch(() => null);
      if (!metrics || metrics.ok !== true) return;
      lastMetrics = metrics;
      applyMetrics(metrics);
    } finally {
      refreshMetricsInFlight = false;
    }
  }

  async function refreshSshStatus() {
    if (!settingSshToggle) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/ssh', {}, 3000).catch(() => null);
      if (!res || res.ok !== true) {
        settingSshToggle.disabled = true;
        return;
      }

      const installed = !!res.installed;
      settingSshToggle.disabled = !installed;
      settingSshToggle.checked = !!res.enabled;
      settingSshToggle.title = installed
        ? `${res.service || 'ssh'}: ${res.active ? 'active' : 'inactive'}`
        : 'SSH not available on this system';
    } catch {}
  }

  function systemUpdateState() {
    const st = systemUpdateStatusCache && typeof systemUpdateStatusCache === 'object' ? systemUpdateStatusCache : null;
    return st && st.state ? String(st.state).trim().toLowerCase() : 'idle';
  }

  function systemUpdateIsBusy(state) {
    const s = String(state || '').trim().toLowerCase();
    return ['downloading', 'extracting', 'deploying', 'restarting', 'restarting_daemon'].includes(s);
  }

  function systemUpdateProgressPct(state) {
    const s = String(state || '').trim().toLowerCase();
    if (s === 'downloading') return 22;
    if (s === 'extracting') return 46;
    if (s === 'deploying') return 72;
    if (s === 'restarting') return 88;
    if (s === 'restarting_daemon') return 94;
    if (s === 'done') return 100;
    if (s === 'error') return 100;
    return 0;
  }

  function systemUpdateStateLabel(state, status) {
    const s = String(state || '').trim().toLowerCase();
    const st = status && typeof status === 'object' ? status : {};
    const svc = st.service ? String(st.service) : '';
    if (s === 'downloading') return 'Downloading update bundle…';
    if (s === 'extracting') return 'Extracting update…';
    if (s === 'deploying') return 'Deploying update…';
    if (s === 'restarting') return `Restarting ${svc || 'services'}…`;
    if (s === 'restarting_daemon') return `Restarting ${svc || 'daemon'}…`;
    if (s === 'done') return 'Update complete.';
    if (s === 'error') return `Update failed: ${st.error ? String(st.error) : 'unknown error'}`;
    return 'Idle.';
  }

  function renderSystemUpdatePanel() {
    const check = systemUpdateCheckCache && typeof systemUpdateCheckCache === 'object' ? systemUpdateCheckCache : null;
    const status = systemUpdateStatusCache && typeof systemUpdateStatusCache === 'object' ? systemUpdateStatusCache : null;

    const installedTag =
      check && check.installed && typeof check.installed === 'object' && check.installed.tag ? String(check.installed.tag) : '-';
    const channel = check && check.channel ? String(check.channel).toUpperCase() : '-';
    const availableTag =
      check && check.available && typeof check.available === 'object' && check.available.tag ? String(check.available.tag) : '';

    if (updateInstalledEl) updateInstalledEl.textContent = installedTag || '-';
    if (updateChannelEl) updateChannelEl.textContent = channel || '-';
    if (updateAvailableEl) updateAvailableEl.textContent = availableTag || '-';
    if (updateNotesEl) updateNotesEl.textContent = (check && check.available && check.available.notes ? String(check.available.notes) : '') || '';

    const state = status && status.state ? String(status.state).trim().toLowerCase() : 'idle';
    const busy = systemUpdateIsBusy(state);

    if (btnUpdateCheck) btnUpdateCheck.disabled = busy;

    const updateAvailable = !!(check && check.update_available === true);
    if (btnUpdateApply) btnUpdateApply.disabled = busy || !updateAvailable;

    if (updateStatusEl) {
      let line = '-';
      if (busy) {
        line = systemUpdateStateLabel(state, status);
      } else if (state === 'done') {
        const tgt = status && status.target_tag ? String(status.target_tag) : availableTag || installedTag;
        line = tgt ? `Updated to ${tgt}.` : 'Update complete.';
      } else if (state === 'error') {
        line = systemUpdateStateLabel(state, status);
      } else if (updateAvailable) {
        line = availableTag ? `Update available: ${availableTag}` : 'Update available.';
      } else if (check && check.error) {
        line = String(check.error);
      } else if (check) {
        line = 'Up to date.';
      } else {
        line = 'Loading update status…';
      }
      updateStatusEl.textContent = line;
    }

    if (updateProgressEl && updateProgressBarEl) {
      const show = busy;
      updateProgressEl.classList.toggle('hidden', !show);
      updateProgressEl.setAttribute('aria-hidden', show ? 'false' : 'true');
      updateProgressBarEl.style.width = `${systemUpdateProgressPct(state)}%`;
    }
  }

  function stopSystemUpdatePoll() {
    if (!systemUpdatePollTimer) return;
    window.clearTimeout(systemUpdatePollTimer);
    systemUpdatePollTimer = null;
  }

  function scheduleSystemUpdatePoll(delayMs) {
    stopSystemUpdatePoll();
    const ms = Math.max(750, Number(delayMs) || 1500);
    systemUpdatePollTimer = window.setTimeout(() => systemUpdatePollTick().catch(() => {}), ms);
  }

  async function systemUpdatePollTick() {
    if (systemUpdatePollInFlight) return;
    systemUpdatePollInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) {
        if (updateStatusEl) updateStatusEl.textContent = 'Reconnecting…';
        scheduleSystemUpdatePoll(3500);
        return;
      }
      const st = await apiJsonTimeout('/api/v0/system/update/status', {}, 5000);
      if (st && typeof st === 'object') systemUpdateStatusCache = st;
      renderSystemUpdatePanel();

      const state = systemUpdateState();
      if (systemUpdateIsBusy(state)) {
        scheduleSystemUpdatePoll(1400);
      } else {
        stopSystemUpdatePoll();
        if (state === 'done') refreshSystemUpdateCheck({ force: true }).catch(() => {});
      }
    } catch {
      if (updateStatusEl && systemUpdateIsBusy(systemUpdateState())) updateStatusEl.textContent = 'Reconnecting…';
      scheduleSystemUpdatePoll(4000);
    } finally {
      systemUpdatePollInFlight = false;
    }
  }

  async function refreshSystemUpdateStatus() {
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const st = await apiJsonTimeout('/api/v0/system/update/status', {}, 2500).catch(() => null);
      if (st && typeof st === 'object') systemUpdateStatusCache = st;
      renderSystemUpdatePanel();

      const state = systemUpdateState();
      if (systemUpdateIsBusy(state)) scheduleSystemUpdatePoll(1200);
      else stopSystemUpdatePoll();
    } catch {}
  }

  async function refreshSystemUpdateCheck(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const force = !!options.force;
    const now = Date.now();
    if (!force && systemUpdateCheckAt && now - systemUpdateCheckAt < 60000) {
      renderSystemUpdatePanel();
      return;
    }

    systemUpdateCheckAt = now;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/update/check', {}, 20000);
      if (res && typeof res === 'object') systemUpdateCheckCache = res;
    } catch (e) {
      systemUpdateCheckCache = {
        ok: true,
        channel: '-',
        installed: { tag: '-' },
        available: null,
        update_available: false,
        error: e && e.message ? e.message : String(e),
      };
    } finally {
      renderSystemUpdatePanel();
    }
  }

  async function applySystemUpdate() {
    if (btnUpdateApply && btnUpdateApply.disabled) return;
    if (!confirm('Apply system update now?')) return;
    if (btnUpdateApply) btnUpdateApply.disabled = true;
    if (btnUpdateCheck) btnUpdateCheck.disabled = true;

    try {
      const ok = await ensureHealthy();
      if (!ok) throw new Error('System service unavailable');
      const ch = systemUpdateCheckCache && systemUpdateCheckCache.channel ? String(systemUpdateCheckCache.channel) : '';
      const res = await apiJsonTimeout(
        '/api/v0/system/update/apply',
        { method: 'POST', body: JSON.stringify({ channel: ch }) },
        60000,
      );
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'Update did not start');
      showToast('Update started', null);
      await refreshSystemUpdateStatus();
      scheduleSystemUpdatePoll(1200);
    } catch (e) {
      showToast('Update failed', 'error');
      alert(`Update failed: ${e && e.message ? e.message : e}`);
    } finally {
      renderSystemUpdatePanel();
    }
  }

  async function refreshStore() {
    if (refreshStoreInFlight) return;
    refreshStoreInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      hasLoadedStore = true;
      const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
      const ch = String(activeStoreChannel || 'main').toLowerCase();
      const storeRes = await apiJsonTimeout(`/api/v0/store/apps?channel=${encodeURIComponent(ch)}`, {}, 15000).catch(
        () => null,
      );

      if (!storeRes || storeRes.ok !== true) {
        storeLastOk = false;
        storeLastError = storeRes && (storeRes.error || storeRes.stderr) ? String(storeRes.error || storeRes.stderr) : 'Unable to load store.';
        storeAppsCache = [];
        syncStoreCategoryOptions(storeAppsCache);
        renderStore(storeAppsCache, installedSet);
        return;
      }

      storeLastOk = true;
      storeLastError = '';
      storeAppsCache = Array.isArray(storeRes.apps) ? storeRes.apps : [];
      for (const app of storeAppsCache) {
        if (!app || typeof app !== 'object') continue;
        if (!app.id) continue;
        storeById.set(app.id, app);
      }
      syncStoreCategoryOptions(storeAppsCache);
      renderStore(storeAppsCache, installedSet);
      renderWidgetSettings();
    } finally {
      refreshStoreInFlight = false;
    }
  }

  async function syncStoreNow() {
    if (!btnStoreSync) return;
    if (btnStoreSync.disabled) return;
    const ch = String(activeStoreChannel || 'main').toLowerCase();
    btnStoreSync.disabled = true;
    const prev = btnStoreSync.textContent;
    btnStoreSync.textContent = 'Syncing...';
    try {
      await ensureHealthy();
      await apiJsonTimeout(
        '/api/v0/store/sync',
        { method: 'POST', body: JSON.stringify({ channel: ch }) },
        900000,
      );
      showToast('Store synced', null);
      await refreshStore();
    } catch (err) {
      showToast('Store sync failed', 'error');
      alert(`Sync failed: ${err && err.message ? err.message : err}`);
    } finally {
      btnStoreSync.disabled = false;
      btnStoreSync.textContent = prev;
    }
  }

  async function refreshInstalled() {
    if (refreshInstalledInFlight) return;
    refreshInstalledInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const installedRes = await apiJsonTimeout('/api/v0/apps/installed', {}, 25000);
      const installed = (installedRes && installedRes.apps) || [];
      hasLoadedInstalled = true;
      saveInstalledCache(installed);
      applyInstalled(installed);
    } catch {
      if (!hasLoadedInstalled && installedEmptyEl) {
        installedEmptyEl.style.display = 'block';
        installedEmptyEl.textContent = 'Unable to load apps. Open the App Store and Sync to retry.';
      }
      setStatus('Degraded');
    } finally {
      refreshInstalledInFlight = false;
    }
  }

  async function refreshWidgets() {
    if (refreshWidgetsInFlight) return;
    refreshWidgetsInFlight = true;
    if (btnWidgetsRefresh) btnWidgetsRefresh.disabled = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const widgetsRes = await apiJsonTimeout('/api/v0/apps/widgets', {}, 5000).catch(() => null);
      if (!widgetsRes || widgetsRes.ok !== true) return;
      hasLoadedWidgets = true;
      lastWidgets = widgetsRes;
      renderDashboardWidgets(lastWidgets);
      setWidgetsUpdated(widgetsRes.time);
    } finally {
      if (btnWidgetsRefresh) btnWidgetsRefresh.disabled = false;
      refreshWidgetsInFlight = false;
    }
  }

  async function refresh() {
    setHostIp();

    if (!hasLoadedInstalled && installedEmptyEl) installedEmptyEl.textContent = 'Loading apps...';
    if (!hasLoadedWidgets && dashboardWidgetsEmptyEl) dashboardWidgetsEmptyEl.textContent = 'Loading widgets...';

    if (!lastMetrics) setMetricsPlaceholder();

    const ok = await ensureHealthy();
    if (!ok) return;

    await Promise.allSettled([refreshInstalled(), refreshStore(), refreshMetrics(), refreshWidgets()]);
  }

  function openInstalledAppMenu(app, x, y) {
    const id = String(app && app.id ? app.id : '').trim();
    if (!id) return;
    selectedAppId = id;
    syncInstalledSelection();

    const installed = installedById.get(id) || null;
    const isVirtual = !!(installed && installed.virtual === true);
    const status = installed ? String(installed.status || '').toLowerCase() : String(app.status || '').toLowerCase();
    const isRunning = status === 'running';
    const isOpen = isAppOpen(id);
    const launchable = isAppLaunchable(id);

    if (isVirtual) {
      const items = [
        {
          label: id === 'umbrel-store' ? 'Open Umbrel Store' : 'Open',
          onClick: async () => {
            if (id === 'umbrel-store') {
              setView('store');
              setStoreChannel('umbrel');
              return;
            }
            ensureAppOpen({ id });
          },
        },
        { type: 'sep' },
        {
          label: 'Disable',
          danger: true,
          onClick: async () => {
            const label = metaFor(id).name || id;
            if (!confirm(`Disable ${label}?`)) return;
            await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/uninstall`, { method: 'POST', body: '{}' });
            await refresh();
          },
        },
      ];

      openContextMenu(items, x, y);
      return;
    }

    const items = [
      {
        label: isOpen ? 'Hide from workspace' : 'Open',
        disabled: !launchable && !isOpen,
        hint: !launchable && !isOpen ? 'Start the app first' : '',
        onClick: async () => {
          if (isOpen) {
            openAppIds = openAppIds.filter((v) => v !== id);
            saveOpenApps();
            renderWorkspace();
            syncInstalledSelection();
            return;
          }
          ensureAppOpen({ id });
        },
      },
      { type: 'sep' },
      {
        label: 'Start',
        disabled: isRunning || pendingAppActions.has(id),
        onClick: async () => runAppAction(id, 'up'),
      },
      {
        label: 'Restart',
        disabled: pendingAppActions.has(id),
        onClick: async () => runAppAction(id, 'restart'),
      },
      {
        label: 'Stop',
        danger: true,
        disabled: !isRunning || pendingAppActions.has(id),
        onClick: async () => runAppAction(id, 'down'),
      },
    ];

    openContextMenu(items, x, y);
  }

  function renderInstalledApps(apps) {
    installedAppsEl.innerHTML = '';
    if (!apps || apps.length === 0) {
      installedEmptyEl.style.display = 'block';
      return;
    }

    installedEmptyEl.style.display = 'none';

    for (const app of apps) {
      const meta = metaFor(app.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.appId = app.id || '';
      const launchable = isLaunchableStatus(app.status) && !pendingAppActions.has(app.id);
      const statusClass = isLaunchableStatus(app.status) ? ' forgeos-app-item--running' : ' forgeos-app-item--stopped';
      btn.className = `forgeos-app-item${statusClass}${!launchable ? ' forgeos-app-item--inactive' : ''}${selectedAppId && app.id === selectedAppId ? ' forgeos-app-item--active' : ''}`;
      btn.setAttribute('role', 'listitem');
      btn.addEventListener('click', () => toggleAppOpen(app));
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openInstalledAppMenu(app, e.clientX, e.clientY);
      });

      const top = document.createElement('div');
      top.className = 'forgeos-app-item__top';

      const brand = document.createElement('div');
      brand.className = 'forgeos-app-item__brand';

      const right = document.createElement('div');
      right.className = 'forgeos-app-item__right';

      const logo = document.createElement('img');
      logo.className = 'forgeos-app-item__logo';
      logo.alt = '';
      if (meta.logo) logo.src = meta.logo;

      const nameWrap = document.createElement('div');
      nameWrap.className = 'forgeos-app-item__name-wrap';

      const name = document.createElement('div');
      name.className = 'forgeos-app-item__name';
      name.textContent = meta.name || app.name || app.id;

      const sub = document.createElement('div');
      sub.className = 'forgeos-app-item__sub';

      const res = app.resources || null;
      if (res && typeof res === 'object') {
        const cpu = Number(res.cpu_perc);
        const mem = Number(res.mem_used_bytes);
        const cpuText = Number.isFinite(cpu) ? `CPU ${cpu.toFixed(cpu < 10 ? 2 : 1)}%` : null;
        const memText = Number.isFinite(mem) ? `MEM ${formatBytes(mem)}` : null;
        const metricsText = [cpuText, memText].filter(Boolean).join(' • ');
        sub.textContent = metricsText || meta.desc || 'Open';
      } else {
        sub.textContent = meta.desc || 'Open';
      }

      const pill = document.createElement('span');
      pill.className = 'axe-pill';
      pill.textContent = app.status || 'Installed';
      right.appendChild(pill);

      nameWrap.appendChild(name);
      nameWrap.appendChild(sub);
      brand.appendChild(logo);
      brand.appendChild(nameWrap);

      top.appendChild(brand);
      top.appendChild(right);

      btn.appendChild(top);
      installedAppsEl.appendChild(btn);
    }
  }

	  function renderDashboardApps(apps) {
	    if (!dashboardAppsEl) return;
	    dashboardAppsEl.innerHTML = '';

    const list = Array.isArray(apps) ? apps : [];
    if (dashboardAppsEmptyEl) dashboardAppsEmptyEl.style.display = list.length ? 'none' : 'block';
    if (!list.length) return;

    for (const app of list) {
      const meta = metaFor(app.id);

      const row = document.createElement('div');
      row.className = 'forgeos-app-item forgeos-dashboard-app forgeos-dashboard-app--static';
      row.setAttribute('role', 'listitem');

      const top = document.createElement('div');
      top.className = 'forgeos-app-item__top';

      const brand = document.createElement('div');
      brand.className = 'forgeos-app-item__brand';

      const logo = document.createElement('img');
      logo.className = 'forgeos-app-item__logo';
      logo.alt = '';
      if (meta.logo) logo.src = meta.logo;

      const left = document.createElement('div');
      left.className = 'forgeos-app-item__name-wrap';

      const name = document.createElement('div');
      name.className = 'forgeos-app-item__name';
      name.textContent = meta.name || app.name || app.id;

      const sub = document.createElement('div');
      sub.className = 'forgeos-app-item__sub';

      const res = app.resources || null;
      if (res && typeof res === 'object') {
        const cpu = Number(res.cpu_perc);
        const mem = Number(res.mem_used_bytes);
        const memLimit = Number(res.mem_limit_bytes);
        const cpuText = Number.isFinite(cpu) ? `CPU ${cpu.toFixed(cpu < 10 ? 2 : 1)}%` : null;
        const memText = Number.isFinite(mem) ? `Mem ${formatBytes(mem)}${Number.isFinite(memLimit) && memLimit > 0 ? ` / ${formatBytes(memLimit)}` : ''}` : null;
        sub.textContent = [cpuText, memText].filter(Boolean).join(' \u2022 ') || meta.desc || 'Installed';
      } else {
        sub.textContent = meta.desc || 'Installed';
      }

      left.appendChild(name);
      left.appendChild(sub);

      brand.appendChild(logo);
      brand.appendChild(left);

      const pill = document.createElement('span');
      pill.className = 'axe-pill';
      pill.textContent = app.status || 'Installed';

      top.appendChild(brand);
      top.appendChild(pill);
      row.appendChild(top);

      dashboardAppsEl.appendChild(row);
    }
  }

  function renderWidgetSettings() {
    if (!settingsWidgetsEl) return;
    settingsWidgetsEl.innerHTML = '';

    const apps = Array.isArray(installedAppsCache) ? installedAppsCache : [];
    const widgetApps = apps.filter((a) => {
      if (!a || typeof a !== 'object') return false;
      const id = String(a.id || '').trim();
      if (!id) return false;
      const meta = storeById.get(id);
      if (!meta || typeof meta !== 'object') return false;
      const w = meta.widgets;
      return Array.isArray(w) && w.length > 0;
    });

    if (settingsWidgetsEmptyEl) settingsWidgetsEmptyEl.style.display = widgetApps.length ? 'none' : 'block';
    if (!widgetApps.length) return;

    for (const app of widgetApps) {
      const id = String(app.id || '').trim();
      const meta = metaFor(id);
      const label = document.createElement('label');
      label.className = 'forgeos-toggle';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = isWidgetEnabled(id);
      input.addEventListener('change', () => {
        setWidgetEnabled(id, input.checked);
        refreshWidgets().catch(() => {});
      });

      const text = document.createElement('span');
      text.textContent = meta.name || id;

      label.appendChild(input);
      label.appendChild(text);
      settingsWidgetsEl.appendChild(label);
    }
  }

  function renderDashboardWidgets(payload) {
    if (!dashboardWidgetsEl) return;
    dashboardWidgetsEl.innerHTML = '';

    const apps = payload && payload.ok === true && Array.isArray(payload.apps) ? payload.apps : [];
    const widgets = [];
    for (const app of apps) {
      if (!app || typeof app !== 'object') continue;
      const appId = String(app.id || '').trim();
      if (!appId) continue;
      if (!isWidgetEnabled(appId)) continue;
      const appName = String(app.name || metaFor(appId).name || appId);
      const list = Array.isArray(app.widgets) ? app.widgets : [];
      for (const w of list) {
        if (!w || typeof w !== 'object') continue;
        widgets.push({ appId, appName, widget: w });
      }
    }

	    if (dashboardWidgetsEmptyEl) dashboardWidgetsEmptyEl.style.display = widgets.length ? 'none' : 'block';
	    if (!widgets.length) return;

	    for (const entry of widgets) {
	      const w = entry.widget || {};
	      const ok = w.ok === true;
	      const type = String(w.type || '').trim();
	      const id = String(w.id || '').trim() || 'widget';
	      const data = w.data && typeof w.data === 'object' ? w.data : null;

	      const card = document.createElement('div');
	      card.className = 'forgeos-widget';
	      if (!ok && w.error) card.title = String(w.error);

	      const top = document.createElement('div');
	      top.className = 'forgeos-widget__top';

	      const left = document.createElement('div');

	      const appLine = document.createElement('div');
	      appLine.className = 'forgeos-widget__app';
	      appLine.textContent = entry.appName;

	      const title = document.createElement('div');
	      title.className = 'forgeos-widget__title';
	      title.textContent = (data && data.title ? String(data.title) : id).trim() || id;

	      left.appendChild(appLine);
	      left.appendChild(title);

	      const pill = document.createElement('span');
	      pill.className = 'axe-pill';
	      pill.textContent = ok ? 'live' : 'offline';

	      top.appendChild(left);
	      top.appendChild(pill);
	      card.appendChild(top);

	      if (type === 'text-with-progress') {
	        const value = document.createElement('div');
	        value.className = 'forgeos-widget__value';
	        value.textContent = ok && data && data.text != null ? String(data.text) : '-';
	        card.appendChild(value);

	        const hint = document.createElement('div');
	        hint.className = 'forgeos-widget__hint';
	        hint.textContent = ok && data && data.progressLabel ? String(data.progressLabel) : ok ? '' : 'Not running';
	        if (hint.textContent) card.appendChild(hint);

	        const progress = ok && data && typeof data.progress === 'number' ? data.progress : null;
	        if (typeof progress === 'number' && Number.isFinite(progress)) {
	          const bar = document.createElement('div');
	          bar.className = 'forgeos-widget__bar';
	          const fill = document.createElement('div');
	          fill.className = 'forgeos-widget__bar-fill';
	          const pct = Math.max(0, Math.min(1, progress));
	          fill.style.width = `${Math.round(pct * 100)}%`;
	          bar.appendChild(fill);
	          card.appendChild(bar);
	        }
	      } else if (type === 'three-stats') {
	        const items = ok && data && Array.isArray(data.items) ? data.items : [];
	        if (items.length) {
	          const grid = document.createElement('div');
	          grid.className = 'forgeos-widget__stats';
	          for (const item of items.slice(0, 3)) {
	            if (!item || typeof item !== 'object') continue;
	            const stat = document.createElement('div');
	            stat.className = 'forgeos-widget__stat';

	            const t = document.createElement('div');
	            t.className = 'forgeos-widget__stat-title';
	            t.textContent = String(item.title || '').trim() || '-';

	            const txt = document.createElement('div');
	            txt.className = 'forgeos-widget__stat-text';
	            txt.textContent = String(item.text || '').trim() || '-';

	            stat.appendChild(t);
	            stat.appendChild(txt);

	            if (item.subtext) {
	              const sub = document.createElement('div');
	              sub.className = 'forgeos-widget__stat-subtext';
	              sub.textContent = String(item.subtext);
	              stat.appendChild(sub);
	            }

	            grid.appendChild(stat);
	          }
	          card.appendChild(grid);
	        } else {
	          const hint = document.createElement('div');
	          hint.className = 'forgeos-widget__hint';
	          hint.textContent = ok ? '' : 'Not running';
	          if (hint.textContent) card.appendChild(hint);
	        }
	      } else {
	        const hint = document.createElement('div');
	        hint.className = 'forgeos-widget__hint';
	        hint.textContent = ok ? 'Widget online' : 'Not running';
	        card.appendChild(hint);
	      }

	      dashboardWidgetsEl.appendChild(card);
	    }
	  }

	  function renderStore(storeApps, installedSet) {
	    const storeEl = document.getElementById('store-list');
	    if (!storeEl) return;

    storeEl.innerHTML = '';

    const channel = String(activeStoreChannel || 'main').toLowerCase();
    const hasStoreApps = Array.isArray(storeApps) && storeApps.length > 0;

    if (!hasLoadedStore && !hasStoreApps) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'Loading store…';
      storeEl.appendChild(empty);
      return;
    }

    if (!hasStoreApps && channel === 'umbrel' && hasLoadedStore && !storeLastOk) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-store-item';
      empty.style.gridColumn = '1 / -1';
      empty.style.cursor = 'default';

      const title = document.createElement('div');
      title.className = 'text-lg font-extrabold tracking-tight';
      title.textContent = 'Umbrel store not synced';

      const sub = document.createElement('div');
      sub.className = 'mt-2 text-sm text-slate-300';
      sub.textContent = storeLastError ? `Error: ${storeLastError}` : 'Click Sync to download the Umbrel store index.';

      const actions = document.createElement('div');
      actions.className = 'forgeos-store-item__actions';

      const btn = document.createElement('button');
      btn.className = 'axe-btn';
      btn.type = 'button';
      btn.textContent = 'Sync Umbrel store';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        syncStoreNow().catch(() => {});
      });

      actions.appendChild(btn);
      empty.appendChild(title);
      empty.appendChild(sub);
      empty.appendChild(actions);
      storeEl.appendChild(empty);
      return;
    }

    const entries = hasStoreApps
      ? storeApps
          .map((a) => (a && typeof a === 'object' ? String(a.id || '').trim() : String(a || '').trim()))
          .filter(Boolean)
      : channel !== 'umbrel'
        ? Object.keys(APP_CATALOG)
        : [];

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'No apps found.';
      storeEl.appendChild(empty);
      return;
    }

    if (hasLoadedStore && !storeLastOk && storeLastError && channel !== 'umbrel') {
      const notice = document.createElement('div');
      notice.className = 'forgeos-muted';
      notice.style.gridColumn = '1 / -1';
      notice.textContent = `Store not synced (${storeLastError}). Showing built-in catalog.`;
      storeEl.appendChild(notice);
    }

    const ids = entries.slice().sort((a, b) => {
      const ma = metaFor(a);
      const mb = metaFor(b);
      return String(ma.name || a).localeCompare(String(mb.name || b), undefined, { sensitivity: 'base' });
    });

    const q = (storeQuery || '').trim().toLowerCase();
    const visibleIds = q
      ? ids.filter((id) => {
          const meta = metaFor(id);
          const hay = `${id} ${meta.name || ''} ${meta.desc || ''} ${meta.tag || ''}`.toLowerCase();
          return hay.includes(q);
        })
      : ids;

    const cat = channel === 'umbrel' ? String(storeCategory || '').trim() : '';
    const categoryIds = cat
      ? visibleIds.filter((id) => {
          const meta = metaFor(id);
          return String(meta.tag || '').trim() === cat;
        })
      : visibleIds;

    const filteredIds =
      storeHideInstalled && installedSet ? categoryIds.filter((id) => !installedSet.has(id)) : categoryIds;

    const pagedIds = filteredIds.slice(0, Math.max(STORE_RENDER_STEP, storeRenderLimit || 0));

    if (!filteredIds.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.style.gridColumn = '1 / -1';
      empty.textContent = 'No apps match your search.';
      storeEl.appendChild(empty);
      return;
    }

	    for (const id of pagedIds) {
	      const meta = metaFor(id);
	      const installed = installedById.get(id) || null;
	      const isInstalled = installedSet && installedSet.has(id);
	      const updateAvailable =
	        !!(
	          installed &&
	          (installed.update_available === true ||
	            (installed.update && typeof installed.update === 'object' && installed.update.available === true))
	        );
	      const isInstallable = !!meta.installable;

      const card = document.createElement('div');
      card.className = 'forgeos-store-item';
      card.dataset.appId = id;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.addEventListener('click', () => openStoreModal(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openStoreModal(id);
        }
      });

      const top = document.createElement('div');
      top.className = 'forgeos-store-item__top';

      const brand = document.createElement('div');
      brand.className = 'forgeos-store-item__brand';

      const logo = document.createElement('img');
      logo.className = 'forgeos-store-item__logo';
      logo.alt = `${meta.name || id} logo`;
      if (meta.logo) logo.src = meta.logo;
      logo.loading = 'lazy';

      const nameWrap = document.createElement('div');
      nameWrap.className = 'forgeos-store-item__name-wrap';

      const name = document.createElement('div');
      name.className = 'forgeos-store-item__name';
      name.textContent = meta.name || id;

      const idLine = document.createElement('div');
      idLine.className = 'forgeos-muted forgeos-mono';
      idLine.textContent = id;
      idLine.style.fontSize = '11px';

      nameWrap.appendChild(name);
      nameWrap.appendChild(idLine);

      brand.appendChild(logo);
      brand.appendChild(nameWrap);

	      const pill = document.createElement('span');
	      pill.className = 'axe-pill';
	      if (isInstalled) {
	        pill.textContent = updateAvailable ? 'Update available' : 'Installed';
	        if (updateAvailable) pill.classList.add('forgeos-pill--update');
	      } else {
	        pill.textContent = isInstallable ? meta.tag || 'App' : 'Coming soon';
	      }

      top.appendChild(brand);
      top.appendChild(pill);

      const desc = document.createElement('div');
      desc.className = 'forgeos-store-item__desc';
      desc.textContent = meta.desc || '';

      card.appendChild(top);
      card.appendChild(desc);

	      if (isInstalled) {
	        const actions = document.createElement('div');
	        actions.className = 'forgeos-store-item__actions';

	        const btnOpen = document.createElement('button');
	        btnOpen.className = 'axe-btn';
	        btnOpen.type = 'button';
	        btnOpen.textContent = 'Open';
          btnOpen.disabled = !isAppLaunchable(id);
          if (btnOpen.disabled) btnOpen.title = 'Start the app to open it';
	        btnOpen.addEventListener('click', (e) => {
	          e.stopPropagation();
	          openApp({ id, name: meta.name });
	        });

	        actions.appendChild(btnOpen);
	        card.appendChild(actions);
	      } else if (isInstallable) {
	        const actions = document.createElement('div');
	        actions.className = 'forgeos-store-item__actions';

        const btnInstall = document.createElement('button');
        btnInstall.className = 'axe-btn';
        btnInstall.type = 'button';
        btnInstall.textContent = 'Install';
        btnInstall.addEventListener('click', async (e) => {
          e.stopPropagation();
          startProgress(id, 'install');
          btnInstall.disabled = true;
          try {
            await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/install`, {
              method: 'POST',
              body: JSON.stringify({ channel: meta.channel || 'main' }),
            });
            await apiAppAction(id, 'up');
            await refresh();
            openApp({ id, name: meta.name });
            finishProgress(id);
          } catch (err) {
            cancelProgress(id);
            alert(`Install failed: ${err && err.message ? err.message : err}`);
            btnInstall.disabled = false;
          }
        });

	        actions.appendChild(btnInstall);
	        card.appendChild(actions);
	      }

      storeEl.appendChild(card);

      if (appProgress.has(id)) updateProgressDom(id);
    }

    if (filteredIds.length > pagedIds.length) {
      const remaining = filteredIds.length - pagedIds.length;
      const more = document.createElement('div');
      more.className = 'forgeos-store-item forgeos-store-loadmore';
      more.style.gridColumn = '1 / -1';
      more.style.cursor = 'default';

      const btnMore = document.createElement('button');
      btnMore.className = 'axe-btn';
      btnMore.type = 'button';
      btnMore.textContent = `Load more (${remaining})`;
      btnMore.addEventListener('click', (e) => {
        e.stopPropagation();
        storeRenderLimit = pagedIds.length + STORE_RENDER_STEP;
        renderStore(storeApps, installedSet);
      });

      more.appendChild(btnMore);
      storeEl.appendChild(more);
    }
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    modalEl.setAttribute('aria-hidden', 'true');
    if (modalBodyEl) modalBodyEl.innerHTML = '';
    document.body.style.overflow = '';
  }

  function formatUptime(seconds) {
    const s = Number(seconds);
    if (!Number.isFinite(s) || s < 0) return '-';
    const total = Math.floor(s);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h <= 0) return `${m}m`;
    return `${h}h ${m}m`;
  }

  function formatInfoText(value) {
    const raw = String(value || '').replace(/\r\n/g, '\n').trim();
    if (!raw) return '';

    // Umbrel descriptions sometimes use " - " as bullet separators in a single paragraph.
    if (!raw.includes('\n')) {
      const parts = raw
        .split(' - ')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 3) {
        const [head, ...rest] = parts;
        return [head, '', ...rest.map((p) => `• ${p}`)].join('\n');
      }
    }

    return raw;
  }

  function openMetricsModal() {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    modalTitleEl.textContent = 'Metrics';
    modalBodyEl.innerHTML = '';

    const metrics = lastMetrics && lastMetrics.ok === true ? lastMetrics : null;

    const grid = document.createElement('div');
    grid.className = 'forgeos-grid';

    const sys = document.createElement('div');
    sys.className = 'forgeos-mini-card';

    const sysK = document.createElement('div');
    sysK.className = 'forgeos-mini-card__k';
    sysK.textContent = 'System';

    const sysV = document.createElement('div');
    sysV.className = 'forgeos-mini-card__v forgeos-mono';

    if (metrics) {
      const cpu = metrics.cpu || {};
      const cores = Number(cpu.cores) || 1;
      const load1 = Number(cpu.load1) || 0;
      const cpuPct = Math.max(0, Math.round((load1 / cores) * 100));

      const mem = metrics.memory || {};
      const total = Number(mem.total_bytes) || 0;
      const used = Number(mem.used_bytes) || 0;
      const memPct = total > 0 ? Math.max(0, Math.round((used / total) * 100)) : 0;

      const disks = Array.isArray(metrics.disks) ? metrics.disks : [];
      const preferred =
        disks.find((d) => d && d.path === '/srv/forgeos-data') || disks.find((d) => d && d.path === '/') || null;
      const diskText = preferred
        ? `${preferred.path} ${Math.round((Number(preferred.used_bytes || 0) / Math.max(1, Number(preferred.total_bytes || 0))) * 100)}%`
        : '-';

      sysV.textContent = `CPU ${cpuPct}% · MEM ${memPct}% · DISK ${diskText} · UPTIME ${formatUptime(metrics.uptime_s)}`;
    } else {
      sysV.textContent = 'No metrics yet.';
    }

    sys.appendChild(sysK);
    sys.appendChild(sysV);
    grid.appendChild(sys);

    const apps = document.createElement('div');
    apps.className = 'forgeos-mini-card';

    const appsK = document.createElement('div');
    appsK.className = 'forgeos-mini-card__k';
    appsK.textContent = 'Apps';

    const appsV = document.createElement('div');
    appsV.className = 'forgeos-mini-card__v';

    const list = document.createElement('div');
    list.className = 'flex flex-col gap-2';

    const items = Array.isArray(installedAppsCache) ? installedAppsCache : [];
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.textContent = 'No installed apps.';
      list.appendChild(empty);
    } else {
      for (const app of items) {
        const meta = metaFor(app.id);
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-3';

        const left = document.createElement('div');
        left.className = 'min-w-0';

        const name = document.createElement('div');
        name.className = 'font-semibold truncate';
        name.textContent = meta.name || app.id;

        const sub = document.createElement('div');
        sub.className = 'forgeos-muted';

        const res = app.resources || null;
        const cpu = res ? Number(res.cpu_perc) : NaN;
        const mem = res ? Number(res.mem_used_bytes) : NaN;
        sub.textContent = [
          app.status ? String(app.status) : null,
          Number.isFinite(cpu) ? `CPU ${cpu.toFixed(cpu < 10 ? 2 : 1)}%` : null,
          Number.isFinite(mem) ? `Mem ${formatBytes(mem)}` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        left.appendChild(name);
        left.appendChild(sub);

        const right = document.createElement('span');
        right.className = 'axe-pill';
        right.textContent = app.status || 'installed';

        row.appendChild(left);
        row.appendChild(right);
        list.appendChild(row);
      }
    }

    appsV.appendChild(list);
    apps.appendChild(appsK);
    apps.appendChild(appsV);
    grid.appendChild(apps);

    modalBodyEl.appendChild(grid);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openPowerModal() {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    modalTitleEl.textContent = 'Power';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-power';

    const desc = document.createElement('div');
    desc.className = 'text-sm text-slate-300';
    desc.textContent = 'System actions for this 5tratumOS host.';

    const actions = document.createElement('div');
    actions.className = 'forgeos-power__actions';

    function addBtn(label, onClick, variant) {
      const b = document.createElement('button');
      b.className = `axe-btn${variant ? ` ${variant}` : ''}`;
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', onClick);
      actions.appendChild(b);
    }

    async function doPower(action) {
      const act = String(action || '').trim().toLowerCase();
      const label = act === 'reboot' ? 'Restart' : act === 'shutdown' ? 'Shutdown' : 'Power';
      const msg =
        act === 'reboot'
          ? 'Restart this 5tratumOS host now?'
          : act === 'shutdown'
            ? 'Shut down this 5tratumOS host now?'
            : 'Run power action?';

      if (!confirm(msg)) return;
      try {
        await apiJson('/api/v0/system/power', { method: 'POST', body: JSON.stringify({ action: act }) });
        closeModal();
        setStatus(act === 'reboot' ? 'Restarting…' : 'Shutting down…');
        showToast(`${label} requested`, null);
      } catch (e) {
        showToast('Power action failed', 'error');
        alert(`Power action failed: ${e && e.message ? e.message : e}`);
      }
    }

    addBtn('Refresh UI', () => {
      closeModal();
      refresh().catch(() => {});
    });

    addBtn('Restart', () => doPower('reboot'));
    addBtn('Shutdown', () => doPower('shutdown'), 'forgeos-btn--danger');

    addBtn('Lock', async () => {
      try {
        await apiJson('/api/v0/auth/logout', { method: 'POST', body: '{}' });
      } catch {}
      window.location.href = '/login.html?next=/';
    });

    wrap.appendChild(desc);
    wrap.appendChild(actions);
    modalBodyEl.appendChild(wrap);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openTerminalModal() {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    modalTitleEl.textContent = 'Terminal';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-terminal';

    const desc = document.createElement('div');
    desc.className = 'text-sm text-slate-300';
    desc.textContent = 'Run forgeos commands on this host (Ctrl+Enter to run).';

    const form = document.createElement('div');
    form.className = 'forgeos-terminal__form';

    const input = document.createElement('textarea');
    input.className = 'forgeos-terminal__input';
    input.rows = 2;
    input.placeholder = 'forgeos store sync umbrel';
    input.value = 'forgeos app installed';

    const actions = document.createElement('div');
    actions.className = 'forgeos-terminal__actions';

    const btnRun = document.createElement('button');
    btnRun.className = 'axe-btn';
    btnRun.type = 'button';
    btnRun.textContent = 'Run';

    const btnClear = document.createElement('button');
    btnClear.className = 'axe-btn';
    btnClear.type = 'button';
    btnClear.textContent = 'Clear';

    const output = document.createElement('pre');
    output.className = 'forgeos-terminal__output';
    output.textContent = '';

    async function run() {
      const cmd = String(input.value || '').trim();
      if (!cmd) return;
      btnRun.disabled = true;
      const prev = btnRun.textContent;
      btnRun.textContent = 'Running...';
      output.textContent = `$ ${cmd}\n`;
      try {
        const res = await apiJsonTimeout(
          '/api/v0/terminal/run',
          { method: 'POST', body: JSON.stringify({ cmd }) },
          900000,
        );
        const stdout = res && res.stdout ? String(res.stdout) : '';
        const stderr = res && res.stderr ? String(res.stderr) : '';
        const code = res && typeof res.code === 'number' ? res.code : null;
        const joined = [stdout.trimEnd(), stderr.trimEnd()].filter(Boolean).join('\n');
        output.textContent += joined || '(no output)';
        if (res && res.ok === false) output.textContent += `\n(exit ${code ?? 'error'})`;
      } catch (e) {
        output.textContent += `Error: ${e && e.message ? e.message : e}`;
      } finally {
        btnRun.disabled = false;
        btnRun.textContent = prev;
      }
    }

    btnRun.addEventListener('click', run);
    btnClear.addEventListener('click', () => {
      output.textContent = '';
      input.focus();
    });
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    });

    actions.appendChild(btnRun);
    actions.appendChild(btnClear);
    form.appendChild(input);
    form.appendChild(actions);

    wrap.appendChild(desc);
    wrap.appendChild(form);
    wrap.appendChild(output);
    modalBodyEl.appendChild(wrap);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => input.focus(), 50);
  }

  function openStoreModal(appId) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    const id = String(appId || '').trim();
    if (!id) return;

    const meta = metaFor(id);
    const installed = installedById.get(id) || null;
    const isInstalled = !!installed;
    const status = installed ? installed.status || 'installed' : 'not-installed';
    const isInstallable = !!meta.installable;

	    modalTitleEl.textContent = meta.name || id;
	    modalBodyEl.innerHTML = '';

	    const updateAvailable =
	      !!(
	        installed &&
	        (installed.update_available === true ||
	          (installed.update && typeof installed.update === 'object' && installed.update.available === true))
	      );
	    const installedVersion = isInstalled ? String(installed.installed_version || '') : '';
	    const latestVersion = String(installed.latest_version || meta.version || '');

	    const layout = document.createElement('div');
	    layout.className = 'forgeos-modal__layout';

	    const shotsWrap = document.createElement('div');
	    shotsWrap.className = 'forgeos-modal__shots';

	    const shots = Array.isArray(meta.screenshots) && meta.screenshots.length ? meta.screenshots : [makeShot(meta.name || id, meta.desc || 'Preview')];

    const mainShot = document.createElement('img');
    mainShot.className = 'forgeos-modal__shot';
    mainShot.alt = `${meta.name || id} preview`;
    mainShot.src = shots[0];
    mainShot.loading = 'lazy';
    shotsWrap.appendChild(mainShot);

    if (shots.length > 1) {
      const thumbs = document.createElement('div');
      thumbs.className = 'forgeos-modal__thumbs';
      shots.forEach((src, idx) => {
        const t = document.createElement('img');
        t.className = `forgeos-modal__thumb${idx === 0 ? ' forgeos-modal__thumb--active' : ''}`;
        t.alt = `${meta.name || id} preview ${idx + 1}`;
        t.src = src;
        t.loading = 'lazy';
        t.addEventListener('click', (e) => {
          e.stopPropagation();
          mainShot.src = src;
          Array.from(thumbs.children).forEach((c, i) => {
            if (!(c instanceof HTMLElement)) return;
            c.classList.toggle('forgeos-modal__thumb--active', i === idx);
          });
        });
        thumbs.appendChild(t);
      });
	      shotsWrap.appendChild(thumbs);
	    }

	    const content = document.createElement('div');
	    content.className = 'forgeos-modal__content';

	    const infoPanel = document.createElement('div');
	    infoPanel.className = 'forgeos-modal__info';

	    const infoTop = document.createElement('div');
	    infoTop.className = 'forgeos-modal__info-top';

	    const infoTitle = document.createElement('div');
	    infoTitle.className = 'forgeos-modal__info-title';
	    infoTitle.textContent = 'Details';

	    const infoSub = document.createElement('div');
	    infoSub.className = 'forgeos-modal__info-sub';
	    infoSub.textContent = meta.tagline || '';

	    infoTop.appendChild(infoTitle);
	    if (infoSub.textContent) infoTop.appendChild(infoSub);
	    infoPanel.appendChild(infoTop);

	    const infoText = document.createElement('div');
	    infoText.className = 'forgeos-modal__info-text';
	    infoText.textContent = formatInfoText(meta.longDesc || meta.desc || '');
	    infoPanel.appendChild(infoText);

	    const metaPanel = document.createElement('div');
	    metaPanel.className = 'forgeos-modal__meta';

    const metaTop = document.createElement('div');
    metaTop.className = 'forgeos-modal__meta-top';

    const logo = document.createElement('img');
    logo.className = 'forgeos-modal__meta-logo';
    logo.alt = `${meta.name || id} logo`;
    if (meta.logo) logo.src = meta.logo;
    logo.loading = 'lazy';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'min-w-0';

    const title = document.createElement('div');
    title.className = 'text-lg font-extrabold tracking-tight';
    title.textContent = meta.name || id;

    const pills = document.createElement('div');
    pills.className = 'mt-1 flex flex-wrap items-center gap-2';

    const tagPill = document.createElement('span');
    tagPill.className = 'axe-pill';
    tagPill.textContent = meta.tag || 'App';

    const statusPill = document.createElement('span');
    statusPill.className = 'axe-pill';
    statusPill.textContent = status;

	    pills.appendChild(tagPill);
	    pills.appendChild(statusPill);
	    if (updateAvailable) {
	      const updatePill = document.createElement('span');
	      updatePill.className = 'axe-pill forgeos-pill--update';
	      updatePill.textContent = 'Update available';
	      pills.appendChild(updatePill);
	    }

	    titleWrap.appendChild(title);
	    titleWrap.appendChild(pills);

	    metaTop.appendChild(logo);
	    metaTop.appendChild(titleWrap);

	    const details = document.createElement('div');
	    details.className = 'forgeos-modal__kvlist';

	    function addKV(label, value, href) {
	      const row = document.createElement('div');
	      row.className = 'forgeos-modal__kv';

	      const k = document.createElement('div');
	      k.className = 'forgeos-modal__kv-k';
	      k.textContent = label;

	      const v = document.createElement('div');
	      v.className = 'forgeos-modal__kv-v';

	      const val = String(value || '').trim();
	      if (!val) {
	        v.textContent = '-';
	      } else if (href && /^https?:\/\//i.test(String(href))) {
	        const a = document.createElement('a');
	        a.href = href;
	        a.target = '_blank';
	        a.rel = 'noreferrer';
	        a.className = 'forgeos-modal__link';
	        a.textContent = val;
	        v.appendChild(a);
	      } else {
	        v.textContent = val;
	      }

	      row.appendChild(k);
	      row.appendChild(v);
	      details.appendChild(row);
	    }

	    const versionText = isInstalled ? installedVersion || latestVersion : latestVersion;
	    addKV('Version', versionText);
	    if (isInstalled && updateAvailable && installedVersion && latestVersion && latestVersion !== installedVersion) {
	      addKV('Latest', latestVersion);
	    }
	    addKV('Channel', meta.channel || '-');
	    addKV('Source', meta.repo || meta.website || meta.storeId || '', meta.repo || meta.website || '');
	    if (meta.website && meta.repo && meta.website !== meta.repo) addKV('Website', meta.website, meta.website);
	    if (meta.developer) addKV('Developer', meta.developer);
	    if (meta.support) addKV('Support', meta.support, meta.support);
	    if (meta.storeId) addKV('Store id', meta.storeId);

	    const actions = document.createElement('div');
	    actions.className = 'forgeos-modal__meta-actions';

	    if (isInstalled) {
	      const btnOpen = document.createElement('button');
	      btnOpen.className = 'axe-btn';
	      btnOpen.type = 'button';
	      btnOpen.textContent = 'Open';
        btnOpen.disabled = !isAppLaunchable(id);
        if (btnOpen.disabled) btnOpen.title = 'Start the app to open it';
	      btnOpen.addEventListener('click', () => openApp({ id, name: meta.name }));

	      actions.appendChild(btnOpen);

	      if (updateAvailable) {
	        const btnUpdate = document.createElement('button');
	        btnUpdate.className = 'axe-btn';
	        btnUpdate.type = 'button';
	        btnUpdate.textContent = 'Update';
	        btnUpdate.dataset.progressId = id;
	        btnUpdate.addEventListener('click', async () => {
	          startProgress(id, 'update');
	          btnUpdate.disabled = true;
	          try {
	            await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/update`, { method: 'POST', body: '{}' });
	            await refresh();
	            finishProgress(id);
	          } catch (err) {
	            cancelProgress(id);
	            alert(`Update failed: ${err && err.message ? err.message : err}`);
	          } finally {
	            btnUpdate.disabled = false;
	          }
	        });
	        actions.appendChild(btnUpdate);
	      }

	      const btnUninstall = document.createElement('button');
	      btnUninstall.className = 'axe-btn';
      btnUninstall.type = 'button';
      btnUninstall.textContent = 'Uninstall';
      btnUninstall.addEventListener('click', async () => {
        const label = meta.name || id;
        if (!confirm(`Uninstall ${label}? (Data will be kept)`)) return;
        btnUninstall.disabled = true;
        const prev = btnUninstall.textContent;
        btnUninstall.textContent = 'Uninstalling...';
        try {
          openAppIds = openAppIds.filter((x) => x !== id);
          saveOpenApps();
          await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/uninstall`, { method: 'POST', body: '{}' });
          await refresh();
          closeModal();
        } catch (err) {
          alert(`Uninstall failed: ${err && err.message ? err.message : err}`);
          btnUninstall.disabled = false;
          btnUninstall.textContent = prev;
        }
      });

	      actions.appendChild(btnUninstall);
	    } else {
	      const btnInstall = document.createElement('button');
	      btnInstall.className = 'axe-btn';
      btnInstall.type = 'button';
      btnInstall.textContent = isInstallable ? 'Install' : 'Coming soon';
      btnInstall.disabled = !isInstallable;
      btnInstall.dataset.progressId = id;

      btnInstall.addEventListener('click', async () => {
        if (!isInstallable) return;
        startProgress(id, 'install');
        btnInstall.disabled = true;
        try {
          await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/install`, {
            method: 'POST',
            body: JSON.stringify({ channel: meta.channel || 'main' }),
          });
          await apiAppAction(id, 'up');
          await refresh();
          openApp({ id, name: meta.name });
          finishProgress(id);
          closeModal();
        } catch (err) {
          cancelProgress(id);
          alert(`Install failed: ${err && err.message ? err.message : err}`);
          btnInstall.disabled = false;
        }
      });

      actions.appendChild(btnInstall);
	    }

	    metaPanel.appendChild(metaTop);
	    metaPanel.appendChild(details);
	    metaPanel.appendChild(actions);

	    content.appendChild(infoPanel);
	    content.appendChild(metaPanel);
	    layout.appendChild(shotsWrap);
	    layout.appendChild(content);
	    modalBodyEl.appendChild(layout);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function openApp(app) {
    closeModal();
    ensureAppOpen(app);
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = String(btn.getAttribute('data-view') || '').trim();
      if (!view) return;
      if (!views[view]) return;
      if (view === 'dashboard') {
        dashboardShowHome = true;
        setView('dashboard');
        renderWorkspace();
        return;
      }
      setView(view);
    });
  });

  btnResumeWorkspace?.addEventListener('click', () => {
    dashboardShowHome = false;
    setView('dashboard');
    renderWorkspace();
  });

  btnPower?.addEventListener('click', openPowerModal);
  btnOpenTerminal?.addEventListener('click', openTerminalModal);

  btnSidebarCollapse?.addEventListener('click', () => {
    const current = loadSidebarMode();
    const next = current === 'collapsed' ? 'static' : 'collapsed';
    setSidebarMode(next);
  });

  settingSidebarSelect?.addEventListener('change', () => setSidebarMode(settingSidebarSelect.value));

  settingSshToggle?.addEventListener('change', async () => {
    const next = !!settingSshToggle.checked;
    settingSshToggle.disabled = true;
    try {
      await apiJson('/api/v0/system/ssh', { method: 'POST', body: JSON.stringify({ enabled: next }) });
      showToast(`SSH ${next ? 'enabled' : 'disabled'}`, null);
    } catch (e) {
      showToast('SSH update failed', 'error');
      alert(`SSH update failed: ${e && e.message ? e.message : e}`);
      settingSshToggle.checked = !next;
    } finally {
      await refreshSshStatus();
    }
  });

  btnUpdateCheck?.addEventListener('click', () => refreshSystemUpdateCheck({ force: true }).catch(() => {}));
  btnUpdateApply?.addEventListener('click', () => applySystemUpdate().catch(() => {}));

  btnRefresh?.addEventListener('click', refresh);
  btnMetrics?.addEventListener('click', openMetricsModal);
  btnWidgetsRefresh?.addEventListener('click', () => refreshWidgets().catch(() => {}));
  btnSelectedStart?.addEventListener('click', () => runSelectedAppAction('up'));
  btnSelectedStop?.addEventListener('click', () => runSelectedAppAction('down'));
  btnSelectedRestart?.addEventListener('click', () => runSelectedAppAction('restart'));
  btnShowDesktop?.addEventListener('click', () => {
    setView('dashboard');
    for (const [id] of openWindows.entries()) minimizeWindow(id);
  });
  modalCloseBtn?.addEventListener('click', closeModal);

  modalEl?.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.hasAttribute('data-modal-close')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (contextMenuEl && !contextMenuEl.classList.contains('hidden')) {
      closeContextMenu();
      return;
    }
    if (!modalEl) return;
    if (modalEl.classList.contains('hidden')) return;
    closeModal();
  });

  document.addEventListener('click', (e) => {
    if (!contextMenuEl) return;
    if (contextMenuEl.classList.contains('hidden')) return;
    const t = e.target;
    if (t instanceof Node && contextMenuEl.contains(t)) return;
    closeContextMenu();
  });

  window.addEventListener('resize', () => closeContextMenu());
  window.addEventListener(
    'scroll',
    () => {
      closeContextMenu();
    },
    true,
  );

  storeSearchInput?.addEventListener('input', () => {
    storeQuery = storeSearchInput.value || '';
    storeRenderLimit = STORE_RENDER_STEP;
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
  });

  storeHideInstalledInput?.addEventListener('change', () => {
    storeHideInstalled = !!storeHideInstalledInput.checked;
    storeRenderLimit = STORE_RENDER_STEP;
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
  });

  storeCategorySelect?.addEventListener('change', () => {
    storeCategory = storeCategorySelect.value || '';
    storeRenderLimit = STORE_RENDER_STEP;
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
  });

  btnStoreClear?.addEventListener('click', () => {
    storeQuery = '';
    if (storeSearchInput) storeSearchInput.value = '';
    storeCategory = '';
    if (storeCategorySelect) storeCategorySelect.value = '';
    storeRenderLimit = STORE_RENDER_STEP;
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
    storeSearchInput?.focus();
  });

  btnStoreSync?.addEventListener('click', () => syncStoreNow().catch(() => {}));

  if (storeChannelButtons && storeChannelButtons.length) {
    storeChannelButtons.forEach((btn) => {
      btn.addEventListener('click', () => setStoreChannel(btn.dataset.storeChannel || 'main'));
    });
  }

  // Allow buttons inside content to route via data-view
  document.body.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const view = t.getAttribute('data-view');
    if (!view) return;
    if (!views[view]) return;
    setView(view);
  });

  window.addEventListener('resize', () => {
    const box = workspaceBox();
    const pad = 10;
    for (const entry of openWindows.values()) {
      if (entry.isMaximized) {
        entry.el.style.left = `${pad}px`;
        entry.el.style.top = `${pad}px`;
        entry.el.style.width = `${Math.max(320, box.width - pad * 2)}px`;
        entry.el.style.height = `${Math.max(220, box.height - pad * 2)}px`;
        continue;
      }

      const el = entry.el;
      const minW = 360;
      const minH = 280;
      const margin = 12;

      const currentW = parseFloat(el.style.width) || el.getBoundingClientRect().width;
      const currentH = parseFloat(el.style.height) || el.getBoundingClientRect().height;

      const maxW = Math.max(minW, box.width - margin * 2);
      const maxH = Math.max(minH, box.height - margin * 2);
      const nextW = clamp(currentW, minW, maxW);
      const nextH = clamp(currentH, minH, maxH);

      const currentLeft = parseFloat(el.style.left) || 0;
      const currentTop = parseFloat(el.style.top) || 0;
      const nextLeft = clamp(currentLeft, margin, Math.max(margin, box.width - nextW - margin));
      const nextTop = clamp(currentTop, margin, Math.max(margin, box.height - nextH - margin));

      el.style.left = `${Math.round(nextLeft)}px`;
      el.style.top = `${Math.round(nextTop)}px`;
      el.style.width = `${Math.round(nextW)}px`;
      el.style.height = `${Math.round(nextH)}px`;
    }
  });

  // Initial render
  if (storeHideInstalledInput) storeHideInstalled = !!storeHideInstalledInput.checked;
  openAppIds = loadOpenApps();
  widgetPrefs = loadWidgetPrefs();
  activeStoreChannel = loadStoreChannel();
  storeRenderLimit = STORE_RENDER_STEP;
  applyStoreChannelUi();
  dashboardShowHome = true;
  applySidebarMode(loadSidebarMode());
  updateClock();
  window.setInterval(updateClock, 15000);
  const cachedInstalled = loadInstalledCache();
  if (cachedInstalled && Array.isArray(cachedInstalled.apps) && cachedInstalled.apps.length) {
    hasLoadedInstalled = true;
    applyInstalled(cachedInstalled.apps, { fromCache: true });
  }
  refresh().catch(() => setStatus('UI only'));
  refreshSystemUpdateStatus().catch(() => {});
  window.setTimeout(() => refreshSystemUpdateCheck().catch(() => {}), 2500);
  window.setInterval(() => refreshMetrics().catch(() => {}), 5000);
  window.setInterval(() => refreshWidgets().catch(() => {}), 10000);
  window.setInterval(() => refreshInstalled().catch(() => {}), 30000);
  window.setInterval(() => refreshSystemUpdateCheck().catch(() => {}), 3600000);
})();
