(function () {
  const navButtons = Array.from(document.querySelectorAll('[data-view]'));
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const statusPill = document.getElementById('status-pill');
  const statusDockBtn = document.getElementById('btn-status');
  const hostIp = document.getElementById('host-ip');
  const trustedNetworksEl = document.getElementById('trusted-networks');
  const tailscaleStatusEl = document.getElementById('tailscale-status');
  const metricCpu = document.getElementById('metric-cpu');
  const metricMem = document.getElementById('metric-mem');
	  const metricDisk = document.getElementById('metric-disk');
	  const metricIp = document.getElementById('metric-ip');
    const metricCardCpu = document.getElementById('metric-card-cpu');
    const metricCardMem = document.getElementById('metric-card-mem');
    const metricCardDisk = document.getElementById('metric-card-disk');
    const metricCardIp = document.getElementById('metric-card-ip');
    const metricCpuSub = document.getElementById('metric-cpu-sub');
    const metricCpuCores = document.getElementById('metric-cpu-cores');
    const metricCpuBar = document.getElementById('metric-cpu-bar');
    const metricMemBar = document.getElementById('metric-mem-bar');
    const metricMemSub = document.getElementById('metric-mem-sub');
    const metricDiskBar = document.getElementById('metric-disk-bar');
    const metricDiskSub = document.getElementById('metric-disk-sub');
	  const dashboardAppsEl = document.getElementById('dashboard-apps');
	  const dashboardAppsEmptyEl = document.getElementById('dashboard-apps-empty');
	  const dashboardWidgetsEl = document.getElementById('dashboard-widgets');
	  const dashboardWidgetsEmptyEl = document.getElementById('dashboard-widgets-empty');
    const dashboardWidgetsUpdatedEl = document.getElementById('dashboard-widgets-updated');
    const dashboardGridEl = document.getElementById('dashboard-grid');
    const fleetUpdatedEl = document.getElementById('fleet-updated');
    const fleetHashrateEl = document.getElementById('fleet-hashrate');
    const fleetWorkersEl = document.getElementById('fleet-workers');
    const fleetSparkLineEl = document.getElementById('fleet-spark-line');
    const fleetBreakdownEl = document.getElementById('fleet-breakdown');
    const fleetWorkersUpdatedEl = document.getElementById('fleet-workers-updated');
    const fleetWorkersBodyEl = document.getElementById('fleet-workers-body');
    const btnFleetRefresh = document.getElementById('btn-fleet-refresh');
    const settingCardFleetHashrate = document.getElementById('setting-card-fleet-hashrate');
    const settingCardFleetWorkers = document.getElementById('setting-card-fleet-workers');
    const settingCardMiningOverview = document.getElementById('setting-card-mining-overview');

  const views = {
    dashboard: document.getElementById('view-dashboard'),
    store: document.getElementById('view-store'),
    settings: document.getElementById('view-settings'),
  };

  const viewMeta = {
    dashboard: { title: 'Dashboard', subtitle: 'System summary' },
    store: { title: 'Global App Store', subtitle: 'Community templates' },
    settings: { title: 'Settings', subtitle: 'Global control' },
  };

  const installedAppsEl = document.getElementById('installed-apps');
  const installedEmptyEl = document.getElementById('installed-empty');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnPower = document.getElementById('btn-power');
  const sidebarClockEl = document.getElementById('sidebar-clock');
  const btnSidebarCollapse = document.getElementById('btn-sidebar-collapse');
  const btnDashboardMode = document.getElementById('btn-dashboard-mode');
    const btnWidgetsRefresh = document.getElementById('btn-widgets-refresh');
  const btnModeDesktop = document.getElementById('btn-mode-desktop');
  const btnModeApps = document.getElementById('btn-mode-apps');
  const btnModeFleet = document.getElementById('btn-mode-fleet');
  const btnModeAppsList = document.getElementById('btn-mode-appslist');
  const btnOpenStore = document.getElementById('btn-open-store');
  const paneDesktopEl = document.getElementById('pane-desktop');
  const paneAppsLauncherEl = document.getElementById('pane-apps-launcher');
  const appsLauncherGridEl = document.getElementById('apps-launcher-grid');
  const appsLauncherEmptyEl = document.getElementById('apps-launcher-empty');
  const desktopSurfaceEl = document.getElementById('desktop-surface');
  const desktopEmptyEl = document.getElementById('desktop-empty');
  const desktopBinEl = document.getElementById('desktop-bin');
  const storeSearchInput = document.getElementById('store-search');
  const storeCategorySelect = document.getElementById('store-category');
  const storeHideInstalledInput = document.getElementById('store-hide-installed');
  const btnStoreClear = document.getElementById('btn-store-clear');
  const settingStoreAutoSync = document.getElementById('setting-store-autosync');
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
  const btnDashboardLayoutReset = document.getElementById('btn-dashboard-layout-reset');
  const settingSshToggle = document.getElementById('setting-ssh');
  const sshStatusEl = document.getElementById('ssh-status');
  const sshAdminUserEl = document.getElementById('ssh-admin-user');
  const sshAuthMethodsEl = document.getElementById('ssh-auth-methods');
  const sshAdminPasswordStateEl = document.getElementById('ssh-admin-password-state');
  const sshPasswordInput = document.getElementById('setting-ssh-password');
  const sshPasswordConfirmInput = document.getElementById('setting-ssh-password-confirm');
  const btnSshSetPassword = document.getElementById('btn-ssh-set-password');
  const sshPublicKeyInput = document.getElementById('setting-ssh-publickey');
  const btnSshAddKey = document.getElementById('btn-ssh-add-key');
  const updateInstalledEl = document.getElementById('update-installed');
  const updateChannelEl = document.getElementById('update-channel');
  const updateAvailableEl = document.getElementById('update-available');
  const updateStatusEl = document.getElementById('update-status');
  const updateProgressEl = document.getElementById('update-progress');
  const updateProgressBarEl = document.getElementById('update-progress-bar');
  const updateNotesEl = document.getElementById('update-notes');
  const btnUpdateCheck = document.getElementById('btn-update-check');
  const btnUpdateApply = document.getElementById('btn-update-apply');
  const btnFixProxy = document.getElementById('btn-fix-proxy');
  const updateRepoInput = document.getElementById('update-repo');
  const updateTokenInput = document.getElementById('update-token');
  const updateAuthStatusEl = document.getElementById('update-auth-status');
  const btnUpdateSave = document.getElementById('btn-update-save');
  const btnUpdateTokenClear = document.getElementById('btn-update-token-clear');
  const autoLockMinutesInput = document.getElementById('setting-autolock-minutes');
  const btnAutoLockSave = document.getElementById('btn-autolock-save');
  const autoLockStatusEl = document.getElementById('autolock-status');

  // Legacy "selected app" controls (removed from UI; keep null-safe until context menus land)
  const selectedControlsEl = document.getElementById('selected-app-controls');
  const selectedAppNameEl = document.getElementById('selected-app-name');
  const selectedAppStatusEl = document.getElementById('selected-app-status');
  const btnSelectedStart = document.getElementById('selected-app-start');
  const btnSelectedStop = document.getElementById('selected-app-stop');
  const btnSelectedRestart = document.getElementById('selected-app-restart');

  const modalEl = document.getElementById('modal');
  const modalKindEl = document.getElementById('modal-kind');
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
  const navDashboardBtn = document.querySelector('[data-view="dashboard"]');
  const navDashboardLabelEl = navDashboardBtn ? navDashboardBtn.querySelector('.forgeos-nav-item__label') : null;

  let activeViewKey = 'dashboard';
  let dashboardMode = 'fleet';

  let selectedAppId = null;
  let installedAppsCache = [];
  let installedById = new Map();
  let storeAppsCache = [];
  let storeById = new Map();
  let installedStoreById = new Map();
	  let storeQuery = '';
	  let storeHideInstalled = false;
    let activeStoreChannel = 'main';
  let storeCategory = '';
  let storeRenderLimit = 72;
  let storeLastOk = false;
  let storeLastError = '';
  let storeAutoSyncEnabled = true;
  let storeAutoSyncInFlight = false;
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
    let systemUpdateConfigCache = null;
    let systemUpdateCheckCache = null;
    let systemUpdateStatusCache = null;
    let systemUpdateCheckAt = 0;
    let systemUpdatePollTimer = null;
    let systemUpdatePollInFlight = false;
  let openAppIds = [];
  let maximizedAppId = null;
  const workspaceTileById = new Map();
  let dashboardLayout = null;
  let dashboardCards = new Map();
  let draggingDashboardCardId = null;
  let lastFleet = null;
  let refreshFleetInFlight = false;
  let fleetSeries = [];
  const OPEN_APPS_KEY = 'forgeos.openApps';
  const INSTALLED_CACHE_KEY = 'forgeos.installedCache.v1';
  const STORE_CHANNEL_KEY = 'forgeos.storeChannel';
  const STORE_AUTO_SYNC_KEY = '5tratumos.storeAutoSync';
  const STORE_AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000;
  const SIDEBAR_MODE_KEY = 'forgeos.sidebarMode';
  const WIDGET_PREFS_KEY = 'forgeos.widgetPrefs';
  const DASHBOARD_LAYOUT_KEY = 'forgeos.dashboardLayout.v1';
  const FLEET_SERIES_KEY = 'forgeos.fleetHashrateSeries.v1';
  const AUTOLOCK_MINUTES_KEY = 'forgeos.autoLockMinutes';
  const DASHBOARD_MODE_KEY = '5tratumos.dashboardMode';
  const DESKTOP_STATE_KEY_V2 = '5tratumos.desktopState.v2';
  const DESKTOP_STATE_KEY_V1 = '5tratumos.desktopState.v1';
  const DRAWER_PINNED_KEY = '5tratumos.drawerPinned.v1';
  const STORE_RENDER_STEP = 72;
  let dragAppId = null;
  const openWindows = new Map();
  let activeWindowId = null;
  let zCounter = 20;
    const pendingAppActions = new Map();
  const appProgress = new Map();
  let widgetPrefs = {};
  let autoLockMinutes = 0;
  let lastUserActivityAt = Date.now();
  let lastUserActivityTickAt = 0;
  let autoLockTimer = null;
  let autoLockInFlight = false;
  let modalOnClose = null;
  let desktopState = { items: {} };
  let desktopDragId = '';
  let drawerPinned = new Set();

  function noteUserActivity() {
    const now = Date.now();
    if (now - lastUserActivityTickAt < 700) return;
    lastUserActivityTickAt = now;
    lastUserActivityAt = now;
  }

  function loadAutoLockMinutesFallback() {
    try {
      const raw = String(window.localStorage.getItem(AUTOLOCK_MINUTES_KEY) || '').trim();
      if (!raw) return 0;
      const n = Math.max(0, Math.round(Number(raw)));
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }

  function saveAutoLockMinutesFallback(minutes) {
    try {
      window.localStorage.setItem(AUTOLOCK_MINUTES_KEY, String(Math.max(0, Math.round(Number(minutes) || 0))));
    } catch {}
  }

  function setAutoLockUi(minutes, statusText) {
    if (autoLockMinutesInput) autoLockMinutesInput.value = String(Math.max(0, Math.round(Number(minutes) || 0)));
    if (autoLockStatusEl) autoLockStatusEl.textContent = statusText || '-';
  }

  async function refreshSessionConfig() {
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/session', {}, 3500).catch(() => null);
      if (!res || res.ok !== true) return;
      const minutes = Math.max(0, Math.round(Number(res.lock_minutes) || 0));
      autoLockMinutes = Number.isFinite(minutes) ? minutes : 0;
      saveAutoLockMinutesFallback(autoLockMinutes);
      setAutoLockUi(autoLockMinutes, 'Loaded.');
      startAutoLockWatcher();
    } catch {}
  }

  async function saveSessionConfig(minutes) {
    const m = Math.max(0, Math.round(Number(minutes) || 0));
    if (!Number.isFinite(m)) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout(
        '/api/v0/system/session',
        { method: 'POST', body: JSON.stringify({ lock_minutes: m }) },
        6000,
      );
      if (!res || res.ok !== true) throw new Error(res && res.error ? String(res.error) : 'save failed');
      autoLockMinutes = m;
      saveAutoLockMinutesFallback(autoLockMinutes);
      setAutoLockUi(autoLockMinutes, 'Saved.');
      startAutoLockWatcher();
      showToast('Session lock saved', null);
    } catch (e) {
      console.error('Session lock save failed', e);
      setAutoLockUi(autoLockMinutes, 'Save failed.');
      showToast('Session lock save failed', 'error');
    }
  }

  async function triggerAutoLock() {
    if (autoLockInFlight) return;
    autoLockInFlight = true;
    try {
      try {
        await apiJsonTimeout('/api/v0/auth/logout', { method: 'POST', body: '{}' }, 2500);
      } catch {}
      window.location.href = '/login.html?next=/';
    } finally {
      autoLockInFlight = false;
    }
  }

  function startAutoLockWatcher() {
    if (autoLockTimer) window.clearInterval(autoLockTimer);
    autoLockTimer = window.setInterval(() => {
      const mins = Number(autoLockMinutes) || 0;
      if (!Number.isFinite(mins) || mins <= 0) return;
      if (document.hidden) return;
      const idleMs = Date.now() - lastUserActivityAt;
      if (idleMs >= mins * 60 * 1000) triggerAutoLock().catch(() => {});
    }, 15000);
  }

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

  function loadDashboardMode() {
    try {
      const raw = String(window.localStorage.getItem(DASHBOARD_MODE_KEY) || '').trim().toLowerCase();
      if (raw === 'desktop' || raw === 'apps' || raw === 'fleet' || raw === 'appslist') return raw;
    } catch {}
    return 'fleet';
  }

  function saveDashboardMode() {
    try {
      window.localStorage.setItem(DASHBOARD_MODE_KEY, String(dashboardMode || 'fleet'));
    } catch {}
  }

  function setDashboardMode(nextMode) {
    const next = String(nextMode || '').trim().toLowerCase();
    if (next !== 'desktop' && next !== 'apps' && next !== 'fleet' && next !== 'appslist') return;
    if (dashboardMode === next) return;
    dashboardMode = next;
    saveDashboardMode();
    syncDashboardModeUi();
    if (activeViewKey === 'dashboard') {
      renderWorkspace();
      renderDesktop();
      renderAppsLauncher(installedAppsCache);
    }
    if (activeViewKey === 'dashboard' && dashboardMode === 'fleet') {
      refreshFleet().catch(() => {});
      refreshWidgets().catch(() => {});
    }
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

  function defaultDashboardLayout() {
    return { order: ['fleet-hashrate', 'fleet-workers', 'mining-overview'], hidden: {} };
  }

  function loadDashboardLayout() {
    try {
      const raw = String(window.localStorage.getItem(DASHBOARD_LAYOUT_KEY) || '').trim();
      if (!raw) return defaultDashboardLayout();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return defaultDashboardLayout();
      const order = Array.isArray(parsed.order)
        ? parsed.order.map((v) => String(v || '').trim()).filter(Boolean)
        : defaultDashboardLayout().order;
      const hidden = parsed.hidden && typeof parsed.hidden === 'object' ? parsed.hidden : {};
      return { order, hidden };
    } catch {
      return defaultDashboardLayout();
    }
  }

  function saveDashboardLayout() {
    try {
      window.localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(dashboardLayout || defaultDashboardLayout()));
    } catch {}
  }

  function isDashboardCardVisible(cardId) {
    const id = String(cardId || '').trim();
    if (!id) return true;
    const layout = dashboardLayout || defaultDashboardLayout();
    const hidden = layout.hidden && typeof layout.hidden === 'object' ? layout.hidden : {};
    return hidden[id] !== true;
  }

  function setDashboardCardVisible(cardId, visible) {
    const id = String(cardId || '').trim();
    if (!id) return;
    if (!dashboardLayout || typeof dashboardLayout !== 'object') dashboardLayout = defaultDashboardLayout();
    if (!dashboardLayout.hidden || typeof dashboardLayout.hidden !== 'object') dashboardLayout.hidden = {};
    dashboardLayout.hidden[id] = visible ? false : true;
    saveDashboardLayout();
    applyDashboardLayout();
  }

  function applyDashboardLayout() {
    if (!dashboardGridEl) return;
    if (!dashboardLayout || typeof dashboardLayout !== 'object') dashboardLayout = defaultDashboardLayout();

    const order = normalizeDashboardOrder(dashboardLayout.order);
    if (!Array.isArray(dashboardLayout.order) || dashboardLayout.order.join('|') !== order.join('|')) {
      dashboardLayout.order = order;
      saveDashboardLayout();
    }
    const handled = new Set();

    for (const id of order) {
      const el = dashboardCards.get(id);
      if (!el) continue;
      dashboardGridEl.appendChild(el);
      handled.add(id);
    }

    for (const [id, el] of dashboardCards.entries()) {
      if (handled.has(id)) continue;
      dashboardGridEl.appendChild(el);
    }

    for (const [id, el] of dashboardCards.entries()) {
      el.classList.toggle('hidden', !isDashboardCardVisible(id));
    }

    if (settingCardFleetHashrate) settingCardFleetHashrate.checked = isDashboardCardVisible('fleet-hashrate');
    if (settingCardFleetWorkers) settingCardFleetWorkers.checked = isDashboardCardVisible('fleet-workers');
    if (settingCardMiningOverview) settingCardMiningOverview.checked = isDashboardCardVisible('mining-overview');
  }

  function normalizeDashboardOrder(orderRaw) {
    const existing = Array.from(dashboardCards.keys());
    const existingSet = new Set(existing);
    const out = [];
    const seen = new Set();

    const order = Array.isArray(orderRaw) ? orderRaw : [];
    for (const raw of order) {
      const id = String(raw || '').trim();
      if (!id || !existingSet.has(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }

    for (const raw of defaultDashboardLayout().order) {
      const id = String(raw || '').trim();
      if (!id || !existingSet.has(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }

    for (const id of existing) {
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }

    return out;
  }

  function attachDashboardDrag(cardEl, id) {
    if (!(cardEl instanceof HTMLElement)) return;
    const cardId = String(id || '').trim();
    if (!cardId) return;
    cardEl.setAttribute('draggable', 'true');

    cardEl.addEventListener('dragstart', (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.closest('button, a, input, select, textarea, label')) {
        e.preventDefault();
        return;
      }
      draggingDashboardCardId = cardId;
      cardEl.classList.add('forgeos-dashboard-card--dragging');
      try {
        e.dataTransfer?.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
      } catch {}
    });

    cardEl.addEventListener('dragend', () => {
      draggingDashboardCardId = null;
      cardEl.classList.remove('forgeos-dashboard-card--dragging');
      for (const el of dashboardCards.values()) el.classList.remove('forgeos-dashboard-card--drop');
    });

    cardEl.addEventListener('dragover', (e) => {
      if (!draggingDashboardCardId) return;
      e.preventDefault();
      if (draggingDashboardCardId !== cardId) cardEl.classList.add('forgeos-dashboard-card--drop');
    });

    cardEl.addEventListener('dragleave', () => {
      cardEl.classList.remove('forgeos-dashboard-card--drop');
    });

    cardEl.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cardEl.classList.remove('forgeos-dashboard-card--drop');
      const source = String(e.dataTransfer?.getData('text/plain') || draggingDashboardCardId || '').trim();
      if (!source || source === cardId) return;
      if (!dashboardLayout || typeof dashboardLayout !== 'object') dashboardLayout = defaultDashboardLayout();
      const order = normalizeDashboardOrder(dashboardLayout.order);
      const next = order.filter((x) => x !== source);
      const targetIdx = next.indexOf(cardId);
      if (targetIdx < 0) {
        next.push(source);
      } else {
        const rect = cardEl.getBoundingClientRect();
        const after = Number.isFinite(e.clientY) && rect.height > 0 ? e.clientY > rect.top + rect.height / 2 : false;
        const insertAt = after ? targetIdx + 1 : targetIdx;
        next.splice(Math.min(next.length, Math.max(0, insertAt)), 0, source);
      }
      dashboardLayout.order = next;
      saveDashboardLayout();
      applyDashboardLayout();
    });
  }

  function initDashboard() {
    if (!dashboardGridEl) return;

    dashboardCards = new Map();
    const cards = Array.from(dashboardGridEl.querySelectorAll('[data-dashboard-card]'));
    for (const el of cards) {
      if (!(el instanceof HTMLElement)) continue;
      const id = String(el.dataset.dashboardCard || '').trim();
      if (!id) continue;
      dashboardCards.set(id, el);
      attachDashboardDrag(el, id);
    }

    dashboardLayout = loadDashboardLayout();

    settingCardFleetHashrate?.addEventListener('change', () => {
      setDashboardCardVisible('fleet-hashrate', !!settingCardFleetHashrate.checked);
    });
    settingCardFleetWorkers?.addEventListener('change', () => {
      setDashboardCardVisible('fleet-workers', !!settingCardFleetWorkers.checked);
    });
    settingCardMiningOverview?.addEventListener('change', () => {
      setDashboardCardVisible('mining-overview', !!settingCardMiningOverview.checked);
    });

    dashboardGridEl.addEventListener('dragover', (e) => {
      if (!draggingDashboardCardId) return;
      e.preventDefault();
    });

    dashboardGridEl.addEventListener('drop', (e) => {
      if (!draggingDashboardCardId) return;
      e.preventDefault();
      const source = String(e.dataTransfer?.getData('text/plain') || draggingDashboardCardId || '').trim();
      if (!source) return;
      if (!dashboardLayout || typeof dashboardLayout !== 'object') dashboardLayout = defaultDashboardLayout();
      const order = normalizeDashboardOrder(dashboardLayout.order);
      const next = order.filter((x) => x !== source);

      let beforeId = '';
      try {
        const y = Number(e.clientY);
        if (Number.isFinite(y)) {
          const els = Array.from(dashboardGridEl.querySelectorAll('[data-dashboard-card]'));
          for (const el of els) {
            if (!(el instanceof HTMLElement)) continue;
            const id = String(el.dataset.dashboardCard || '').trim();
            if (!id || id === source) continue;
            if (el.classList.contains('hidden')) continue;
            const rect = el.getBoundingClientRect();
            if (y < rect.top + rect.height / 2) {
              beforeId = id;
              break;
            }
          }
        }
      } catch {}

      if (beforeId) {
        const idx = next.indexOf(beforeId);
        if (idx >= 0) next.splice(idx, 0, source);
        else next.push(source);
      } else {
        next.push(source);
      }
      dashboardLayout.order = next;
      saveDashboardLayout();
      applyDashboardLayout();
    });

    applyDashboardLayout();
  }

  function loadFleetSeries() {
    try {
      const raw = String(window.localStorage.getItem(FLEET_SERIES_KEY) || '').trim();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((p) => ({ t: Number(p && p.t), v: Number(p && p.v) }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.t > 0);
    } catch {
      return [];
    }
  }

  function saveFleetSeries() {
    try {
      window.localStorage.setItem(FLEET_SERIES_KEY, JSON.stringify(fleetSeries.slice(-720)));
    } catch {}
  }

  function applyInstalled(apps, opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const fromCache = !!options.fromCache;
    const noWorkspace = !!options.noWorkspace;

    const installed = Array.isArray(apps) ? apps : [];

    const prevOpenApps = Array.isArray(openAppIds) ? openAppIds.slice() : [];
    installedAppsCache = installed;
    installedById = new Map(installed.map((a) => [a.id, a]));

    installedStoreById = new Map();
    for (const app of installed) {
      if (!app || typeof app !== 'object') continue;
      if (!app.id) continue;
      if (!app.store || typeof app.store !== 'object') continue;
      installedStoreById.set(app.id, app.store);
    }

    if (selectedAppId && !installedById.has(selectedAppId)) selectedAppId = null;

    // Clear pending app actions once the daemon reports a stable state.
    // Keep them around a while to avoid transient iframe error pages during restarts.
    for (const [idRaw] of Array.from(pendingAppActions.entries())) {
      const id = String(idRaw || '').trim();
      if (!id) {
        pendingAppActions.delete(idRaw);
        continue;
      }
      const kind = pendingKindFor(id);
      const ageMs = pendingAgeMsFor(id);
      const st = installedById.get(id);
      const status = String(st && st.status ? st.status : '').trim().toLowerCase();
      const stoppedLike = status === 'stopped' || status === 'not-created' || status === 'not_created' || status === 'not created';
      if ((kind === 'restart' || kind === 'up' || kind === 'redeploy') && status === 'running') {
        pendingAppActions.delete(idRaw);
        continue;
      }
      if (kind === 'down' && stoppedLike) {
        pendingAppActions.delete(idRaw);
        continue;
      }
      if (ageMs > 10 * 60 * 1000) pendingAppActions.delete(idRaw);
    }

    // Preserve open apps across periodic refreshes to avoid iframe reloads that reset app UIs.
    // Only prune apps that are no longer installed.
    openAppIds = uniqOrder(openAppIds).filter((appId) => installedById.has(appId) || pendingAppActions.has(appId));
    saveOpenApps();

    applyStoreChannelUi();

    const installedSet = new Set(installed.map((a) => a.id));
    renderInstalledApps(installed);
    renderDashboardApps(installed);
    renderAppsLauncher(installed);
    renderStore(storeAppsCache, installedSet);
    const openAppsChanged =
      prevOpenApps.length !== openAppIds.length || prevOpenApps.some((id, idx) => id !== openAppIds[idx]);
    const canTouchWorkspace = activeViewKey === 'dashboard';
    if (canTouchWorkspace) {
      if (openAppsChanged || !noWorkspace) {
        renderWorkspace();
      } else {
        // Keep iframe tiles stable; only update status/pills/overlays.
        for (const id of openAppIds) {
          const tile = workspaceTileById.get(id) || null;
          if (!tile) continue;
          updateTile(tile, installedById.get(id) || { id });
        }
      }
    }
    syncInstalledSelection();
    updateAppHeader();
    renderWidgetSettings();
    renderDesktop();

    if (fromCache && !healthCache.ok) setStatus('Cached');
  }

  function loadStoreChannel() {
    try {
      const raw = String(window.localStorage.getItem(STORE_CHANNEL_KEY) || '').trim().toLowerCase();
      if (raw === 'main' || raw === 'dev' || raw === 'global') return raw;
    } catch {}
    return 'main';
  }

  function loadStoreAutoSyncEnabled() {
    try {
      const raw = String(window.localStorage.getItem(STORE_AUTO_SYNC_KEY) || '').trim().toLowerCase();
      if (raw === '0' || raw === 'false' || raw === 'off') return false;
      if (raw === '1' || raw === 'true' || raw === 'on') return true;
    } catch {}
    return true;
  }

  function saveStoreAutoSyncEnabled() {
    try {
      window.localStorage.setItem(STORE_AUTO_SYNC_KEY, storeAutoSyncEnabled ? 'true' : 'false');
    } catch {}
  }

  function applyStoreAutoSyncUi() {
    if (!settingStoreAutoSync) return;
    settingStoreAutoSync.checked = !!storeAutoSyncEnabled;
  }

  function saveStoreChannel() {
    try {
      window.localStorage.setItem(STORE_CHANNEL_KEY, String(activeStoreChannel || 'main'));
    } catch {}
  }

  function applyStoreChannelUi() {
    const ch = String(activeStoreChannel || 'main').toLowerCase();

    if (storeChannelButtons && storeChannelButtons.length) {
      for (const btn of storeChannelButtons) {
        if (!(btn instanceof HTMLElement)) continue;
        const btnCh = String(btn.dataset.storeChannel || '').trim().toLowerCase();
        btn.classList.toggle('forgeos-segment__btn--active', btnCh === ch);
      }
    }

    if (storeCategorySelect) {
      const showCategory = ch === 'global';
      storeCategorySelect.classList.toggle('hidden', !showCategory);
      storeCategorySelect.disabled = !showCategory;
    }

    if (storeSourceLabel) {
      storeSourceLabel.textContent =
        ch === 'global' ? 'Global App Store' : ch === 'dev' ? 'AxeSuite DEV' : 'AxeSuite MAIN';
    }

    if (storeSourceDesc) {
      storeSourceDesc.textContent =
        ch === 'global'
          ? 'Browse community app templates and install them into 5tratumOS.'
          : ch === 'dev'
            ? 'Preview channel for AxeSuite apps (use with caution).'
            : 'Stable releases for AxeSuite apps.';
    }

    if (storeSearchInput) {
      storeSearchInput.placeholder = ch === 'global' ? 'Search global apps...' : 'Search apps...';
    }
  }

  function syncStoreCategoryOptions(apps) {
    if (!storeCategorySelect) return;
    const ch = String(activeStoreChannel || 'main').toLowerCase();
    if (ch !== 'global') return;

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
    if (!ch || !['main', 'dev', 'global'].includes(ch)) return;
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

  function pendingKindFor(appId) {
    const id = String(appId || '').trim();
    if (!id) return '';
    const v = pendingAppActions.get(id);
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v && 'kind' in v) return String(v.kind || '');
    return '';
  }

  function pendingAgeMsFor(appId) {
    const id = String(appId || '').trim();
    if (!id) return 0;
    const v = pendingAppActions.get(id);
    if (!v || typeof v === 'string') return 0;
    if (typeof v === 'object' && v && 'startedAt' in v) {
      const t = Number(v.startedAt);
      if (Number.isFinite(t) && t > 0) return Date.now() - t;
    }
    return 0;
  }

  function appStatusForUi(appId, installed) {
    const id = String(appId || '').trim();
    const pending = id ? pendingKindFor(id) : '';
    const raw = installed && typeof installed === 'object' ? installed.status : '';
    const s = String(raw || '').trim().toLowerCase();
    const stoppedLike = s === 'not-created' || s === 'not_created' || s === 'not created' || s === 'stopped' || s === 'exited' || s === 'dead';
    const runningLike = s === 'running';

    // Guard against stale pending UI states: if the daemon already reports a stable state,
    // prefer it and clear the pending marker.
    if (pending) {
      if ((pending === 'restart' || pending === 'up' || pending === 'redeploy') && runningLike) {
        pendingAppActions.delete(id);
        return 'running';
      }
      if (pending === 'down' && stoppedLike) {
        pendingAppActions.delete(id);
        return 'stopped';
      }
      const ageMs = pendingAgeMsFor(id);
      if (ageMs > 2 * 60 * 1000) pendingAppActions.delete(id);
    }

    if (pending === 'restart') return 'restarting';
    if (pending === 'up') return 'starting';
    if (pending === 'down') return 'stopping';
    if (pending === 'redeploy') return 'redeploying';
    if (!s) return 'installed';
    if (s === 'not-created' || s === 'not_created' || s === 'not created') return 'stopped';
    if (s === 'created') return 'starting';
    if (s === 'exited' || s === 'dead') return 'stopped';
    return s;
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

  function sanitizeStoreText(value) {
    const raw = String(value ?? '');
    if (!raw) return raw;
    const u = ['u', 'm', 'b', 'r', 'e', 'l'].join('');
    return raw
      .replace(new RegExp(`\\b${u}OS\\b`, 'gi'), '5tratumOS')
      .replace(new RegExp(`\\b${u} App Store\\b`, 'gi'), 'Global App Store')
      .replace(new RegExp(`\\b${u}\\b`, 'gi'), '5tratumOS');
  }

  function attachGithubRawFallback(img) {
    if (!(img instanceof HTMLImageElement)) return;
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      const current = String(img.currentSrc || img.src || '').trim();
      if (!current) return;
      const tried = new Set(String(img.dataset.forgeosTried || '').split('|').filter(Boolean));
      tried.add(current);

      const candidates = [];
      if (current.includes('/raw.githubusercontent.com/')) {
        if (current.includes('/master/')) candidates.push(current.replace('/master/', '/main/'));
        if (current.includes('/main/')) candidates.push(current.replace('/main/', '/master/'));

        const m = current.match(/^(https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/(?:master|main)\/[^/]+)\/(.+)$/);
        if (m) {
          const base = m[1];
          const rel = m[2];
          if (!rel.startsWith('gallery/') && !rel.startsWith('images/') && !rel.startsWith('screenshots/')) {
            const fn = rel.split('/').pop();
            if (fn) candidates.push(`${base}/gallery/${fn}`);
          } else {
            const fn = rel.split('/').pop();
            if (fn) candidates.push(`${base}/${fn}`);
          }

          if (rel.endsWith('.svg')) candidates.push(`${base}/icon.png`);
          if (rel.endsWith('/icon.png')) candidates.push(`${base}/icon.svg`);
        }
      }

      for (const next of candidates) {
        if (!next || tried.has(next)) continue;
        img.dataset.forgeosTried = Array.from(tried).join('|');
        img.src = next;
        return;
      }

      const finalFallback = String(img.dataset.fallbackSrc || '').trim();
      if (finalFallback && !tried.has(finalFallback)) {
        img.dataset.forgeosTried = Array.from(tried).join('|');
        img.src = finalFallback;
      }
    });
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
    axedoom: {
      id: 'axedoom',
      name: 'AxeDoom',
      desc: 'Play Doom in your browser (Freedoom). Optional install.',
      tag: 'Fun',
      logo: makeLogo('D', 'AxeDoom', '#00e5ff', '#ff2bd6'),
      screenshots: [makeShot('AxeDoom', 'Freedoom + Chocolate Doom (noVNC)')],
    },
  };

  function metaFor(id, opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const prefer = String(options.prefer || 'installed').toLowerCase() === 'store' ? 'store' : 'installed';
    const store =
      prefer === 'store'
        ? storeById.get(id) || installedStoreById.get(id) || null
        : installedStoreById.get(id) || storeById.get(id) || null;
    if (store && typeof store === 'object') {
      const name = sanitizeStoreText(String(store.name || id));
      const tagline = sanitizeStoreText(String(store.tagline || '')).trim();
      const description = sanitizeStoreText(String(store.description || '')).trim();
      const category = sanitizeStoreText(String(store.category || '')).trim();
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
        version: sanitizeStoreText(String(store.version || '')),
        developer: sanitizeStoreText(String(store.developer || '')),
        website: String(store.website || ''),
        repo,
        support: sanitizeStoreText(String(store.support || '')),
        installable: !!store.installable,
      };
    }

    const fallback = APP_CATALOG[id] || null;
    const channel = String(activeStoreChannel || 'main');
    if (fallback) return { ...fallback, channel, installable: true };
    return { id, name: id, desc: '', tag: 'App', logo: null, screenshots: [], channel, installable: true };
  }

  function statusKeyForUi(text) {
    const t = String(text || '').trim().toLowerCase();
    if (!t) return 'starting';
    if (t.includes('online') || t.includes('running') || t.includes('ready')) return 'online';
    if (t.includes('start') || t.includes('init') || t.includes('boot')) return 'starting';
    if (t.includes('offline') || t.includes('down') || t.includes('error') || t.includes('fail')) return 'offline';
    return 'starting';
  }

  function setStatus(text) {
    const label = String(text || '').trim() || 'Status';
    if (statusPill) statusPill.textContent = label;
    if (statusDockBtn) {
      statusDockBtn.title = label;
      statusDockBtn.setAttribute('aria-label', label);
      statusDockBtn.dataset.status = statusKeyForUi(label);
    }
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
    activeViewKey = String(viewKey || '').trim() || 'dashboard';

    Object.entries(views).forEach(([k, el]) => {
      if (!el) return;
      if (k === activeViewKey) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    syncDashboardModeUi();

    const meta = viewMeta[activeViewKey] || { title: activeViewKey, subtitle: '' };
    if (viewTitle) viewTitle.textContent = meta.title;
    if (viewSubtitle) viewSubtitle.textContent = meta.subtitle || '';

    if (activeViewKey === 'settings') {
      refreshSshStatus().catch(() => {});
      refreshSystemUpdateStatus().catch(() => {});
      refreshSystemUpdateConfig().catch(() => {});
      refreshSystemUpdateCheck().catch(() => {});
      renderWidgetSettings();
    }

    if (activeViewKey === 'dashboard') renderWorkspace();
  }

  function syncDashboardModeUi() {
    navButtons.forEach((btn) => {
      const view = String(btn.getAttribute('data-view') || '').trim();
      if (!view) return btn.classList.remove('forgeos-nav-item--active');
      if (view !== activeViewKey) return btn.classList.remove('forgeos-nav-item--active');

      if (view === 'dashboard') {
        const mode = String(btn.getAttribute('data-dashboard-mode') || '').trim().toLowerCase();
        if (mode) {
          btn.classList.toggle('forgeos-nav-item--active', mode === String(dashboardMode || 'fleet').toLowerCase());
          return;
        }
      }

      btn.classList.add('forgeos-nav-item--active');
    });
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

  function openNoticeModal(options) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return Promise.resolve();
    const opts = options && typeof options === 'object' ? options : {};
    const title = String(opts.title || 'Notice').trim() || 'Notice';
    const message = String(opts.message || '').trim();
    const kind = String(opts.kind || 'Notice').trim() || 'Notice';
    const primaryText = String(opts.primaryText || 'OK').trim() || 'OK';
    const danger = !!opts.danger;

    return new Promise((resolve) => {
      modalOnClose = () => resolve();
      if (modalKindEl) modalKindEl.textContent = kind;
      modalTitleEl.textContent = title;
      modalBodyEl.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col gap-4';

      const p = document.createElement('div');
      p.className = 'text-sm text-slate-200 whitespace-pre-wrap';
      p.textContent = message || '';
      wrap.appendChild(p);

      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end gap-2';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `axe-btn${danger ? ' forgeos-btn--danger' : ''}`;
      btn.textContent = primaryText;
      btn.addEventListener('click', () => closeModal());
      actions.appendChild(btn);

      wrap.appendChild(actions);
      modalBodyEl.appendChild(wrap);

      modalEl.classList.remove('hidden');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => btn.focus(), 20);
    });
  }

  function openConfirmModal(options) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return Promise.resolve(false);
    const opts = options && typeof options === 'object' ? options : {};
    const title = String(opts.title || 'Confirm').trim() || 'Confirm';
    const message = String(opts.message || '').trim();
    const kind = String(opts.kind || 'Confirm').trim() || 'Confirm';
    const confirmText = String(opts.confirmText || 'Confirm').trim() || 'Confirm';
    const cancelText = String(opts.cancelText || 'Cancel').trim() || 'Cancel';
    const danger = !!opts.danger;

    return new Promise((resolve) => {
      let settled = false;
      modalOnClose = () => {
        if (settled) return;
        settled = true;
        resolve(false);
      };

      if (modalKindEl) modalKindEl.textContent = kind;
      modalTitleEl.textContent = title;
      modalBodyEl.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col gap-4';

      const p = document.createElement('div');
      p.className = 'text-sm text-slate-200 whitespace-pre-wrap';
      p.textContent = message || '';
      wrap.appendChild(p);

      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end gap-2';

      const btnCancel = document.createElement('button');
      btnCancel.type = 'button';
      btnCancel.className = 'axe-btn';
      btnCancel.textContent = cancelText;
      btnCancel.addEventListener('click', () => closeModal());

      const btnOk = document.createElement('button');
      btnOk.type = 'button';
      btnOk.className = `axe-btn${danger ? ' forgeos-btn--danger' : ''}`;
      btnOk.textContent = confirmText;
      btnOk.addEventListener('click', () => {
        settled = true;
        resolve(true);
        closeModal();
      });

      actions.appendChild(btnCancel);
      actions.appendChild(btnOk);
      wrap.appendChild(actions);
      modalBodyEl.appendChild(wrap);

      modalEl.classList.remove('hidden');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => btnOk.focus(), 20);
    });
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
          openNoticeModal({
            kind: 'Error',
            title: 'Action failed',
            message: err && err.message ? String(err.message) : String(err),
            danger: true,
          }).catch(() => {});
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
    const pad2 = (n) => String(Math.max(0, Math.floor(Number(n) || 0))).padStart(2, '0');
    const timeText = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    const dateText = d.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' });

    if (sidebarClockEl) {
      let t = sidebarClockEl.querySelector('.forgeos-clock__time');
      let sub = sidebarClockEl.querySelector('.forgeos-clock__date');
      let analog = sidebarClockEl.querySelector('.forgeos-clock__analog');
      if (!(t instanceof HTMLElement)) {
        sidebarClockEl.textContent = '';
        t = document.createElement('div');
        t.className = 'forgeos-clock__time';
        sidebarClockEl.appendChild(t);
        sub = document.createElement('div');
        sub.className = 'forgeos-clock__date';
        sidebarClockEl.appendChild(sub);

        analog = document.createElement('div');
        analog.className = 'forgeos-clock__analog';
        analog.setAttribute('aria-hidden', 'true');
        analog.innerHTML = `
          <span class="forgeos-clock__hand forgeos-clock__hand--hour"></span>
          <span class="forgeos-clock__hand forgeos-clock__hand--min"></span>
          <span class="forgeos-clock__hand forgeos-clock__hand--sec"></span>
          <span class="forgeos-clock__dot"></span>
        `.trim();
        sidebarClockEl.appendChild(analog);
      }
      t.textContent = timeText;
      if (sub instanceof HTMLElement) sub.textContent = dateText;
      sidebarClockEl.title = dateText;

      const sec = d.getSeconds();
      const min = d.getMinutes() + sec / 60;
      const hour = (d.getHours() % 12) + min / 60;

      const hourHand = sidebarClockEl.querySelector('.forgeos-clock__hand--hour');
      const minHand = sidebarClockEl.querySelector('.forgeos-clock__hand--min');
      const secHand = sidebarClockEl.querySelector('.forgeos-clock__hand--sec');

      if (hourHand instanceof HTMLElement) hourHand.style.setProperty('--rot', `${hour * 30}deg`);
      if (minHand instanceof HTMLElement) minHand.style.setProperty('--rot', `${min * 6}deg`);
      if (secHand instanceof HTMLElement) secHand.style.setProperty('--rot', `${sec * 6}deg`);
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
    if (metricCpuBar) metricCpuBar.style.width = '0%';
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

  function formatCompactNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    const abs = Math.abs(n);
    const units = [
      { v: 1e12, s: 'T' },
      { v: 1e9, s: 'B' },
      { v: 1e6, s: 'M' },
      { v: 1e3, s: 'K' },
    ];
    for (const u of units) {
      if (abs >= u.v) {
        const scaled = n / u.v;
        const decimals = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
        return `${scaled.toFixed(decimals)}${u.s}`;
      }
    }
    return String(Math.round(n));
  }

  const _VERSION_RE = /^\s*v?(\d+(?:\.\d+)*)(?:[-+](.*))?\s*$/i;

  function versionKey(value) {
    const raw = String(value || '').trim();
    if (!raw) return { nums: [0, 0, 0], rank: 0, suffix: '' };
    const m = raw.match(_VERSION_RE);
    if (!m) return { nums: [0, 0, 0], rank: 0, suffix: raw.toLowerCase() };
    const nums = String(m[1] || '0')
      .split('.')
      .map((p) => (p && /^\d+$/.test(p) ? Number(p) : 0))
      .slice(0, 3);
    while (nums.length < 3) nums.push(0);
    const suffix = String(m[2] || '').trim().toLowerCase();
    let rank = 1;
    if (!suffix) rank = 5;
    else if (suffix.startsWith('rc')) rank = 4;
    else if (suffix.includes('beta')) rank = 3;
    else if (suffix.includes('alpha')) rank = 2;
    else if (suffix.includes('dev')) rank = 1;
    return { nums, rank, suffix };
  }

  function compareVersion(a, b) {
    const ka = versionKey(a);
    const kb = versionKey(b);
    for (let i = 0; i < 3; i += 1) {
      const da = Number(ka.nums[i]) || 0;
      const db = Number(kb.nums[i]) || 0;
      if (da !== db) return da < db ? -1 : 1;
    }
    if (ka.rank !== kb.rank) return ka.rank < kb.rank ? -1 : 1;
    if (ka.suffix !== kb.suffix) return ka.suffix < kb.suffix ? -1 : 1;
    return 0;
  }

  function isUpdateAvailable(installed, latest) {
    const i = String(installed || '').trim();
    const l = String(latest || '').trim();
    if (!i || !l) return false;
    return compareVersion(i, l) < 0;
  }

  function formatWidgetStatText(title, text) {
    const t = String(title || '').trim().toLowerCase();
    const raw = String(text ?? '').trim();
    if (!raw) return '-';

    // Accept formatted numerics (e.g. "450,225,552") from upstream widgets.
    const numeric = raw.replace(/,/g, '');
    if (!/^-?\d+(?:\.\d+)?$/.test(numeric)) return raw;
    const num = Number(numeric);
    if (!Number.isFinite(num)) return raw;
    if (t.includes('share') || t.includes('shares') || t.includes('best')) return formatCompactNumber(num);
    return raw;
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
    if (metricCpuBar) metricCpuBar.style.width = `${Math.max(0, Math.min(100, cpuPct))}%`;

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
      disks.find((d) => d && d.path === '/srv/5tratumos-data') || disks.find((d) => d && d.path === '/') || null;
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
    if (maximizedAppId && !openAppIds.includes(maximizedAppId)) maximizedAppId = null;
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

  function setWorkspaceLayout(count, opts) {
    if (!workspaceEl) return;
    const options = opts && typeof opts === 'object' ? opts : {};
    const maximized = !!options.maximized;
    workspaceEl.classList.remove(
      'forgeos-workspace--1',
      'forgeos-workspace--2',
      'forgeos-workspace--3',
      'forgeos-workspace--4',
      'forgeos-workspace--maximized',
    );
    if (maximized) {
      workspaceEl.classList.add('forgeos-workspace--maximized');
      return;
    }
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
    const status = appStatusForUi(id, installed);

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
    logo.loading = 'lazy';
    logo.decoding = 'async';
    const fallbackLogo = fallbackLogoFor(id, meta.name || id);
    const primaryLogo = String(meta.logo || '').trim() || fallbackLogo;
    logo.src = primaryLogo;
    logo.addEventListener('error', () => {
      if (logo.dataset.fallbackApplied === '1') return;
      logo.dataset.fallbackApplied = '1';
      logo.src = fallbackLogo;
    });

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

    const btnMin = document.createElement('button');
    btnMin.type = 'button';
    btnMin.className = 'forgeos-tile__btn forgeos-tile__btn--min';
    btnMin.title = 'Restore';
    btnMin.setAttribute('aria-label', 'Restore');
    btnMin.textContent = '';
    btnMin.disabled = maximizedAppId !== id;
    btnMin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (maximizedAppId !== id) return;
      maximizedAppId = null;
      renderWorkspace();
    });

    const btnMax = document.createElement('button');
    btnMax.type = 'button';
    btnMax.className = 'forgeos-tile__btn forgeos-tile__btn--max';
    btnMax.title = 'Maximize';
    btnMax.setAttribute('aria-label', 'Maximize');
    btnMax.textContent = '';
    btnMax.disabled = maximizedAppId === id;
    btnMax.addEventListener('click', (e) => {
      e.stopPropagation();
      if (maximizedAppId === id) return;
      maximizedAppId = id;
      setDashboardMode('apps');
      selectedAppId = id;
      syncInstalledSelection();
      updateAppHeader();
      renderWorkspace();
    });

    const btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'forgeos-tile__close';
    btnClose.title = 'Close';
    btnClose.textContent = 'x';
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAppOpen({ id });
    });

    const btnPop = document.createElement('button');
    btnPop.type = 'button';
    btnPop.className = 'forgeos-tile__btn forgeos-tile__btn--pop';
    btnPop.title = 'Open in new tab';
    btnPop.setAttribute('aria-label', 'Open in new tab');
    btnPop.textContent = '\u2197';
    btnPop.disabled = !isAppLaunchable(id);
    if (btnPop.disabled) btnPop.title = 'Start the app to open it';
    btnPop.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isAppLaunchable(id)) return;
      const url = `${window.location.origin}/apps/${encodeURIComponent(id)}/`;
      window.open(url, '_blank', 'noopener');
    });

    actions.appendChild(btnMin);
    actions.appendChild(btnMax);
    actions.appendChild(btnPop);
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
    iframe.addEventListener('focus', noteUserActivity);
    iframe.addEventListener('pointerdown', noteUserActivity, { passive: true });
    const pathUrl = `${window.location.origin}/apps/${encodeURIComponent(id)}/`;
    iframe.src = pathUrl;
    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        try {
          doc.addEventListener('pointerdown', noteUserActivity, { passive: true, capture: true });
          doc.addEventListener('keydown', noteUserActivity, { passive: true, capture: true });
          doc.addEventListener('wheel', noteUserActivity, { passive: true, capture: true });
        } catch {}
        if (doc.getElementById('forgeos-embed-style')) return;
        const style = doc.createElement('style');
        style.id = 'forgeos-embed-style';
        style.textContent = `
          :root { color-scheme: dark; }
          * { scrollbar-color: rgba(148,163,184,.42) rgba(0,0,0,.55); scrollbar-width: thin; }
          *::-webkit-scrollbar { width: 10px; height: 10px; }
          *::-webkit-scrollbar-track { background: rgba(0,0,0,.55); }
          *::-webkit-scrollbar-thumb { background: rgba(148,163,184,.28); border-radius: 999px; border: 2px solid rgba(0,0,0,.55); }
          *::-webkit-scrollbar-thumb:hover { background: rgba(226,232,240,.22); }
        `.trim();
        (doc.head || doc.documentElement).appendChild(style);
      } catch {}
    });

    const ui = installed && installed.ui && typeof installed.ui === 'object' ? installed.ui : null;
    const port = ui && ui.port ? Number(ui.port) : 0;
    const host = window.location.hostname;
    const fallbackUrl = port ? `http://${host}:${port}/` : 'about:blank';
    attachCompatFallback(iframe, id, pathUrl, fallbackUrl);

    frameWrap.appendChild(iframe);

    const overlay = document.createElement('div');
    overlay.className = 'forgeos-tile__overlay hidden';
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
    const overlayText = document.createElement('div');
    overlayText.className = 'forgeos-tile__overlay-text';
    overlayText.textContent = 'Restarting...';
    overlay.appendChild(overlayText);
    frameWrap.appendChild(overlay);

    tile.draggable = !maximizedAppId;
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

  function updateTile(tile, app) {
    if (!(tile instanceof HTMLElement)) return;
    const id = String(tile.dataset.appId || '').trim();
    if (!id) return;

    const meta = metaFor(id);
    const installed = installedById.get(id) || null;
    const status = appStatusForUi(id, installed);

    tile.setAttribute('aria-label', meta.name || id);
    tile.draggable = !maximizedAppId;

    const nameEl = tile.querySelector('.forgeos-tile__name');
    if (nameEl) nameEl.textContent = meta.name || id;

    const pill = tile.querySelector('.axe-pill');
    if (pill) pill.textContent = status;

    const overlay = tile.querySelector('.forgeos-tile__overlay');
    if (overlay instanceof HTMLElement) {
      const pending = pendingKindFor(id);
      const ageMs = pendingAgeMsFor(id);
      const raw = installed && typeof installed === 'object' ? installed.status : '';
      const s = String(raw || '').trim().toLowerCase();
      const stoppedLike = s === 'stopped' || s === 'not-created' || s === 'not_created' || s === 'not created' || s === 'exited' || s === 'dead';
      const runningLike = s === 'running';
      const stale = ageMs > (pending === 'redeploy' ? 10 * 60 * 1000 : 2 * 60 * 1000);
      let show = false;
      if (!stale) {
        if (pending === 'restart' || pending === 'up' || pending === 'redeploy') show = !runningLike;
        else if (pending === 'down') show = !stoppedLike;
      }
      overlay.classList.toggle('hidden', !show);
      overlay.style.display = show ? 'flex' : 'none';
      overlay.setAttribute('aria-hidden', show ? 'false' : 'true');
      const txt = overlay.querySelector('.forgeos-tile__overlay-text');
      if (txt instanceof HTMLElement) {
        txt.textContent =
          pending === 'up'
            ? 'Starting...'
            : pending === 'down'
              ? 'Stopping...'
              : pending === 'redeploy'
                ? 'Redeploying...'
                : 'Restarting...';
      }
    }

    const btnMin = tile.querySelector('.forgeos-tile__btn--min');
    if (btnMin instanceof HTMLButtonElement) btnMin.disabled = maximizedAppId !== id;
    const btnMax = tile.querySelector('.forgeos-tile__btn--max');
    if (btnMax instanceof HTMLButtonElement) btnMax.disabled = maximizedAppId === id;

    const logo = tile.querySelector('.forgeos-tile__logo');
    if (logo instanceof HTMLImageElement) {
      const fallbackLogo = fallbackLogoFor(id, meta.name || id);
      const nextSrc = String(meta.logo || '').trim() || fallbackLogo;
      if (logo.src !== nextSrc) logo.src = nextSrc;
    }
  }

  function getOrCreateTile(app) {
    const id = String(app && app.id ? app.id : '').trim();
    if (!id) return null;
    const existing = workspaceTileById.get(id) || null;
    if (existing) {
      updateTile(existing, app);
      return existing;
    }
    const tile = makeTile(app);
    if (tile) workspaceTileById.set(id, tile);
    return tile;
  }

  function renderWorkspace() {
    if (!workspaceEl) return;

    normalizeOpenApps();

    const apps = openAppIds.map((id) => installedById.get(id) || { id });

    const count = apps.length;
    syncDashboardModeUi();

    const mode = String(dashboardMode || 'fleet').toLowerCase();
    const showDesktop = mode === 'desktop';
    const showAppsList = mode === 'appslist';
    // Workbench (apps mode) shows the workspace when apps are open. When no apps are open,
    // show the Fleet dashboard cards instead of duplicating the Apps list view.
    const showFleet = mode === 'fleet' || (mode === 'apps' && count === 0);
    const showAppsLauncher = showAppsList;
    const showWorkspace = mode === 'apps' && count > 0;

    if (paneDesktopEl) paneDesktopEl.classList.toggle('hidden', !showDesktop);
    if (paneAppsLauncherEl) paneAppsLauncherEl.classList.toggle('hidden', !showAppsLauncher);

    const isMaximized = !!(maximizedAppId && openAppIds.includes(maximizedAppId));
    if (maximizedAppId && !isMaximized) maximizedAppId = null;
    const visibleApps = isMaximized ? apps.filter((a) => String(a && a.id ? a.id : '').trim() === maximizedAppId) : apps;
    setWorkspaceLayout(showWorkspace ? (isMaximized ? 1 : count) : 0, { maximized: showWorkspace && isMaximized });
    if (workspaceEmptyEl) workspaceEmptyEl.style.display = showFleet ? 'block' : 'none';
    workspaceEl.style.display = showWorkspace ? 'grid' : 'none';

    if (!showWorkspace) {
      if (count === 0) {
        workspaceEl.innerHTML = '';
        workspaceTileById.clear();
      }
      return;
    }

    const keep = new Set(openAppIds);
    for (const [id, tile] of workspaceTileById.entries()) {
      if (keep.has(id)) continue;
      try {
        tile.remove();
      } catch {}
      workspaceTileById.delete(id);
    }

    // Keep tiles mounted to avoid iframe reloads during periodic refresh.
    // Hide non-maximized tiles via `.hidden` instead of removing them.
    const visibleSet = new Set(
      visibleApps.map((a) => String(a && a.id ? a.id : '').trim()).filter(Boolean),
    );
    const desired = [];
    for (const app of apps) {
      const tile = getOrCreateTile(app);
      if (!tile) continue;
      updateTile(tile, app);
      const id = String(app && app.id ? app.id : '').trim();
      desired.push({ id, tile, app });
    }

    const desiredIds = desired.map((e) => e.id).filter(Boolean);
    const currentIds = Array.from(workspaceEl.children)
      .map((n) => (n instanceof HTMLElement ? String(n.dataset.appId || '').trim() : ''))
      .filter(Boolean);

    const sameOrder =
      currentIds.length === desiredIds.length &&
      currentIds.every((id, idx) => id === desiredIds[idx]);

    if (!sameOrder) {
      // Ensure all desired tiles are mounted and ordered; this is the only time we move nodes.
      for (const entry of desired) {
        if (entry.tile.parentElement !== workspaceEl) {
          workspaceEl.appendChild(entry.tile);
        }
      }
      let cursor = workspaceEl.firstChild;
      for (const entry of desired) {
        if (entry.tile === cursor) {
          cursor = cursor ? cursor.nextSibling : null;
          continue;
        }
        workspaceEl.insertBefore(entry.tile, cursor);
      }
    }

    for (const entry of desired) {
      const id = entry.id;
      const tile = entry.tile;
      const isTileMaximized = !!(isMaximized && maximizedAppId && id === maximizedAppId);
      tile.classList.toggle('forgeos-tile--maximized', isTileMaximized);
      tile.classList.toggle('hidden', !!id && !visibleSet.has(id));
    }
  }

  function ensureDesktopStateShape(state) {
    const st = state && typeof state === 'object' ? state : {};
    const items = st.items && typeof st.items === 'object' ? st.items : {};
    return { ...st, items };
  }

  function desktopItemIdForApp(appId) {
    const id = String(appId || '').trim();
    return id ? `app:${id}` : '';
  }

  function desktopStateFromV1(parsed) {
    const icons = parsed && parsed.icons && typeof parsed.icons === 'object' ? parsed.icons : {};
    const items = {};
    for (const [idRaw, pos] of Object.entries(icons)) {
      const appId = String(idRaw || '').trim();
      if (!appId) continue;
      const x = pos && typeof pos === 'object' ? Number(pos.x) : 0;
      const y = pos && typeof pos === 'object' ? Number(pos.y) : 0;
      items[desktopItemIdForApp(appId)] = { type: 'app', appId, x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
    }
    return { items };
  }

  function loadDesktopState() {
    try {
      const rawV2 = String(window.localStorage.getItem(DESKTOP_STATE_KEY_V2) || '').trim();
      if (rawV2) {
        const parsed = JSON.parse(rawV2);
        if (parsed && typeof parsed === 'object') return ensureDesktopStateShape(parsed);
      }
    } catch {}

    try {
      const rawV1 = String(window.localStorage.getItem(DESKTOP_STATE_KEY_V1) || '').trim();
      if (!rawV1) return { items: {} };
      const parsed = JSON.parse(rawV1);
      if (!parsed || typeof parsed !== 'object') return { items: {} };
      return ensureDesktopStateShape(desktopStateFromV1(parsed));
    } catch {
      return { items: {} };
    }
  }

  function saveDesktopState() {
    try {
      window.localStorage.setItem(DESKTOP_STATE_KEY_V2, JSON.stringify(ensureDesktopStateShape(desktopState)));
    } catch {}
  }

  function desktopItemEntries() {
    const items = desktopState && desktopState.items && typeof desktopState.items === 'object' ? desktopState.items : {};
    return Object.entries(items).filter(([id]) => !!id);
  }

  function desktopItemsSorted() {
    const entries = desktopItemEntries()
      .map(([id, item]) => [id, item && typeof item === 'object' ? item : null])
      .filter(([, item]) => !!item);
    entries.sort((a, b) => {
      const ay = Number(a[1].y) || 0;
      const by = Number(b[1].y) || 0;
      if (ay !== by) return ay - by;
      const ax = Number(a[1].x) || 0;
      const bx = Number(b[1].x) || 0;
      if (ax !== bx) return ax - bx;
      return String(a[0]).localeCompare(String(b[0]));
    });
    return entries;
  }

  function desktopFindFolderIdForApp(appId) {
    const id = String(appId || '').trim();
    if (!id) return '';
    for (const [itemId, item] of desktopItemEntries()) {
      if (!item || typeof item !== 'object') continue;
      if (String(item.type || '') !== 'folder') continue;
      const apps = Array.isArray(item.appIds) ? item.appIds : [];
      if (apps.includes(id)) return itemId;
    }
    return '';
  }

  function isPinnedToDesktop(appId) {
    const id = String(appId || '').trim();
    if (!id) return false;
    const itemId = desktopItemIdForApp(id);
    const items = desktopState && desktopState.items && typeof desktopState.items === 'object' ? desktopState.items : {};
    if (items[itemId]) return true;
    return !!desktopFindFolderIdForApp(id);
  }

  const DESKTOP_GRID = { x: 92, y: 108, marginX: 18, marginY: 18 };

  function clampDesktopPos(x, y) {
    const px = Math.max(0, Math.round(Number(x) || 0));
    const py = Math.max(0, Math.round(Number(y) || 0));
    if (!desktopSurfaceEl) return { x: px, y: py };
    const rect = desktopSurfaceEl.getBoundingClientRect();
    const layoutW = desktopSurfaceEl.offsetWidth || rect.width || 0;
    const layoutH = desktopSurfaceEl.offsetHeight || rect.height || 0;
    if (!Number.isFinite(layoutW) || !Number.isFinite(layoutH) || layoutW < 160 || layoutH < 180) {
      return { x: px, y: py };
    }
    const iconW = 84;
    const iconH = 108;
    const maxX = Math.max(0, Math.floor(layoutW - iconW - 10));
    const maxY = Math.max(0, Math.floor(layoutH - iconH - 10));
    return { x: Math.min(maxX, px), y: Math.min(maxY, py) };
  }

  function snapDesktopPos(x, y) {
    const gx = DESKTOP_GRID.x;
    const gy = DESKTOP_GRID.y;
    const mx = DESKTOP_GRID.marginX;
    const my = DESKTOP_GRID.marginY;
    const sx = Math.max(0, Math.round((Number(x) - mx) / gx) * gx + mx);
    const sy = Math.max(0, Math.round((Number(y) - my) / gy) * gy + my);
    return clampDesktopPos(sx, sy);
  }

  function defaultDesktopPosition() {
    const ids = desktopItemEntries().map(([id]) => id);
    const colW = DESKTOP_GRID.x;
    const rowH = DESKTOP_GRID.y;
    const x0 = DESKTOP_GRID.marginX;
    const y0 = DESKTOP_GRID.marginY;
    const cols = 6;
    const idx = ids.length;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return snapDesktopPos(x0 + col * colW, y0 + row * rowH);
  }

  function pinToDesktop(appId, pos) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (!desktopState || typeof desktopState !== 'object') desktopState = { items: {} };
    if (!desktopState.items || typeof desktopState.items !== 'object') desktopState.items = {};
    if (isPinnedToDesktop(id)) return;
    const itemId = desktopItemIdForApp(id);
    const p = pos && typeof pos === 'object' ? pos : defaultDesktopPosition();
    const snapped = snapDesktopPos(p.x, p.y);
    desktopState.items[itemId] = { type: 'app', appId: id, x: snapped.x, y: snapped.y };
    saveDesktopState();
    renderDesktop();
  }

  function unpinFromDesktop(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items) return;
    delete desktopState.items[desktopItemIdForApp(id)];

    const folderId = desktopFindFolderIdForApp(id);
    if (folderId && desktopState.items[folderId] && desktopState.items[folderId].type === 'folder') {
      const folder = desktopState.items[folderId];
      folder.appIds = Array.isArray(folder.appIds) ? folder.appIds.filter((a) => a !== id) : [];
      normalizeDesktopFolder(folderId);
    }
    saveDesktopState();
    renderDesktop();
  }

  function desktopSurfacePoint(evt) {
    if (!desktopSurfaceEl) return { x: 0, y: 0 };
    const rect = desktopSurfaceEl.getBoundingClientRect();
    const layoutW = desktopSurfaceEl.offsetWidth || rect.width || 1;
    const layoutH = desktopSurfaceEl.offsetHeight || rect.height || 1;
    const scaleX = rect.width > 0 ? rect.width / layoutW : 1;
    const scaleY = rect.height > 0 ? rect.height / layoutH : 1;
    const x = ((evt.clientX || 0) - rect.left) / (scaleX || 1);
    const y = ((evt.clientY || 0) - rect.top) / (scaleY || 1);
    return { x: Math.max(0, x), y: Math.max(0, y) };
  }

  function setDesktopItemPosition(itemId, x, y) {
    const id = String(itemId || '').trim();
    if (!id) return;
    if (!desktopState || typeof desktopState !== 'object') desktopState = { items: {} };
    if (!desktopState.items || typeof desktopState.items !== 'object') desktopState.items = {};
    if (!desktopState.items[id]) return;
    const snapped = snapDesktopPos(x, y);
    desktopState.items[id].x = snapped.x;
    desktopState.items[id].y = snapped.y;
    saveDesktopState();
  }

  function newDesktopFolderId() {
    return `folder:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }

  function normalizeDesktopFolder(folderId) {
    const id = String(folderId || '').trim();
    if (!id) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items || !desktopState.items[id]) return;
    const folder = desktopState.items[id];
    if (!folder || typeof folder !== 'object' || folder.type !== 'folder') return;

    folder.appIds = uniqOrder(
      (Array.isArray(folder.appIds) ? folder.appIds : []).map((v) => String(v || '').trim()).filter(Boolean),
    );

    if (folder.appIds.length <= 1) {
      const remaining = folder.appIds[0] || '';
      const fx = Number(folder.x) || 0;
      const fy = Number(folder.y) || 0;
      delete desktopState.items[id];
      if (remaining) {
        desktopState.items[desktopItemIdForApp(remaining)] = { type: 'app', appId: remaining, x: fx, y: fy };
      }
    }
  }

  function desktopCreateFolderAt(pos, appIds, opts) {
    if (!desktopState || typeof desktopState !== 'object') desktopState = { items: {} };
    if (!desktopState.items || typeof desktopState.items !== 'object') desktopState.items = {};
    const list = uniqOrder((Array.isArray(appIds) ? appIds : []).map((v) => String(v || '').trim()).filter(Boolean));
    if (list.length < 2) return '';
    const folderId = newDesktopFolderId();
    const name = (opts && typeof opts === 'object' && opts.name ? String(opts.name) : 'Folder').trim() || 'Folder';
    const p = pos && typeof pos === 'object' ? pos : defaultDesktopPosition();
    const snapped = snapDesktopPos(p.x, p.y);
    desktopState.items[folderId] = { type: 'folder', name, x: snapped.x, y: snapped.y, appIds: list };
    for (const appId of list) {
      delete desktopState.items[desktopItemIdForApp(appId)];
    }
    saveDesktopState();
    return folderId;
  }

  function desktopAddAppToFolder(folderId, appId) {
    const fid = String(folderId || '').trim();
    const id = String(appId || '').trim();
    if (!fid || !id) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items || !desktopState.items[fid]) return;
    const folder = desktopState.items[fid];
    if (!folder || typeof folder !== 'object' || folder.type !== 'folder') return;
    folder.appIds = uniqOrder([...(Array.isArray(folder.appIds) ? folder.appIds : []), id]);
    delete desktopState.items[desktopItemIdForApp(id)];
    saveDesktopState();
    normalizeDesktopFolder(fid);
  }

  function desktopMergeFolders(targetFolderId, sourceFolderId) {
    const target = String(targetFolderId || '').trim();
    const source = String(sourceFolderId || '').trim();
    if (!target || !source || target === source) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items) return;
    const tgt = desktopState.items[target];
    const src = desktopState.items[source];
    if (!tgt || !src || tgt.type !== 'folder' || src.type !== 'folder') return;
    tgt.appIds = uniqOrder([...(Array.isArray(tgt.appIds) ? tgt.appIds : []), ...(Array.isArray(src.appIds) ? src.appIds : [])]);
    delete desktopState.items[source];
    normalizeDesktopFolder(target);
    saveDesktopState();
  }

  function desktopUnfolder(folderId) {
    const fid = String(folderId || '').trim();
    if (!fid) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items || !desktopState.items[fid]) return;
    const folder = desktopState.items[fid];
    if (!folder || typeof folder !== 'object' || folder.type !== 'folder') return;
    const baseX = Number(folder.x) || 0;
    const baseY = Number(folder.y) || 0;
    const apps = Array.isArray(folder.appIds) ? folder.appIds.slice() : [];
    delete desktopState.items[fid];

    let idx = 0;
    for (const appIdRaw of apps) {
      const appId = String(appIdRaw || '').trim();
      if (!appId) continue;
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const p = snapDesktopPos(baseX + col * DESKTOP_GRID.x, baseY + row * DESKTOP_GRID.y);
      desktopState.items[desktopItemIdForApp(appId)] = { type: 'app', appId, x: p.x, y: p.y };
      idx += 1;
    }

    saveDesktopState();
  }

  function desktopItemAtClientPoint(excludeItemId, clientX, clientY) {
    if (!desktopSurfaceEl) return '';
    const ex = String(excludeItemId || '').trim();
    const x = Number(clientX) || 0;
    const y = Number(clientY) || 0;
    for (const node of Array.from(desktopSurfaceEl.querySelectorAll('[data-desktop-item-id]'))) {
      if (!(node instanceof HTMLElement)) continue;
      const id = String(node.dataset.desktopItemId || '').trim();
      if (!id || id === ex) continue;
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return id;
    }
    return '';
  }

  function desktopItemByOverlap(excludeItemId, rect) {
    if (!desktopSurfaceEl) return '';
    if (!rect) return '';
    const ex = String(excludeItemId || '').trim();
    const srcLeft = Number(rect.left) || 0;
    const srcTop = Number(rect.top) || 0;
    const srcRight = Number(rect.right) || 0;
    const srcBottom = Number(rect.bottom) || 0;
    const srcArea = Math.max(0, srcRight - srcLeft) * Math.max(0, srcBottom - srcTop);
    if (!srcArea) return '';

    let bestId = '';
    let bestArea = 0;
    for (const node of Array.from(desktopSurfaceEl.querySelectorAll('[data-desktop-item-id]'))) {
      if (!(node instanceof HTMLElement)) continue;
      const id = String(node.dataset.desktopItemId || '').trim();
      if (!id || id === ex) continue;
      const r = node.getBoundingClientRect();
      const left = Math.max(srcLeft, r.left);
      const right = Math.min(srcRight, r.right);
      const top = Math.max(srcTop, r.top);
      const bottom = Math.min(srcBottom, r.bottom);
      const area = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (area > bestArea) {
        bestArea = area;
        bestId = id;
      }
    }

    if (!bestId) return '';
    // Require a meaningful overlap so near-misses don't create folders.
    if (bestArea / srcArea < 0.22) return '';
    return bestId;
  }

  function desktopHandleDrop(draggedItemId, targetItemId) {
    const draggedId = String(draggedItemId || '').trim();
    const targetId = String(targetItemId || '').trim();
    if (!draggedId || !targetId || draggedId === targetId) return false;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items) return false;
    const dragged = desktopState.items[draggedId];
    const target = desktopState.items[targetId];
    if (!dragged || !target) return false;

    if (dragged.type === 'app' && target.type === 'folder') {
      desktopAddAppToFolder(targetId, dragged.appId);
      return true;
    }

    if (dragged.type === 'folder' && target.type === 'folder') {
      desktopMergeFolders(targetId, draggedId);
      return true;
    }

    if (dragged.type === 'folder' && target.type === 'app') {
      desktopAddAppToFolder(draggedId, target.appId);
      delete desktopState.items[desktopItemIdForApp(target.appId)];
      saveDesktopState();
      normalizeDesktopFolder(draggedId);
      return true;
    }

    if (dragged.type === 'app' && target.type === 'app') {
      desktopCreateFolderAt({ x: target.x, y: target.y }, [dragged.appId, target.appId]);
      return true;
    }

    return false;
  }

  function openFolderModal(folderId) {
    const fid = String(folderId || '').trim();
    if (!fid) return;
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    if (!desktopState || typeof desktopState !== 'object' || !desktopState.items || !desktopState.items[fid]) return;
    const folder = desktopState.items[fid];
    if (!folder || typeof folder !== 'object' || folder.type !== 'folder') return;

    if (modalKindEl) modalKindEl.textContent = 'Folder';
    modalTitleEl.textContent = String(folder.name || 'Folder').trim() || 'Folder';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-4';

    const grid = document.createElement('div');
    grid.className = 'forgeos-launcher-grid';

    const apps = Array.isArray(folder.appIds) ? folder.appIds : [];
    for (const appIdRaw of apps) {
      const appId = String(appIdRaw || '').trim();
      if (!appId) continue;
      const meta = metaFor(appId);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'forgeos-launcher-item';
      btn.dataset.appId = appId;

      const icon = document.createElement('img');
      icon.className = 'forgeos-launcher-item__icon';
      icon.alt = '';
      icon.loading = 'lazy';
      icon.decoding = 'async';
      const fallbackLogo = fallbackLogoFor(appId, meta.name || appId);
      const logoUrl = String(meta.logo || '').trim() || fallbackLogo;
      icon.src = logoUrl;
      icon.dataset.logoUrl = logoUrl;
      icon.addEventListener('error', () => {
        if (icon.dataset.fallbackApplied === '1') return;
        icon.dataset.fallbackApplied = '1';
        icon.src = fallbackLogo;
      });

      const name = document.createElement('div');
      name.className = 'forgeos-launcher-item__name';
      name.textContent = meta.name || appId;

      btn.appendChild(icon);
      btn.appendChild(name);

      btn.addEventListener('click', () => {
        closeModal();
        ensureAppOpen({ id: appId });
      });

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(
          [
            {
              label: 'Remove from folder',
              onClick: async () => {
                if (!desktopState.items[fid] || desktopState.items[fid].type !== 'folder') return;
                desktopState.items[fid].appIds = (Array.isArray(desktopState.items[fid].appIds) ? desktopState.items[fid].appIds : []).filter(
                  (a) => a !== appId,
                );
                normalizeDesktopFolder(fid);
                if (!isPinnedToDesktop(appId)) pinToDesktop(appId);
                saveDesktopState();
                renderDesktop();
                if (!desktopState.items[fid] || desktopState.items[fid].type !== 'folder') {
                  closeModal();
                  return;
                }
                openFolderModal(fid);
              },
            },
          ],
          e.clientX,
          e.clientY,
        );
      });

      grid.appendChild(btn);
    }

    wrap.appendChild(grid);
    modalBodyEl.appendChild(wrap);
    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function renderDesktop() {
    if (!desktopSurfaceEl) return;
    if (String(dashboardMode || 'fleet') !== 'desktop') return;

    desktopState = ensureDesktopStateShape(desktopState);

    let normalized = false;
    const existing = new Map();
    for (const node of Array.from(desktopSurfaceEl.querySelectorAll('[data-desktop-item-id]'))) {
      if (!(node instanceof HTMLElement)) continue;
      const itemId = String(node.dataset.desktopItemId || '').trim();
      if (!itemId) continue;
      existing.set(itemId, node);
    }

    const entries = desktopItemsSorted();
    if (desktopEmptyEl) desktopEmptyEl.classList.toggle('hidden', entries.length > 0);

    const keep = new Set(entries.map(([id]) => id));
    for (const [itemId, node] of existing.entries()) {
      if (keep.has(itemId)) continue;
      try {
        node.remove();
      } catch {}
      existing.delete(itemId);
    }

    for (const [itemId, item] of entries) {
      if (!item || typeof item !== 'object') continue;
      const snapped = snapDesktopPos(Number(item.x) || 0, Number(item.y) || 0);
      if (Number(item.x) !== snapped.x || Number(item.y) !== snapped.y) {
        item.x = snapped.x;
        item.y = snapped.y;
        normalized = true;
      }

      let node = existing.get(itemId) || null;
      if (!node) {
        node = document.createElement('div');
        node.className = 'forgeos-desktop-icon';
        node.dataset.desktopItemId = itemId;
        node.tabIndex = 0;

        if (item.type === 'folder') {
          node.classList.add('forgeos-desktop-folder');
          node.dataset.folderId = itemId;

          const wrap = document.createElement('div');
          wrap.className = 'forgeos-desktop-folder__wrap';

          const count = document.createElement('div');
          count.className = 'forgeos-desktop-folder__count';
          wrap.appendChild(count);

          const grid = document.createElement('div');
          grid.className = 'forgeos-desktop-folder__grid';
          wrap.appendChild(grid);

          const label = document.createElement('div');
          label.className = 'forgeos-desktop-icon__label';

          node.appendChild(wrap);
          node.appendChild(label);

          node.addEventListener('click', () => openFolderModal(itemId));
          node.addEventListener('dblclick', () => openFolderModal(itemId));
          node.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') openFolderModal(itemId);
          });

          node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openContextMenu(
              [
                { label: 'Open folder', onClick: async () => openFolderModal(itemId) },
                { label: 'Unfolder', onClick: async () => { desktopUnfolder(itemId); renderDesktop(); } },
                { type: 'sep' },
                { label: 'Remove folder', danger: true, onClick: async () => { desktopUnfolder(itemId); renderDesktop(); } },
              ],
              e.clientX,
              e.clientY,
            );
          });

          node.addEventListener('dragover', (e) => {
            if (!desktopDragId) return;
            e.preventDefault();
          });
          node.addEventListener('drop', (e) => {
            if (!desktopDragId) return;
            e.preventDefault();
            e.stopPropagation();
            const id = String(desktopDragId || '').trim();
            desktopDragId = '';
            if (!id) return;
            desktopAddAppToFolder(itemId, id);
            renderDesktop();
            showToast('Added to folder', null);
          });
        } else {
          const appId = String(item.appId || '').trim() || String(itemId).replace(/^app:/, '');
          node.dataset.appId = appId;

          const img = document.createElement('img');
          img.className = 'forgeos-desktop-icon__img';
          img.alt = '';
          img.loading = 'lazy';
          img.decoding = 'async';
          img.addEventListener('error', () => {
            if (img.dataset.fallbackApplied === '1') return;
            const fallbackLogo = fallbackLogoFor(appId, metaFor(appId).name || appId);
            img.dataset.fallbackApplied = '1';
            img.src = fallbackLogo;
          });
          node.appendChild(img);

          const label = document.createElement('div');
          label.className = 'forgeos-desktop-icon__label';
          node.appendChild(label);

          const badge = document.createElement('div');
          badge.className = 'forgeos-desktop-icon__badge';
          node.appendChild(badge);

          node.addEventListener('dblclick', () => ensureAppOpen({ id: appId }));
          node.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') ensureAppOpen({ id: appId });
          });

          node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const installedNow = installedById.get(appId) || null;
            const st = installedNow ? String(installedNow.status || '').toLowerCase() : '';
            const isRunning = st === 'running';
            openContextMenu(
              [
                { label: 'Open', disabled: !isAppLaunchable(appId), onClick: async () => ensureAppOpen({ id: appId }) },
                { type: 'sep' },
                { label: 'Start', disabled: isRunning || pendingAppActions.has(appId), onClick: async () => runAppAction(appId, 'up') },
                { label: 'Restart', disabled: pendingAppActions.has(appId), onClick: async () => runAppAction(appId, 'restart') },
                { label: 'Stop', danger: true, disabled: !isRunning || pendingAppActions.has(appId), onClick: async () => runAppAction(appId, 'down') },
                { type: 'sep' },
                { label: 'Redeploy', disabled: pendingAppActions.has(appId), hint: 'Recreate containers (keeps data)', onClick: async () => runAppAction(appId, 'redeploy') },
                { type: 'sep' },
                { label: 'Remove', danger: true, onClick: async () => unpinFromDesktop(appId) },
              ],
              e.clientX,
              e.clientY,
            );
          });
        }

        let dragStart = null;
        node.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          noteUserActivity();
          const p = desktopSurfacePoint(e);
          const ox = parseFloat(node.style.left) || 0;
          const oy = parseFloat(node.style.top) || 0;
          dragStart = {
            startX: p.x,
            startY: p.y,
            anchorX: p.x - ox,
            anchorY: p.y - oy,
            originX: ox,
            originY: oy,
            moved: false,
          };
          try {
            node.setPointerCapture(e.pointerId);
          } catch {}
        });
        node.addEventListener('pointermove', (e) => {
          if (!dragStart) return;
          const p = desktopSurfacePoint(e);
          const dx = p.x - dragStart.startX;
          const dy = p.y - dragStart.startY;
          if (!dragStart.moved) {
            if (Math.abs(dx) <= 12 && Math.abs(dy) <= 12) return;
            dragStart.moved = true;
            node.classList.add('forgeos-desktop-icon--dragging');
          }

          const unclampedX = p.x - dragStart.anchorX;
          const unclampedY = p.y - dragStart.anchorY;
          const clamped = clampDesktopPos(unclampedX, unclampedY);
          node.style.left = `${clamped.x}px`;
          node.style.top = `${clamped.y}px`;
        });
        node.addEventListener('pointerup', (e) => {
          if (!dragStart) return;
          const wasMoved = !!dragStart.moved;
          const originX = Number(dragStart.originX) || 0;
          const originY = Number(dragStart.originY) || 0;
          node.classList.remove('forgeos-desktop-icon--dragging');
          dragStart = null;

          if (!wasMoved) {
            node.style.left = `${originX}px`;
            node.style.top = `${originY}px`;
            return;
          }

          const targetFromPointer = desktopItemAtClientPoint(itemId, e.clientX, e.clientY);
          const rect = node.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const targetId =
            targetFromPointer || desktopItemAtClientPoint(itemId, cx, cy) || desktopItemByOverlap(itemId, rect);
          if (targetId && desktopHandleDrop(itemId, targetId)) {
            renderDesktop();
            return;
          }

          const left = parseFloat(node.style.left) || 0;
          const top = parseFloat(node.style.top) || 0;
          const snapped = snapDesktopPos(left, top);
          node.style.left = `${snapped.x}px`;
          node.style.top = `${snapped.y}px`;
          setDesktopItemPosition(itemId, snapped.x, snapped.y);
          renderDesktop();
        });
        node.addEventListener('pointercancel', () => {
          node.classList.remove('forgeos-desktop-icon--dragging');
          dragStart = null;
        });

        desktopSurfaceEl.appendChild(node);
        existing.set(itemId, node);
      }

      node.style.left = `${snapped.x}px`;
      node.style.top = `${snapped.y}px`;

      if (item.type === 'folder') {
        const labelEl = node.querySelector('.forgeos-desktop-icon__label');
        if (labelEl) labelEl.textContent = String(item.name || 'Folder').trim() || 'Folder';
        const apps = Array.isArray(item.appIds) ? item.appIds : [];
        const countEl = node.querySelector('.forgeos-desktop-folder__count');
        if (countEl) countEl.textContent = String(apps.length);
        const gridEl = node.querySelector('.forgeos-desktop-folder__grid');
        if (gridEl) {
          gridEl.innerHTML = '';
          for (const appIdRaw of apps.slice(0, 4)) {
            const appId = String(appIdRaw || '').trim();
            if (!appId) continue;
            const meta = metaFor(appId);
            const img = document.createElement('img');
            img.className = 'forgeos-desktop-folder__thumb';
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            const fallbackLogo = fallbackLogoFor(appId, meta.name || appId);
            img.src = String(meta.logo || '').trim() || fallbackLogo;
            img.addEventListener('error', () => {
              if (img.dataset.fallbackApplied === '1') return;
              img.dataset.fallbackApplied = '1';
              img.src = fallbackLogo;
            });
            gridEl.appendChild(img);
          }
        }
      } else {
        const appId = String(item.appId || '').trim() || String(node.dataset.appId || '').trim() || String(itemId).replace(/^app:/, '');
        const meta = metaFor(appId);
        const installed = installedById.get(appId) || null;
        const status = appStatusForUi(appId, installed);

        const img = node.querySelector('.forgeos-desktop-icon__img');
        if (img instanceof HTMLImageElement) {
          const fallbackLogo = fallbackLogoFor(appId, meta.name || appId);
          const logoUrl = String(meta.logo || '').trim() || fallbackLogo;
          if (img.dataset.logoUrl !== logoUrl) {
            img.dataset.logoUrl = logoUrl;
            img.dataset.fallbackApplied = '0';
            img.src = logoUrl;
          }
        }

        const labelEl = node.querySelector('.forgeos-desktop-icon__label');
        if (labelEl) labelEl.textContent = meta.name || appId;
        const badgeEl = node.querySelector('.forgeos-desktop-icon__badge');
        if (badgeEl) badgeEl.textContent = status;
      }
    }

    if (normalized) saveDesktopState();
  }

  function loadDrawerPinned() {
    try {
      const raw = String(window.localStorage.getItem(DRAWER_PINNED_KEY) || '').trim();
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map((v) => String(v || '').trim()).filter(Boolean));
    } catch {
      return new Set();
    }
  }

  function saveDrawerPinned() {
    try {
      window.localStorage.setItem(DRAWER_PINNED_KEY, JSON.stringify(Array.from(drawerPinned || new Set())));
    } catch {}
  }

  function isPinnedToDrawer(appId) {
    const id = String(appId || '').trim();
    if (!id) return false;
    return drawerPinned instanceof Set ? drawerPinned.has(id) : false;
  }

  function setPinnedToDrawer(appId, pinned) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (!(drawerPinned instanceof Set)) drawerPinned = new Set();
    if (pinned) drawerPinned.add(id);
    else drawerPinned.delete(id);
    saveDrawerPinned();
  }

  function toggleDashboardMode() {
    // Legacy no-op (replaced by Desktop/APPS/Fleet segmented control).
    setView('dashboard');
  }

  function ensureAppOpen(app) {
    const id = app && app.id ? String(app.id || '').trim() : '';
    if (!id) return;
    setView('dashboard');
    setDashboardMode('apps');
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
    setView('dashboard');
    if (isAppOpen(id)) {
      // Only close an app when the user is on the Apps workspace.
      if (String(dashboardMode || 'fleet') === 'apps') openAppIds = openAppIds.filter((x) => x !== id);
      else setDashboardMode('apps');
    } else {
      setDashboardMode('apps');
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
    const status = id ? appStatusForUi(id, installed) : '-';

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
      try {
        await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/down`, { method: 'POST', body: '{}' });
      } catch {}
      await new Promise((r) => setTimeout(r, 800));
      try {
        await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/up`, { method: 'POST', body: '{}' });
      } catch {}
      return;
    }
    if (kind === 'redeploy') {
      await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/redeploy`, {
        method: 'POST',
        body: JSON.stringify({ pull: true }),
      });
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
      const ok = await openConfirmModal({
        title: `Stop ${label}?`,
        message: 'This stops the app containers. You can start it again later.',
        confirmText: 'Stop',
        cancelText: 'Cancel',
        danger: true,
      });
      if (!ok) return;
    }

    if (k === 'redeploy') {
      const label = metaFor(id).name || id;
      const ok = await openConfirmModal({
        title: `Redeploy ${label}?`,
        message:
          'This recreates the app containers to recover from breakages. Your app data should be kept, but the app will restart and may be unavailable for a few minutes.\n\nUse this if the app is broken, stuck, or misconfigured.',
        confirmText: 'Redeploy',
        cancelText: 'Cancel',
        danger: false,
      });
      if (!ok) return;
    }

    pendingAppActions.set(id, { kind: k, startedAt: Date.now() });

    if (k === 'down') {
      openAppIds = openAppIds.filter((x) => x !== id);
      saveOpenApps();
      renderWorkspace();
      syncInstalledSelection();
    }

    try {
      await apiAppAction(id, k);
      showToast(
        `${k === 'up' ? 'Starting' : k === 'down' ? 'Stopping' : k === 'restart' ? 'Restarting' : k === 'redeploy' ? 'Redeploying' : 'Running'} ${metaFor(id).name || id}`,
        null,
      );
      if (k === 'restart' || k === 'up' || k === 'redeploy') {
        const deadline = Date.now() + (k === 'redeploy' ? 10 * 60 * 1000 : 60 * 1000);
        let reachedRunning = false;
        while (Date.now() < deadline) {
          await refreshInstalled();
          const st = installedById.get(id);
          if (st && String(st.status || '').toLowerCase() === 'running') {
            reachedRunning = true;
            break;
          }
          await new Promise((r) => setTimeout(r, 1200));
        }
        if (!reachedRunning) showToast(k === 'redeploy' ? 'Redeploy is still in progress...' : 'App is still starting...', 'warn');
      } else {
        await refresh();
      }
    } catch (e) {
      console.error('App action failed', e);
      showToast('App action failed', 'error');
    } finally {
      await refreshInstalled();
      renderWorkspace();
      updateAppHeader();
    }
  }

  async function runSelectedAppAction(kind) {
    const id = selectedAppId;
    if (!id) return;
    await runAppAction(id, kind);
  }

  function normalizeVersionString(value) {
    const raw = String(value || '').trim();
    return raw.replace(/^v/i, '').trim();
  }

  async function waitForAppUpdate(appId, options) {
    const id = String(appId || '').trim();
    if (!id) return { ok: false, reason: 'missing app id' };
    const opts = options && typeof options === 'object' ? options : {};
    const expected = normalizeVersionString(opts.expectedVersion || '');
    const previous = normalizeVersionString(opts.previousVersion || '');
    const timeoutMs = Math.max(15_000, Math.min(10 * 60_000, Number(opts.timeoutMs) || 180_000));
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      try {
        await refreshInstalled();
      } catch {}
      const st = installedById.get(id);
      const status = st ? String(st.status || '').trim().toLowerCase() : '';
      const installedVersion = st ? normalizeVersionString(st.installed_version || '') : '';
      const latestVersion = st ? normalizeVersionString(st.latest_version || '') : '';
      const updateAvailable = !!(st && st.update_available);

      const stable = status === 'running' || status === 'stopped';
      const versionMatches = expected && installedVersion && installedVersion === expected;
      const advanced = previous && installedVersion && installedVersion !== previous;
      const satisfied = stable && !updateAvailable && (versionMatches || advanced || (!!installedVersion && !!latestVersion && !isUpdateAvailable(installedVersion, latestVersion)));

      if (satisfied) return { ok: true, status, installed_version: installedVersion, latest_version: latestVersion };

      await new Promise((r) => setTimeout(r, 1600));
    }

    return { ok: false, reason: 'timeout' };
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

  function formatHashrateThs(value) {
    const v = Number(value);
    if (!Number.isFinite(v) || v < 0) return '-';
    const decimals = v >= 100 ? 0 : v >= 10 ? 1 : v >= 1 ? 2 : 3;
    return v.toFixed(decimals);
  }

  function setFleetUpdated(iso) {
    const t = formatTimeShort(iso);
    if (fleetUpdatedEl) fleetUpdatedEl.textContent = t ? `Updated ${t}` : '-';
    if (fleetWorkersUpdatedEl) fleetWorkersUpdatedEl.textContent = t ? `Updated ${t}` : '-';
  }

  function updateFleetSeriesPoint(totalThs) {
    const v = Number(totalThs);
    if (!Number.isFinite(v)) return;
    const now = Date.now();
    const last = fleetSeries.length ? fleetSeries[fleetSeries.length - 1] : null;
    if (last && Number.isFinite(last.t) && now - last.t < 8000) {
      last.v = v;
    } else {
      fleetSeries.push({ t: now, v });
    }
    if (fleetSeries.length > 720) fleetSeries = fleetSeries.slice(-720);
    saveFleetSeries();
  }

  function renderFleetSpark() {
    if (!fleetSparkLineEl) return;
    const points = fleetSeries.slice(-180);
    if (points.length < 2) {
      fleetSparkLineEl.setAttribute('points', '');
      return;
    }
    const values = points.map((p) => Number(p.v)).filter((v) => Number.isFinite(v));
    if (!values.length) {
      fleetSparkLineEl.setAttribute('points', '');
      return;
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const h = 30;
    const w = 100;
    const pts = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * w;
      const y = h - ((Number(p.v) - min) / span) * (h - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    fleetSparkLineEl.setAttribute('points', pts.join(' '));
  }

  function renderFleetBreakdown(pools, totalThs) {
    if (!fleetBreakdownEl) return;
    fleetBreakdownEl.innerHTML = '';

    const entries = Array.isArray(pools)
      ? pools
          .map((p) => {
            const pool = p && typeof p === 'object' ? p.pool : null;
            const coin = p && typeof p === 'object' ? String(p.coin || p.id || '').trim() : '';
            const ok = !!(p && typeof p === 'object' && p.ok === true && pool && typeof pool === 'object');
            const hashrate = ok ? Number(pool.hashrate_ths) : NaN;
            const workers = ok ? Number(pool.workers) : NaN;
            return { coin, ok, hashrate, workers };
          })
          .filter((x) => x.coin)
      : [];

    entries.sort((a, b) => (Number.isFinite(b.hashrate) ? b.hashrate : -1) - (Number.isFinite(a.hashrate) ? a.hashrate : -1));

    const total = Number(totalThs);
    for (const item of entries) {
      const row = document.createElement('div');
      row.className = 'forgeos-fleet-item';

      const label = document.createElement('div');
      label.className = 'forgeos-fleet-item__label';
      label.textContent = item.coin;

      const bar = document.createElement('div');
      bar.className = 'forgeos-fleet-item__bar';
      const fill = document.createElement('div');
      fill.className = 'forgeos-fleet-item__fill';
      const pct = item.ok && Number.isFinite(item.hashrate) && total > 0 ? Math.max(0, Math.min(100, (item.hashrate / total) * 100)) : 0;
      fill.style.width = `${pct.toFixed(1)}%`;
      bar.appendChild(fill);

      const value = document.createElement('div');
      value.className = 'forgeos-fleet-item__value';
      if (!item.ok) {
        value.textContent = 'offline';
      } else {
        const parts = [];
        parts.push(`${formatHashrateThs(item.hashrate)} TH/s`);
        if (Number.isFinite(item.workers)) parts.push(`${Math.max(0, Math.round(item.workers))} w`);
        value.textContent = parts.join(' \u2022 ');
      }

      row.appendChild(label);
      row.appendChild(bar);
      row.appendChild(value);
      fleetBreakdownEl.appendChild(row);
    }
  }

  function renderFleetWorkers(payload) {
    if (!fleetWorkersBodyEl) return;
    fleetWorkersBodyEl.innerHTML = '';

    const workers = payload && typeof payload === 'object' && Array.isArray(payload.workers) ? payload.workers : [];
    if (!workers.length) {
      const hint = document.createElement('div');
      hint.className = 'forgeos-muted';
      hint.textContent = 'No active workers reported yet.';
      fleetWorkersBodyEl.appendChild(hint);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-table-wrap';
    const table = document.createElement('table');
    table.className = 'forgeos-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    for (const label of ['Worker', 'Coin', 'Hashrate', 'Best share', 'Last share']) {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    function workerName(raw) {
      const base = String(
        raw.worker ??
          raw.worker_name ??
          raw.worker_id ??
          raw.workerId ??
          raw.workerID ??
          raw.workerName ??
          raw.workername ??
          raw.rig ??
          raw.rig_name ??
          raw.rigName ??
          raw.miner ??
          raw.miner_name ??
          raw.minerName ??
          raw.user ??
          raw.username ??
          raw.name ??
          raw.id ??
          raw.address ??
          '',
      ).trim();
      if (!base) return '-';
      if (base.includes('.')) {
        const parts = base.split('.');
        const head = parts[0] || '';
        const tail = parts.slice(1).join('.');
        if (head.length >= 20 && tail) return tail;
      }
      return base;
    }

    for (const raw of workers.slice(0, 200)) {
      if (!raw || typeof raw !== 'object') continue;
      const name = workerName(raw);
      const coin = String(raw.coin || '').trim() || '-';
      const rate =
        raw.hashrate_ths ?? raw.hashrate_1m_ths ?? raw.hashrate_5m_ths ?? raw.hashrate ?? raw.rate_ths ?? raw.rate ?? null;
      const rateTxt = rate === null || rate === undefined ? '-' : `${formatHashrateThs(rate)} TH/s`;
      const bestShareRaw =
        raw.bestshare ??
        raw.best_share ??
        raw.bestShare ??
        raw.bestShareValue ??
        raw.best_share_value ??
        raw.best ??
        null;
      const bestShareNum = bestShareRaw === null || bestShareRaw === undefined ? NaN : Number(bestShareRaw);
      const bestShareTxt = Number.isFinite(bestShareNum)
        ? formatCompactNumber(bestShareNum)
        : bestShareRaw
          ? String(bestShareRaw)
          : '-';
      const lastAgo = raw.lastshare_ago_s ?? raw.last_share_ago_s ?? raw.lastshareAgo ?? null;
      const lastTxt =
        lastAgo === null || lastAgo === undefined
          ? '-'
          : Number.isFinite(Number(lastAgo))
            ? `${Math.max(0, Math.round(Number(lastAgo)))}s`
            : String(lastAgo);

      const tr = document.createElement('tr');
      const cols = [name, coin, rateTxt, bestShareTxt, lastTxt];
      for (const c of cols) {
        const td = document.createElement('td');
        td.textContent = c;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    wrap.appendChild(table);
    fleetWorkersBodyEl.appendChild(wrap);
  }

  function renderFleet(payload) {
    if (!payload || payload.ok !== true) return;
    lastFleet = payload;
    setFleetUpdated(payload.time);

    const total = payload.total && typeof payload.total === 'object' ? payload.total : {};
    const totalThs = Number(total.hashrate_ths);
    const totalWorkers = Number(total.workers);

    if (fleetHashrateEl) fleetHashrateEl.textContent = Number.isFinite(totalThs) ? formatHashrateThs(totalThs) : '-';
    if (fleetWorkersEl) fleetWorkersEl.textContent = Number.isFinite(totalWorkers) ? String(Math.max(0, Math.round(totalWorkers))) : '-';

    if (Number.isFinite(totalThs)) updateFleetSeriesPoint(totalThs);
    renderFleetSpark();
    renderFleetBreakdown(payload.pools, totalThs);
    renderFleetWorkers(payload);
  }

  async function refreshFleet(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    if (!options.force && !dashboardCardsVisible()) return;
    if (refreshFleetInFlight) return;
    refreshFleetInFlight = true;
    if (btnFleetRefresh) btnFleetRefresh.disabled = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/fleet/summary?limit=200', {}, 7000).catch(() => null);
      if (!res || res.ok !== true) return;
      renderFleet(res);
    } finally {
      refreshFleetInFlight = false;
      if (btnFleetRefresh) btnFleetRefresh.disabled = false;
    }
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
        if (sshStatusEl) sshStatusEl.textContent = 'Unavailable';
        return;
      }

      const installed = !!res.installed;
      settingSshToggle.disabled = !installed;
      settingSshToggle.checked = !!res.enabled;
      settingSshToggle.title = installed
        ? `${res.service || 'ssh'}: ${res.active ? 'active' : 'inactive'}`
        : 'SSH not available on this system';

      if (sshStatusEl) {
        const bits = [
          installed ? 'Installed' : 'Not installed',
          res.enabled ? 'Enabled' : 'Disabled',
          res.active ? 'Active' : 'Inactive',
        ];
        sshStatusEl.textContent = bits.join(' / ');
      }

      if (sshAdminUserEl && res.admin_user) sshAdminUserEl.textContent = String(res.admin_user);

      if (sshAuthMethodsEl) {
        const eff = res.effective && typeof res.effective === 'object' ? res.effective : null;
        const methods = [];
        if (eff && eff.pubkeyauthentication === true) methods.push('Public key');
        if (eff && eff.passwordauthentication === true) methods.push('Password');
        if (eff && eff.kbdinteractiveauthentication === true) methods.push('Keyboard-interactive');
        sshAuthMethodsEl.textContent = methods.length ? methods.join(', ') : '-';
      }

      if (sshAdminPasswordStateEl) {
        const admin = res.admin && typeof res.admin === 'object' ? res.admin : null;
        if (!admin) sshAdminPasswordStateEl.textContent = '-';
        else if (admin.locked) sshAdminPasswordStateEl.textContent = 'Locked (set password)';
        else if (admin.has_password) sshAdminPasswordStateEl.textContent = 'Set';
        else sshAdminPasswordStateEl.textContent = 'Not set';
      }
    } catch {}
  }

  async function refreshSystemUpdateConfig() {
    if (!updateRepoInput && !updateAuthStatusEl) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/update/config', {}, 5000).catch(() => null);
      if (!res || res.ok !== true) return;
      systemUpdateConfigCache = res;
      if (updateRepoInput && res.repo) updateRepoInput.value = String(res.repo);

      if (updateAuthStatusEl) {
        const tokenConfigured = !!res.token_configured;
        const tokenSource = res.token_source ? String(res.token_source) : 'none';
        const repoSource = res.repo_source ? String(res.repo_source) : 'env';
        const allowUnverified = !!res.allow_unverified;
        const parts = [
          tokenConfigured ? `Token: set (${tokenSource})` : 'Token: not set',
          `Repo: ${repoSource}`,
          allowUnverified ? 'Unverified: allowed' : 'Unverified: blocked',
        ];
        updateAuthStatusEl.textContent = parts.join(' \u2022 ');
      }
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
    if (s === 'downloading') return 'Downloading update bundle...';
    if (s === 'extracting') return 'Extracting update...';
    if (s === 'deploying') return 'Deploying update...';
    if (s === 'restarting') return `Restarting ${svc || 'services'}...`;
    if (s === 'restarting_daemon') return `Restarting ${svc || 'daemon'}...`;
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
        line = 'Loading update status...';
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
        if (updateStatusEl) updateStatusEl.textContent = 'Reconnecting...';
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
      if (updateStatusEl && systemUpdateIsBusy(systemUpdateState())) updateStatusEl.textContent = 'Reconnecting...';
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

  async function saveSystemUpdateConfig() {
    if (!btnUpdateSave) return;
    const repo = updateRepoInput ? String(updateRepoInput.value || '').trim() : '';
    const token = updateTokenInput ? String(updateTokenInput.value || '').trim() : '';

    btnUpdateSave.disabled = true;
    const prev = btnUpdateSave.textContent;
    btnUpdateSave.textContent = 'Saving...';
    if (updateAuthStatusEl) updateAuthStatusEl.textContent = 'Saving update settings...';

    try {
      const body = { repo };
      if (token) body.token = token;
      const res = await apiJsonTimeout('/api/v0/system/update/config', { method: 'POST', body: JSON.stringify(body) }, 8000);
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'save failed');
      systemUpdateConfigCache = res;
      if (updateTokenInput) updateTokenInput.value = '';
      showToast('Update settings saved', null);
      if (updateAuthStatusEl) updateAuthStatusEl.textContent = 'Saved. Refreshing...';
      await refreshSystemUpdateConfig();
      await refreshSystemUpdateCheck({ force: true });
    } catch (e) {
      showToast('Save failed', 'error');
      if (updateAuthStatusEl) {
        updateAuthStatusEl.textContent = `Save failed: ${e && e.message ? String(e.message) : String(e)}`;
      }
      await openNoticeModal({
        kind: 'Error',
        title: 'Save failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnUpdateSave.disabled = false;
      btnUpdateSave.textContent = prev;
    }
  }

  async function clearSystemUpdateToken() {
    if (!btnUpdateTokenClear) return;
    const okConfirm = await openConfirmModal({
      title: 'Clear GitHub token?',
      message: 'This removes the stored token from this 5tratumOS host.',
      confirmText: 'Clear token',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!okConfirm) return;
    btnUpdateTokenClear.disabled = true;
    const prev = btnUpdateTokenClear.textContent;
    btnUpdateTokenClear.textContent = 'Clearing...';

    try {
      const res = await apiJsonTimeout(
        '/api/v0/system/update/config',
        { method: 'POST', body: JSON.stringify({ token: '' }) },
        8000,
      );
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'clear failed');
      systemUpdateConfigCache = res;
      if (updateTokenInput) updateTokenInput.value = '';
      showToast('Token cleared', null);
      await refreshSystemUpdateConfig();
      await refreshSystemUpdateCheck({ force: true });
    } catch (e) {
      showToast('Clear failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Clear failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnUpdateTokenClear.disabled = false;
      btnUpdateTokenClear.textContent = prev;
    }
  }

  async function applySystemUpdate() {
    if (btnUpdateApply && btnUpdateApply.disabled) return;
    const okConfirm = await openConfirmModal({
      title: 'Apply system update now?',
      message: 'This restarts portal services during deployment.',
      confirmText: 'Update',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!okConfirm) return;
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
      await openNoticeModal({
        kind: 'Error',
        title: 'System update failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
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
      storeById = new Map();
      for (const app of storeAppsCache) {
        if (!app || typeof app !== 'object') continue;
        if (!app.id) continue;
        storeById.set(app.id, app);
      }
      syncStoreCategoryOptions(storeAppsCache);
      renderStore(storeAppsCache, installedSet);
      renderWidgetSettings();
      renderDesktop();
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
      await openNoticeModal({
        kind: 'Error',
        title: 'Store sync failed',
        message: err && err.message ? String(err.message) : String(err),
        danger: true,
      });
    } finally {
      btnStoreSync.disabled = false;
      btnStoreSync.textContent = prev;
    }
  }

  async function fixProxyNow() {
    if (!btnFixProxy) return;
    if (btnFixProxy.disabled) return;

    const ok = await openConfirmModal({
      title: 'Fix proxy routes?',
      message:
        'This repairs the /apps/<id>/ reverse proxy rules for installed apps and restarts the portal proxy.\n\nUse this if an app loads on its direct port but returns 502 via /apps/<id>/.\n\nApp data is not changed.',
      confirmText: 'Fix proxy',
      cancelText: 'Cancel',
      danger: false,
    });
    if (!ok) return;

    btnFixProxy.disabled = true;
    const prev = btnFixProxy.textContent;
    btnFixProxy.textContent = 'Fixing...';
    try {
      await ensureHealthy();
      const res = await apiJsonTimeout('/api/v0/system/proxy/repair', { method: 'POST', body: '{}' }, 180000);
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'Proxy repair failed');
      const updated = Array.isArray(res.updated) ? res.updated.length : 0;
      const added = Array.isArray(res.added) ? res.added.length : 0;
      showToast('Proxy repaired', null);
      await openNoticeModal({
        kind: 'System',
        title: 'Proxy repaired',
        message: `Updated routes: ${updated}\nAdded routes: ${added}\nPortal restarted: ${res.restart && res.restart.ok ? 'yes' : 'no'}`,
        danger: false,
      });
    } catch (e) {
      showToast('Proxy repair failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Proxy repair failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnFixProxy.disabled = false;
      btnFixProxy.textContent = prev;
    }
  }

  async function syncStoreBackground() {
    if (!storeAutoSyncEnabled) return;
    if (storeAutoSyncInFlight) return;
    if (refreshStoreInFlight) return;
    if (btnStoreSync && btnStoreSync.disabled) return;
    storeAutoSyncInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const ch = String(activeStoreChannel || 'main').toLowerCase();
      await apiJsonTimeout(
        '/api/v0/store/sync',
        { method: 'POST', body: JSON.stringify({ channel: ch }) },
        900000,
      );
      await refreshStore();
    } catch (err) {
      console.warn('Background store sync failed', err);
    } finally {
      storeAutoSyncInFlight = false;
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
      const workspaceInUse =
        activeViewKey === 'dashboard' &&
        String(dashboardMode || 'fleet') === 'apps' &&
        Array.isArray(openAppIds) &&
        openAppIds.length > 0;
      applyInstalled(installed, { noWorkspace: workspaceInUse });
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

  function dashboardCardsVisible() {
    return activeViewKey === 'dashboard' && String(dashboardMode || 'fleet') === 'fleet';
  }

  async function refreshWidgets(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    if (!options.force && !dashboardCardsVisible()) return;
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

    await Promise.allSettled([refreshInstalled(), refreshStore(), refreshMetrics(), refreshWidgets(), refreshFleet()]);
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
    const isPinned = isPinnedToDrawer(id);

    if (isVirtual) {
      const items = [
        {
          label: 'Open',
          onClick: async () => {
            ensureAppOpen({ id });
          },
        },
        {
          label: isPinned ? 'Unpin from drawer' : 'Pin to drawer',
          onClick: async () => {
            setPinnedToDrawer(id, !isPinned);
            renderInstalledApps(installedAppsCache);
          },
        },
        { type: 'sep' },
        {
          label: 'Disable',
          danger: true,
          onClick: async () => {
            const label = metaFor(id).name || id;
            const okConfirm = await openConfirmModal({
              title: `Disable ${label}?`,
              message: 'This removes the built-in placeholder entry. (No data will be deleted.)',
              confirmText: 'Disable',
              cancelText: 'Cancel',
              danger: true,
            });
            if (!okConfirm) return;
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
      {
        label: isPinned ? 'Unpin from drawer' : 'Pin to drawer',
        onClick: async () => {
          setPinnedToDrawer(id, !isPinned);
          renderInstalledApps(installedAppsCache);
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
      { type: 'sep' },
      {
        label: 'Redeploy',
        hint: 'Recreate containers (keeps data)',
        disabled: pendingAppActions.has(id),
        onClick: async () => runAppAction(id, 'redeploy'),
      },
    ];

    openContextMenu(items, x, y);
  }

  function renderAppsLauncher(apps) {
    if (!appsLauncherGridEl || !appsLauncherEmptyEl) return;
    appsLauncherGridEl.innerHTML = '';
    const list = Array.isArray(apps) ? apps : [];
    appsLauncherEmptyEl.classList.toggle('hidden', list.length > 0);
    if (!list.length) return;

    const sorted = list.slice().sort((a, b) => {
      const ida = a && typeof a === 'object' ? String(a.id || '').trim() : '';
      const idb = b && typeof b === 'object' ? String(b.id || '').trim() : '';
      const ma = metaFor(ida);
      const mb = metaFor(idb);
      return String(ma.name || ida).localeCompare(String(mb.name || idb), undefined, { sensitivity: 'base' });
    });

    for (const app of sorted) {
      if (!app || typeof app !== 'object') continue;
      const id = String(app.id || '').trim();
      if (!id) continue;
      const meta = metaFor(id);
      const isPinned = isPinnedToDrawer(id);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'forgeos-launcher-item';
      btn.dataset.appId = id;

      const icon = document.createElement('img');
      icon.className = 'forgeos-launcher-item__icon';
      icon.alt = '';
      icon.loading = 'lazy';
      icon.decoding = 'async';
      const fallbackLogo = fallbackLogoFor(id, meta.name || app.name || id);
      icon.src = String(meta.logo || '').trim() || fallbackLogo;
      icon.addEventListener('error', () => {
        if (icon.dataset.fallbackApplied === '1') return;
        icon.dataset.fallbackApplied = '1';
        icon.src = fallbackLogo;
      });

      const name = document.createElement('div');
      name.className = 'forgeos-launcher-item__name';
      name.textContent = meta.name || app.name || id;

      btn.appendChild(icon);
      btn.appendChild(name);

      btn.addEventListener('click', async () => {
        // Apps page is a launcher: start the app if needed, then open it.
        if (!isAppLaunchable(id) && !pendingAppActions.has(id)) {
          await runAppAction(id, 'up');
        }
        ensureAppOpen({ id });
      });
      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openInstalledAppMenu(app, e.clientX, e.clientY);
      });

      btn.addEventListener('dblclick', (e) => {
        e.preventDefault();
        setPinnedToDrawer(id, !isPinned);
        renderInstalledApps(installedAppsCache);
        renderAppsLauncher(installedAppsCache);
        showToast(isPinned ? 'Unpinned from drawer' : 'Pinned to drawer', null);
      });

      appsLauncherGridEl.appendChild(btn);
    }
  }

  function renderInstalledApps(apps) {
    installedAppsEl.innerHTML = '';
    const all = Array.isArray(apps) ? apps : [];
    const visible = all.filter((a) => {
      if (!a || typeof a !== 'object') return false;
      const id = String(a.id || '').trim();
      if (!id) return false;
      const running = isLaunchableStatus(a.status) && !pendingAppActions.has(id);
      return running || isPinnedToDrawer(id);
    });

    if (!visible.length) {
      installedEmptyEl.style.display = 'block';
      installedEmptyEl.textContent = 'No running apps. Pin apps to the drawer from Workbench or App Store.';
      return;
    }

    installedEmptyEl.style.display = 'none';

    for (const app of visible) {
      const meta = metaFor(app.id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.appId = app.id || '';
      btn.title = meta.longDesc || meta.desc || meta.tagline || '';
      const launchable = isLaunchableStatus(app.status) && !pendingAppActions.has(app.id);
      const statusClass = isLaunchableStatus(app.status) ? ' forgeos-app-item--running' : ' forgeos-app-item--stopped';
      btn.className = `forgeos-app-item${statusClass}${!launchable ? ' forgeos-app-item--inactive' : ''}${selectedAppId && app.id === selectedAppId ? ' forgeos-app-item--active' : ''}`;
      btn.setAttribute('role', 'listitem');
      btn.addEventListener('click', () => toggleAppOpen(app));
      btn.draggable = !pendingAppActions.has(app.id);
      btn.addEventListener('dragstart', (e) => {
        if (!btn.draggable) return;
        desktopDragId = app.id || '';
        try {
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('text/plain', String(app.id || ''));
        } catch {}
      });
      btn.addEventListener('dragend', () => {
        desktopDragId = '';
      });
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
      logo.loading = 'lazy';
      logo.decoding = 'async';
      const fallbackLogo = fallbackLogoFor(app.id, meta.name || app.name || app.id);
      const primaryLogo = String(meta.logo || '').trim() || fallbackLogo;
      logo.src = primaryLogo;
      logo.addEventListener('error', () => {
        if (logo.dataset.fallbackApplied === '1') return;
        logo.dataset.fallbackApplied = '1';
        logo.src = fallbackLogo;
      });

      const nameWrap = document.createElement('div');
      nameWrap.className = 'forgeos-app-item__name-wrap';

      const name = document.createElement('div');
      name.className = 'forgeos-app-item__name';
      name.textContent = meta.name || app.name || app.id;

      const pill = document.createElement('span');
      pill.className = 'axe-pill';
      pill.textContent = appStatusForUi(app.id, app) || 'Installed';
      right.appendChild(pill);

      nameWrap.appendChild(name);
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
      logo.loading = 'lazy';
      logo.decoding = 'async';
      const fallbackLogo = fallbackLogoFor(app.id, meta.name || app.name || app.id);
      const primaryLogo = String(meta.logo || '').trim() || fallbackLogo;
      logo.src = primaryLogo;
      logo.addEventListener('error', () => {
        if (logo.dataset.fallbackApplied === '1') return;
        logo.dataset.fallbackApplied = '1';
        logo.src = fallbackLogo;
      });

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
      pill.textContent = appStatusForUi(app.id, app) || 'Installed';

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

      const grouped = new Map();
      for (const entry of widgets) {
        const appId = String(entry.appId || '').trim();
        if (!appId) continue;
        const appName = String(entry.appName || appId);
        if (!grouped.has(appId)) grouped.set(appId, { appId, appName, entries: [] });
        grouped.get(appId).entries.push(entry);
      }

      const groups = Array.from(grouped.values()).sort((a, b) =>
        a.appName.localeCompare(b.appName, undefined, { sensitivity: 'base' }),
      );

      for (const group of groups) {
        const wrap = document.createElement('div');
        wrap.className = 'forgeos-widget-app';

        const head = document.createElement('div');
        head.className = 'forgeos-widget-app__head';

        const title = document.createElement('div');
        title.className = 'forgeos-widget-app__title';
        title.textContent = group.appName;

        head.appendChild(title);
        wrap.appendChild(head);

        const grid = document.createElement('div');
        grid.className = 'forgeos-widget-app__grid';

        for (const entry of group.entries) {
          const w = entry.widget || {};
          const ok = w.ok === true;
          const type = String(w.type || '').trim();
          const id = String(w.id || '').trim() || 'widget';
          const data = w.data && typeof w.data === 'object' ? w.data : null;
          const titleText = (data && data.title ? String(data.title) : id).trim() || id;
          const isSyncWidget = /\bsync\b/i.test(titleText);

          const card = document.createElement('div');
          card.className = 'forgeos-widget';
          if (!ok && w.error) card.title = String(w.error);

          const top = document.createElement('div');
          top.className = 'forgeos-widget__top';

          const left = document.createElement('div');

          const title = document.createElement('div');
          title.className = 'forgeos-widget__title';
          title.textContent = titleText;

          left.appendChild(title);

          const pill = document.createElement('span');
          pill.className = 'axe-pill';
          pill.textContent = ok ? 'live' : 'offline';

          top.appendChild(left);
          top.appendChild(pill);
          card.appendChild(top);

          if (type === 'text-with-progress') {
            const progress = ok && data && typeof data.progress === 'number' ? data.progress : null;
            const pct = typeof progress === 'number' && Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : null;

            const value = document.createElement('div');
            value.className = 'forgeos-widget__value';
            if (ok && data && isSyncWidget && typeof pct === 'number') {
              const pctInt = pct >= 0.999 ? 100 : Math.floor(pct * 100);
              value.textContent = `${pctInt}%`;
            } else {
              value.textContent = ok && data && data.text != null ? String(data.text) : '-';
            }
            card.appendChild(value);

            const hint = document.createElement('div');
            hint.className = 'forgeos-widget__hint';
            hint.textContent = ok && data && data.progressLabel ? String(data.progressLabel) : ok ? '' : 'Not running';
            if (hint.textContent) card.appendChild(hint);

            if (typeof pct === 'number') {
              const bar = document.createElement('div');
              bar.className = 'forgeos-widget__bar';
              const fill = document.createElement('div');
              fill.className = 'forgeos-widget__bar-fill';
              const pctInt = isSyncWidget ? (pct >= 0.999 ? 100 : Math.floor(pct * 100)) : Math.round(pct * 100);
              fill.style.width = `${pctInt}%`;
              bar.appendChild(fill);
              card.appendChild(bar);
            }
          } else if (type === 'three-stats') {
            const items = ok && data && Array.isArray(data.items) ? data.items : [];
            if (items.length) {
              const statGrid = document.createElement('div');
              statGrid.className = 'forgeos-widget__stats';
              for (const item of items.slice(0, 3)) {
                if (!item || typeof item !== 'object') continue;
                const stat = document.createElement('div');
                stat.className = 'forgeos-widget__stat';

                const t = document.createElement('div');
                t.className = 'forgeos-widget__stat-title';
                t.textContent = String(item.title || '').trim() || '-';

                const txt = document.createElement('div');
                txt.className = 'forgeos-widget__stat-text';
                txt.textContent = formatWidgetStatText(item.title, item.text);

                stat.appendChild(t);
                stat.appendChild(txt);

                if (item.subtext) {
                  const sub = document.createElement('div');
                  sub.className = 'forgeos-widget__stat-subtext';
                  sub.textContent = String(item.subtext);
                  stat.appendChild(sub);
                }

                statGrid.appendChild(stat);
              }
              card.appendChild(statGrid);
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

          grid.appendChild(card);
        }

        wrap.appendChild(grid);
        dashboardWidgetsEl.appendChild(wrap);
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
      empty.textContent = 'Loading store...';
      storeEl.appendChild(empty);
      return;
    }

    if (!hasStoreApps && channel === 'global' && hasLoadedStore && !storeLastOk) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-store-item';
      empty.style.gridColumn = '1 / -1';
      empty.style.cursor = 'default';

      const title = document.createElement('div');
      title.className = 'text-lg font-extrabold tracking-tight';
      title.textContent = 'Global store not synced';

      const sub = document.createElement('div');
      sub.className = 'mt-2 text-sm text-slate-300';
      sub.textContent = storeLastError ? `Error: ${storeLastError}` : 'Click Sync to download the global store index.';

      const actions = document.createElement('div');
      actions.className = 'forgeos-store-item__actions';

      const btn = document.createElement('button');
      btn.className = 'axe-btn';
      btn.type = 'button';
      btn.textContent = 'Sync global store';
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
      : channel !== 'global'
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

    if (hasLoadedStore && !storeLastOk && storeLastError && channel !== 'global') {
      const notice = document.createElement('div');
      notice.className = 'forgeos-muted';
      notice.style.gridColumn = '1 / -1';
      notice.textContent = `Store not synced (${storeLastError}). Showing built-in catalog.`;
      storeEl.appendChild(notice);
    }

    const ids = entries.slice().sort((a, b) => {
      const ma = metaFor(a, { prefer: 'store' });
      const mb = metaFor(b, { prefer: 'store' });
      return String(ma.name || a).localeCompare(String(mb.name || b), undefined, { sensitivity: 'base' });
    });

    const q = (storeQuery || '').trim().toLowerCase();
    const visibleIds = q
      ? ids.filter((id) => {
          const meta = metaFor(id, { prefer: 'store' });
          const hay = `${id} ${meta.name || ''} ${meta.desc || ''} ${meta.tag || ''}`.toLowerCase();
          return hay.includes(q);
        })
      : ids;

    const cat = channel === 'global' ? String(storeCategory || '').trim() : '';
    const categoryIds = cat
      ? visibleIds.filter((id) => {
          const meta = metaFor(id, { prefer: 'store' });
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
	      const meta = metaFor(id, { prefer: 'store' });
	      const installed = installedById.get(id) || null;
	      const isInstalled = installedSet && installedSet.has(id);
	      const updateAvailable = !!(installed && isUpdateAvailable(installed.installed_version, meta.version));
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

      // Keep store cards tidy: use icon-only tiles (details view shows screenshots).

      const top = document.createElement('div');
      top.className = 'forgeos-store-item__top';

      const brand = document.createElement('div');
      brand.className = 'forgeos-store-item__brand';

      const logo = document.createElement('img');
      logo.className = 'forgeos-store-item__logo';
      logo.alt = `${meta.name || id} logo`;
      logo.dataset.fallbackSrc = fallbackLogoFor(id, meta.name || id);
      if (meta.logo) logo.src = meta.logo;
      logo.loading = 'lazy';
      attachGithubRawFallback(logo);

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
	        pill.textContent = updateAvailable ? 'Update' : 'Installed';
          if (updateAvailable) {
            pill.title = meta.version ? `Update available: v${String(meta.version).replace(/^v/i, '')}` : 'Update available';
            pill.classList.add('forgeos-pill--update', 'forgeos-store-item__update-badge');
          }
	      } else {
	        pill.textContent = isInstallable ? meta.tag || 'App' : 'Coming soon';
	      }

      top.appendChild(brand);
      top.appendChild(pill);

      const desc = document.createElement('div');
      desc.className = 'forgeos-store-item__desc';
      desc.textContent = sanitizeStoreText(meta.desc || '');

      card.appendChild(top);
      card.appendChild(desc);

      const metaRow = document.createElement('div');
      metaRow.className = 'forgeos-store-item__meta';
      const v = String(meta.version || '').trim();
      if (v) {
        const version = document.createElement('div');
        version.className = 'forgeos-store-item__version forgeos-mono';
        version.textContent = `v${v.replace(/^v/i, '')}`;
        metaRow.appendChild(version);
      }
      const dev = String(meta.developer || '').trim();
      if (dev) {
        const by = document.createElement('div');
        by.className = 'forgeos-store-item__by';
        by.textContent = dev;
        metaRow.appendChild(by);
      }
      if (metaRow.childNodes.length) card.appendChild(metaRow);

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

          if (updateAvailable) {
            const btnUpdate = document.createElement('button');
            btnUpdate.className = 'axe-btn';
            btnUpdate.type = 'button';
            btnUpdate.textContent = 'Update';
            btnUpdate.dataset.defaultLabel = 'Update';
            btnUpdate.dataset.progressId = id;
            btnUpdate.addEventListener('click', async (e) => {
              e.stopPropagation();
              btnUpdate.disabled = true;
              startProgress(id, 'update');
              const beforeVer = installed ? String(installed.installed_version || '') : '';
              let requestErr = null;
              try {
                try {
                  await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/update`, {
                    method: 'POST',
                    body: JSON.stringify({ channel: meta.channel || activeStoreChannel || 'main' }),
                  });
                } catch (err) {
                  requestErr = err;
                }
                const res = await waitForAppUpdate(id, { expectedVersion: meta.version, previousVersion: beforeVer });
                if (res && res.ok) {
                  finishProgress(id);
                  await refreshInstalled();
                  await refreshStore();
                  showToast('App updated', null);
                } else {
                  cancelProgress(id);
                  showToast('Update status unknown', 'warn');
                  await openNoticeModal({
                    kind: 'Warning',
                    title: 'Update status unknown',
                    message:
                      'The update appears to have started, but confirmation timed out.\n\n' +
                      (requestErr ? `Request error: ${requestErr && requestErr.message ? requestErr.message : requestErr}` : ''),
                  });
                }
              } finally {
                btnUpdate.disabled = false;
                btnUpdate.textContent = btnUpdate.dataset.defaultLabel || 'Update';
              }
            });
            actions.appendChild(btnUpdate);
          }

	        card.appendChild(actions);
	      } else if (isInstallable) {
	        const actions = document.createElement('div');
	        actions.className = 'forgeos-store-item__actions';

        const btnInstall = document.createElement('button');
        btnInstall.className = 'axe-btn';
        btnInstall.type = 'button';
        btnInstall.textContent = 'Install';
        btnInstall.dataset.defaultLabel = 'Install';
        btnInstall.dataset.progressId = id;
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
            await openNoticeModal({
              kind: 'Error',
              title: 'Install failed',
              message: err && err.message ? String(err.message) : String(err),
              danger: true,
            });
            btnInstall.disabled = false;
            btnInstall.textContent = btnInstall.dataset.defaultLabel || 'Install';
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
    try {
      if (typeof modalOnClose === 'function') modalOnClose();
    } catch {}
    modalOnClose = null;
    modalEl.classList.add('hidden');
    modalEl.setAttribute('aria-hidden', 'true');
    if (modalBodyEl) modalBodyEl.innerHTML = '';
    document.body.style.overflow = '';
    try {
      systemDetailMode = null;
      stopSystemDetailPoll();
    } catch {}
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
    const raw = sanitizeStoreText(String(value || '')).replace(/\r\n/g, '\n').trim();
    if (!raw) return '';

    // Some store descriptions use " - " as bullet separators in a single paragraph.
    if (!raw.includes('\n')) {
      const parts = raw
        .split(' - ')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 3) {
        const [head, ...rest] = parts;
        return [head, '', ...rest.map((p) => `\u2022 ${p}`)].join('\n');
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
        disks.find((d) => d && d.path === '/srv/5tratumos-data') || disks.find((d) => d && d.path === '/') || null;
      const diskText = preferred
        ? `${preferred.path} ${Math.round((Number(preferred.used_bytes || 0) / Math.max(1, Number(preferred.total_bytes || 0))) * 100)}%`
        : '-';

      sysV.textContent = `CPU ${cpuPct}% \u00b7 MEM ${memPct}% \u00b7 DISK ${diskText} \u00b7 UPTIME ${formatUptime(metrics.uptime_s)}`;
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
          .join(' \u00b7 ');

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

  let systemDetailMode = null;
  let systemDetailPollTimer = null;
  let systemDetailPollInFlight = false;

  function stopSystemDetailPoll() {
    if (!systemDetailPollTimer) return;
    window.clearTimeout(systemDetailPollTimer);
    systemDetailPollTimer = null;
  }

  function scheduleSystemDetailPoll(delayMs) {
    stopSystemDetailPoll();
    const ms = Math.max(750, Number(delayMs) || 1500);
    systemDetailPollTimer = window.setTimeout(() => refreshSystemDetail().catch(() => {}), ms);
  }

  async function apiSystemProcesses(sort, limit) {
    const params = new URLSearchParams();
    if (sort) params.set('sort', String(sort));
    if (limit) params.set('limit', String(limit));
    const q = params.toString();
    return apiJsonTimeout(`/api/v0/system/processes${q ? `?${q}` : ''}`, {}, 3500);
  }

  function renderProcessTable(bodyEl, procs) {
    if (!(bodyEl instanceof HTMLElement)) return;
    bodyEl.innerHTML = '';
    const list = Array.isArray(procs) ? procs : [];
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.textContent = 'No process data.';
      bodyEl.appendChild(empty);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-table-wrap';
    const table = document.createElement('table');
    table.className = 'forgeos-table';

    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    for (const label of ['PID', 'USER', 'CMD', 'CPU', 'MEM', 'RSS']) {
      const th = document.createElement('th');
      th.textContent = label;
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const p of list.slice(0, 80)) {
      if (!p || typeof p !== 'object') continue;
      const tr = document.createElement('tr');
      const pid = p.pid != null ? String(p.pid) : '-';
      const user = p.user != null ? String(p.user) : '-';
      const cmd = p.command != null ? String(p.command) : '-';
      const cpu = Number(p.cpu_perc);
      const mem = Number(p.mem_perc);
      const rss = Number(p.rss_bytes);
      const cols = [
        pid,
        user,
        cmd,
        Number.isFinite(cpu) ? `${cpu.toFixed(cpu >= 10 ? 1 : 2)}%` : '-',
        Number.isFinite(mem) ? `${mem.toFixed(mem >= 10 ? 1 : 2)}%` : '-',
        Number.isFinite(rss) ? formatBytes(rss) : '-',
      ];
      for (const c of cols) {
        const td = document.createElement('td');
        td.textContent = c;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    bodyEl.appendChild(wrap);
  }

  function renderDiskTable(bodyEl, disks) {
    if (!(bodyEl instanceof HTMLElement)) return;
    bodyEl.innerHTML = '';
    const list = Array.isArray(disks) ? disks : [];
    if (!list.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.textContent = 'No disk data.';
      bodyEl.appendChild(empty);
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-table-wrap';
    const table = document.createElement('table');
    table.className = 'forgeos-table';

    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    for (const label of ['MOUNT', 'USED', 'TOTAL', 'PCT']) {
      const th = document.createElement('th');
      th.textContent = label;
      trh.appendChild(th);
    }
    thead.appendChild(trh);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (const d of list.slice(0, 64)) {
      if (!d || typeof d !== 'object') continue;
      const path = String(d.path || d.mount || '-') || '-';
      const used = Number(d.used_bytes);
      const total = Number(d.total_bytes);
      const pct = total > 0 ? Math.round((Math.max(0, used) / total) * 100) : NaN;
      const cols = [path, Number.isFinite(used) ? formatBytes(used) : '-', Number.isFinite(total) ? formatBytes(total) : '-', Number.isFinite(pct) ? `${pct}%` : '-'];
      const tr = document.createElement('tr');
      for (const c of cols) {
        const td = document.createElement('td');
        td.textContent = c;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    bodyEl.appendChild(wrap);
  }

  async function refreshSystemDetail() {
    if (!systemDetailMode || !modalEl || modalEl.classList.contains('hidden')) {
      stopSystemDetailPoll();
      return;
    }
    if (systemDetailPollInFlight) return;
    systemDetailPollInFlight = true;
    try {
      const ok = await ensureHealthy();
      if (!ok) {
        scheduleSystemDetailPoll(2200);
        return;
      }

      const metrics = await apiJsonTimeout('/api/v0/system/metrics', {}, 3000).catch(() => null);
      if (metrics && metrics.ok === true) lastMetrics = metrics;

      const mode = String(systemDetailMode || 'cpu').toLowerCase();
      const sort = mode === 'mem' ? 'mem' : mode === 'disk' ? 'cpu' : 'cpu';
      const res = await apiSystemProcesses(sort, 30).catch(() => null);

      const summaryEl = document.getElementById('sysdetail-summary');
      const procsEl = document.getElementById('sysdetail-procs');
      const disksEl = document.getElementById('sysdetail-disks');
      const titleEl = document.getElementById('sysdetail-title');
      const subEl = document.getElementById('sysdetail-sub');

      if (titleEl) titleEl.textContent = mode === 'mem' ? 'Memory' : mode === 'disk' ? 'Disk' : 'CPU';

      const m = metrics && metrics.ok === true ? metrics : null;
      if (m && summaryEl) {
        const cpu = m.cpu || {};
        const cores = Number(cpu.cores) || 1;
        const load1 = Number(cpu.load1) || 0;
        const cpuTotal = Number.isFinite(Number(cpu.total_perc)) ? Number(cpu.total_perc) : NaN;
        const cpuPct = Number.isFinite(cpuTotal) ? Math.max(0, Math.round(cpuTotal)) : Math.max(0, Math.round((load1 / cores) * 100));

        const mem = m.memory || {};
        const total = Number(mem.total_bytes) || 0;
        const used = Number(mem.used_bytes) || 0;
        const memPct = total > 0 ? Math.max(0, Math.round((used / total) * 100)) : 0;

        const disks = Array.isArray(m.disks) ? m.disks : [];
        const preferred = disks.find((d) => d && d.path === '/srv/5tratumos-data') || disks.find((d) => d && d.path === '/') || null;
        const diskPct =
          preferred && Number(preferred.total_bytes) > 0
            ? Math.max(0, Math.round((Number(preferred.used_bytes || 0) / Number(preferred.total_bytes || 1)) * 100))
            : null;

        const uptime = formatUptime(m.uptime_s);
        let line = '';
        if (mode === 'mem') line = `Used ${formatBytes(used)} / ${formatBytes(total)} (${memPct}%) \u2022 Uptime ${uptime}`;
        else if (mode === 'disk')
          line = preferred
            ? `${preferred.path} ${formatBytes(Number(preferred.used_bytes || 0))} / ${formatBytes(Number(preferred.total_bytes || 0))} (${diskPct ?? '-'}%) \u2022 Uptime ${uptime}`
            : `Uptime ${uptime}`;
        else line = `Total ${cpuPct}% \u2022 ${cores} cores \u2022 load1 ${load1.toFixed(2)} \u2022 Uptime ${uptime}`;

        summaryEl.textContent = line;
        if (subEl) subEl.textContent = `Updated ${formatTimeShort(m.time) || ''}`.trim() || '-';
      } else {
        if (summaryEl) summaryEl.textContent = 'Loading...';
        if (subEl) subEl.textContent = '-';
      }

      if (mode === 'disk') {
        if (disksEl) disksEl.classList.remove('hidden');
        if (procsEl) procsEl.classList.remove('hidden');
        if (m) renderDiskTable(disksEl, m.disks);
        if (res && res.ok === true) renderProcessTable(procsEl, res.procs);
        else renderProcessTable(procsEl, []);
      } else {
        if (disksEl) disksEl.classList.add('hidden');
        if (procsEl) procsEl.classList.remove('hidden');
        if (res && res.ok === true) renderProcessTable(procsEl, res.procs);
        else renderProcessTable(procsEl, []);
      }
    } finally {
      systemDetailPollInFlight = false;
      scheduleSystemDetailPoll(1600);
    }
  }

  function openSystemDetailModal(mode) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    systemDetailMode = String(mode || 'cpu').trim().toLowerCase() || 'cpu';

    modalTitleEl.textContent = 'System';
    modalBodyEl.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'forgeos-sysdetail__head';

    const left = document.createElement('div');
    left.className = 'min-w-0';

    const title = document.createElement('div');
    title.id = 'sysdetail-title';
    title.className = 'forgeos-sysdetail__title';
    title.textContent = systemDetailMode === 'mem' ? 'Memory' : systemDetailMode === 'disk' ? 'Disk' : 'CPU';

    const summary = document.createElement('div');
    summary.id = 'sysdetail-summary';
    summary.className = 'forgeos-sysdetail__summary forgeos-mono';
    summary.textContent = 'Loading...';

    const sub = document.createElement('div');
    sub.id = 'sysdetail-sub';
    sub.className = 'forgeos-muted';
    sub.textContent = '-';

    left.appendChild(title);
    left.appendChild(summary);
    left.appendChild(sub);

    const tabs = document.createElement('div');
    tabs.className = 'forgeos-sysdetail__tabs';

    function addTab(key, label) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `axe-btn forgeos-sysdetail__tab${systemDetailMode === key ? ' forgeos-sysdetail__tab--active' : ''}`;
      b.textContent = label;
      b.addEventListener('click', () => {
        systemDetailMode = key;
        Array.from(tabs.children).forEach((c) => {
          if (!(c instanceof HTMLElement)) return;
          c.classList.toggle('forgeos-sysdetail__tab--active', c.dataset.tab === key);
        });
        refreshSystemDetail().catch(() => {});
      });
      b.dataset.tab = key;
      tabs.appendChild(b);
    }

    addTab('cpu', 'CPU');
    addTab('mem', 'Memory');
    addTab('disk', 'Disk');

    head.appendChild(left);
    head.appendChild(tabs);

    const content = document.createElement('div');
    content.className = 'forgeos-sysdetail__content';

    const procs = document.createElement('div');
    procs.id = 'sysdetail-procs';

    const disks = document.createElement('div');
    disks.id = 'sysdetail-disks';
    disks.className = 'hidden';

    content.appendChild(disks);
    content.appendChild(procs);

    modalBodyEl.appendChild(head);
    modalBodyEl.appendChild(content);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    refreshSystemDetail().catch(() => {});
  }

  function openPowerModal() {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    if (modalKindEl) modalKindEl.textContent = 'System';
    modalTitleEl.textContent = 'Power';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'forgeos-power';

    const desc = document.createElement('div');
    desc.className = 'text-sm text-slate-300';
    const statusLabel = statusPill ? String(statusPill.textContent || '').trim() : '';
    const host = (() => {
      try {
        return String(window.location.hostname || '').trim();
      } catch {
        return '';
      }
    })();
    desc.textContent =
      'System actions for this 5tratumOS host.' +
      (statusLabel || host ? `  (${[statusLabel ? `Status: ${statusLabel}` : null, host ? `Host: ${host}` : null].filter(Boolean).join(' • ')})` : '');

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

      const okConfirm = await openConfirmModal({
        title: msg,
        message: act === 'shutdown' ? 'This will power off the host immediately.' : 'This will restart the host immediately.',
        confirmText: label,
        cancelText: 'Cancel',
        danger: act === 'shutdown',
      });
      if (!okConfirm) return;
      try {
        await apiJson('/api/v0/system/power', { method: 'POST', body: JSON.stringify({ action: act }) });
        closeModal();
        setStatus(act === 'reboot' ? 'Restarting...' : 'Shutting down...');
        showToast(`${label} requested`, null);
      } catch (e) {
        showToast('Power action failed', 'error');
        await openNoticeModal({
          kind: 'Error',
          title: 'Power action failed',
          message: e && e.message ? String(e.message) : String(e),
          danger: true,
        });
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
    desc.textContent = 'Run a command on the host (Ctrl+Enter).';

    const form = document.createElement('div');
    form.className = 'forgeos-terminal__form';

    const input = document.createElement('textarea');
    input.className = 'forgeos-terminal__input';
    input.rows = 2;
    input.placeholder = '';
    input.value = '';

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
      const shown = cmd
        .split(/\r?\n/)
        .map((ln) => String(ln || '').trim())
        .filter(Boolean)
        .map((ln) => `$ ${ln}`)
        .join('\n');
      output.textContent = `${shown}\n`;
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
    try {
      if (!modalEl || !modalBodyEl || !modalTitleEl) return;
      const id = String(appId || '').trim();
      if (!id) return;
      if (modalKindEl) modalKindEl.textContent = 'App Store';

      const meta = metaFor(id, { prefer: 'store' });
      const installed = installedById.get(id) || null;
      const isInstalled = !!installed;
      const status = installed ? installed.status || 'installed' : 'not-installed';
      const isInstallable = !!meta.installable;

	    modalTitleEl.textContent = meta.name || id;
	    modalBodyEl.innerHTML = '';

	    const updateAvailable = !!(installed && isUpdateAvailable(installed.installed_version, meta.version));
	    const installedVersion = isInstalled ? String(installed.installed_version || '') : '';
	    const latestVersion = String(meta.version || (installed ? installed.latest_version : '') || '');

	    const layout = document.createElement('div');
	    layout.className = 'forgeos-modal__layout';

	    const shotsWrap = document.createElement('div');
	    shotsWrap.className = 'forgeos-modal__shots';

	    const shots = Array.isArray(meta.screenshots) && meta.screenshots.length ? meta.screenshots : [makeShot(meta.name || id, meta.desc || 'Preview')];

    const mainShot = document.createElement('img');
    mainShot.className = 'forgeos-modal__shot';
    mainShot.alt = `${meta.name || id} preview`;
    mainShot.dataset.fallbackSrc = makeShot(meta.name || id, meta.desc || 'Preview');
    mainShot.src = shots[0];
    mainShot.loading = 'lazy';
    attachGithubRawFallback(mainShot);
    shotsWrap.appendChild(mainShot);

    if (shots.length > 1) {
      const thumbs = document.createElement('div');
      thumbs.className = 'forgeos-modal__thumbs';
      shots.forEach((src, idx) => {
        const t = document.createElement('img');
        t.className = `forgeos-modal__thumb${idx === 0 ? ' forgeos-modal__thumb--active' : ''}`;
        t.alt = `${meta.name || id} preview ${idx + 1}`;
        t.dataset.fallbackSrc = makeShot(meta.name || id, meta.desc || 'Preview');
        t.src = src;
        t.loading = 'lazy';
        attachGithubRawFallback(t);
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
    logo.dataset.fallbackSrc = fallbackLogoFor(id, meta.name || id);
    if (meta.logo) logo.src = meta.logo;
    logo.loading = 'lazy';
    attachGithubRawFallback(logo);

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
	      updatePill.className = 'axe-pill forgeos-pill--update forgeos-modal__update-badge';
	      updatePill.textContent = 'Update';
        updatePill.title = latestVersion ? `Update available: v${latestVersion}` : 'Update available';
	      metaPanel.appendChild(updatePill);
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
          btnUpdate.dataset.defaultLabel = 'Update';
	        btnUpdate.dataset.progressId = id;
	        btnUpdate.addEventListener('click', async () => {
	          startProgress(id, 'update');
	          btnUpdate.disabled = true;
            const beforeVer = installed ? String(installed.installed_version || '') : '';
            let requestErr = null;
	          try {
	            try {
	              await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/update`, {
	                method: 'POST',
	                body: JSON.stringify({ channel: meta.channel || activeStoreChannel || 'main' }),
	              });
	            } catch (err) {
                requestErr = err;
              }

              const res = await waitForAppUpdate(id, { expectedVersion: meta.version, previousVersion: beforeVer });
              if (res && res.ok) {
                finishProgress(id);
                await refreshInstalled();
                // Re-render this details panel so the installed version / update badge update immediately.
                openStoreModal(id);
                showToast('App updated', null);
              } else {
                cancelProgress(id);
                showToast('Update status unknown', 'warn');
                await openNoticeModal({
                  kind: 'Warning',
                  title: 'Update status unknown',
                  message:
                    'The update appears to have started, but confirmation timed out.\n\n' +
                    (requestErr ? `Request error: ${requestErr && requestErr.message ? requestErr.message : requestErr}` : ''),
                });
              }
	          } finally {
	            btnUpdate.disabled = false;
              btnUpdate.textContent = btnUpdate.dataset.defaultLabel || 'Update';
	          }
	        });
	        actions.appendChild(btnUpdate);
	      }

        const rollbacks = installed && Array.isArray(installed.rollbacks) ? installed.rollbacks : [];
        if (rollbacks.length) {
          const select = document.createElement('select');
          select.className = 'forgeos-input';
          select.title = 'Rollback version (from locally saved snapshots)';

          const opt0 = document.createElement('option');
          opt0.value = '';
          opt0.textContent = 'Rollback...';
          select.appendChild(opt0);

          for (const rb of rollbacks.slice(0, 12)) {
            if (!rb || typeof rb !== 'object') continue;
            const v = String(rb.version || '').trim();
            if (!v) continue;
            const t = String(rb.time || rb.updated_at || rb.at || '').trim();
            const label = t ? `${v} (${t})` : v;
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = label;
            select.appendChild(opt);
          }

          const btnRollback = document.createElement('button');
          btnRollback.className = 'axe-btn forgeos-btn--danger';
          btnRollback.type = 'button';
          btnRollback.textContent = 'Rollback';
          btnRollback.disabled = true;
          btnRollback.addEventListener('click', async () => {
            const v = String(select.value || '').trim();
            if (!v) return;
            const label = meta.name || id;
            const okConfirm = await openConfirmModal({
              title: `Rollback ${label}?`,
              message: `Rollback to ${v}?`,
              confirmText: 'Rollback',
              cancelText: 'Cancel',
              danger: true,
            });
            if (!okConfirm) return;
            btnRollback.disabled = true;
            try {
              await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/rollback`, {
                method: 'POST',
                body: JSON.stringify({ version: v }),
              });
              await refresh();
              showToast('Rollback complete', null);
            } catch (err) {
              await openNoticeModal({
                kind: 'Error',
                title: 'Rollback failed',
                message: err && err.message ? String(err.message) : String(err),
                danger: true,
              });
            } finally {
              btnRollback.disabled = false;
            }
          });

          select.addEventListener('change', () => {
            btnRollback.disabled = !String(select.value || '').trim();
          });

          actions.appendChild(select);
          actions.appendChild(btnRollback);
        }

	      const btnUninstall = document.createElement('button');
	      btnUninstall.className = 'axe-btn';
      btnUninstall.type = 'button';
      btnUninstall.textContent = 'Uninstall';
      btnUninstall.addEventListener('click', async () => {
        const label = meta.name || id;
        const okConfirm = await openConfirmModal({
          title: `Uninstall ${label}?`,
          message: 'Containers will be removed. App data will be kept.',
          confirmText: 'Uninstall',
          cancelText: 'Cancel',
          danger: true,
        });
        if (!okConfirm) return;
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
          await openNoticeModal({
            kind: 'Error',
            title: 'Uninstall failed',
            message: err && err.message ? String(err.message) : String(err),
            danger: true,
          });
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
      btnInstall.dataset.defaultLabel = btnInstall.textContent;
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
          await openNoticeModal({
            kind: 'Error',
            title: 'Install failed',
            message: err && err.message ? String(err.message) : String(err),
            danger: true,
          });
          btnInstall.disabled = false;
          btnInstall.textContent = btnInstall.dataset.defaultLabel || 'Install';
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
    } catch (err) {
      console.error('openStoreModal failed', err);
      showToast('Unable to open app details', 'error');
    }
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
        const mode = String(btn.getAttribute('data-dashboard-mode') || '').trim().toLowerCase();
        if (mode) {
          if (activeViewKey === 'dashboard') setDashboardMode(mode);
          else {
            dashboardMode = mode;
            saveDashboardMode();
            setView('dashboard');
          }
          return;
        }
      }
      setView(view);
    });
  });

  btnOpenStore?.addEventListener('click', () => setView('store'));

  settingStoreAutoSync?.addEventListener('change', () => {
    storeAutoSyncEnabled = !!settingStoreAutoSync.checked;
    saveStoreAutoSyncEnabled();
    applyStoreAutoSyncUi();
  });

  btnPower?.addEventListener('click', openPowerModal);
  btnOpenTerminal?.addEventListener('click', openTerminalModal);
  btnAutoLockSave?.addEventListener('click', () => saveSessionConfig(autoLockMinutesInput ? autoLockMinutesInput.value : 0).catch(() => {}));
  btnFixProxy?.addEventListener('click', () => fixProxyNow().catch(() => {}));

  sidebarClockEl?.addEventListener('click', () => {
    const body = document.body;
    const isCollapsed = body.classList.contains('forgeos-sidebar-collapsed');
    const isAutoCollapsed =
      body.classList.contains('forgeos-sidebar-auto') && !document.querySelector('.forgeos-sidebar:hover');
    if (isCollapsed || isAutoCollapsed) openPowerModal();
  });

  if (desktopSurfaceEl) {
    desktopSurfaceEl.addEventListener('dragover', (e) => {
      if (!desktopDragId) return;
      e.preventDefault();
    });
    desktopSurfaceEl.addEventListener('drop', (e) => {
      if (!desktopDragId) return;
      e.preventDefault();
      const id = String(desktopDragId || '').trim();
      desktopDragId = '';
      if (!id) return;
      const targetId = desktopItemAtClientPoint('', e.clientX, e.clientY);
      if (targetId && desktopState && desktopState.items && desktopState.items[targetId]) {
        const target = desktopState.items[targetId];
        if (target && target.type === 'folder') {
          desktopAddAppToFolder(targetId, id);
          renderDesktop();
          showToast('Added to folder', null);
          return;
        }
        if (target && target.type === 'app') {
          const targetAppId = String(target.appId || '').trim() || String(targetId).replace(/^app:/, '');
          if (targetAppId && targetAppId !== id) {
            desktopCreateFolderAt({ x: target.x, y: target.y }, [id, targetAppId]);
            renderDesktop();
            showToast('Folder created', null);
            return;
          }
        }
      }

      const p = desktopSurfacePoint(e);
      pinToDesktop(id, { x: p.x - 36, y: p.y - 36 });
      showToast('Added to Desktop', null);
    });
  }

  if (desktopBinEl) {
    ['dragenter', 'dragover'].forEach((ev) => {
      desktopBinEl.addEventListener(ev, (e) => {
        if (!desktopDragId) return;
        e.preventDefault();
        desktopBinEl.classList.add('forgeos-desktop-bin--hot');
      });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      desktopBinEl.addEventListener(ev, () => {
        desktopBinEl.classList.remove('forgeos-desktop-bin--hot');
      });
    });
    desktopBinEl.addEventListener('drop', (e) => {
      if (!desktopDragId) return;
      e.preventDefault();
      const id = String(desktopDragId || '').trim();
      desktopDragId = '';
      if (!id) return;
      unpinFromDesktop(id);
      showToast('Removed from Desktop', null);
    });
  }

  btnSidebarCollapse?.addEventListener('click', () => {
    const current = loadSidebarMode();
    const next = current === 'collapsed' ? 'static' : 'collapsed';
    setSidebarMode(next);
  });

  settingSidebarSelect?.addEventListener('change', () => setSidebarMode(settingSidebarSelect.value));

  btnDashboardLayoutReset?.addEventListener('click', () => {
    openConfirmModal({
      title: 'Reset dashboard layout?',
      message: 'This restores the default card order and visibility.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      danger: true,
    })
      .then((ok) => {
        if (!ok) return;
        dashboardLayout = defaultDashboardLayout();
        saveDashboardLayout();
        applyDashboardLayout();
        showToast('Dashboard layout reset', null);
      })
      .catch(() => {});
  });

  settingSshToggle?.addEventListener('change', async () => {
    const next = !!settingSshToggle.checked;
    settingSshToggle.disabled = true;
    try {
      await apiJson('/api/v0/system/ssh', { method: 'POST', body: JSON.stringify({ enabled: next }) });
      showToast(`SSH ${next ? 'enabled' : 'disabled'}`, null);
    } catch (e) {
      showToast('SSH update failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'SSH update failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
      settingSshToggle.checked = !next;
    } finally {
      await refreshSshStatus();
    }
  });

  btnSshSetPassword?.addEventListener('click', async () => {
    const pw = sshPasswordInput ? String(sshPasswordInput.value || '') : '';
    const pw2 = sshPasswordConfirmInput ? String(sshPasswordConfirmInput.value || '') : '';
    if (!pw || pw.length < 10) {
      showToast('Password must be 10+ characters', 'error');
      return;
    }
    if (pw !== pw2) {
      showToast('Passwords do not match', 'error');
      return;
    }

    btnSshSetPassword.disabled = true;
    try {
      await apiJson('/api/v0/system/ssh/password', { method: 'POST', body: JSON.stringify({ password: pw }) });
      showToast('SSH password updated', null);
      if (sshPasswordInput) sshPasswordInput.value = '';
      if (sshPasswordConfirmInput) sshPasswordConfirmInput.value = '';
    } catch (e) {
      showToast('SSH password update failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'SSH password update failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnSshSetPassword.disabled = false;
      await refreshSshStatus();
    }
  });

  btnSshAddKey?.addEventListener('click', async () => {
    const key = sshPublicKeyInput ? String(sshPublicKeyInput.value || '') : '';
    if (!key.trim()) {
      showToast('Paste a public key first', 'error');
      return;
    }
    btnSshAddKey.disabled = true;
    try {
      const res = await apiJson('/api/v0/system/ssh/authorized-key', { method: 'POST', body: JSON.stringify({ key }) });
      showToast(res && res.added === false ? 'Key already present' : 'SSH key added', null);
      if (sshPublicKeyInput) sshPublicKeyInput.value = '';
    } catch (e) {
      showToast('SSH key add failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'SSH key add failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnSshAddKey.disabled = false;
    }
  });

  btnUpdateCheck?.addEventListener('click', () => refreshSystemUpdateCheck({ force: true }).catch(() => {}));
  btnUpdateApply?.addEventListener('click', () => applySystemUpdate().catch(() => {}));
  btnUpdateSave?.addEventListener('click', () => saveSystemUpdateConfig().catch(() => {}));
  btnUpdateTokenClear?.addEventListener('click', () => clearSystemUpdateToken().catch(() => {}));

  btnRefresh?.addEventListener('click', refresh);
  metricCardCpu?.addEventListener('click', () => openSystemDetailModal('cpu'));
  metricCardMem?.addEventListener('click', () => openSystemDetailModal('mem'));
  metricCardDisk?.addEventListener('click', () => openSystemDetailModal('disk'));
  metricCardIp?.addEventListener('click', async () => {
    const ip = String(metricIp?.textContent || '').trim();
    if (!ip) return;
    try {
      await navigator.clipboard.writeText(ip);
      showToast('IP copied', null);
    } catch {
      openSystemDetailModal('cpu');
    }
  });
  btnWidgetsRefresh?.addEventListener('click', () => refreshWidgets({ force: true }).catch(() => {}));
  btnFleetRefresh?.addEventListener('click', () => refreshFleet({ force: true }).catch(() => {}));
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
  ['pointerdown', 'keydown', 'wheel', 'mousemove', 'touchstart'].forEach((ev) => {
    try {
      window.addEventListener(ev, noteUserActivity, { passive: true, capture: true });
    } catch {}
  });
  noteUserActivity();
  autoLockMinutes = loadAutoLockMinutesFallback();
  setAutoLockUi(autoLockMinutes, autoLockMinutes > 0 ? 'Using cached value.' : 'Disabled.');
  startAutoLockWatcher();
  if (storeHideInstalledInput) storeHideInstalled = !!storeHideInstalledInput.checked;
  openAppIds = loadOpenApps();
  widgetPrefs = loadWidgetPrefs();
  desktopState = loadDesktopState();
  drawerPinned = loadDrawerPinned();
  activeStoreChannel = loadStoreChannel();
  storeAutoSyncEnabled = loadStoreAutoSyncEnabled();
  storeRenderLimit = STORE_RENDER_STEP;
  applyStoreChannelUi();
  applyStoreAutoSyncUi();
  // Always start on Fleet by default.
  dashboardMode = 'fleet';
  saveDashboardMode();
  syncDashboardModeUi();
  renderWorkspace();
  renderDesktop();
  applySidebarMode(loadSidebarMode());
  fleetSeries = loadFleetSeries();
  initDashboard();
  updateClock();
  window.setInterval(updateClock, 1000);
  const cachedInstalled = loadInstalledCache();
  if (cachedInstalled && Array.isArray(cachedInstalled.apps) && cachedInstalled.apps.length) {
    hasLoadedInstalled = true;
    applyInstalled(cachedInstalled.apps, { fromCache: true });
  }
  refresh().catch(() => setStatus('UI only'));
  refreshSystemUpdateStatus().catch(() => {});
  refreshSystemUpdateConfig().catch(() => {});
  refreshSessionConfig().catch(() => {});
  window.setTimeout(() => refreshSystemUpdateCheck().catch(() => {}), 2500);
  window.setInterval(() => refreshMetrics().catch(() => {}), 5000);
  window.setInterval(() => {
    // Avoid background dashboard polling while the workspace is in focus. Some embedded apps
    // reset their UI state when the parent page does heavy DOM churn / polling.
    if (activeViewKey !== 'dashboard' || String(dashboardMode || 'fleet') !== 'fleet') return;
    refreshFleet().catch(() => {});
  }, 10000);
  window.setInterval(() => {
    if (activeViewKey !== 'dashboard' || String(dashboardMode || 'fleet') !== 'fleet') return;
    refreshWidgets().catch(() => {});
  }, 10000);
  window.setInterval(() => refreshInstalled().catch(() => {}), 30000);
  window.setInterval(() => syncStoreBackground().catch(() => {}), STORE_AUTO_SYNC_INTERVAL_MS);
  window.setInterval(() => refreshSystemUpdateCheck().catch(() => {}), 3600000);
})();
