(function () {
  const navButtons = Array.from(document.querySelectorAll('[data-view]'));
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const statusPill = document.getElementById('status-pill');
  const statusDockBtn = document.getElementById('btn-status');
  const hostIp = document.getElementById('host-ip');
  const trustedNetworksEl = document.getElementById('trusted-networks');
  const tailscaleStatusEl = document.getElementById('tailscale-status');
  const wifiStatusEl = document.getElementById('wifi-status');
  const wifiDetailEl = document.getElementById('wifi-detail');
  const btnWifiToggle = document.getElementById('btn-wifi-toggle');
  const btnWifiScan = document.getElementById('btn-wifi-scan');
  const btnWifiDisconnect = document.getElementById('btn-wifi-disconnect');
  const wifiNetworksEl = document.getElementById('wifi-networks');
  let wifiStateCache = { enabled: false, connected: false, ssid: '' };
  const metricCpu = document.getElementById('metric-cpu');
  const metricMem = document.getElementById('metric-mem');
  const metricDisk = document.getElementById('metric-disk');
  const metricNetHost = document.getElementById('metric-net-host');
  const metricNetIp = document.getElementById('metric-net-ip');
  const metricNetBar = document.getElementById('metric-net-bar');
  const metricNetSub = document.getElementById('metric-net-sub');
  const desktopTopbarEl = document.querySelector('.forgeos-desktop-topbar');
  const btnTopbarToggle = document.getElementById('btn-topbar-toggle');
  const topbarActivityEl = document.getElementById('topbar-activity');
  const topbarActivityTextEl = document.getElementById('topbar-activity-text');
  const topbarActivityPctEl = document.getElementById('topbar-activity-pct');
  const topbarActivityBarEl = document.getElementById('topbar-activity-bar');
  const topbarPerfEl = document.getElementById('topbar-perf');
  const topbarPerfCountEl = document.getElementById('topbar-perf-count');
  const topbarOsVersionEl = document.getElementById('topbar-os-version');
  const topbarOsStageEl = document.getElementById('topbar-os-stage');
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
  const btnSidebarPin = document.getElementById('btn-sidebar-pin');
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const btnDashboardMode = document.getElementById('btn-dashboard-mode');
    const btnWidgetsRefresh = document.getElementById('btn-widgets-refresh');
  const btnModeFleet = document.getElementById('btn-mode-fleet');
  const btnModeAppsList = document.getElementById('btn-mode-appslist');
  const btnModeWorkbench = document.getElementById('btn-mode-workbench');
  const btnOpenStore = document.getElementById('btn-open-store');
  const paneAppsLauncherEl = document.getElementById('pane-apps-launcher');
  const appsLauncherGridEl = document.getElementById('apps-launcher-grid');
  const appsLauncherEmptyEl = document.getElementById('apps-launcher-empty');
  const appsPagesTabsEl = document.getElementById('apps-pages-tabs');
  const btnAppsPagePrev = document.getElementById('btn-apps-page-prev');
  const btnAppsPageNext = document.getElementById('btn-apps-page-next');
  const btnAppsPageAdd = document.getElementById('btn-apps-page-add');
  const paneDesktopEl = document.getElementById('pane-desktop');
  const desktopSurfaceEl = document.getElementById('desktop-surface');
  const desktopEmptyEl = document.getElementById('desktop-empty');
  const desktopBinEl = document.getElementById('desktop-bin');
  const settingSettingsLayoutSelect = document.getElementById('setting-settings-layout');
  const settingsNavEl = document.getElementById('settings-nav');
  const settingsGridEl = document.getElementById('settings-grid');
  const storeSearchInput = document.getElementById('store-search');
  const storeCategorySelect = document.getElementById('store-category');
  const storeHideInstalledInput = document.getElementById('store-hide-installed');
  const btnStoreClear = document.getElementById('btn-store-clear');
  const settingStoreAutoSync = document.getElementById('setting-store-autosync');
  const btnStoreSync = document.getElementById('btn-store-sync');
  const btnStoreCustom = document.getElementById('btn-store-custom');
  const storeSourceLabel = document.getElementById('store-source-label');
  const storeSourceDesc = document.getElementById('store-source-desc');
  const storeChannelCustomsEl = document.getElementById('store-channel-customs');
  let storeChannelButtons = Array.from(document.querySelectorAll('[data-store-channel]'));
  const workspaceEl = document.getElementById('workspace');
  const workspaceEmptyEl = document.getElementById('workspace-empty');
  const btnResumeWorkspace = document.getElementById('btn-resume-workspace');
  const settingSidebarSelect = document.getElementById('setting-sidebar');
  const settingTopbarSelect = document.getElementById('setting-topbar');
  const settingHostnameInput = document.getElementById('setting-hostname');
  const settingChannelSelect = document.getElementById('setting-channel');
  const storageDefaultSelect = document.getElementById('setting-storage-default');
  const btnStorageSave = document.getElementById('btn-storage-save');
  const btnStorageRefresh = document.getElementById('btn-storage-refresh');
  const btnStorageOrphansScan = document.getElementById('btn-storage-orphans-scan');
  const btnStorageOrphansScanSizes = document.getElementById('btn-storage-orphans-scan-sizes');
  const btnStorageOrphansDelete = document.getElementById('btn-storage-orphans-delete');
  const storageListEl = document.getElementById('storage-list');
  const storageStatusEl = document.getElementById('storage-status');
  const storageOrphansListEl = document.getElementById('storage-orphans-list');
  const storageOrphansStatusEl = document.getElementById('storage-orphans-status');
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
  const btnFixApp = document.getElementById('btn-fix-app');
  const updateRepoInput = document.getElementById('update-repo');
  const updateTokenInput = document.getElementById('update-token');
  const updateAuthStatusEl = document.getElementById('update-auth-status');
  const updateCheckIntervalSelect = document.getElementById('update-check-interval');
  const updateAutoApplyInput = document.getElementById('update-auto-apply');
  const authUsernameInput = document.getElementById('setting-username');
  const authPasswordInput = document.getElementById('setting-password');
  const btnAuthUpdate = document.getElementById('btn-auth-update');
  const btnUpdateSave = document.getElementById('btn-update-save');
  const btnUpdateTokenClear = document.getElementById('btn-update-token-clear');
  const autoLockMinutesInput = document.getElementById('setting-autolock-minutes');
  const btnAutoLockSave = document.getElementById('btn-autolock-save');
  const autoLockStatusEl = document.getElementById('autolock-status');
  const kioskEnabledInput = document.getElementById('setting-kiosk-enabled');
  const kioskStatusEl = document.getElementById('kiosk-status');
  const mqttCardEl = document.getElementById('settings-mqtt-card');
  const mqttUnavailableEl = document.getElementById('mqtt-unavailable');
  const mqttConfigEl = document.getElementById('mqtt-config');
  const mqttEnabledInput = document.getElementById('setting-mqtt-enabled');
  const mqttPrefixInput = document.getElementById('setting-mqtt-prefix');
  const mqttAppsEl = document.getElementById('setting-mqtt-apps');
  const mqttStatusEl = document.getElementById('mqtt-status');
  const mqttEventStatusInput = document.getElementById('setting-mqtt-event-status');
  const mqttEventHashrateInput = document.getElementById('setting-mqtt-event-hashrate');
  const mqttEventWorkersInput = document.getElementById('setting-mqtt-event-workers');
  const mqttEventBlockInput = document.getElementById('setting-mqtt-event-block');
  const btnMqttSave = document.getElementById('btn-mqtt-save');
  const discordCardEl = document.getElementById('settings-discord-card');
  const discordEnabledInput = document.getElementById('setting-discord-enabled');
  const discordWebhookInput = document.getElementById('setting-discord-webhook');
  const discordHashrateInput = document.getElementById('setting-discord-hashrate');
  const discordAppsEl = document.getElementById('setting-discord-apps');
  const discordStatusEl = document.getElementById('discord-status');
  const discordEventStatusInput = document.getElementById('setting-discord-event-status');
  const discordEventHashrateInput = document.getElementById('setting-discord-event-hashrate');
  const discordEventWorkersInput = document.getElementById('setting-discord-event-workers');
  const discordEventBlockInput = document.getElementById('setting-discord-event-block');
  const discordEventUpdateSuccessInput = document.getElementById('setting-discord-event-update-success');
  const discordEventUpdateFailureInput = document.getElementById('setting-discord-event-update-failure');
  const discordEventRestartInput = document.getElementById('setting-discord-event-restart');
  const btnDiscordSave = document.getElementById('btn-discord-save');
  const watchdogCardEl = document.getElementById('settings-watchdog-card');
  const watchdogEnabledInput = document.getElementById('setting-watchdog-enabled');
  const watchdogAppsEl = document.getElementById('setting-watchdog-apps');
  const watchdogStatusEl = document.getElementById('watchdog-status');
  const btnWatchdogSave = document.getElementById('btn-watchdog-save');

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
  const globalSplashEl = document.getElementById('global-splash');
  const globalSplashTitleEl = document.getElementById('global-splash-title');
  const globalSplashSubEl = document.getElementById('global-splash-sub');
  const globalSplashDismissEl = document.getElementById('global-splash-dismiss');
  const globalSplashActionsEl = document.getElementById('global-splash-actions');
  const globalSplashPrimaryBtn = document.getElementById('global-splash-primary');
  const globalSplashSecondaryBtn = document.getElementById('global-splash-secondary');
  const globalSplashProgressEl = document.getElementById('global-splash-progress');
  const globalSplashProgressFillEl = document.getElementById('global-splash-progress-fill');
  const globalSplashProgressLabelEl = document.getElementById('global-splash-progress-label');
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
  let storeCustomStores = [];
  let storageCache = null;
  let storageOrphansCache = null;
  let storageOrphansSelection = { paths: new Set(), containers: new Set() };
  let storageOrphansSafe = true;
  const storeAppsByChannelCache = new Map();

  // Apps launcher pages (server-backed).
  let appsPagesState = null;
  let appsPagesLoaded = false;
  let appsPagesSaveTimer = 0;
  let activeAppsPageId = '';
  let launcherDrag = null;
  let launcherGhostEl = null;
  let launcherHoverTabTimer = 0;
	  let lastMetrics = null;
	  let lastWidgets = null;
  let mqttAppsCache = [];
  let discordAppsCache = [];
  let watchdogAppsCache = [];
  let consoleConfigCache = null;
  let consolePromptDone = false;
    let hasLoadedInstalled = false;
    let hasLoadedStore = false;
    let hasLoadedWidgets = false;
    let healthCache = { ok: false, checkedAt: 0 };
    let refreshInstalledInFlight = false;
    let refreshStoreInFlight = false;
  let refreshMetricsInFlight = false;
  let lastNetSample = null;
  const APP_LAUNCH_SPLASH_SRC = '/assets/New%20Logos/video/20260117_2007_New%20Video_simple_compose_01kf6s3p1ff0k9c418pwm2q7ak.gif';
    let refreshWidgetsInFlight = false;
    let systemUpdateConfigCache = null;
    let systemUpdateCheckCache = null;
    let systemUpdateStatusCache = null;
    let systemUpdateCheckAt = 0;
    let systemUpdatePollTimer = null;
    let systemUpdatePollInFlight = false;
    let systemUpdateAutoCheckTimer = null;
    let systemUpdateSplashToken = null;
    let uiConfigCache = null;
    let topbarTempOpen = false;
    let topbarHoverOpen = false;
    let sidebarManualOpen = false;
    let splashTokenSeq = 0;
    const splashTokens = new Map();
    let splashClickBound = false;
  let openAppIds = [];
  let maximizedAppId = null;
  const workspaceTileById = new Map();
  let dashboardLayout = null;
  let dashboardCards = new Map();
  let draggingDashboardCardId = null;
  let lastFleet = null;
  const FLEET_CACHE_KEY = '5tratumos.fleetCache.v1';
  const WIDGETS_CACHE_KEY = '5tratumos.widgetsCache.v1';
  let refreshFleetInFlight = false;
  let fleetSeries = [];
  const OPEN_APPS_KEY = 'forgeos.openApps';
  const INSTALLED_CACHE_KEY = 'forgeos.installedCache.v1';
  const STORE_CHANNEL_KEY = 'forgeos.storeChannel';
  const STORE_AUTO_SYNC_KEY = '5tratumos.storeAutoSync';
  const STORE_AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000;
  const SIDEBAR_MODE_KEY = 'forgeos.sidebarMode';
  const SIDEBAR_MANUAL_OPEN_KEY = '5tratumos.sidebarManualOpen.v1';
  const WIDGET_PREFS_KEY = 'forgeos.widgetPrefs';
  const DASHBOARD_LAYOUT_KEY = 'forgeos.dashboardLayout.v1';
  const FLEET_SERIES_KEY = 'forgeos.fleetHashrateSeries.v1';
  const AUTOLOCK_MINUTES_KEY = 'forgeos.autoLockMinutes';
  const DASHBOARD_MODE_KEY = '5tratumos.dashboardMode';
  const DESKTOP_STATE_KEY_V2 = '5tratumos.desktopState.v2';
  const DESKTOP_STATE_KEY_V1 = '5tratumos.desktopState.v1';
  const DRAWER_PINNED_KEY = '5tratumos.drawerPinned.v1';
  const SETTINGS_LAYOUT_KEY = '5tratumos.settingsLayout.v1';
  const SETTINGS_SECTION_KEY = '5tratumos.settingsSection.v1';
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
  let desktopRemoteLoaded = false;
  let desktopRemoteSaveTimer = 0;
  let drawerPinned = new Set();
  let globalSplashActionsEnabled = false;
  const perfOffenders = new Map();
  let perfAlertCache = [];
  let settingsLayout = 'single';
  let activeSettingsKey = '';
  let settingsNavBuilt = false;

  function refreshGlobalSplashLock() {
    if (!globalSplashEl) return;
    let locked = false;
    for (const value of splashTokens.values()) {
      if (value && value.dismissable === false) {
        locked = true;
        break;
      }
    }
    globalSplashEl.dataset.locked = locked ? 'true' : 'false';
    if (globalSplashDismissEl) {
      globalSplashDismissEl.classList.toggle('hidden', locked);
      if (!locked) globalSplashDismissEl.textContent = 'Click anywhere to dismiss';
    }
    if (globalSplashActionsEl) {
      const show = globalSplashActionsEnabled && !locked;
      globalSplashActionsEl.classList.toggle('hidden', !show);
      globalSplashActionsEl.setAttribute('aria-hidden', show ? 'false' : 'true');
    }
  }

  if (topbarActivityEl) {
    topbarActivityEl.addEventListener('click', async () => {
      const items = activityItems();
      if (!items.length) return;
      const lines = items
        .slice()
        .sort((a, b) => (Number(b.startedAt) || 0) - (Number(a.startedAt) || 0))
        .map((it) => {
          const p = it.pct === null || it.pct === undefined ? '' : ` (${it.pct}%)`;
          const sub = it.sub ? `\n${it.sub}` : '';
          return `- ${it.label}${p}${sub}`;
        })
        .join('\n\n');
      await openNoticeModal({
        kind: 'System',
        title: 'Activity',
        message: lines,
        danger: false,
      });
    });
  }

  function isAxeSuiteAppId(appId) {
    const id = String(appId || '').trim().toLowerCase();
    if (!id) return false;
    // Explicit allowlist: keep perf alerts focused on non-AxeSuite apps (e.g. Doom).
    // Note: AxeBTCF is distinct from AxeBTC (axebtc vs axebtcf).
    return (
      id === 'axebch' ||
      id === 'axedgb' ||
      id === 'axebtc' ||
      id === 'axebtcf' ||
      id === 'axelive' ||
      id === 'axebench' ||
      id === 'axemig' ||
      id === 'axesim'
    );
  }

  function updatePerfWarnings(installedList) {
    const now = Date.now();
    const installed = Array.isArray(installedList) ? installedList : [];
    const activeId = String(activeWindowId || '').trim().toLowerCase();

    const CPU_WARN_PCT = 80;
    const MEM_WARN_PCT = 85;
    const EXTREME_PCT = 95;
    const SUSTAIN_MS = 60 * 1000;
    const EXTREME_SUSTAIN_MS = 15 * 1000;
    const CLEAR_AFTER_MS = 30 * 1000;
    const MEM_WARN_BYTES_NO_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GiB

    const seen = new Set();
    for (const app of installed) {
      if (!app || typeof app !== 'object') continue;
      const id = String(app.id || '').trim().toLowerCase();
      if (!id) continue;
      if (isAxeSuiteAppId(id)) continue;

      const status = String(app.status || '').trim().toLowerCase();
      const runningLike = status === 'running' || status === 'restarting';
      if (!runningLike) continue;

      const res = app.resources && typeof app.resources === 'object' ? app.resources : null;
      if (!res) continue;

      const cpuPct = Number(res.cpu_perc);
      const memUsed = Number(res.mem_used_bytes);
      const memLimit = Number(res.mem_limit_bytes);
      const memPct = Number.isFinite(memUsed) && Number.isFinite(memLimit) && memLimit > 0 ? (memUsed / memLimit) * 100 : NaN;

      const cpuHot = Number.isFinite(cpuPct) && cpuPct >= CPU_WARN_PCT;
      const memHot =
        (Number.isFinite(memPct) && memPct >= MEM_WARN_PCT) ||
        (!Number.isFinite(memPct) && Number.isFinite(memUsed) && memUsed >= MEM_WARN_BYTES_NO_LIMIT);
      if (!cpuHot && !memHot) continue;

      seen.add(id);
      const prev = perfOffenders.get(id) || null;
      const firstSeenAt = prev && Number(prev.firstSeenAt) ? Number(prev.firstSeenAt) : now;
      perfOffenders.set(id, {
        firstSeenAt,
        lastSeenAt: now,
        cpuPct,
        memUsed,
        memLimit,
        memPct,
      });
    }

    for (const [id, st] of Array.from(perfOffenders.entries())) {
      if (seen.has(id)) continue;
      const lastSeenAt = st && Number(st.lastSeenAt) ? Number(st.lastSeenAt) : 0;
      if (!lastSeenAt || now - lastSeenAt > CLEAR_AFTER_MS) perfOffenders.delete(id);
    }

    const alerts = [];
    for (const [id, st] of Array.from(perfOffenders.entries())) {
      if (id === activeId) continue;
      if (!st || typeof st !== 'object') continue;
      const firstSeenAt = Number(st.firstSeenAt) || now;
      const cpuPct = Number(st.cpuPct);
      const memPct = Number(st.memPct);
      const extreme = (Number.isFinite(cpuPct) && cpuPct >= EXTREME_PCT) || (Number.isFinite(memPct) && memPct >= EXTREME_PCT);
      const minMs = extreme ? EXTREME_SUSTAIN_MS : SUSTAIN_MS;
      if (now - firstSeenAt < minMs) continue;

      const name = metaFor(id).name || (installedById.get(id) && installedById.get(id).name) || id;
      alerts.push({ id, name, cpuPct, memPct, memUsed: Number(st.memUsed), memLimit: Number(st.memLimit) });
    }

    perfAlertCache = alerts
      .slice()
      .sort((a, b) => (Number(b.cpuPct) || 0) - (Number(a.cpuPct) || 0) || (Number(b.memPct) || 0) - (Number(a.memPct) || 0));

    if (!topbarPerfEl || !topbarPerfCountEl) return;
    if (!perfAlertCache.length) {
      topbarPerfEl.classList.add('hidden');
      topbarPerfEl.setAttribute('aria-hidden', 'true');
      topbarPerfCountEl.textContent = '0';
      return;
    }
    topbarPerfCountEl.textContent = String(Math.min(9, perfAlertCache.length));
    const titleLines = perfAlertCache.slice(0, 4).map((it) => {
      const cpu = Number.isFinite(it.cpuPct) ? `${Math.round(it.cpuPct)}% CPU` : '';
      const mem =
        Number.isFinite(it.memPct) && it.memLimit > 0
          ? `${Math.round(it.memPct)}% RAM`
          : Number.isFinite(it.memUsed)
            ? `${formatBytes(it.memUsed)} RAM`
            : '';
      return `${it.name}: ${[cpu, mem].filter(Boolean).join(' • ')}`.trim();
    });
    topbarPerfEl.title = titleLines.join('\n');
    topbarPerfEl.classList.remove('hidden');
    topbarPerfEl.setAttribute('aria-hidden', 'false');
  }

  if (topbarPerfEl) {
    topbarPerfEl.addEventListener('click', async () => {
      const items = Array.isArray(perfAlertCache) ? perfAlertCache.slice() : [];
      if (!items.length) return;
      const lines = items
        .slice(0, 10)
        .map((it) => {
          const cpu = Number.isFinite(it.cpuPct) ? `${Math.round(it.cpuPct)}% CPU` : '';
          const mem =
            Number.isFinite(it.memPct) && it.memLimit > 0
              ? `${Math.round(it.memPct)}% RAM`
              : Number.isFinite(it.memUsed)
                ? `${formatBytes(it.memUsed)} RAM`
                : '';
          const detail = [cpu, mem].filter(Boolean).join(' • ');
          return `- ${it.name}${detail ? ` — ${detail}` : ''}`;
        })
        .join('\n');
      await openNoticeModal({
        kind: 'System',
        title: 'High resource usage',
        message: `${lines}\n\nTip: stop unused apps from the Apps page.`,
        danger: false,
      });
    });
  }

  function loadSettingsLayout() {
    try {
      const raw = String(window.localStorage.getItem(SETTINGS_LAYOUT_KEY) || '').trim().toLowerCase();
      if (raw === 'split' || raw === 'single') return raw;
    } catch {}
    return isMobileLayout() ? 'single' : 'split';
  }

  function saveSettingsLayout(mode) {
    try {
      window.localStorage.setItem(SETTINGS_LAYOUT_KEY, String(mode || 'single'));
    } catch {}
  }

  function loadActiveSettingsKey() {
    try {
      return String(window.localStorage.getItem(SETTINGS_SECTION_KEY) || '').trim().toLowerCase();
    } catch {
      return '';
    }
  }

  function saveActiveSettingsKey(key) {
    try {
      window.localStorage.setItem(SETTINGS_SECTION_KEY, String(key || '').trim().toLowerCase());
    } catch {}
  }

  function settingsSectionsList() {
    if (!settingsGridEl) return [];
    return Array.from(settingsGridEl.querySelectorAll('section[data-settings-key]'));
  }

  function sectionLabel(section) {
    if (!section) return { title: 'Settings', sub: '' };
    const titleEl =
      section.querySelector('.text-2xl') ||
      section.querySelector('.font-extrabold') ||
      section.querySelector('h2, h3') ||
      null;
    const subEl = section.querySelector('.text-sm.text-slate-300') || null;
    const title = String(titleEl && titleEl.textContent ? titleEl.textContent : '').trim() || 'Settings';
    const sub = String(subEl && subEl.textContent ? subEl.textContent : '').trim();
    return { title, sub };
  }

  function renderSettingsNav() {
    if (!settingsNavEl) return;
    settingsNavEl.innerHTML = '';
    const heading = document.createElement('div');
    heading.className = 'forgeos-settings-nav__title';
    heading.textContent = 'Settings';
    settingsNavEl.appendChild(heading);

    for (const section of settingsSectionsList()) {
      if (!(section instanceof HTMLElement)) continue;
      const key = String(section.dataset.settingsKey || '').trim().toLowerCase();
      if (!key) continue;
      const meta = sectionLabel(section);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'forgeos-settings-nav__btn';
      btn.dataset.settingsKey = key;
      btn.addEventListener('click', () => {
        activeSettingsKey = key;
        saveActiveSettingsKey(activeSettingsKey);
        applySettingsLayout();
      });

      const title = document.createElement('div');
      title.textContent = meta.title;
      btn.appendChild(title);

      if (meta.sub) {
        const sub = document.createElement('div');
        sub.className = 'forgeos-settings-nav__sub';
        sub.textContent = meta.sub;
        btn.appendChild(sub);
      }

      settingsNavEl.appendChild(btn);
    }

    settingsNavBuilt = true;
  }

  function applySettingsLayout() {
    const mode = settingsLayout === 'split' ? 'split' : 'single';
    const split = mode === 'split';
    document.body.classList.toggle('forgeos-settings-split', split);

    if (settingsNavEl) {
      settingsNavEl.classList.toggle('hidden', !split);
      settingsNavEl.setAttribute('aria-hidden', split ? 'false' : 'true');
    }

    const sections = settingsSectionsList();
    const keys = new Set(
      sections
        .map((s) => (s instanceof HTMLElement ? String(s.dataset.settingsKey || '').trim().toLowerCase() : ''))
        .filter(Boolean),
    );

    if (!activeSettingsKey || !keys.has(activeSettingsKey)) {
      const saved = loadActiveSettingsKey();
      activeSettingsKey = saved && keys.has(saved) ? saved : keys.has('system') ? 'system' : Array.from(keys)[0] || '';
    }

    for (const section of sections) {
      if (!(section instanceof HTMLElement)) continue;
      const key = String(section.dataset.settingsKey || '').trim().toLowerCase();
      const hide = split && key && activeSettingsKey && key !== activeSettingsKey;
      section.classList.toggle('forgeos-settings-section--hidden', hide);
      section.setAttribute('aria-hidden', hide ? 'true' : 'false');
    }

    if (split && settingsNavEl) {
      if (!settingsNavBuilt) renderSettingsNav();
      for (const btn of Array.from(settingsNavEl.querySelectorAll('.forgeos-settings-nav__btn'))) {
        if (!(btn instanceof HTMLElement)) continue;
        const key = String(btn.dataset.settingsKey || '').trim().toLowerCase();
        btn.classList.toggle('forgeos-settings-nav__btn--active', !!activeSettingsKey && key === activeSettingsKey);
      }
    }

    if (settingSettingsLayoutSelect) settingSettingsLayoutSelect.value = mode;
  }

  function showGlobalSplash(opts) {
    if (!globalSplashEl) return null;
    const options = opts && typeof opts === 'object' ? opts : {};
    const title = String(options.title || 'Working...').trim() || 'Working...';
    const sub = String(options.sub || options.subtitle || '').trim();
    const progress = Number.isFinite(Number(options.progress)) ? Number(options.progress) : null;
    const showProgress = options.showProgress === true || progress !== null;
    const dismissable = options.dismissable !== false;
    const primary = options.primary && typeof options.primary === 'object' ? options.primary : null;
    const secondary = options.secondary && typeof options.secondary === 'object' ? options.secondary : null;

    globalSplashActionsEnabled = !!(primary || secondary);
    if (globalSplashPrimaryBtn) {
      const show = !!(primary && primary.label);
      globalSplashPrimaryBtn.classList.toggle('hidden', !show);
      if (show) {
        globalSplashPrimaryBtn.textContent = String(primary.label);
        globalSplashPrimaryBtn.classList.toggle('forgeos-btn--danger', primary.danger !== false);
        globalSplashPrimaryBtn.disabled = !!primary.disabled;
        globalSplashPrimaryBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          primary.onClick?.();
        };
      } else {
        globalSplashPrimaryBtn.onclick = null;
      }
    }

    if (globalSplashSecondaryBtn) {
      const show = !!(secondary && secondary.label);
      globalSplashSecondaryBtn.classList.toggle('hidden', !show);
      if (show) {
        globalSplashSecondaryBtn.textContent = String(secondary.label);
        globalSplashSecondaryBtn.classList.toggle('forgeos-btn--danger', !!secondary.danger);
        globalSplashSecondaryBtn.disabled = !!secondary.disabled;
        globalSplashSecondaryBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          secondary.onClick?.();
        };
      } else {
        globalSplashSecondaryBtn.onclick = null;
      }
    }

    splashTokenSeq += 1;
    const token = `splash-${splashTokenSeq}`;
    splashTokens.set(token, { title, sub, dismissable });
    if (globalSplashTitleEl) globalSplashTitleEl.textContent = title;
    if (globalSplashSubEl) {
      const fallbackSub = dismissable ? 'Please wait' : 'Do not refresh or navigate away from this page.';
      globalSplashSubEl.textContent = sub || fallbackSub;
    }
    if (globalSplashProgressEl) {
      globalSplashProgressEl.classList.toggle('hidden', !showProgress);
      globalSplashProgressEl.setAttribute('aria-hidden', showProgress ? 'false' : 'true');
    }
    if (showProgress && progress !== null) {
      const pct = Math.max(0, Math.min(100, Math.round(progress)));
      if (globalSplashProgressFillEl) setMaskedGradientBar(globalSplashProgressFillEl, pct);
      if (globalSplashProgressLabelEl) globalSplashProgressLabelEl.textContent = `${pct}%`;
    }
    globalSplashEl.classList.remove('hidden');
    globalSplashEl.setAttribute('aria-hidden', 'false');
    refreshGlobalSplashLock();
    if (!splashClickBound) {
      splashClickBound = true;
      globalSplashEl.addEventListener('click', () => {
        if (globalSplashEl.dataset.locked === 'true') return;
        globalSplashEl.classList.add('hidden');
        globalSplashEl.setAttribute('aria-hidden', 'true');
        splashTokens.clear();
        globalSplashActionsEnabled = false;
        if (globalSplashActionsEl) {
          globalSplashActionsEl.classList.add('hidden');
          globalSplashActionsEl.setAttribute('aria-hidden', 'true');
        }
        refreshGlobalSplashLock();
      });
    }
    return token;
  }

  function hideGlobalSplash(token) {
    if (!globalSplashEl) return;
    if (token) splashTokens.delete(token);
    refreshGlobalSplashLock();
    if (splashTokens.size) return;
    globalSplashEl.classList.add('hidden');
    globalSplashEl.setAttribute('aria-hidden', 'true');
    globalSplashActionsEnabled = false;
    if (globalSplashActionsEl) {
      globalSplashActionsEl.classList.add('hidden');
      globalSplashActionsEl.setAttribute('aria-hidden', 'true');
    }
  }

  function updateGlobalSplash(title, sub) {
    if (!globalSplashEl || globalSplashEl.classList.contains('hidden')) return;
    if (globalSplashTitleEl && title) globalSplashTitleEl.textContent = String(title);
    if (globalSplashSubEl && sub) globalSplashSubEl.textContent = String(sub);
  }

  function updateGlobalSplashProgress(pct) {
    if (!globalSplashEl || globalSplashEl.classList.contains('hidden')) return;
    const value = Number(pct);
    if (!Number.isFinite(value)) return;
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    if (globalSplashProgressEl) {
      globalSplashProgressEl.classList.remove('hidden');
      globalSplashProgressEl.setAttribute('aria-hidden', 'false');
    }
    if (globalSplashProgressFillEl) setMaskedGradientBar(globalSplashProgressFillEl, clamped);
    if (globalSplashProgressLabelEl) globalSplashProgressLabelEl.textContent = `${clamped}%`;
  }

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

  function loadNotifyCache(kind) {
    try {
      const raw = String(window.localStorage.getItem(`notify.${kind}.config`) || '').trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function setMqttInputsEnabled(enabled) {
    const on = !!enabled;
    if (mqttPrefixInput) mqttPrefixInput.disabled = !on;
    if (mqttAppsEl) mqttAppsEl.querySelectorAll('input[type="checkbox"]').forEach((el) => (el.disabled = !on));
    if (mqttEventStatusInput) mqttEventStatusInput.disabled = !on;
    if (mqttEventHashrateInput) mqttEventHashrateInput.disabled = !on;
    if (mqttEventWorkersInput) mqttEventWorkersInput.disabled = !on;
    if (mqttEventBlockInput) mqttEventBlockInput.disabled = !on;
  }

  function saveNotifyCache(kind, cfg) {
    if (!cfg || typeof cfg !== 'object') return;
    try {
      window.localStorage.setItem(`notify.${kind}.config`, JSON.stringify(cfg));
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

  function renderNotifyAppList(container, apps, selectedSet, emptyText) {
    if (!container) return;
    container.innerHTML = '';
    if (!Array.isArray(apps) || apps.length === 0) {
      container.classList.add('forgeos-muted');
      container.textContent = emptyText || 'No AxeSuite apps installed.';
      return;
    }
    container.classList.remove('forgeos-muted');
    apps.forEach((app) => {
      const id = String(app.id || '').trim().toLowerCase();
      if (!id) return;
      const label = document.createElement('label');
      label.className = 'forgeos-toggle';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.appId = id;
      input.checked = selectedSet.has(id);
      const span = document.createElement('span');
      span.textContent = String(app.name || id);
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
  }

  function collectNotifyAppSelection(container) {
    if (!container) return [];
    const ids = [];
    container.querySelectorAll('input[type="checkbox"][data-app-id]').forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      if (input.checked && input.dataset.appId) ids.push(input.dataset.appId);
    });
    return ids;
  }

  async function refreshMqttConfig() {
    if (!mqttCardEl) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/mqtt/config', {}, 5000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'load failed');
      const available = !!res.available;
      if (mqttUnavailableEl) mqttUnavailableEl.classList.toggle('hidden', available);
      if (mqttConfigEl) mqttConfigEl.classList.remove('hidden');
      const cfg = res.config || {};
      saveNotifyCache('mqtt', cfg);
      if (mqttEnabledInput) mqttEnabledInput.checked = !!cfg.enabled;
      setMqttInputsEnabled(!!cfg.enabled);
      if (mqttPrefixInput) mqttPrefixInput.value = String(cfg.prefix || '5tratumOS');
      const apps = Array.isArray(res.apps) ? res.apps : [];
      mqttAppsCache = apps;
      const selected = new Set(
        Array.isArray(cfg.apps) && cfg.apps.length ? cfg.apps.map((id) => String(id)) : apps.map((a) => String(a.id)),
      );
      renderNotifyAppList(mqttAppsEl, apps, selected, 'No AxeSuite apps installed.');
      const events = cfg.events || {};
      if (mqttEventStatusInput) mqttEventStatusInput.checked = !!events.status_change;
      if (mqttEventHashrateInput) mqttEventHashrateInput.checked = !!events.hashrate_drop;
      if (mqttEventWorkersInput) mqttEventWorkersInput.checked = !!events.worker_offline;
      if (mqttEventBlockInput) mqttEventBlockInput.checked = !!events.block_found;
      if (mqttStatusEl) mqttStatusEl.textContent = available ? 'Loaded.' : 'Mosquitto will be installed on save.';
    } catch (e) {
      const cached = loadNotifyCache('mqtt');
      if (cached) {
        if (mqttEnabledInput) mqttEnabledInput.checked = !!cached.enabled;
        setMqttInputsEnabled(!!cached.enabled);
        if (mqttPrefixInput) mqttPrefixInput.value = String(cached.prefix || '5tratumOS');
        if (mqttEventStatusInput) mqttEventStatusInput.checked = !!cached.events?.status_change;
        if (mqttEventHashrateInput) mqttEventHashrateInput.checked = !!cached.events?.hashrate_drop;
        if (mqttEventWorkersInput) mqttEventWorkersInput.checked = !!cached.events?.worker_offline;
        if (mqttEventBlockInput) mqttEventBlockInput.checked = !!cached.events?.block_found;
        if (Array.isArray(mqttAppsCache) && mqttAppsCache.length) {
          const selected = new Set(
            Array.isArray(cached.apps) && cached.apps.length
              ? cached.apps.map((id) => String(id))
              : mqttAppsCache.map((a) => String(a.id)),
          );
          renderNotifyAppList(mqttAppsEl, mqttAppsCache, selected, 'No AxeSuite apps installed.');
        }
        if (mqttStatusEl) mqttStatusEl.textContent = 'Cached.';
        return;
      }
      if (mqttStatusEl) mqttStatusEl.textContent = 'Load failed.';
    }
  }

  async function saveMqttConfig() {
    if (!btnMqttSave) return;
    btnMqttSave.disabled = true;
    if (mqttStatusEl) mqttStatusEl.textContent = 'Saving...';
    try {
      const body = {
        enabled: !!(mqttEnabledInput && mqttEnabledInput.checked),
        prefix: mqttPrefixInput ? String(mqttPrefixInput.value || '').trim() : '',
        apps: collectNotifyAppSelection(mqttAppsEl),
        events: {
          status_change: !!(mqttEventStatusInput && mqttEventStatusInput.checked),
          hashrate_drop: !!(mqttEventHashrateInput && mqttEventHashrateInput.checked),
          worker_offline: !!(mqttEventWorkersInput && mqttEventWorkersInput.checked),
          block_found: !!(mqttEventBlockInput && mqttEventBlockInput.checked),
        },
      };
      const res = await apiJsonTimeout('/api/v0/system/mqtt/config', { method: 'POST', body: JSON.stringify(body) }, 8000);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'save failed');
      saveNotifyCache('mqtt', body);
      showToast('MQTT settings saved', null);
      await refreshMqttConfig();
      if (mqttStatusEl) mqttStatusEl.textContent = 'Saved.';
    } catch (e) {
      if (mqttStatusEl) mqttStatusEl.textContent = 'Save failed.';
      showToast('MQTT save failed', 'error');
    } finally {
      btnMqttSave.disabled = false;
    }
  }

  async function refreshDiscordConfig() {
    if (!discordCardEl) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/discord/config', {}, 5000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'load failed');
      const cfg = res.config || {};
      saveNotifyCache('discord', cfg);
      if (discordEnabledInput) discordEnabledInput.checked = !!cfg.enabled;
      if (discordWebhookInput) discordWebhookInput.value = String(cfg.webhook || '');
      if (discordHashrateInput) discordHashrateInput.value = String(cfg.hashrate_drop_pct || 50);
      const apps = Array.isArray(res.apps) ? res.apps : [];
      discordAppsCache = apps;
      const selected = new Set(
        Array.isArray(cfg.apps) && cfg.apps.length ? cfg.apps.map((id) => String(id)) : apps.map((a) => String(a.id)),
      );
      renderNotifyAppList(discordAppsEl, apps, selected, 'No AxeSuite apps installed.');
      const events = cfg.events || {};
      if (discordEventStatusInput) discordEventStatusInput.checked = !!events.status_change;
      if (discordEventHashrateInput) discordEventHashrateInput.checked = !!events.hashrate_drop;
      if (discordEventWorkersInput) discordEventWorkersInput.checked = !!events.worker_offline;
      if (discordEventBlockInput) discordEventBlockInput.checked = !!events.block_found;
      if (discordEventUpdateSuccessInput) discordEventUpdateSuccessInput.checked = !!events.update_success;
      if (discordEventUpdateFailureInput) discordEventUpdateFailureInput.checked = !!events.update_failure;
      if (discordEventRestartInput) discordEventRestartInput.checked = !!events.restart;
      if (discordStatusEl) discordStatusEl.textContent = 'Loaded.';
    } catch (e) {
      const cached = loadNotifyCache('discord');
      if (cached) {
        if (discordEnabledInput) discordEnabledInput.checked = !!cached.enabled;
        if (discordWebhookInput) discordWebhookInput.value = String(cached.webhook || '');
        if (discordHashrateInput) discordHashrateInput.value = String(cached.hashrate_drop_pct || 50);
        const events = cached.events || {};
        if (discordEventStatusInput) discordEventStatusInput.checked = !!events.status_change;
        if (discordEventHashrateInput) discordEventHashrateInput.checked = !!events.hashrate_drop;
        if (discordEventWorkersInput) discordEventWorkersInput.checked = !!events.worker_offline;
        if (discordEventBlockInput) discordEventBlockInput.checked = !!events.block_found;
        if (discordEventUpdateSuccessInput) discordEventUpdateSuccessInput.checked = !!events.update_success;
        if (discordEventUpdateFailureInput) discordEventUpdateFailureInput.checked = !!events.update_failure;
        if (discordEventRestartInput) discordEventRestartInput.checked = !!events.restart;
        if (Array.isArray(discordAppsCache) && discordAppsCache.length) {
          const selected = new Set(
            Array.isArray(cached.apps) && cached.apps.length
              ? cached.apps.map((id) => String(id))
              : discordAppsCache.map((a) => String(a.id)),
          );
          renderNotifyAppList(discordAppsEl, discordAppsCache, selected, 'No AxeSuite apps installed.');
        }
        if (discordStatusEl) discordStatusEl.textContent = 'Cached.';
        return;
      }
      if (discordStatusEl) discordStatusEl.textContent = 'Load failed.';
    }
  }

  async function saveDiscordConfig() {
    if (!btnDiscordSave) return;
    btnDiscordSave.disabled = true;
    if (discordStatusEl) discordStatusEl.textContent = 'Saving...';
    try {
      const body = {
        enabled: !!(discordEnabledInput && discordEnabledInput.checked),
        webhook: discordWebhookInput ? String(discordWebhookInput.value || '').trim() : '',
        hashrate_drop_pct: discordHashrateInput ? Number(discordHashrateInput.value || 50) : 50,
        apps: collectNotifyAppSelection(discordAppsEl),
        events: {
          status_change: !!(discordEventStatusInput && discordEventStatusInput.checked),
          hashrate_drop: !!(discordEventHashrateInput && discordEventHashrateInput.checked),
          worker_offline: !!(discordEventWorkersInput && discordEventWorkersInput.checked),
          block_found: !!(discordEventBlockInput && discordEventBlockInput.checked),
          update_success: !!(discordEventUpdateSuccessInput && discordEventUpdateSuccessInput.checked),
          update_failure: !!(discordEventUpdateFailureInput && discordEventUpdateFailureInput.checked),
          restart: !!(discordEventRestartInput && discordEventRestartInput.checked),
        },
      };
      const res = await apiJsonTimeout('/api/v0/system/discord/config', { method: 'POST', body: JSON.stringify(body) }, 8000);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'save failed');
      saveNotifyCache('discord', body);
      showToast('Discord settings saved', null);
      await refreshDiscordConfig();
      if (discordStatusEl) discordStatusEl.textContent = 'Saved.';
    } catch (e) {
      if (discordStatusEl) discordStatusEl.textContent = 'Save failed.';
      showToast('Discord save failed', 'error');
    } finally {
      btnDiscordSave.disabled = false;
    }
  }

  async function refreshWatchdogConfig() {
    if (!watchdogCardEl) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/watchdog/config', {}, 5000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'load failed');
      const cfg = res.config || {};
      if (watchdogEnabledInput) watchdogEnabledInput.checked = !!cfg.enabled;
      const apps = Array.isArray(res.apps) ? res.apps : [];
      watchdogAppsCache = apps;
      const selected = new Set(Array.isArray(cfg.apps) ? cfg.apps.map((id) => String(id)) : []);
      renderNotifyAppList(watchdogAppsEl, apps, selected, 'No apps installed yet.');
      if (watchdogStatusEl) watchdogStatusEl.textContent = 'Loaded.';
    } catch {
      if (watchdogStatusEl) watchdogStatusEl.textContent = 'Load failed.';
    }
  }

  async function saveWatchdogConfig() {
    if (!btnWatchdogSave) return;
    btnWatchdogSave.disabled = true;
    if (watchdogStatusEl) watchdogStatusEl.textContent = 'Saving...';
    try {
      const body = {
        enabled: !!(watchdogEnabledInput && watchdogEnabledInput.checked),
        apps: collectNotifyAppSelection(watchdogAppsEl),
      };
      const res = await apiJsonTimeout('/api/v0/system/watchdog/config', { method: 'POST', body: JSON.stringify(body) }, 8000);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'save failed');
      showToast('Watchdog saved', null);
      await refreshWatchdogConfig();
      if (watchdogStatusEl) watchdogStatusEl.textContent = 'Saved.';
    } catch {
      if (watchdogStatusEl) watchdogStatusEl.textContent = 'Save failed.';
      showToast('Watchdog save failed', 'error');
    } finally {
      btnWatchdogSave.disabled = false;
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
      if (raw === 'static' || raw === 'collapsed' || raw === 'auto' || raw === 'manual') return raw;
    } catch {}
    return 'static';
  }

  function loadSidebarManualOpen() {
    try {
      const raw = String(window.localStorage.getItem(SIDEBAR_MANUAL_OPEN_KEY) || '').trim().toLowerCase();
      return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'y' || raw === 'on';
    } catch {
      return false;
    }
  }

  function saveSidebarManualOpen(open) {
    try {
      window.localStorage.setItem(SIDEBAR_MANUAL_OPEN_KEY, open ? '1' : '0');
    } catch {}
  }

  function isMobileLayout() {
    try {
      return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
    } catch {
      return (window.innerWidth || 0) <= 900;
    }
  }

  function normalizeWorkbenchTopbarMode(value) {
    const v = String(value || '').trim().toLowerCase();
    if (v === 'expanded' || v === 'compact' || v === 'auto') return v;
    return 'compact';
  }

  function normalizeTopbarMode(value) {
    const v = String(value || '').trim().toLowerCase();
    if (v === 'static' || v === 'collapsed' || v === 'auto' || v === 'manual') return v;
    return 'static';
  }

  function getTopbarMode() {
    const cfg = uiConfigCache && typeof uiConfigCache === 'object' ? uiConfigCache : {};
    if (Object.prototype.hasOwnProperty.call(cfg, 'topbar_mode')) return normalizeTopbarMode(cfg.topbar_mode);
    if (Object.prototype.hasOwnProperty.call(cfg, 'topbar_pinned')) return cfg.topbar_pinned ? 'static' : 'auto';
    // Legacy workbench-only mode implies pinned.
    if (Object.prototype.hasOwnProperty.call(cfg, 'workbench_topbar_mode')) {
      return normalizeWorkbenchTopbarMode(cfg.workbench_topbar_mode) === 'expanded' ? 'static' : 'auto';
    }
    return 'static';
  }

  function applyTopbarMode() {
    const mode = getTopbarMode();
    const pinned = mode === 'static';
    const auto = mode === 'auto';
    const manual = mode === 'manual';
    const collapsedLike = mode !== 'static';

    let open = false;
    if (pinned) open = true;
    else if (manual) open = !!topbarTempOpen;
    else if (auto) open = !!topbarTempOpen || (!isMobileLayout() && topbarHoverOpen);
    else open = false;

    document.body.classList.toggle('forgeos-topbar-pinned', pinned);
    document.body.classList.toggle('forgeos-topbar-compact', collapsedLike);
    document.body.classList.toggle('forgeos-topbar-auto', auto);
    document.body.classList.toggle('forgeos-topbar-open', open);

    if (pinned || mode === 'collapsed') {
      topbarTempOpen = false;
      topbarHoverOpen = false;
    }

    if (btnTopbarToggle) {
      const pressed = pinned || (manual && open);
      btnTopbarToggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      if (manual) {
        btnTopbarToggle.setAttribute('aria-label', open ? 'Collapse top bar' : 'Expand top bar');
        btnTopbarToggle.title = open ? 'Collapse top bar' : 'Expand top bar';
      } else {
        btnTopbarToggle.setAttribute('aria-label', pinned ? 'Unpin top bar' : 'Pin top bar');
        btnTopbarToggle.title = pinned ? 'Unpin top bar (auto-hide)' : 'Pin top bar';
      }
    }
  }

  let mobileSidebarPrevMode = '';

  function setMobileSidebarOpen(open) {
    const next = !!open;
    if (next) {
      mobileSidebarPrevMode = loadSidebarMode();
      applySidebarMode('static');
    }
    document.body.classList.toggle('forgeos-mobile-sidebar-open', next);
    if (!next && mobileSidebarPrevMode) {
      applySidebarMode(mobileSidebarPrevMode);
      mobileSidebarPrevMode = '';
    }
  }

  function toggleMobileSidebar() {
    const isOpen = document.body.classList.contains('forgeos-mobile-sidebar-open');
    setMobileSidebarOpen(!isOpen);
  }

  function applySidebarMode(mode) {
    const m = String(mode || 'static').toLowerCase();
    document.body.classList.toggle('forgeos-sidebar-manual', m === 'manual');
    document.body.classList.toggle('forgeos-sidebar-auto', m === 'auto');
    const collapsed = m === 'collapsed' || (m === 'manual' && !sidebarManualOpen);
    document.body.classList.toggle('forgeos-sidebar-collapsed', collapsed);
    document.body.classList.toggle('forgeos-sidebar-manual-open', m === 'manual' && !!sidebarManualOpen);
    if (settingSidebarSelect) settingSidebarSelect.value = m;

    if (btnSidebarPin) {
      const pinned = m === 'static';
      btnSidebarPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
      btnSidebarPin.setAttribute('aria-label', pinned ? 'Unpin sidebar' : 'Pin sidebar');
      btnSidebarPin.title = pinned ? 'Unpin sidebar (auto-hide)' : 'Pin sidebar';
    }
  }

  function setSidebarMode(mode) {
    const next = String(mode || '').trim().toLowerCase();
    if (!['static', 'collapsed', 'auto', 'manual'].includes(next)) return;
    sidebarManualOpen = false;
    saveSidebarManualOpen(false);
    try {
      window.localStorage.setItem(SIDEBAR_MODE_KEY, next);
    } catch {}
    applySidebarMode(next);
  }

  function loadDashboardMode() {
    try {
      const raw = String(window.localStorage.getItem(DASHBOARD_MODE_KEY) || '').trim().toLowerCase();
      if (raw === 'apps' || raw === 'fleet' || raw === 'appslist') return raw;
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
    if (next !== 'apps' && next !== 'fleet' && next !== 'appslist') return;
    if (dashboardMode === next) return;
    dashboardMode = next;
    saveDashboardMode();
    syncDashboardModeUi();
    if (activeViewKey === 'dashboard') {
      renderWorkspace();
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

  function newPageId() {
    return `page-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function normalizePagesState(state, installedApps) {
    const installedIds = new Set(
      (Array.isArray(installedApps) ? installedApps : [])
        .map((a) => (a && typeof a === 'object' ? String(a.id || '').trim().toLowerCase() : ''))
        .filter((v) => v),
    );

    const base = state && typeof state === 'object' ? state : {};
    const pagesRaw = Array.isArray(base.pages) ? base.pages : [];
    const pages = [];
    const seen = new Set();
    for (const p of pagesRaw) {
      if (!p || typeof p !== 'object') continue;
      const id = String(p.id || '').trim().toLowerCase();
      if (!id) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      const name = String(p.name || '').trim().slice(0, 32) || 'Page';
      const itemsRaw = Array.isArray(p.items) ? p.items : [];
      const items = [];
      const itemSeen = new Set();
      for (const v of itemsRaw) {
        const appId = String(v || '').trim().toLowerCase();
        if (!appId) continue;
        if (!installedIds.has(appId)) continue;
        if (itemSeen.has(appId)) continue;
        itemSeen.add(appId);
        items.push(appId);
      }
      pages.push({ id, name, items });
    }

    if (!pages.length) {
      const all = Array.from(installedIds);
      all.sort((a, b) => {
        const ma = metaFor(a);
        const mb = metaFor(b);
        return String(ma.name || a).localeCompare(String(mb.name || b), undefined, { sensitivity: 'base' });
      });
      const id = 'page-1';
      pages.push({ id, name: 'Apps', items: all });
    }

    // Ensure newly installed apps show up somewhere by default (append to first page).
    const allSeen = new Set();
    for (const p of pages) {
      for (const id of Array.isArray(p.items) ? p.items : []) allSeen.add(id);
    }
    const missing = [];
    for (const id of installedIds) {
      if (!allSeen.has(id)) missing.push(id);
    }
    if (missing.length) {
      missing.sort((a, b) => {
        const ma = metaFor(a);
        const mb = metaFor(b);
        return String(ma.name || a).localeCompare(String(mb.name || b), undefined, { sensitivity: 'base' });
      });
      pages[0].items = (Array.isArray(pages[0].items) ? pages[0].items : []).concat(missing);
    }

    const active = String(base.active || '').trim().toLowerCase();
    const activeResolved = active && pages.some((p) => p.id === active) ? active : pages[0].id;
    return { version: 1, active: activeResolved, pages };
  }

  async function refreshAppsPagesState(installedApps) {
    if (!appsPagesLoaded) {
      try {
        const res = await apiJsonTimeout('/api/v0/apps/pages', {}, 2500).catch(() => null);
        if (res && res.ok === true && res.state && typeof res.state === 'object') {
          appsPagesState = res.state;
        }
      } catch {}
      appsPagesLoaded = true;
    }
    appsPagesState = normalizePagesState(appsPagesState, installedApps);
    activeAppsPageId = String(appsPagesState.active || '').trim().toLowerCase();
  }

  function scheduleAppsPagesSave() {
    if (appsPagesSaveTimer) window.clearTimeout(appsPagesSaveTimer);
    appsPagesSaveTimer = window.setTimeout(() => {
      appsPagesSaveTimer = 0;
      saveAppsPagesState().catch(() => {});
    }, 700);
  }

  async function saveAppsPagesState() {
    if (!appsPagesState || typeof appsPagesState !== 'object') return;
    const res = await apiJsonTimeout('/api/v0/apps/pages', { method: 'POST', body: JSON.stringify({ state: appsPagesState }) }, 5000).catch(() => null);
    if (!res || res.ok !== true) throw new Error(res && res.error ? String(res.error) : 'save failed');
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
    if (desktopSurfaceEl) renderDesktop();
    updatePerfWarnings(installed);
    renderTopbarActivity();

    if (fromCache && !healthCache.ok) setStatus('Cached');
  }

  function slugifyCustomStoreKey(raw) {
    return String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/https?:\/\//g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }

  function deriveCustomStoreSlot(url, label, existingSlots) {
    const existing = new Set((Array.isArray(existingSlots) ? existingSlots : []).map((v) => String(v || '').trim().toLowerCase()));
    const baseLabel = String(label || '').trim() || storeLabelFromUrl(url) || '';
    const derived = slugifyCustomStoreKey(baseLabel) || slugifyCustomStoreKey(url) || 'store';
    let base = `custom-${derived}`.replace(/^custom-+/, 'custom-');
    if (base.length > 54) base = base.slice(0, 54);
    let slot = base;
    let n = 2;
    while (existing.has(slot)) {
      const suffix = `-${n++}`;
      slot = `${base.slice(0, Math.max(0, 54 - suffix.length))}${suffix}`;
    }
    return slot;
  }

  function allowedStoreChannels() {
    const custom = Array.isArray(storeCustomStores)
      ? storeCustomStores.map((entry) => String(entry.slot || '').trim().toLowerCase()).filter(Boolean)
      : [];
    return ['main', 'dev', 'global', ...custom];
  }

  function loadStoreChannel() {
    try {
      const raw = String(window.localStorage.getItem(STORE_CHANNEL_KEY) || '').trim().toLowerCase();
      if (!raw) return 'main';
      if (raw === 'main' || raw === 'dev' || raw === 'global') return raw;
      if (raw.startsWith('custom')) return raw;
    } catch {}
    return 'main';
  }

  function findCustomStore(slot) {
    const key = String(slot || '').trim().toLowerCase();
    if (!key) return null;
    return (Array.isArray(storeCustomStores) ? storeCustomStores : []).find(
      (entry) => String(entry.slot || '').trim().toLowerCase() === key,
    ) || null;
  }

  function storeChannelLabel(ch) {
    const key = String(ch || '').trim().toLowerCase();
    if (!key) return 'App Store';
    if (key === 'global') return 'Global App Store';
    if (key === 'dev') return 'AxeSuite DEV';
    if (key === 'main') return 'AxeSuite MAIN';
    const custom = findCustomStore(key);
    if (custom && custom.label) return String(custom.label);
    if (custom && custom.url) {
      const derived = storeLabelFromUrl(custom.url);
      if (derived) return derived;
    }
    if (key.startsWith('custom')) return 'Custom store';
    return 'App Store';
  }

  function storeLabelFromUrl(rawUrl) {
    const urlText = String(rawUrl || '').trim();
    if (!urlText) return '';
    try {
      const url = new URL(urlText.startsWith('http') ? urlText : `https://${urlText}`);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        let repo = parts[1];
        if (repo.endsWith('.git')) repo = repo.slice(0, -4);
        repo = repo.replace(/[-_]+/g, ' ').trim();
        return repo ? repo.replace(/\b\w/g, (m) => m.toUpperCase()) : '';
      }
    } catch {}
    return '';
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
      storeSourceLabel.textContent = storeChannelLabel(ch);
    }

    if (storeSourceDesc) {
      if (ch === 'global') {
        storeSourceDesc.textContent = 'Browse community app templates and install them into 5tratumOS.';
      } else if (ch === 'dev') {
        storeSourceDesc.textContent = 'Preview channel for AxeSuite apps (use with caution).';
      } else if (ch === 'main') {
        storeSourceDesc.textContent = 'Stable releases for AxeSuite apps.';
      } else if (ch.startsWith('custom')) {
        const custom = findCustomStore(ch);
        const source = custom && custom.url ? `Source: ${custom.url}` : 'Custom community store.';
        storeSourceDesc.textContent = source;
      } else {
        storeSourceDesc.textContent = 'Install and manage apps.';
      }
    }

    if (storeSearchInput) {
      storeSearchInput.placeholder = ch === 'global' ? 'Search global apps...' : 'Search apps...';
    }
  }

  function bindStoreChannelButtons() {
    if (!storeChannelButtons || !storeChannelButtons.length) return;
    storeChannelButtons.forEach((btn) => {
      if (!(btn instanceof HTMLElement)) return;
      if (btn.dataset.storeChannelBound === '1') return;
      btn.dataset.storeChannelBound = '1';
      btn.addEventListener('click', () => setStoreChannel(btn.dataset.storeChannel || 'main'));
    });
  }

  async function getStoreAppsByChannel(channel) {
    const ch = String(channel || '').trim().toLowerCase() || 'main';
    const cached = storeAppsByChannelCache.get(ch) || null;
    const now = Date.now();
    if (cached && cached.time && now - cached.time < 60000 && cached.byId instanceof Map) return cached;
    const res = await apiJsonTimeout(`/api/v0/store/apps?channel=${encodeURIComponent(ch)}`, {}, 20000).catch(() => null);
    if (!res || res.ok !== true) throw new Error((res && res.error) || 'store load failed');
    const apps = Array.isArray(res.apps) ? res.apps : [];
    const byId = new Map(
      apps
        .filter((a) => a && typeof a === 'object')
        .map((a) => [String(a.id || '').trim().toLowerCase(), a])
        .filter((pair) => pair[0]),
    );
    const next = { time: now, apps, byId };
    storeAppsByChannelCache.set(ch, next);
    return next;
  }

  function renderStoreCustomButtons() {
    if (!storeChannelCustomsEl) return;
    storeChannelCustomsEl.innerHTML = '';
    const entries = Array.isArray(storeCustomStores) ? storeCustomStores : [];
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;
      const slot = String(entry.slot || '').trim().toLowerCase();
      if (!slot) continue;
      const label = entry.label ? String(entry.label) : storeChannelLabel(slot);
      const btn = document.createElement('button');
      btn.className = 'forgeos-segment__btn';
      btn.type = 'button';
      btn.dataset.storeChannel = slot;
      btn.textContent = label;
      btn.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(
          [
            { label: 'Edit store', onClick: async () => openCustomStoreModal(slot) },
            {
              label: 'Remove store',
              danger: true,
              onClick: async () => {
                const ok = await openConfirmModal({
                  title: 'Remove custom store?',
                  message: `Remove ${storeChannelLabel(slot)}?`,
                  confirmText: 'Remove',
                  cancelText: 'Cancel',
                  danger: true,
                });
                if (!ok) return;
                try {
                  const res = await apiJsonTimeout(
                    '/api/v0/store/config',
                    { method: 'POST', body: JSON.stringify({ slot, url: '', label: '' }) },
                    8000,
                  );
                  if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'remove failed');
                  await refreshStoreCustomConfig();
                  if (String(activeStoreChannel || '').toLowerCase() === slot) setStoreChannel('main');
                  showToast('Store removed', null);
                } catch (err) {
                  showToast('Remove failed', 'error');
                  await openNoticeModal({
                    kind: 'Error',
                    title: 'Remove failed',
                    message: err && err.message ? String(err.message) : String(err),
                    danger: true,
                  });
                }
              },
            },
          ],
          e.clientX,
          e.clientY,
        );
      });
      storeChannelCustomsEl.appendChild(btn);
    }
    storeChannelButtons = Array.from(document.querySelectorAll('[data-store-channel]'));
    bindStoreChannelButtons();
    applyStoreChannelUi();
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
    if (!ch || !allowedStoreChannels().includes(ch)) return;
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
    if (id.toLowerCase() === 'axedoom') return '/assets/doom.webp';
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
      name: 'Doom',
      desc: 'Play Doom in your browser (Freedoom). Optional install.',
      tag: 'Fun',
      logo: '/assets/doom.webp',
      screenshots: [makeShot('Doom', 'Freedoom + Chocolate Doom (noVNC)')],
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
      let name = sanitizeStoreText(String(store.name || id));
      const tagline = sanitizeStoreText(String(store.tagline || '')).trim();
      const description = sanitizeStoreText(String(store.description || '')).trim();
      const category = sanitizeStoreText(String(store.category || '')).trim();
      let logo = String(store.icon || '').trim() || fallbackLogoFor(id, name);
      if (id === 'axedoom') name = 'Doom';
      if (id === 'axedoom') logo = '/assets/doom.webp';
      const repo = String(store.repo || '').trim();
      const gallery = normalizeGallery(store.gallery);
      const depsRaw = Array.isArray(store.dependencies)
        ? store.dependencies
        : typeof store.dependencies === 'string'
          ? store.dependencies.split(/[,\s]+/g)
          : [];
      const deps = Array.from(
        new Set(
          depsRaw
            .map((v) => String(v || '').trim().toLowerCase())
            .filter((v) => v && v !== String(id || '').trim().toLowerCase()),
        ),
      );
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
        dependencies: deps,
        installable: !!store.installable,
      };
    }

    const fallback = APP_CATALOG[id] || null;
    const channel = String(activeStoreChannel || 'main');
    if (fallback) return { ...fallback, channel, installable: true };
    return { id, name: id, desc: '', tag: 'App', logo: null, screenshots: [], channel, dependencies: [], installable: true };
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
      if (metricNetHost) metricNetHost.textContent = h || '-';
      if (metricNetIp) metricNetIp.textContent = h || '-';
    } catch {
      if (hostIp) hostIp.textContent = '-';
      if (metricNetHost) metricNetHost.textContent = '-';
      if (metricNetIp) metricNetIp.textContent = '-';
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
      refreshUiConfig().catch(() => {});
      refreshWifiStatus().catch(() => {});
      refreshMqttConfig().catch(() => {});
      refreshDiscordConfig().catch(() => {});
      refreshWatchdogConfig().catch(() => {});
      renderWidgetSettings();
    }

    if (activeViewKey === 'dashboard') renderWorkspace();
    applyTopbarMode();
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

  function appLaunchUrl(id) {
    const appId = String(id || '').trim().toLowerCase();
    const host = window.location.hostname || '';
    if (appId === 'tailscale' && host) {
      return `${window.location.protocol}//${host}:8240/`;
    }
    return `${window.location.origin}/apps/${encodeURIComponent(id)}/`;
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

  function openChoiceModal(options) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return Promise.resolve(null);
    const opts = options && typeof options === 'object' ? options : {};
    const title = String(opts.title || 'Choose').trim() || 'Choose';
    const message = String(opts.message || '').trim();
    const kind = String(opts.kind || 'Confirm').trim() || 'Confirm';
    const choices = Array.isArray(opts.choices) ? opts.choices : [];

    return new Promise((resolve) => {
      let settled = false;
      modalOnClose = () => {
        if (settled) return;
        settled = true;
        resolve(null);
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
      actions.className = 'flex items-center justify-end gap-2 flex-wrap';

      for (const choice of choices) {
        if (!choice || typeof choice !== 'object') continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `axe-btn${choice.danger ? ' forgeos-btn--danger' : ''}`;
        btn.textContent = String(choice.label || 'OK').trim() || 'OK';
        btn.addEventListener('click', () => {
          settled = true;
          resolve(choice.value ?? null);
          closeModal();
        });
        actions.appendChild(btn);
      }

      wrap.appendChild(actions);
      modalBodyEl.appendChild(wrap);

      modalEl.classList.remove('hidden');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const first = actions.querySelector('button');
      if (first) window.setTimeout(() => first.focus(), 20);
    });
  }

  function renderWifiNetworks(networks) {
    if (!wifiNetworksEl) return;
    const list = Array.isArray(networks) ? networks : [];
    wifiNetworksEl.innerHTML = '';
    if (!list.length) return;

    const makeRow = (net) => {
      const ssid = String(net && net.ssid ? net.ssid : '').trim();
      const inUse = !!(net && net.in_use);
      const sec = String(net && net.security ? net.security : '').trim();
      const sig = typeof (net && net.signal) === 'number' ? net.signal : Number(net && net.signal) || 0;

      const row = document.createElement('div');
      row.className = 'forgeos-mini-card flex items-center justify-between gap-3';

      const left = document.createElement('div');
      left.className = 'min-w-0';

      const title = document.createElement('div');
      title.className = 'font-semibold truncate';
      title.textContent = ssid || '(hidden network)';

      const sub = document.createElement('div');
      sub.className = 'forgeos-muted text-sm';
      sub.textContent = `${inUse ? 'Connected • ' : ''}${sec ? sec : 'Open'} • ${Math.max(0, Math.min(100, sig))}%`;

      left.appendChild(title);
      left.appendChild(sub);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'axe-btn';
      btn.textContent = inUse ? 'Connected' : 'Connect';
      btn.disabled = inUse;
      btn.addEventListener('click', async () => {
        if (!ssid) {
          await openNoticeModal({
            kind: 'Info',
            title: 'Hidden network',
            message: 'Hidden SSIDs are not supported yet. Add SSID + password support next if needed.',
          });
          return;
        }
        await openWifiConnectModal(ssid, sec);
      });

      row.appendChild(left);
      row.appendChild(btn);
      return row;
    };

    for (const net of list.slice(0, 25)) wifiNetworksEl.appendChild(makeRow(net));
  }

  async function openWifiConnectModal(ssid, security) {
    const netSsid = String(ssid || '').trim();
    if (!netSsid) return;
    const sec = String(security || '').trim();

    modalKindEl.textContent = 'Network';
    modalTitleEl.textContent = `Join Wi‑Fi`;
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'grid gap-3';

    const ssidRow = document.createElement('div');
    ssidRow.className = 'forgeos-mini-card';
    {
      const k = document.createElement('div');
      k.className = 'forgeos-mini-card__k';
      k.textContent = 'SSID';
      const v = document.createElement('div');
      v.className = 'forgeos-mini-card__v';
      const ss = document.createElement('span');
      ss.className = 'forgeos-mono';
      ss.textContent = netSsid;
      v.appendChild(ss);
      ssidRow.appendChild(k);
      ssidRow.appendChild(v);
    }
    wrap.appendChild(ssidRow);

    const passWrap = document.createElement('div');
    const passLbl = document.createElement('label');
    passLbl.className = 'forgeos-label';
    passLbl.textContent = 'Password';
    const passInput = document.createElement('input');
    passInput.className = 'forgeos-input';
    passInput.type = 'password';
    passInput.placeholder = sec ? 'Wi‑Fi password' : 'Optional';
    passWrap.appendChild(passLbl);
    passWrap.appendChild(passInput);
    wrap.appendChild(passWrap);

    const actions = document.createElement('div');
    actions.className = 'flex items-center justify-end gap-2 mt-2';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'axe-btn';
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => closeModal());

    const btnJoin = document.createElement('button');
    btnJoin.type = 'button';
    btnJoin.className = 'axe-btn';
    btnJoin.textContent = 'Join';
    btnJoin.addEventListener('click', async () => {
      btnJoin.disabled = true;
      const prev = btnJoin.textContent;
      btnJoin.textContent = 'Joining...';
      try {
        const body = { ssid: netSsid, password: String(passInput.value || '') };
        const res = await apiJsonTimeout('/api/v0/system/wifi/connect', { method: 'POST', body: JSON.stringify(body) }, 60000).catch(() => null);
        if (!res || res.ok !== true) throw new Error((res && res.error) || 'connect failed');
        closeModal();
        showToast('Wi‑Fi connected', null);
        await refreshWifiStatus();
      } catch (e) {
        await openNoticeModal({ kind: 'Error', title: 'Wi‑Fi connect failed', message: e && e.message ? String(e.message) : String(e), danger: true });
      } finally {
        btnJoin.disabled = false;
        btnJoin.textContent = prev;
      }
    });

    actions.appendChild(btnCancel);
    actions.appendChild(btnJoin);
    wrap.appendChild(actions);

    modalBodyEl.appendChild(wrap);
    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => passInput.focus(), 50);
  }

  async function refreshWifiStatus() {
    if (!wifiStatusEl && !wifiDetailEl && !btnWifiToggle) return;
    const res = await apiJsonTimeout('/api/v0/system/wifi/status', {}, 8000).catch(() => null);
    if (!res || res.ok !== true) {
      wifiStateCache = { enabled: false, connected: false, ssid: '' };
      if (wifiStatusEl) wifiStatusEl.textContent = 'Unavailable';
      if (wifiDetailEl) wifiDetailEl.textContent = res && res.error ? String(res.error) : '-';
      if (btnWifiToggle) btnWifiToggle.disabled = true;
      if (btnWifiScan) btnWifiScan.disabled = true;
      if (btnWifiDisconnect) btnWifiDisconnect.disabled = true;
      return;
    }
    const enabled = !!res.enabled;
    const connected = !!res.connected;
    const ssid = String(res.ssid || '').trim();
    wifiStateCache = { enabled, connected, ssid };
    if (wifiStatusEl) wifiStatusEl.textContent = !enabled ? 'Disabled' : connected ? 'Connected' : 'Enabled';
    if (wifiDetailEl) wifiDetailEl.textContent = !enabled ? 'Wi‑Fi radio is off.' : connected ? (ssid ? `SSID: ${ssid}` : 'Connected') : 'Not connected.';
    if (btnWifiToggle) {
      btnWifiToggle.disabled = false;
      btnWifiToggle.textContent = enabled ? 'Disable Wi‑Fi' : 'Enable Wi‑Fi';
    }
    if (btnWifiScan) btnWifiScan.disabled = !enabled;
    if (btnWifiDisconnect) btnWifiDisconnect.disabled = !connected;
  }

  async function scanWifiNetworks() {
    if (!btnWifiScan) return;
    btnWifiScan.disabled = true;
    const prev = btnWifiScan.textContent;
    btnWifiScan.textContent = 'Scanning...';
    try {
      const res = await apiJsonTimeout('/api/v0/system/wifi/scan', {}, 20000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'scan failed');
      renderWifiNetworks(res.networks);
    } catch (e) {
      await openNoticeModal({ kind: 'Error', title: 'Wi‑Fi scan failed', message: e && e.message ? String(e.message) : String(e), danger: true });
    } finally {
      btnWifiScan.disabled = false;
      btnWifiScan.textContent = prev;
    }
  }

  function openUpdateAvailableModal(tag, notes) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return Promise.resolve(null);
    const version = String(tag || '').trim();
    const bodyText = String(notes || '').trim();

    return new Promise((resolve) => {
      let settled = false;
      modalOnClose = () => {
        if (settled) return;
        settled = true;
        resolve(null);
      };

      if (modalKindEl) modalKindEl.textContent = 'Update';
      modalTitleEl.textContent = version ? `Update available: ${version}` : 'Update available';
      modalBodyEl.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'flex flex-col gap-4';

      const img = document.createElement('img');
      img.src = APP_LAUNCH_SPLASH_SRC;
      img.alt = 'Update available';
      img.style.width = '220px';
      img.style.height = 'auto';
      img.style.margin = '0 auto';
      img.style.display = 'block';
      img.style.borderRadius = '16px';
      img.style.border = '1px solid rgba(255,255,255,0.08)';
      wrap.appendChild(img);

      const p = document.createElement('div');
      p.className = 'text-sm text-slate-200 whitespace-pre-wrap';
      p.textContent = `An OS update is ready to install.\n\nChoose Install to apply now.`;
      wrap.appendChild(p);

      if (bodyText) {
        const notesEl = document.createElement('div');
        notesEl.className = 'text-xs text-slate-300 whitespace-pre-wrap';
        notesEl.textContent = bodyText;
        wrap.appendChild(notesEl);
      }

      const actions = document.createElement('div');
      actions.className = 'flex items-center justify-end gap-2 flex-wrap';

      const btnInstall = document.createElement('button');
      btnInstall.type = 'button';
      btnInstall.className = 'axe-btn forgeos-btn--danger';
      btnInstall.textContent = 'Install update';
      btnInstall.addEventListener('click', () => {
        settled = true;
        resolve('install');
        closeModal();
      });

      actions.appendChild(btnInstall);
      wrap.appendChild(actions);

      modalBodyEl.appendChild(wrap);

      modalEl.classList.remove('hidden');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => btnInstall.focus(), 20);
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
    iframe.src = appLaunchUrl(id);
    const launchOverlay = document.createElement('div');
    launchOverlay.className = 'forgeos-app-launch';
    launchOverlay.setAttribute('aria-hidden', 'false');
    const launchImg = document.createElement('img');
    launchImg.className = 'forgeos-app-launch__img';
    launchImg.alt = 'Starting app';
    launchImg.src = APP_LAUNCH_SPLASH_SRC;
    launchOverlay.appendChild(launchImg);
    content.appendChild(launchOverlay);
    content.appendChild(iframe);

    let launchHidden = false;
    const hideLaunch = () => {
      if (launchHidden) return;
      launchHidden = true;
      launchOverlay.classList.add('forgeos-app-launch--hidden');
      launchOverlay.setAttribute('aria-hidden', 'true');
    };
    iframe.addEventListener('load', hideLaunch, { once: true });
    window.setTimeout(hideLaunch, 12000);

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

  function sleep(ms) {
    const t = Math.max(0, Number(ms) || 0);
    return new Promise((resolve) => window.setTimeout(resolve, t));
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
    if (metricNetBar) metricNetBar.style.width = '0%';
    if (metricNetSub) metricNetSub.textContent = '-';
    if (trustedNetworksEl) trustedNetworksEl.textContent = 'Setup wizard (coming soon)';
    if (tailscaleStatusEl) tailscaleStatusEl.textContent = 'Optional';
    if (wifiStatusEl) wifiStatusEl.textContent = '-';
    if (wifiDetailEl) wifiDetailEl.textContent = '-';
    if (wifiNetworksEl) wifiNetworksEl.innerHTML = '';
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
      { v: 1e18, s: 'E' },
      { v: 1e15, s: 'P' },
      { v: 1e12, s: 'T' },
      { v: 1e9, s: 'G' },
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

  function formatBytesPerSec(bytes) {
    return `${formatBytes(bytes)}/s`;
  }

  function setMaskedGradientBar(el, pctRaw) {
    if (!el) return;
    const pct = Math.max(0, Math.min(100, Number(pctRaw) || 0));
    el.style.width = `${pct}%`;
    if (pct <= 0) {
      el.style.backgroundSize = '100% 100%';
      el.style.backgroundPosition = 'left center';
      return;
    }
    const scale = 10000 / Math.max(0.5, pct);
    el.style.backgroundSize = `${scale.toFixed(1)}% 100%`;
    el.style.backgroundPosition = 'left center';
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
    if (metricCpuBar) setMaskedGradientBar(metricCpuBar, cpuPct);

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
    if (metricMemBar) setMaskedGradientBar(metricMemBar, memPct);
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
      if (metricDiskBar) setMaskedGradientBar(metricDiskBar, diskPct);
      if (metricDiskSub) metricDiskSub.textContent = `${preferred.path}: ${formatBytes(dUsed)} / ${formatBytes(dTotal)}`;
    }

    if (metricNetBar || metricNetSub) {
      const net = metrics.network || {};
      const rx = Number(net.rx_bytes) || 0;
      const tx = Number(net.tx_bytes) || 0;
      const now = Date.now();
      let rateRx = 0;
      let rateTx = 0;
      if (lastNetSample && Number.isFinite(lastNetSample.time)) {
        const dt = Math.max(1, (now - lastNetSample.time) / 1000);
        rateRx = Math.max(0, (rx - lastNetSample.rx) / dt);
        rateTx = Math.max(0, (tx - lastNetSample.tx) / dt);
      }
      lastNetSample = { time: now, rx, tx };
      const totalRate = rateRx + rateTx;
      const maxRate = 50 * 1024 * 1024;
      const pct = maxRate > 0 ? Math.max(0, Math.min(100, (totalRate / maxRate) * 100)) : 0;
      if (metricNetBar) setMaskedGradientBar(metricNetBar, pct);
      if (metricNetSub) metricNetSub.textContent = `Up ${formatBytesPerSec(rateTx)} \u2022 Down ${formatBytesPerSec(rateRx)}`;
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
    if (k === 'migrate') return `Moving ${p}%`;
    if (k === 'sync') return `Syncing ${p}%`;
    return `Working ${p}%`;
  }

  function activityItems() {
    const items = [];

    try {
      const state = systemUpdateState();
      const st = systemUpdateStatusCache && typeof systemUpdateStatusCache === 'object' ? systemUpdateStatusCache : null;
      if (systemUpdateIsBusy(state)) {
        items.push({
          key: 'system-update',
          label: 'Updating 5tratumOS',
          sub: systemUpdateStateLabel(state, st),
          pct: systemUpdateProgressPct(state, st),
          startedAt: st && st.time ? Date.parse(String(st.time)) || 0 : 0,
        });
      }
    } catch {}

    for (const [idRaw, st] of Array.from(appProgress.entries())) {
      const id = String(idRaw || '').trim();
      if (!id || !st || typeof st !== 'object') continue;
      const pct = Number.isFinite(Number(st.pct)) ? Math.max(0, Math.min(100, Math.round(Number(st.pct)))) : null;
      items.push({
        key: `app-progress:${id}`,
        label: `${progressLabel(st.kind, pct ?? 0)} ${metaFor(id).name || id}`,
        sub: '',
        pct,
        startedAt: Number(st.startedAt) || 0,
      });
    }

    for (const [idRaw, v] of Array.from(pendingAppActions.entries())) {
      const id = String(idRaw || '').trim();
      if (!id) continue;
      if (appProgress.has(id)) continue;
      const kind = v && typeof v === 'object' ? String(v.kind || '') : '';
      const verb =
        kind === 'up'
          ? 'Starting'
          : kind === 'down'
            ? 'Stopping'
            : kind === 'restart'
              ? 'Restarting'
              : kind === 'redeploy'
                ? 'Redeploying'
                : 'Working on';
      items.push({
        key: `app-action:${id}`,
        label: `${verb} ${metaFor(id).name || id}`,
        sub: 'Please wait…',
        pct: null,
        startedAt: v && typeof v === 'object' ? Number(v.startedAt) || 0 : 0,
      });
    }

    return items;
  }

  function renderTopbarActivity() {
    if (!topbarActivityEl || !topbarActivityTextEl || !topbarActivityBarEl) return;
    const items = activityItems();
    if (!items.length) {
      topbarActivityEl.classList.add('hidden');
      topbarActivityEl.setAttribute('aria-hidden', 'true');
      topbarActivityEl.classList.remove('forgeos-topbar-activity--indeterminate');
      return;
    }

    const primary = items
      .slice()
      .sort((a, b) => {
        const pa = a.pct === null || a.pct === undefined ? -1 : Number(a.pct);
        const pb = b.pct === null || b.pct === undefined ? -1 : Number(b.pct);
        if (pb !== pa) return pb - pa;
        return (Number(b.startedAt) || 0) - (Number(a.startedAt) || 0);
      })[0];

    const more = items.length > 1 ? ` (+${items.length - 1})` : '';
    const label = `${String(primary && primary.label ? primary.label : 'Working...')}${more}`;
    topbarActivityTextEl.textContent = label;

    const pct = primary && primary.pct !== null && primary.pct !== undefined ? Number(primary.pct) : null;
    const indeterminate = pct === null || !Number.isFinite(pct);
    topbarActivityEl.classList.toggle('forgeos-topbar-activity--indeterminate', indeterminate);
    if (topbarActivityPctEl) topbarActivityPctEl.textContent = indeterminate ? '' : `${Math.max(0, Math.min(100, Math.round(pct)))}%`;

    if (indeterminate) {
      topbarActivityBarEl.style.width = '100%';
    } else {
      setMaskedGradientBar(topbarActivityBarEl, pct);
    }

    const lines = items
      .slice()
      .sort((a, b) => (Number(b.startedAt) || 0) - (Number(a.startedAt) || 0))
      .map((it) => {
        const p = it.pct === null || it.pct === undefined ? '' : ` (${it.pct}%)`;
        const sub = it.sub ? ` — ${it.sub}` : '';
        return `${it.label}${p}${sub}`;
      });
    topbarActivityEl.title = lines.join('\n');

    topbarActivityEl.classList.remove('hidden');
    topbarActivityEl.setAttribute('aria-hidden', 'false');
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
      setMaskedGradientBar(bar, pct);
    }

    for (const btn of Array.from(document.querySelectorAll(`button[data-progress-id=\"${id}\"]`))) {
      if (!(btn instanceof HTMLButtonElement)) continue;
      btn.textContent = progressLabel(st.kind, pct);
    }

    if (globalSplashEl && !globalSplashEl.classList.contains('hidden')) {
      updateGlobalSplashProgress(pct);
    }

    renderTopbarActivity();
  }

  function cancelProgress(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    const st = appProgress.get(id);
    if (st && st.timer) window.clearInterval(st.timer);
    appProgress.delete(id);
    const installedSet = new Set((installedAppsCache || []).map((a) => a.id));
    renderStore(storeAppsCache, installedSet);
    renderTopbarActivity();
  }

  renderTopbarActivity();

  function startProgress(appId, kind) {
    const id = String(appId || '').trim();
    if (!id) return;
    if (appProgress.has(id)) cancelProgress(id);

    const st = { kind: String(kind || '').trim() || 'working', pct: 1, timer: null, startedAt: Date.now() };
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
    renderTopbarActivity();
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
    renderTopbarActivity();
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
      const url = appLaunchUrl(id);
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

    const launchOverlay = document.createElement('div');
    launchOverlay.className = 'forgeos-app-launch forgeos-app-launch--tile';
    launchOverlay.setAttribute('aria-hidden', 'false');
    const launchImg = document.createElement('img');
    launchImg.className = 'forgeos-app-launch__img';
    launchImg.alt = 'Starting app';
    launchImg.src = APP_LAUNCH_SPLASH_SRC;
    launchOverlay.appendChild(launchImg);
    frameWrap.appendChild(launchOverlay);

    const pathUrl = appLaunchUrl(id);
    const iframe = document.createElement('iframe');
    iframe.className = 'forgeos-tile__frame';
    iframe.title = meta.name || id;
    iframe.loading = 'lazy';
    iframe.addEventListener('focus', noteUserActivity);
    iframe.addEventListener('pointerdown', noteUserActivity, { passive: true });
    iframe.src = pathUrl;
    let launchHidden = false;
    const hideLaunch = () => {
      if (launchHidden) return;
      launchHidden = true;
      launchOverlay.classList.add('forgeos-app-launch--hidden');
      launchOverlay.setAttribute('aria-hidden', 'true');
    };
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
      hideLaunch();
    });
    window.setTimeout(hideLaunch, 12000);

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
    applyTopbarMode();

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
    scheduleDesktopRemoteSave();
  }

  function scheduleDesktopRemoteSave() {
    if (desktopRemoteSaveTimer) window.clearTimeout(desktopRemoteSaveTimer);
    desktopRemoteSaveTimer = window.setTimeout(() => {
      desktopRemoteSaveTimer = 0;
      pushDesktopStateRemote().catch(() => {});
    }, 700);
  }

  async function pushDesktopStateRemote() {
    const ok = await ensureHealthy();
    if (!ok) return;
    await apiJsonTimeout('/api/v0/desktop/state', { method: 'POST', body: JSON.stringify({ state: ensureDesktopStateShape(desktopState) }) }, 4000);
  }

  async function refreshDesktopStateRemote() {
    if (desktopRemoteLoaded) return;
    const ok = await ensureHealthy();
    if (!ok) return;
    const res = await apiJsonTimeout('/api/v0/desktop/state', {}, 2500).catch(() => null);
    if (!res || res.ok !== true) return;
    if (!res.state || typeof res.state !== 'object') return;
    const remoteState = ensureDesktopStateShape(res.state);
    const remoteItems = remoteState.items && typeof remoteState.items === 'object' ? remoteState.items : {};
    const localState = ensureDesktopStateShape(desktopState);
    const localItems = localState.items && typeof localState.items === 'object' ? localState.items : {};
    const remoteCount = Object.keys(remoteItems).length;
    const localCount = Object.keys(localItems).length;

    // If the OS has no desktop state yet but this browser does, seed the OS.
    if (remoteCount === 0 && localCount > 0) {
      desktopRemoteLoaded = true;
      await pushDesktopStateRemote();
      return;
    }

    desktopRemoteLoaded = true;
    desktopState = remoteState;
    try {
      window.localStorage.setItem(DESKTOP_STATE_KEY_V2, JSON.stringify(desktopState));
    } catch {}
    renderDesktop();
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

    // When switching views, the desktop surface can temporarily report 0x0 while hidden.
    // In that case, defer rendering until layout stabilizes so clamping/snapping is correct.
    const surfaceRect = desktopSurfaceEl.getBoundingClientRect();
    if (!surfaceRect.width || !surfaceRect.height) {
      window.requestAnimationFrame(() => renderDesktop());
      return;
    }

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
          img.draggable = false;
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
                {
                  label: 'Move data…',
                  hint: 'Move app data to another drive',
                  disabled: pendingAppActions.has(appId),
                  onClick: async () => openMoveAppDataModal(appId),
                },
                { type: 'sep' },
                { label: 'Remove', danger: true, onClick: async () => unpinFromDesktop(appId) },
              ],
              e.clientX,
              e.clientY,
            );
          });
        }

        let dragStart = null;
        node.addEventListener('dragstart', (e) => e.preventDefault());
        node.addEventListener('pointerdown', (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          noteUserActivity();
          const p = desktopSurfacePoint(e);
          const ox = parseFloat(node.style.left) || 0;
          const oy = parseFloat(node.style.top) || 0;
          const isTouch = String(e.pointerType || '') === 'touch';
          let longPressTimer = 0;
          dragStart = {
            startX: p.x,
            startY: p.y,
            anchorX: p.x - ox,
            anchorY: p.y - oy,
            originX: ox,
            originY: oy,
            moved: false,
            armed: !isTouch,
            longPressTimer: 0,
          };
          if (isTouch) {
            longPressTimer = window.setTimeout(() => {
              if (!dragStart) return;
              dragStart.armed = true;
              dragStart.moved = true;
              node.classList.add('forgeos-desktop-icon--dragging');
            }, 220);
            dragStart.longPressTimer = longPressTimer;
          }
          try {
            node.setPointerCapture(e.pointerId);
          } catch {}
        });
        node.addEventListener('pointermove', (e) => {
          if (!dragStart) return;
          const p = desktopSurfacePoint(e);
          const dx = p.x - dragStart.startX;
          const dy = p.y - dragStart.startY;
          if (!dragStart.armed) {
            // Touch: only start moving after long-press arms it.
            return;
          }
          if (!dragStart.moved) {
            // Mouse/pen: small threshold so repositioning works without feeling "stuck".
            if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) return;
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
          if (dragStart.longPressTimer) window.clearTimeout(dragStart.longPressTimer);
          node.classList.remove('forgeos-desktop-icon--dragging');
          dragStart = null;

          if (!wasMoved) {
            node.style.left = `${originX}px`;
            node.style.top = `${originY}px`;
            if (item.type === 'folder') {
              openFolderModal(itemId);
            } else {
              const appId = String(item.appId || '').trim() || String(node.dataset.appId || '').trim() || String(itemId).replace(/^app:/, '');
              if (appId) ensureAppOpen({ id: appId });
            }
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
          if (dragStart && dragStart.longPressTimer) window.clearTimeout(dragStart.longPressTimer);
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
    renderTopbarActivity();
    const verb =
      k === 'up'
        ? 'Starting'
        : k === 'down'
          ? 'Stopping'
          : k === 'restart'
            ? 'Restarting'
            : k === 'redeploy'
              ? 'Redeploying'
              : 'Running';
    const splashToken = showGlobalSplash({ title: `${verb} ${metaFor(id).name || id}`, sub: 'Please wait' });

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
      hideGlobalSplash(splashToken);
      await refreshInstalled();
      renderWorkspace();
      updateAppHeader();
      renderTopbarActivity();
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

  function cssEscape(val) {
    const s = String(val || '');
    try {
      if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s);
    } catch {}
    return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function withCacheBust(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
      const u = new URL(raw, window.location.origin);
      u.searchParams.set('_r', String(Date.now()));
      return u.toString();
    } catch {
      const sep = raw.includes('?') ? '&' : '?';
      return `${raw}${sep}_r=${Date.now()}`;
    }
  }

  function reloadOpenAppFrames(appId) {
    const id = String(appId || '').trim();
    if (!id) return;
    const entry = openWindows.get(id) || null;
    if (entry && entry.iframe) {
      try {
        entry.iframe.src = withCacheBust(appLaunchUrl(id));
      } catch {}
    }
    try {
      const tile = document.querySelector(`.forgeos-tile[data-app-id="${cssEscape(id)}"]`);
      if (tile) {
        const iframe = tile.querySelector('iframe.forgeos-tile__frame');
        if (iframe) iframe.src = withCacheBust(appLaunchUrl(id));
      }
    } catch {}
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
      setMaskedGradientBar(fill, pct);
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
    const prevScroll = fleetWorkersBodyEl.querySelector('.forgeos-table-wrap')?.scrollTop ?? 0;
    fleetWorkersBodyEl.innerHTML = '';

    const workers = payload && typeof payload === 'object' && Array.isArray(payload.workers) ? payload.workers : [];
    const inactive =
      payload && typeof payload === 'object' && Array.isArray(payload.workers_inactive) ? payload.workers_inactive : [];

    if (!workers.length && !inactive.length) {
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
    try {
      wrap.scrollTop = Number(prevScroll) || 0;
    } catch {}

    if (!inactive.length) return;

    const details = document.createElement('details');
    details.className = 'forgeos-fleet-workers-inactive';
    const summary = document.createElement('summary');
    summary.textContent = `Inactive workers (${inactive.length})`;
    details.appendChild(summary);

    const inactiveWrap = document.createElement('div');
    inactiveWrap.className = 'forgeos-table-wrap';
    const inactiveTable = document.createElement('table');
    inactiveTable.className = 'forgeos-table';
    const inactiveHead = document.createElement('thead');
    const inactiveHeadRow = document.createElement('tr');
    for (const label of ['Worker', 'Coin', 'Hashrate', 'Best share', 'Last share']) {
      const th = document.createElement('th');
      th.textContent = label;
      inactiveHeadRow.appendChild(th);
    }
    inactiveHead.appendChild(inactiveHeadRow);
    inactiveTable.appendChild(inactiveHead);

    const inactiveBody = document.createElement('tbody');
    for (const raw of inactive.slice(0, 200)) {
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
      inactiveBody.appendChild(tr);
    }
    inactiveTable.appendChild(inactiveBody);
    inactiveWrap.appendChild(inactiveTable);
    details.appendChild(inactiveWrap);
    fleetWorkersBodyEl.appendChild(details);
  }

  function renderFleet(payload) {
    if (!payload || payload.ok !== true) return;
    lastFleet = payload;
    setFleetUpdated(payload.time);
    try {
      window.localStorage.setItem(FLEET_CACHE_KEY, JSON.stringify(payload));
    } catch {}

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

  function loadFleetCache() {
    try {
      const raw = String(window.localStorage.getItem(FLEET_CACHE_KEY) || '').trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed.ok !== true) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function loadWidgetsCache() {
    try {
      const raw = String(window.localStorage.getItem(WIDGETS_CACHE_KEY) || '').trim();
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed.ok !== true) return null;
      return parsed;
    } catch {
      return null;
    }
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
      const res = await apiJsonTimeout('/api/v0/fleet/summary?limit=200', {}, 2500).catch(() => null);
      if (!res || res.ok !== true) {
        const cached = loadFleetCache();
        if (cached) renderFleet(cached);
        return;
      }
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
      if (updateCheckIntervalSelect && res.check_interval_s) updateCheckIntervalSelect.value = String(res.check_interval_s);
      if (updateAutoApplyInput) updateAutoApplyInput.checked = !!res.auto_apply;
      startSystemUpdateAutoCheck(Number(res.check_interval_s) || 3600);

      if (updateAuthStatusEl) {
        const tokenConfigured = !!res.token_configured;
        const tokenSource = res.token_source ? String(res.token_source) : 'none';
        const allowUnverified = !!res.allow_unverified;
        const parts = [
          tokenConfigured ? `Token: saved (${tokenSource})` : 'Token: not set',
          allowUnverified ? 'Unverified: allowed' : 'Unverified: blocked',
        ];
        updateAuthStatusEl.textContent = parts.join(' \u2022 ');
      }
      if (updateTokenInput) {
        updateTokenInput.placeholder = res.token_configured ? 'Saved' : 'ghp_...';
        updateTokenInput.setAttribute('aria-label', res.token_configured ? 'GitHub token saved' : 'GitHub token');
      }
    } catch {}
  }

  function stopSystemUpdateAutoCheck() {
    if (!systemUpdateAutoCheckTimer) return;
    window.clearInterval(systemUpdateAutoCheckTimer);
    systemUpdateAutoCheckTimer = null;
  }

  function startSystemUpdateAutoCheck(intervalS) {
    const seconds = Math.max(60, Number(intervalS) || 3600);
    stopSystemUpdateAutoCheck();
    systemUpdateAutoCheckTimer = window.setInterval(() => refreshSystemUpdateCheck().catch(() => {}), seconds * 1000);
  }

  async function refreshAuthSettings() {
    if (!authUsernameInput) return;
    try {
      const res = await apiJsonTimeout('/api/v0/auth/status', {}, 3000).catch(() => null);
      if (!res || res.ok !== true) return;
      if (res.user) authUsernameInput.value = String(res.user);
    } catch {}
  }

  async function refreshSystemSettings() {
    if (!settingChannelSelect) return;
    try {
      const res = await apiJsonTimeout('/api/v0/system/channel', {}, 3000).catch(() => null);
      if (!res || res.ok !== true) return;
      if (settingHostnameInput && res.hostname) settingHostnameInput.value = String(res.hostname);
      if (settingChannelSelect) settingChannelSelect.value = String(res.channel || 'main');
    } catch {}
  }

  async function refreshUiConfig() {
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/ui', {}, 3000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'load failed');
      uiConfigCache = res;
      if (settingTopbarSelect) settingTopbarSelect.value = getTopbarMode();
      applyTopbarMode();
    } catch {
      if (settingTopbarSelect) settingTopbarSelect.value = getTopbarMode();
      applyTopbarMode();
    }
  }

  async function saveUiConfig(patch) {
    const body = patch && typeof patch === 'object' ? patch : {};
    const res = await apiJsonTimeout('/api/v0/system/ui', { method: 'POST', body: JSON.stringify(body) }, 8000).catch(() => null);
    if (!res || res.ok !== true) throw new Error((res && res.error) || 'save failed');
    uiConfigCache = res;
    return res;
  }

  function renderStorageSettings() {
    if (!storageDefaultSelect && !storageListEl && !storageStatusEl) return;
    const res = storageCache && typeof storageCache === 'object' ? storageCache : null;
    if (!res || res.ok !== true) {
      if (storageStatusEl) storageStatusEl.textContent = 'Storage unavailable.';
      if (storageListEl) storageListEl.innerHTML = '';
      if (storageDefaultSelect) storageDefaultSelect.innerHTML = '';
      return;
    }
    const cfg = res.config && typeof res.config === 'object' ? res.config : {};
    const mountsCfg = Array.isArray(cfg.mounts) ? cfg.mounts : [];
    const defaultMount = String(cfg.default_mount || '').trim();
    const mountsDetected = Array.isArray(res.mounts) ? res.mounts : [];

    const normalizeMp = (mp) => {
      const s = String(mp || '').trim();
      if (!s) return '';
      if (!s.startsWith('/')) return '';
      if (s === '/') return '/';
      return s.replace(/\/+$/, '');
    };

    const isSystemMount = (mp, fstype) => {
      const p = String(mp || '').trim();
      const fs = String(fstype || '').trim().toLowerCase();
      if (!p) return true;
      if (p === '/') return false;
      if (fs === 'tmpfs' || fs === 'devtmpfs' || fs === 'overlay') return true;
      if (p === '/boot' || p === '/boot/efi') return true;
      if (p.startsWith('/run') || p.startsWith('/proc') || p.startsWith('/sys') || p.startsWith('/dev')) return true;
      return false;
    };

    const findDetected = (mp) => {
      const needle = normalizeMp(mp);
      if (!needle) return null;
      for (const m of mountsDetected) {
        if (!m || typeof m !== 'object') continue;
        if (normalizeMp(m.mountpoint) === needle) return m;
      }
      return null;
    };

    const mountDisplayName = (mp, detected) => {
      const p = normalizeMp(mp);
      if (!p) return 'OS disk (system)';
      if (p === '/srv/5tratumos-data') return String((detected && detected.label) || 'Internal').trim() || 'Internal';
      const label = String((detected && detected.label) || '').trim();
      return label || 'External drive';
    };

    if (storageDefaultSelect) {
      storageDefaultSelect.innerHTML = '';
      const optLocal = document.createElement('option');
      optLocal.value = '';
      optLocal.textContent = 'OS disk (system)';
      storageDefaultSelect.appendChild(optLocal);
      for (const m of mountsCfg) {
        if (!m || typeof m !== 'object') continue;
        const mp = normalizeMp(m.mountpoint);
        if (!mp) continue;
        const detected = findDetected(mp);
        const label = mountDisplayName(mp, detected);
        const opt = document.createElement('option');
        opt.value = mp;
        opt.textContent = label;
        storageDefaultSelect.appendChild(opt);
      }
      const selected = normalizeMp(defaultMount);
      const allowed = selected && mountsCfg.some((m) => m && typeof m === 'object' && normalizeMp(m.mountpoint) === selected);
      storageDefaultSelect.value = allowed ? selected : '';
    }

    if (storageListEl) {
      storageListEl.innerHTML = '';
      const list = Array.isArray(mountsDetected) ? mountsDetected : [];
      const root = findDetected('/') || null;
      const rows = list
        .filter((m) => m && typeof m === 'object' && normalizeMp(m.mountpoint) && normalizeMp(m.mountpoint) !== '/' && !isSystemMount(m.mountpoint, m.fstype))
        .sort((a, b) => String(a.mountpoint || '').localeCompare(String(b.mountpoint || '')));
      const cfgSet = new Set(
        mountsCfg
          .map((m) => (m && typeof m === 'object' ? normalizeMp(m.mountpoint) : ''))
          .filter((v) => v),
      );

      const renderRow = (m) => {
        const mp = normalizeMp(m && m.mountpoint);
        if (!mp) return;
        const isRoot = mp === '/';
        const isInternal = mp === '/srv/5tratumos-data';
        const title = isRoot ? 'OS disk (system)' : mountDisplayName(mp, m);
        const readonly = isRoot;
        const toggleDisabled = isRoot || isInternal;
        const registered = isRoot ? true : cfgSet.has(mp) || !!m.registered || isInternal;

        const row = document.createElement('div');
        row.className = 'forgeos-mini-card';
        row.dataset.storageMp = mp;

        const k = document.createElement('div');
        k.className = 'forgeos-mini-card__k';
        k.textContent = title;

        const v = document.createElement('div');
        v.className = 'forgeos-mini-card__v';

        const meta = document.createElement('div');
        meta.className = 'forgeos-muted forgeos-mono';
        const metaBits = [];
        if (!isRoot) metaBits.push(mp);
        if (m.fstype) metaBits.push(String(m.fstype));
        if (m.size) metaBits.push(String(m.size));
        if (m.has_5tratumos) metaBits.push('5tratumOS apps detected');
        meta.textContent = metaBits.join(' • ') || '-';

        const form = document.createElement('div');
        form.className = 'mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-end';

        const labelWrap = document.createElement('div');
        const labelLbl = document.createElement('label');
        labelLbl.className = 'forgeos-label';
        labelLbl.textContent = 'Label';
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'forgeos-input';
        labelInput.placeholder = isRoot ? 'OS disk' : 'Drive name';
        labelInput.value = String(m.config_label || m.label || '').trim();
        labelInput.disabled = readonly;
        labelInput.dataset.storageField = 'label';
        labelWrap.appendChild(labelLbl);
        labelWrap.appendChild(labelInput);

        const regWrap = document.createElement('div');
        const regLbl = document.createElement('label');
        regLbl.className = 'forgeos-toggle mt-6';
        regLbl.title = toggleDisabled ? 'This drive is always available for apps.' : 'Allow apps to be stored on this drive.';
        const regInput = document.createElement('input');
        regInput.type = 'checkbox';
        regInput.checked = registered;
        regInput.disabled = toggleDisabled;
        regInput.dataset.storageField = 'registered';
        const regText = document.createElement('span');
        regText.textContent = 'Use for apps';
        regLbl.appendChild(regInput);
        regLbl.appendChild(regText);
        regWrap.appendChild(regLbl);

        const hintWrap = document.createElement('div');
        hintWrap.className = 'text-xs text-slate-300 sm:col-span-1';
        hintWrap.textContent = isRoot
          ? 'The OS disk holds system files and can store apps by default.'
          : isInternal
            ? 'Internal app storage (recommended).'
            : registered
              ? 'Registered for app installs and migrations.'
              : 'Not used for apps until registered.';

        form.appendChild(labelWrap);
        form.appendChild(regWrap);
        form.appendChild(hintWrap);

        v.appendChild(meta);
        v.appendChild(form);
        row.appendChild(k);
        row.appendChild(v);
        storageListEl.appendChild(row);
      };

      if (root && typeof root === 'object') renderRow({ ...root, mountpoint: '/' });

      if (!rows.length && !root) {
        const empty = document.createElement('div');
        empty.className = 'forgeos-muted';
        empty.textContent = 'No mounted drives detected.';
        storageListEl.appendChild(empty);
      }

      for (const m of rows) renderRow(m);
    }

    if (storageStatusEl) {
      storageStatusEl.textContent = 'Tip: Right click an app to move its data between drives.';
    }
  }

  async function refreshStorageSettings() {
    if (!storageDefaultSelect && !storageListEl && !storageStatusEl) return;
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/system/storage', {}, 6000).catch(() => null);
      if (!res || res.ok !== true) return;
      storageCache = res;
      renderStorageSettings();
    } catch {}
  }

  async function saveStorageSettings() {
    if (!storageDefaultSelect) return;
    const mp = String(storageDefaultSelect.value || '').trim();
    if (btnStorageSave) btnStorageSave.disabled = true;
    const prev = btnStorageSave ? btnStorageSave.textContent : '';
    if (btnStorageSave) btnStorageSave.textContent = 'Saving...';
    if (storageStatusEl) storageStatusEl.textContent = 'Saving...';
    try {
      const normalizeMp = (mountpoint) => String(mountpoint || '').trim().replace(/\/+$/, '');
      const cfg = storageCache && typeof storageCache === 'object' ? storageCache.config : null;
      const existing = cfg && typeof cfg === 'object' && Array.isArray(cfg.mounts) ? cfg.mounts : [];
      const mountsByMp = new Map();
      for (const m of existing) {
        if (!m || typeof m !== 'object') continue;
        const mpRow = normalizeMp(m.mountpoint);
        if (!mpRow || mpRow === '/') continue;
        mountsByMp.set(mpRow, String(m.label || '').trim());
      }
      if (storageListEl) {
        const rows = Array.from(storageListEl.querySelectorAll('[data-storage-mp]'));
        for (const row of rows) {
          const mpRow = normalizeMp(row && row.dataset ? row.dataset.storageMp || '' : '');
          if (!mpRow || mpRow === '/') continue;
          const regEl = row.querySelector('input[data-storage-field=\"registered\"]');
          const registered = !!(regEl && regEl.checked);
          const labelEl = row.querySelector('input[data-storage-field=\"label\"]');
          const label = String(labelEl && 'value' in labelEl ? labelEl.value : '').trim();
          if (registered) mountsByMp.set(mpRow, label);
          else mountsByMp.delete(mpRow);
        }
      }

      const mpDefault = String(mp || '').trim();
      const mounts = Array.from(mountsByMp.entries()).map(([mountpoint, label]) => ({ mountpoint, label }));
      const allowedDefault = !mpDefault || mountsByMp.has(normalizeMp(mpDefault));
      const res = await apiJsonTimeout(
        '/api/v0/system/storage/config',
        { method: 'POST', body: JSON.stringify({ default_mount: allowedDefault ? mpDefault : '', mounts }) },
        8000,
      ).catch(() => null);
      if (!res || res.ok !== true) throw new Error(res && res.error ? String(res.error) : 'save failed');
      showToast('Storage settings saved', null);
      storageCache = { ...storageCache, config: res.config };
      await refreshStorageSettings();
    } catch (e) {
      if (storageStatusEl) storageStatusEl.textContent = `Save failed: ${e && e.message ? String(e.message) : String(e)}`;
    } finally {
      if (btnStorageSave) btnStorageSave.disabled = false;
      if (btnStorageSave) btnStorageSave.textContent = prev || 'Save';
    }
  }

  function updateStorageOrphansActions() {
    if (!storageOrphansSafe) {
      if (btnStorageOrphansDelete) btnStorageOrphansDelete.disabled = true;
      return;
    }
    const hasPaths = storageOrphansSelection.paths && storageOrphansSelection.paths.size > 0;
    const hasCtrs = storageOrphansSelection.containers && storageOrphansSelection.containers.size > 0;
    const enabled = hasPaths || hasCtrs;
    if (btnStorageOrphansDelete) btnStorageOrphansDelete.disabled = !enabled;
  }

  function renderStorageOrphans() {
    if (!storageOrphansListEl && !storageOrphansStatusEl) return;
    const res = storageOrphansCache && typeof storageOrphansCache === 'object' ? storageOrphansCache : null;
    const data = res && Array.isArray(res.data) ? res.data : [];
    const containers = res && Array.isArray(res.containers) ? res.containers : [];
    storageOrphansSafe = !(res && res.ok === true && res.safe === false);

    if (storageOrphansStatusEl) {
      if (!res) storageOrphansStatusEl.textContent = 'Scan to find orphaned app data and containers.';
      else if (res.ok !== true) storageOrphansStatusEl.textContent = 'Scan failed.';
      else if (storageOrphansSafe) storageOrphansStatusEl.textContent = `${data.length} orphaned folders, ${containers.length} orphaned containers.`;
      else
        storageOrphansStatusEl.textContent =
          (res.warning ? String(res.warning) : 'Orphan cleanup is disabled for safety.') +
          ` (${data.length} folders, ${containers.length} containers)`;
    }

    if (!storageOrphansListEl) return;
    storageOrphansListEl.innerHTML = '';

    const makeRow = ({ title, subtitle, checked, onToggle, disabled }) => {
      const row = document.createElement('div');
      row.className = 'forgeos-mini-card flex items-start gap-3';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!checked;
      cb.disabled = !!disabled;
      cb.addEventListener('change', () => onToggle(!!cb.checked));
      cb.className = 'mt-1';
      const body = document.createElement('div');
      body.className = 'min-w-0';
      const t = document.createElement('div');
      t.className = 'font-semibold';
      t.textContent = title;
      const s = document.createElement('div');
      s.className = 'forgeos-muted text-sm break-words';
      s.textContent = subtitle;
      body.appendChild(t);
      body.appendChild(s);
      row.appendChild(cb);
      row.appendChild(body);
      return row;
    };

    if (!res || res.ok !== true) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.textContent = res && res.error ? String(res.error) : '-';
      storageOrphansListEl.appendChild(empty);
      updateStorageOrphansActions();
      return;
    }

    const block = (title) => {
      const h = document.createElement('div');
      h.className = 'text-sm font-semibold text-slate-200 mt-2';
      h.textContent = title;
      return h;
    };

    const sortedData = data
      .filter((x) => x && typeof x === 'object' && x.path)
      .slice()
      .sort((a, b) => String(a.path || '').localeCompare(String(b.path || '')));
    const sortedCtrs = containers
      .filter((x) => x && typeof x === 'object' && x.name)
      .slice()
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    if (!sortedData.length && !sortedCtrs.length) {
      const empty = document.createElement('div');
      empty.className = 'forgeos-muted';
      empty.textContent = 'No orphaned data found.';
      storageOrphansListEl.appendChild(empty);
      storageOrphansSelection = { paths: new Set(), containers: new Set() };
      updateStorageOrphansActions();
      return;
    }

    if (sortedData.length) {
      storageOrphansListEl.appendChild(block('Folders'));
      for (const item of sortedData) {
        const path = String(item.path || '');
        const appId = String(item.app_id || '').trim() || 'unknown';
        const kind = String(item.kind || '').trim() || 'data';
        const size = String(item.size || '').trim() || '-';
        const label = String(item.label || '').trim() || 'Drive';
        const reason = String(item.reason || '').trim();
        const title = `${appId} • ${kind} • ${size} • ${label}`;
        const subtitle = `${reason ? reason + ' • ' : ''}${path}`;
        const checked = storageOrphansSelection.paths.has(path);
        storageOrphansListEl.appendChild(
          makeRow({
            title,
            subtitle,
            checked,
            disabled: !storageOrphansSafe,
            onToggle: (on) => {
              if (on) storageOrphansSelection.paths.add(path);
              else storageOrphansSelection.paths.delete(path);
              updateStorageOrphansActions();
            },
          }),
        );
      }
    }

    if (sortedCtrs.length) {
      storageOrphansListEl.appendChild(block('Containers'));
      for (const item of sortedCtrs) {
        const name = String(item.name || '');
        const appId = String(item.app_id || '').trim() || 'unknown';
        const reason = String(item.reason || '').trim();
        const checked = storageOrphansSelection.containers.has(name);
        storageOrphansListEl.appendChild(
          makeRow({
            title: `${appId} • ${name}`,
            subtitle: reason || 'Orphan container',
            checked,
            disabled: !storageOrphansSafe,
            onToggle: (on) => {
              if (on) storageOrphansSelection.containers.add(name);
              else storageOrphansSelection.containers.delete(name);
              updateStorageOrphansActions();
            },
          }),
        );
      }
    }

    updateStorageOrphansActions();
  }

  async function refreshStorageOrphans(opts) {
    const options = opts && typeof opts === 'object' ? opts : {};
    const sizes = options.sizes === true;
    if (!storageOrphansStatusEl && !storageOrphansListEl) return;
    if (btnStorageOrphansScan) btnStorageOrphansScan.disabled = true;
    if (btnStorageOrphansScanSizes) btnStorageOrphansScanSizes.disabled = true;
    if (storageOrphansStatusEl) storageOrphansStatusEl.textContent = sizes ? 'Scanning (sizes may take a while)...' : 'Scanning...';
    try {
      const res = await apiJsonTimeout(`/api/v0/system/storage/orphans?sizes=${sizes ? '1' : '0'}`, {}, sizes ? 20000 : 8000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'scan failed');
      storageOrphansCache = res;
      storageOrphansSelection = { paths: new Set(), containers: new Set() };
      renderStorageOrphans();
    } catch (e) {
      storageOrphansCache = { ok: false, error: e && e.message ? String(e.message) : String(e) };
      storageOrphansSelection = { paths: new Set(), containers: new Set() };
      renderStorageOrphans();
    } finally {
      if (btnStorageOrphansScan) btnStorageOrphansScan.disabled = false;
      if (btnStorageOrphansScanSizes) btnStorageOrphansScanSizes.disabled = false;
      updateStorageOrphansActions();
    }
  }

  async function deleteSelectedStorageOrphans() {
    const paths = Array.from(storageOrphansSelection.paths || []);
    const containers = Array.from(storageOrphansSelection.containers || []);
    if (!paths.length && !containers.length) return;

    const ok = await openConfirmModal({
      title: 'Delete selected orphaned items?',
      message:
        `This will permanently delete:\n\n` +
        `${paths.length} folder(s)\n` +
        `${containers.length} container(s)\n\n` +
        `This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) return;

    if (btnStorageOrphansDelete) btnStorageOrphansDelete.disabled = true;
    if (storageOrphansStatusEl) storageOrphansStatusEl.textContent = 'Deleting...';
    try {
      const res = await apiJsonTimeout(
        '/api/v0/system/storage/orphans/delete',
        { method: 'POST', body: JSON.stringify({ confirm: true, paths, containers }) },
        30000,
      ).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'delete failed');
      showToast('Cleanup complete', null);
      await refreshStorageSettings();
      await refreshStorageOrphans({ sizes: false });
    } catch (e) {
      showToast('Cleanup failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Cleanup failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      if (btnStorageOrphansDelete) btnStorageOrphansDelete.disabled = false;
      updateStorageOrphansActions();
    }
  }

  async function refreshConsoleSettings() {
    if (!kioskEnabledInput && !kioskStatusEl) return;
    try {
      const res = await apiJsonTimeout('/api/v0/system/console', {}, 3500).catch(() => null);
      if (!res || res.ok !== true) return;
      consoleConfigCache = res;
      if (kioskEnabledInput) kioskEnabledInput.checked = !!res.enabled;
      if (kioskStatusEl) {
        const parts = [];
        parts.push(res.enabled ? 'Enabled' : 'Disabled');
        if (res.active === true) parts.push('Active');
        else if (res.active === false) parts.push('Inactive');
        if (res.reason) parts.push(String(res.reason));
        kioskStatusEl.textContent = parts.join(' • ') || '-';
      }
    } catch {}
  }

  async function saveConsoleSettings(patch) {
    const body = patch && typeof patch === 'object' ? patch : {};
    const res = await apiJsonTimeout('/api/v0/system/console', { method: 'POST', body: JSON.stringify(body) }, 15_000).catch(() => null);
    if (!res || res.ok !== true) throw new Error(res && res.error ? String(res.error) : 'save failed');
    consoleConfigCache = res;
    await refreshConsoleSettings();
    return res;
  }

  async function maybePromptKiosk() {
    if (consolePromptDone) return;
    consolePromptDone = true;
    try {
      const res = consoleConfigCache && consoleConfigCache.ok === true ? consoleConfigCache : await apiJsonTimeout('/api/v0/system/console', {}, 3500).catch(() => null);
      if (!res || res.ok !== true) return;
      consoleConfigCache = res;
      if (!res.enabled) return;
      if (res.prompted) return;

      const keep = await openConfirmModal({
        title: 'Keep kiosk mode enabled?',
        message:
          'Kiosk mode launches the 5tratumOS UI fullscreen on an attached monitor (tty1).\n\nChoose “Disable” if this is a headless/VM install.',
        confirmText: 'Keep enabled',
        cancelText: 'Disable',
        danger: false,
      });

      if (keep) {
        await saveConsoleSettings({ prompted: true });
      } else {
        await saveConsoleSettings({ enabled: false, prompted: true });
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

  function systemUpdateProgressPct(state, status) {
    const st = status && typeof status === 'object' ? status : null;
    const raw = st && Number.isFinite(Number(st.progress)) ? Number(st.progress) : null;
    if (raw !== null) {
      const n = Math.max(0, Math.min(100, Math.round(raw)));
      return Number.isFinite(n) ? n : 0;
    }
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

  function setTopbarOsPills(check) {
    const chk = check && typeof check === 'object' ? check : null;
    const installedTag =
      chk && chk.installed && typeof chk.installed === 'object' && chk.installed.tag ? String(chk.installed.tag) : '';
    if (topbarOsVersionEl) topbarOsVersionEl.textContent = installedTag || 'v-';
    if (topbarOsStageEl) topbarOsStageEl.textContent = 'ALPHA';
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
    setTopbarOsPills(check);

    const state = status && status.state ? String(status.state).trim().toLowerCase() : 'idle';
    const busy = systemUpdateIsBusy(state);
    const pct = busy ? systemUpdateProgressPct(state, status) : null;

    if (busy) {
      const label = systemUpdateStateLabel(state, status);
      if (!systemUpdateSplashToken) {
        systemUpdateSplashToken = showGlobalSplash({
          title: 'Updating 5tratumOS',
          sub: label,
          showProgress: true,
          progress: pct,
          dismissable: false,
        });
      } else {
        updateGlobalSplash('Updating 5tratumOS', label);
        updateGlobalSplashProgress(pct);
      }
    } else if (systemUpdateSplashToken) {
      hideGlobalSplash(systemUpdateSplashToken);
      systemUpdateSplashToken = null;
    }

    if (btnUpdateCheck) btnUpdateCheck.disabled = busy;

    const updateAvailable = !!(check && check.update_available === true);
    if (btnUpdateApply) btnUpdateApply.disabled = busy || !updateAvailable;

    if (updateStatusEl) {
      let line = '-';
      if (busy) {
        const base = systemUpdateStateLabel(state, status);
        line = pct !== null ? `${base} (${pct}%)` : base;
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
      setMaskedGradientBar(updateProgressBarEl, pct !== null ? pct : systemUpdateProgressPct(state, status));
    }

    maybePromptSystemUpdateAvailable(check, status).catch(() => {});
    renderTopbarActivity();
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
    const userInitiated = !!options.user;
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

      if (userInitiated && res && typeof res === 'object' && res.update_available === true) {
        const tag =
          res.available && typeof res.available === 'object' && res.available.tag ? String(res.available.tag).trim() : '';
        if (tag) updateAvailableModalShownFor = tag;
      }
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
      if (userInitiated) {
        const st = systemUpdateState();
        const chk = systemUpdateCheckCache && typeof systemUpdateCheckCache === 'object' ? systemUpdateCheckCache : null;
        if (!systemUpdateIsBusy(st) && chk && chk.ok === true) {
          if (chk.error) {
            await openNoticeModal({
              kind: 'Error',
              title: 'Update check failed',
              message: String(chk.error),
              danger: true,
            });
          } else if (chk.update_available === true) {
            const tag =
              chk.available && typeof chk.available === 'object' && chk.available.tag ? String(chk.available.tag).trim() : '';
            const notes =
              chk.available && typeof chk.available === 'object' && chk.available.notes ? String(chk.available.notes).trim() : '';
            const notesPreview = notes
              ? notes
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('\n')
              : '';

            let splashToken = null;
            splashToken = showGlobalSplash({
              title: tag ? `Update available: ${tag}` : 'Update available',
              sub: notesPreview || 'An OS update is ready to install.',
              dismissable: true,
              primary: {
                label: 'Install update',
                danger: true,
                onClick: async () => {
                  if (splashToken) hideGlobalSplash(splashToken);
                  await applySystemUpdate();
                },
              },
              secondary: {
                label: 'Later',
                danger: false,
                onClick: () => {
                  if (splashToken) hideGlobalSplash(splashToken);
                },
              },
            });
          } else if (chk.update_available !== true) {
            await openNoticeModal({
              kind: 'System',
              title: 'No updates found',
              message: 'Your system is already up to date.',
            });
          }
        }
      }
    }
  }

  let updateAvailableModalShownFor = '';
  async function maybePromptSystemUpdateAvailable(check, status) {
    const st = status && typeof status === 'object' ? status : null;
    const state = st && st.state ? String(st.state).trim().toLowerCase() : 'idle';
    if (systemUpdateIsBusy(state)) return;

    const c = check && typeof check === 'object' ? check : null;
    if (!c || c.ok !== true) return;
    if (c.notify_available !== true) return;

    const tag = c.available && typeof c.available === 'object' && c.available.tag ? String(c.available.tag) : '';
    if (!tag) return;
    if (updateAvailableModalShownFor === tag) return;
    updateAvailableModalShownFor = tag;

    const notes = c.available && typeof c.available === 'object' && c.available.notes ? String(c.available.notes) : '';
    const choice = await openUpdateAvailableModal(tag, notes);

    if (choice === 'install') {
      await applySystemUpdate();
      return;
    }

    // No dismiss: keep reminding until installed.
  }

  async function saveSystemUpdateConfig() {
    if (!btnUpdateSave) return;
    const token = updateTokenInput ? String(updateTokenInput.value || '').trim() : '';

    btnUpdateSave.disabled = true;
    const prev = btnUpdateSave.textContent;
    btnUpdateSave.textContent = 'Saving...';
    if (updateAuthStatusEl) updateAuthStatusEl.textContent = 'Saving update settings...';

    try {
      const body = {};
      if (updateCheckIntervalSelect) body.check_interval_s = Number(updateCheckIntervalSelect.value) || 3600;
      if (updateAutoApplyInput) body.auto_apply = !!updateAutoApplyInput.checked;
      if (token) body.token = token;
      const res = await apiJsonTimeout('/api/v0/system/update/config', { method: 'POST', body: JSON.stringify(body) }, 8000);
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'save failed');
      systemUpdateConfigCache = res;
      if (updateTokenInput) updateTokenInput.value = '';
      showToast('Update settings saved', null);
      if (updateAuthStatusEl) updateAuthStatusEl.textContent = 'Saved. Refreshing...';
      if (updateTokenInput && res.token_configured) updateTokenInput.placeholder = 'Saved';
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
      if (updateTokenInput) updateTokenInput.placeholder = 'ghp_...';
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
    if (!systemUpdateSplashToken) {
      systemUpdateSplashToken = showGlobalSplash({
        title: 'Updating 5tratumOS',
        sub: 'Starting update...',
        showProgress: true,
        progress: 0,
        dismissable: false,
      });
    }

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
      const msg = e && e.message ? String(e.message) : String(e);
      const isGateway = msg.includes('HTTP 502') || msg.includes('HTTP 503') || msg.includes('Failed to fetch');
      if (isGateway) {
        showToast('Update started (reconnecting...)', null);
        if (updateStatusEl) updateStatusEl.textContent = 'Reconnecting...';
        scheduleSystemUpdatePoll(1200);
        return;
      }

      showToast('Update failed', 'error');
      if (systemUpdateSplashToken) {
        hideGlobalSplash(systemUpdateSplashToken);
        systemUpdateSplashToken = null;
      }
      await openNoticeModal({
        kind: 'Error',
        title: 'System update failed',
        message: msg,
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
    const splashToken = showGlobalSplash({ title: 'Syncing App Store', sub: 'Refreshing templates...' });
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
      hideGlobalSplash(splashToken);
      btnStoreSync.disabled = false;
      btnStoreSync.textContent = prev;
    }
  }

  async function refreshStoreCustomConfig() {
    try {
      const ok = await ensureHealthy();
      if (!ok) return;
      const res = await apiJsonTimeout('/api/v0/store/config', {}, 4000).catch(() => null);
      if (!res || res.ok !== true) return;
      const raw = res.custom && typeof res.custom === 'object' ? res.custom : {};
      const out = [];
      for (const [slotRaw, entry] of Object.entries(raw || {})) {
        const slot = String(slotRaw || '').trim().toLowerCase();
        if (!slot || !slot.startsWith('custom')) continue;
        if (!entry || typeof entry !== 'object') continue;
        const url = String(entry.url || '').trim();
        if (!url) continue;
        const label = String(entry.label || '').trim();
        out.push({ slot, url, label });
      }
      out.sort((a, b) => {
        const al = (a.label || storeLabelFromUrl(a.url) || a.slot).toLowerCase();
        const bl = (b.label || storeLabelFromUrl(b.url) || b.slot).toLowerCase();
        return al.localeCompare(bl, undefined, { sensitivity: 'base' });
      });
      storeCustomStores = out;
      renderStoreCustomButtons();
      if (!allowedStoreChannels().includes(String(activeStoreChannel || '').toLowerCase())) {
        activeStoreChannel = 'main';
        saveStoreChannel();
        applyStoreChannelUi();
      }
    } catch {}
  }

  async function openCustomStoreModal(existingSlot) {
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    const existing = new Map(
      (Array.isArray(storeCustomStores) ? storeCustomStores : []).map((entry) => [String(entry.slot), entry]),
    );
    const slotEditing = String(existingSlot || '').trim().toLowerCase();
    const editing = !!(slotEditing && existing.has(slotEditing));

    modalTitleEl.textContent = editing ? 'Edit custom store' : 'Add custom store';
    if (modalKindEl) modalKindEl.textContent = 'App Store';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-4';

    const hint = document.createElement('div');
    hint.className = 'text-sm text-slate-300';
    hint.textContent = 'Paste a GitHub repo URL or a direct .tar.gz archive URL for an Umbrel community store.';
    wrap.appendChild(hint);

    const urlLabel = document.createElement('label');
    urlLabel.className = 'forgeos-label';
    urlLabel.textContent = 'Store URL';
    wrap.appendChild(urlLabel);

    const urlInput = document.createElement('input');
    urlInput.className = 'forgeos-input';
    urlInput.type = 'text';
    urlInput.placeholder = 'https://github.com/owner/repo';
    wrap.appendChild(urlInput);

    const nameLabel = document.createElement('label');
    nameLabel.className = 'forgeos-label';
    nameLabel.textContent = 'Label (optional)';
    wrap.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.className = 'forgeos-input';
    nameInput.type = 'text';
    nameInput.placeholder = 'Custom store name';
    wrap.appendChild(nameInput);

    const updateFields = () => {
      const current = existing.get(slotEditing);
      urlInput.value = current && current.url ? String(current.url) : '';
      nameInput.value = current && current.label ? String(current.label) : '';
      const derived = storeLabelFromUrl(urlInput.value);
      nameInput.placeholder = derived || 'Custom store name';
    };
    updateFields();

    urlInput.addEventListener('input', () => {
      const derived = storeLabelFromUrl(urlInput.value);
      nameInput.placeholder = derived || 'Custom store name';
    });

    const actions = document.createElement('div');
    actions.className = 'flex items-center justify-end gap-2';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'axe-btn';
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => closeModal());

    const btnSave = document.createElement('button');
    btnSave.type = 'button';
    btnSave.className = 'axe-btn';
    btnSave.textContent = editing ? 'Save' : 'Add store';
    btnSave.addEventListener('click', async () => {
      const url = String(urlInput.value || '').trim();
      const label = String(nameInput.value || '').trim();
      const hasExisting = editing;
      if (!url) {
        if (!hasExisting) {
          showToast('Enter a store URL', 'warn');
          return;
        }
        const ok = await openConfirmModal({
          title: 'Remove custom store?',
          message: `Remove ${storeChannelLabel(slotEditing)}?`,
          confirmText: 'Remove',
          cancelText: 'Cancel',
          danger: true,
        });
        if (!ok) return;
      } else if (!/^https?:\/\//i.test(url)) {
        showToast('URL must start with http(s)://', 'warn');
        return;
      }

      btnSave.disabled = true;
      const prev = btnSave.textContent;
      btnSave.textContent = 'Saving...';
      try {
        const slot = editing
          ? slotEditing
          : deriveCustomStoreSlot(
              url,
              label,
              (Array.isArray(storeCustomStores) ? storeCustomStores : []).map((e) => e.slot),
            );
        const res = await apiJsonTimeout(
          '/api/v0/store/config',
          { method: 'POST', body: JSON.stringify({ slot, url, label }) },
          8000,
        );
        if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'save failed');
        closeModal();
        await refreshStoreCustomConfig();
        if (url) {
          setStoreChannel(slot);
          await syncStoreNow();
        } else if (activeStoreChannel === slot) {
          setStoreChannel('main');
        }
      } catch (err) {
        await openNoticeModal({
          kind: 'Error',
          title: 'Save failed',
          message: err && err.message ? String(err.message) : String(err),
          danger: true,
        });
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = prev;
      }
    });

    actions.appendChild(btnCancel);
    actions.appendChild(btnSave);
    wrap.appendChild(actions);

    modalBodyEl.appendChild(wrap);
    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => urlInput.focus(), 50);
  }

  async function fixAppNow(appId) {
    const app_id = String(appId || '').trim();
    if (!app_id) return;
    const label = metaFor(app_id).name || app_id;
    const okConfirm = await openConfirmModal({
      title: `Fix ${label}?`,
      message:
        'This rebuilds the app from its store template, keeps existing data, refreshes configs, and repairs proxy routes.\n\nUse this if an app fails to load or ports/proxy look wrong.',
      confirmText: 'Fix app',
      cancelText: 'Cancel',
      danger: false,
    });
    if (!okConfirm) return;

    const splashToken = showGlobalSplash({ title: `Fixing ${label}`, sub: 'Rebuilding app from template...' });
    try {
      await ensureHealthy();
      const res = await apiJsonTimeout('/api/v0/apps/repair', { method: 'POST', body: JSON.stringify({ id: app_id }) }, 900000);
      if (!res || res.ok !== true) throw new Error((res && (res.error || res.stderr)) || 'Fix failed');
      showToast('App repaired', null);
      await refresh();
    } catch (err) {
      showToast('Fix failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Fix failed',
        message: err && err.message ? String(err.message) : String(err),
        danger: true,
      });
    } finally {
      hideGlobalSplash(splashToken);
    }
  }

  async function openFixAppModal() {
    if (!btnFixApp) return;
    const apps = Array.isArray(installedAppsCache) ? installedAppsCache : [];
    if (!apps.length) {
      await openNoticeModal({
        kind: 'Notice',
        title: 'No apps installed',
        message: 'Install an app first, then use Fix App to repair it.',
      });
      return;
    }
    if (!modalEl || !modalBodyEl || !modalTitleEl) return;
    modalTitleEl.textContent = 'Fix App';
    if (modalKindEl) modalKindEl.textContent = 'Maintenance';
    modalBodyEl.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-4';

    const p = document.createElement('div');
    p.className = 'text-sm text-slate-300';
    p.textContent = 'Select the app you want to repair. This keeps data but refreshes config and proxy routes.';
    wrap.appendChild(p);

    const select = document.createElement('select');
    select.className = 'forgeos-input';
    const sorted = apps
      .map((a) => ({ id: String(a.id || '').trim(), name: metaFor(String(a.id || '').trim()).name || a.name || a.id }))
      .filter((a) => a.id)
      .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }));
    for (const app of sorted) {
      const opt = document.createElement('option');
      opt.value = app.id;
      opt.textContent = app.name;
      select.appendChild(opt);
    }
    wrap.appendChild(select);

    const actions = document.createElement('div');
    actions.className = 'flex items-center justify-end gap-2';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'axe-btn';
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => closeModal());

    const btnGo = document.createElement('button');
    btnGo.type = 'button';
    btnGo.className = 'axe-btn';
    btnGo.textContent = 'Fix app';
    btnGo.addEventListener('click', async () => {
      const id = String(select.value || '').trim();
      if (!id) return;
      closeModal();
      await fixAppNow(id);
    });

    actions.appendChild(btnCancel);
    actions.appendChild(btnGo);
    wrap.appendChild(actions);
    modalBodyEl.appendChild(wrap);

    modalEl.classList.remove('hidden');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => select.focus(), 50);
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
      const widgetsRes = await apiJsonTimeout('/api/v0/apps/widgets', {}, 2500).catch(() => null);
      if (!widgetsRes || widgetsRes.ok !== true) {
        const cached = loadWidgetsCache();
        if (cached) {
          hasLoadedWidgets = true;
          lastWidgets = cached;
          renderDashboardWidgets(lastWidgets);
          setWidgetsUpdated(cached.time);
        }
        return;
      }
      hasLoadedWidgets = true;
      lastWidgets = widgetsRes;
      try {
        window.localStorage.setItem(WIDGETS_CACHE_KEY, JSON.stringify(widgetsRes));
      } catch {}
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
      refreshConsoleSettings().catch(() => {});
      refreshStorageSettings().catch(() => {});
      maybePromptKiosk().catch(() => {});

    await Promise.allSettled([
      refreshInstalled(),
      refreshStore(),
      refreshMetrics(),
      refreshWidgets(),
      refreshFleet(),
    ]);
  }

  async function openMoveAppDataModal(appId) {
    const id = String(appId || '').trim().toLowerCase();
    if (!id) return;
    const label = metaFor(id).name || id;

    let splashToken = '';
    try {
      const ok = await ensureHealthy();
      if (!ok) throw new Error('Service unavailable');

      const storageRes = await apiJsonTimeout('/api/v0/system/storage', {}, 8000).catch(() => null);
      if (!storageRes || storageRes.ok !== true) throw new Error('Storage unavailable');
      storageCache = storageRes;
      renderStorageSettings();

      const cfg = storageRes.config && typeof storageRes.config === 'object' ? storageRes.config : {};
      const mounts = Array.isArray(cfg.mounts) ? cfg.mounts : [];
      const detected = Array.isArray(storageRes.mounts) ? storageRes.mounts : [];

      const normalizeMp = (mp) => {
        const s = String(mp || '').trim();
        if (!s) return '';
        if (s === '/') return '/';
        return s.replace(/\/+$/, '');
      };

      const mountLabel = (mountpoint) => {
        const mp = normalizeMp(mountpoint);
        if (!mp) return 'OS disk (system)';
        const hit = detected.find((m) => m && typeof m === 'object' && normalizeMp(m.mountpoint) === mp) || null;
        const lbl = String(hit && hit.label ? hit.label : '').trim();
        if (lbl) return lbl;
        if (mp === '/srv/5tratumos-data') return 'Internal';
        return 'External drive';
      };

      const installed = installedById.get(id) || null;
      const currentTarget =
        installed && installed.storage && typeof installed.storage === 'object' ? String(installed.storage.target || '').trim() : '';
      const isLink =
        !!(installed && installed.storage && typeof installed.storage === 'object' && installed.storage.is_link === true);
      const status = installed ? String(installed.status || '').trim().toLowerCase() : '';

      let currentMount = '';
      let currentLocation = 'OS disk (system)';
      if (currentTarget) {
        const candidates = new Set();
        for (const m of detected) {
          if (!m || typeof m !== 'object') continue;
          const mp = normalizeMp(m.mountpoint);
          if (mp) candidates.add(mp);
        }
        for (const m of mounts) {
          if (!m || typeof m !== 'object') continue;
          const mp = normalizeMp(m.mountpoint);
          if (mp) candidates.add(mp);
        }
        const match = Array.from(candidates)
          .sort((a, b) => b.length - a.length)
          .find((mp) => currentTarget.startsWith(mp));
        if (match) {
          currentMount = match;
          currentLocation = mountLabel(match);
        }
      }

      const currentDetail = currentLocation;
      const currentPathHint = '';

      const choices = [{ label: 'OS disk (system)', value: '' }];
      const seen = new Set(['']);
      for (const m of mounts) {
        if (!m || typeof m !== 'object') continue;
        const mp = normalizeMp(m.mountpoint);
        if (!mp) continue;
        if (seen.has(mp)) continue;
        seen.add(mp);
        choices.push({ label: mountLabel(mp), value: mp });
      }

      const pick = await openChoiceModal({
        title: `Move ${label} data`,
        message: `Current location: ${currentDetail}\n\nChoose a destination drive:`,
        kind: 'System',
        choices: choices.concat([{ label: 'Cancel', value: 'cancel', danger: true }]),
      });
      if (pick === null || pick === undefined || pick === 'cancel') return;

      const mountpoint = String(pick).trim();
      const alreadyOnMount = mountpoint && currentMount && normalizeMp(currentMount) === normalizeMp(mountpoint);
      if (!mountpoint && (!isLink || currentMount === '' || currentTarget.startsWith('/var/lib/5tratumos'))) {
        showToast('Already on local storage', null);
        return;
      }
      if (alreadyOnMount) {
        showToast('Already on that drive', null);
        return;
      }

      if (status === 'running' || status === 'restarting') {
        const okStop = await openConfirmModal({
          title: `Stop ${label} to move data?`,
          message: 'This app must be stopped to move its data. The OS will stop it, migrate the files, then start it again.',
          confirmText: 'Stop & move',
          cancelText: 'Cancel',
          danger: false,
        });
        if (!okStop) return;
      }

      const cleanupPick = await openChoiceModal({
        title: 'After the move',
        message:
          'Do you want to keep a backup copy on the source drive?\n\n' +
          'Delete source copy: recommended to avoid duplicated/dirty data.\n' +
          'Keep backup: safer, but uses extra disk space.',
        kind: 'System',
        choices: [
          { label: 'Delete source copy (recommended)', value: 'delete' },
          { label: 'Keep backup on source', value: 'keep' },
          { label: 'Cancel', value: 'cancel', danger: true },
        ],
      });
      if (!cleanupPick || cleanupPick === 'cancel') return;
      const keep_backup = cleanupPick === 'keep';

      const startedAt = Date.now();
      appProgress.set(id, { kind: 'migrate', pct: 5, startedAt });
      renderTopbarActivity();

      splashToken = showGlobalSplash({
        title: `Moving ${label}`,
        sub: 'Starting migration...',
        showProgress: true,
        progress: 5,
        dismissable: false,
      });
      const start = await apiJsonTimeout(
        '/api/v0/apps/migrate',
        { method: 'POST', body: JSON.stringify({ id, mountpoint, keep_backup }) },
        15000,
      ).catch(() => null);
      if (!start || start.ok !== true) throw new Error((start && (start.error || start.stderr)) || 'migration failed to start');

      const deadline = Date.now() + 60 * 60 * 1000;
      let lastState = '';
      let lastPct = 5;
      while (Date.now() < deadline) {
        await sleep(1200);
        const st = await apiJsonTimeout(`/api/v0/apps/migrate/status?id=${encodeURIComponent(id)}`, {}, 6000).catch(() => null);
        if (!st || typeof st !== 'object') continue;
        const state = String(st.state || '').trim().toLowerCase();
        if (state && state !== lastState) {
          lastState = state;
          const sub =
            state === 'stopping'
              ? 'Stopping app...'
              : state === 'copying'
                ? 'Copying data...'
                : state === 'switching'
                  ? 'Switching paths...'
                  : state === 'starting'
                    ? 'Starting app...'
                    : state === 'cleaning'
                      ? 'Cleaning up old files...'
                    : 'Working...';
          updateGlobalSplash(`Moving ${label}`, sub);
        }
        if (Number.isFinite(Number(st.pct))) {
          const pct = Math.max(0, Math.min(100, Math.round(Number(st.pct))));
          updateGlobalSplashProgress(pct);
          if (pct !== lastPct) {
            lastPct = pct;
            appProgress.set(id, { kind: 'migrate', pct, startedAt });
            renderTopbarActivity();
          }
        }
        if (state === 'done') {
          updateGlobalSplashProgress(100);
          hideGlobalSplash(splashToken);
          appProgress.delete(id);
          renderTopbarActivity();
          showToast('Migration complete', null);
          await refreshInstalled();
          await refreshStorageSettings();
          return;
        }
        if (state === 'error') {
          hideGlobalSplash(splashToken);
          appProgress.delete(id);
          renderTopbarActivity();
          await openNoticeModal({
            kind: 'Error',
            title: 'Migration failed',
            message: st.error ? String(st.error) : 'Migration failed.',
            danger: true,
          });
          await refreshInstalled();
          return;
        }
      }
      hideGlobalSplash(splashToken);
      appProgress.delete(id);
      renderTopbarActivity();
      showToast('Migration timed out', 'error');
    } catch (e) {
      if (splashToken) hideGlobalSplash(splashToken);
      if (id) {
        appProgress.delete(id);
        renderTopbarActivity();
      }
      showToast('Migration failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Migration failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    }
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
      {
        label: 'Move data…',
        hint: 'Move app data to another drive',
        disabled: pendingAppActions.has(id),
        onClick: async () => openMoveAppDataModal(id),
      },
      { type: 'sep' },
      {
        label: 'Uninstall...',
        danger: true,
        disabled: pendingAppActions.has(id),
        onClick: async () => {
          await uninstallAppFlow(id);
        },
      },
    ];

    openContextMenu(items, x, y);
  }

  async function uninstallAppFlow(appId, opts) {
    const id = String(appId || '').trim();
    if (!id) return { ok: false, error: 'missing id' };
    const options = opts && typeof opts === 'object' ? opts : {};
    const closeOnDone = options.closeOnDone === true;
    const meta = metaFor(id);
    const label = meta.name || id;

    const pick = await openChoiceModal({
      title: `Uninstall ${label}`,
      message:
        'Choose how to uninstall:\n\n' +
        'Keep data: removes containers, keeps app data (fast reinstall).\n' +
        'Purge data: removes containers and deletes the app data folder (recommended for a clean uninstall; irreversible).',
      kind: 'System',
      choices: [
        { label: 'Keep data', value: 'keep' },
        { label: 'Purge data', value: 'purge', danger: true },
        { label: 'Cancel', value: 'cancel' },
      ],
    });
    if (!pick || pick === 'cancel') return { ok: false, canceled: true };

    const purge = pick === 'purge';
    startProgress(id, 'uninstall');
    const splashToken = showGlobalSplash({
      title: `Uninstalling ${label}`,
      sub: purge ? 'Removing containers + deleting data...' : 'Removing containers...',
      showProgress: true,
      progress: 1,
    });

    try {
      openAppIds = openAppIds.filter((x) => x !== id);
      saveOpenApps();
      setPinnedToDrawer(id, false);
      await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/uninstall`, {
        method: 'POST',
        body: JSON.stringify({ purge }),
      });
      await refresh();
      finishProgress(id);
      if (closeOnDone) closeModal();
      return { ok: true, purge };
    } catch (err) {
      cancelProgress(id);
      await openNoticeModal({
        kind: 'Error',
        title: 'Uninstall failed',
        message: err && err.message ? String(err.message) : String(err),
        danger: true,
      });
      return { ok: false, error: err && err.message ? String(err.message) : String(err) };
    } finally {
      hideGlobalSplash(splashToken);
    }
  }

  let launcherSuppressClickUntil = 0;
  let launcherSuppressClickId = '';

  function appsPagesList() {
    const state = appsPagesState && typeof appsPagesState === 'object' ? appsPagesState : null;
    const pages = state && Array.isArray(state.pages) ? state.pages : [];
    return pages.filter((p) => p && typeof p === 'object' && String(p.id || '').trim());
  }

  function setActiveAppsPage(nextId, opts) {
    const id = String(nextId || '').trim().toLowerCase();
    const pages = appsPagesList();
    const allowAll = !!(opts && opts.allowAll);
    const valid = id && pages.some((p) => String(p.id || '').trim().toLowerCase() === id);
    if (!valid && !(allowAll && id === '__all')) return;
    activeAppsPageId = id;
    if (appsPagesState && typeof appsPagesState === 'object' && id && id !== '__all') {
      appsPagesState.active = id;
      scheduleAppsPagesSave();
    }
    renderAppsLauncher(installedAppsCache);
  }

  function stepAppsPage(dir) {
    const d = Number(dir) || 0;
    if (!d) return;
    const pages = appsPagesList();
    if (!pages.length) return;
    const ids = pages.map((p) => String(p.id || '').trim().toLowerCase()).filter((v) => v);
    const cur = String(activeAppsPageId || '').trim().toLowerCase();
    const idx = Math.max(0, ids.indexOf(cur));
    const next = ids[(idx + d + ids.length) % ids.length];
    setActiveAppsPage(next);
  }

  function renderAppsPagesTabs() {
    if (!appsPagesTabsEl) return;
    appsPagesTabsEl.innerHTML = '';
    const pages = appsPagesList();
    const cur = String(activeAppsPageId || '').trim().toLowerCase();

    const makeTab = (id, label, active, opts) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'forgeos-segment__btn';
      btn.dataset.appsPageId = id;
      btn.dataset.active = active ? '1' : '0';
      btn.textContent = label;
      btn.addEventListener('click', () => setActiveAppsPage(id, { allowAll: true }));
      if (opts && opts.title) btn.title = String(opts.title);
      appsPagesTabsEl.appendChild(btn);
    };

    for (const p of pages) {
      const id = String(p.id || '').trim().toLowerCase();
      const name = String(p.name || '').trim() || 'Page';
      makeTab(id, name, cur === id);
    }
    makeTab('__all', 'All', cur === '__all', { title: 'Alphabetical list of all installed apps' });

    if (btnAppsPagePrev) btnAppsPagePrev.disabled = pages.length <= 1;
    if (btnAppsPageNext) btnAppsPageNext.disabled = pages.length <= 1;
  }

  function launcherCreateGhost(btn, x, y) {
    if (launcherGhostEl) {
      try {
        launcherGhostEl.remove();
      } catch {}
      launcherGhostEl = null;
    }
    const ghost = btn.cloneNode(true);
    ghost.classList.add('forgeos-launcher-ghost');
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
    document.body.appendChild(ghost);
    launcherGhostEl = ghost;
  }

  function launcherClearDropHighlights() {
    if (!appsPagesTabsEl) return;
    for (const btn of Array.from(appsPagesTabsEl.querySelectorAll('[data-apps-page-id]'))) {
      btn.dataset.drop = '0';
    }
  }

  function launcherSetTabDrop(id) {
    if (!appsPagesTabsEl) return;
    launcherClearDropHighlights();
    const bid = String(id || '').trim().toLowerCase();
    const tabs = Array.from(appsPagesTabsEl.querySelectorAll('[data-apps-page-id]'));
    const tab = tabs.find((el) => el && el instanceof HTMLElement && String(el.dataset.appsPageId || '').trim().toLowerCase() === bid) || null;
    if (tab) tab.dataset.drop = '1';
  }

  function launcherCancelHoverSwitch() {
    if (launcherHoverTabTimer) window.clearTimeout(launcherHoverTabTimer);
    launcherHoverTabTimer = 0;
  }

  function launcherMaybeScheduleHoverSwitch(targetPageId) {
    launcherCancelHoverSwitch();
    const target = String(targetPageId || '').trim().toLowerCase();
    if (!target || target === '__all') return;
    if (target === String(activeAppsPageId || '').trim().toLowerCase()) return;
    launcherHoverTabTimer = window.setTimeout(() => {
      launcherHoverTabTimer = 0;
      setActiveAppsPage(target);
    }, 550);
  }

  function moveAppBetweenPages(appId, fromPageId, toPageId, toIndex) {
    if (!appsPagesState || typeof appsPagesState !== 'object') return;
    const pages = appsPagesList();
    const aid = String(appId || '').trim().toLowerCase();
    if (!aid) return;
    const fromId = String(fromPageId || '').trim().toLowerCase();
    const toId = String(toPageId || '').trim().toLowerCase();
    const from = pages.find((p) => String(p.id || '').trim().toLowerCase() === fromId) || null;
    const to = pages.find((p) => String(p.id || '').trim().toLowerCase() === toId) || null;
    if (!to) return;

    if (from && Array.isArray(from.items)) from.items = from.items.filter((v) => String(v || '').trim().toLowerCase() !== aid);
    if (!Array.isArray(to.items)) to.items = [];
    to.items = to.items.filter((v) => String(v || '').trim().toLowerCase() !== aid);
    const idx = Number.isFinite(Number(toIndex)) ? Math.max(0, Math.min(to.items.length, Number(toIndex))) : to.items.length;
    to.items.splice(idx, 0, aid);
  }

  function attachLauncherDnD(btn, appId, pageId, displayedIds) {
    const id = String(appId || '').trim().toLowerCase();
    const pid = String(pageId || '').trim().toLowerCase();
    if (!id || !btn) return;

    btn.addEventListener('pointerdown', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (e.button !== 0) return;
      if (String(activeAppsPageId || '') === '__all') return;
      if (pendingAppActions.has(id)) return;

      launcherDrag = {
        appId: id,
        fromPageId: pid,
        startX: e.clientX,
        startY: e.clientY,
        pointerId: e.pointerId,
        didDrag: false,
        targetTabId: '',
        targetIndex: -1,
        displayed: Array.isArray(displayedIds) ? displayedIds.slice() : [],
      };

      try {
        btn.setPointerCapture(e.pointerId);
      } catch {}
    });

    btn.addEventListener('pointermove', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (!launcherDrag || launcherDrag.pointerId !== e.pointerId) return;
      const dx = e.clientX - launcherDrag.startX;
      const dy = e.clientY - launcherDrag.startY;
      const dist = Math.hypot(dx, dy);
      if (!launcherDrag.didDrag && dist < 8) return;

      if (!launcherDrag.didDrag) {
        launcherDrag.didDrag = true;
        btn.classList.add('forgeos-launcher-item--dragging');
        launcherCreateGhost(btn, e.clientX, e.clientY);
      }

      if (launcherGhostEl) {
        launcherGhostEl.style.left = `${e.clientX}px`;
        launcherGhostEl.style.top = `${e.clientY}px`;
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const tab = el && el instanceof Element ? el.closest('[data-apps-page-id]') : null;
      if (tab && tab instanceof HTMLElement) {
        const tid = String(tab.dataset.appsPageId || '').trim().toLowerCase();
        launcherDrag.targetTabId = tid;
        launcherSetTabDrop(tid);
        launcherMaybeScheduleHoverSwitch(tid);
        launcherDrag.targetIndex = -1;
        return;
      }

      launcherDrag.targetTabId = '';
      launcherCancelHoverSwitch();
      launcherClearDropHighlights();

      const tile = el && el instanceof Element ? el.closest('.forgeos-launcher-item') : null;
      const overId = tile && tile instanceof HTMLElement ? String(tile.dataset.appId || '').trim().toLowerCase() : '';
      if (!overId || !Array.isArray(launcherDrag.displayed)) {
        launcherDrag.targetIndex = launcherDrag.displayed.length;
        return;
      }
      const idx = launcherDrag.displayed.indexOf(overId);
      launcherDrag.targetIndex = idx >= 0 ? idx : launcherDrag.displayed.length;
    });

    const endDrag = () => {
      if (!launcherDrag || launcherDrag.appId !== id) return;
      const didDrag = !!launcherDrag.didDrag;
      const targetTab = String(launcherDrag.targetTabId || '').trim().toLowerCase();
      const targetIndex = Number(launcherDrag.targetIndex);
      launcherDrag = null;
      launcherCancelHoverSwitch();
      launcherClearDropHighlights();
      if (launcherGhostEl) {
        try {
          launcherGhostEl.remove();
        } catch {}
        launcherGhostEl = null;
      }
      btn.classList.remove('forgeos-launcher-item--dragging');
      if (!didDrag) return;

      launcherSuppressClickUntil = Date.now() + 450;
      launcherSuppressClickId = id;

      const pages = appsPagesList();
      const from = pages.find((p) => String(p.id || '').trim().toLowerCase() === pid) || null;
      if (!from) return;

      if (targetTab && targetTab !== '__all') {
        const to = pages.find((p) => String(p.id || '').trim().toLowerCase() === targetTab) || null;
        if (to) {
          moveAppBetweenPages(id, pid, targetTab, Array.isArray(to.items) ? to.items.length : 0);
          scheduleAppsPagesSave();
          renderAppsLauncher(installedAppsCache);
          return;
        }
      }

      // Reorder within the current page.
      const items = Array.isArray(from.items) ? from.items.slice() : [];
      const fromIdx = items.findIndex((v) => String(v || '').trim().toLowerCase() === id);
      if (fromIdx < 0) return;
      items.splice(fromIdx, 1);
      let idx = Number.isFinite(targetIndex) ? Math.max(0, Math.min(items.length, targetIndex)) : items.length;
      if (Number.isFinite(targetIndex) && fromIdx < targetIndex) idx = Math.max(0, idx - 1);
      items.splice(Math.max(0, Math.min(items.length, idx)), 0, id);
      from.items = items;
      scheduleAppsPagesSave();
      renderAppsLauncher(installedAppsCache);
    };

    btn.addEventListener('pointerup', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (!launcherDrag || launcherDrag.pointerId !== e.pointerId) return;
      endDrag();
    });
    btn.addEventListener('pointercancel', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (!launcherDrag || launcherDrag.pointerId !== e.pointerId) return;
      endDrag();
    });
  }

  function renderAppsLauncher(apps) {
    if (!appsLauncherGridEl || !appsLauncherEmptyEl) return;
    appsLauncherGridEl.innerHTML = '';
    const list = Array.isArray(apps) ? apps : [];
    appsLauncherEmptyEl.classList.toggle('hidden', list.length > 0);
    if (!list.length) {
      if (appsPagesTabsEl) appsPagesTabsEl.innerHTML = '';
      return;
    }

    if (!appsPagesLoaded) {
      refreshAppsPagesState(list)
        .catch(() => {})
        .finally(() => {
          // Persist a first-run default state so other devices see the same pages.
          scheduleAppsPagesSave();
          renderAppsLauncher(installedAppsCache);
        });
      return;
    }

    appsPagesState = normalizePagesState(appsPagesState, list);
    activeAppsPageId = String(activeAppsPageId || appsPagesState.active || '').trim().toLowerCase();
    if (!activeAppsPageId) activeAppsPageId = String(appsPagesState.active || '').trim().toLowerCase();

    const pages = appsPagesList();
    const activePage = pages.find((p) => String(p.id || '').trim().toLowerCase() === String(activeAppsPageId || '').trim().toLowerCase()) || null;
    if (!activePage && pages.length) {
      activeAppsPageId = String(pages[0].id || '').trim().toLowerCase();
      appsPagesState.active = activeAppsPageId;
      scheduleAppsPagesSave();
    }

    renderAppsPagesTabs();

    const byId = new Map();
    for (const a of list) {
      if (!a || typeof a !== 'object') continue;
      const id = String(a.id || '').trim().toLowerCase();
      if (id) byId.set(id, a);
    }

    const displayAll = String(activeAppsPageId || '') === '__all';
    let ids = [];
    if (displayAll) {
      ids = Array.from(byId.keys());
      ids.sort((a, b) => {
        const ma = metaFor(a);
        const mb = metaFor(b);
        return String(ma.name || a).localeCompare(String(mb.name || b), undefined, { sensitivity: 'base' });
      });
    } else {
      const items = activePage && Array.isArray(activePage.items) ? activePage.items : [];
      ids = items.map((v) => String(v || '').trim().toLowerCase()).filter((v) => byId.has(v));
    }

    for (const id of ids) {
      const app = byId.get(id) || { id };
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

      btn.addEventListener('click', async (e) => {
        const now = Date.now();
        if (launcherSuppressClickId === id && now < launcherSuppressClickUntil) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
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

      if (!displayAll && activePage) attachLauncherDnD(btn, id, String(activePage.id || '').trim().toLowerCase(), ids);

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
              setMaskedGradientBar(fill, pctInt);
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
              const splashToken = showGlobalSplash({
                title: `Updating ${meta.name || id}`,
                sub: 'Applying update...',
                showProgress: true,
                progress: 1,
              });
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
                  await refresh();
                  reloadOpenAppFrames(id);
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
                hideGlobalSplash(splashToken);
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
          const splashToken = showGlobalSplash({
            title: `Installing ${meta.name || id}`,
            sub: 'Preparing app...',
            showProgress: true,
            progress: 1,
          });
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
          } finally {
            hideGlobalSplash(splashToken);
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
        showGlobalSplash({
          title: act === 'reboot' ? 'Restarting 5tratumOS' : 'Shutting down 5tratumOS',
          sub: 'Do not refresh or navigate away from this page.',
          dismissable: false,
        });
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

  function channelCandidates(prefer) {
    const out = [];
    const push = (v) => {
      const k = String(v || '').trim().toLowerCase();
      if (!k) return;
      if (out.includes(k)) return;
      out.push(k);
    };
    push(prefer);
    push(activeStoreChannel);
    push('main');
    push('global');
    push('dev');
    for (const entry of Array.isArray(storeCustomStores) ? storeCustomStores : []) {
      if (!entry || typeof entry !== 'object') continue;
      push(entry.slot);
    }
    return out;
  }

  async function resolveStoreAppRecord(appId, preferChannel) {
    const id = String(appId || '').trim().toLowerCase();
    if (!id) return null;

    const local = storeById.get(id) || installedStoreById.get(id) || null;
    if (local && typeof local === 'object') return { channel: String(local.channel || preferChannel || activeStoreChannel || 'main'), app: local };

    for (const ch of channelCandidates(preferChannel)) {
      try {
        const bucket = await getStoreAppsByChannel(ch);
        const app = bucket && bucket.byId ? bucket.byId.get(id) : null;
        if (app && typeof app === 'object') return { channel: String(app.channel || ch), app };
      } catch {}
    }
    return null;
  }

  async function buildInstallPlan(targetId, preferChannel) {
    const start = String(targetId || '').trim().toLowerCase();
    if (!start) return { ok: false, error: 'missing app id' };
    const visited = new Set();
    const stack = new Set();
    const order = [];
    const records = new Map();
    const unresolved = new Set();
    let cycle = false;

    async function visit(id, chHint) {
      const key = String(id || '').trim().toLowerCase();
      if (!key) return;
      if (visited.has(key)) return;
      if (stack.has(key)) {
        cycle = true;
        return;
      }
      stack.add(key);
      const rec = await resolveStoreAppRecord(key, chHint);
      if (rec && rec.app) records.set(key, rec);
      else unresolved.add(key);
      const deps = rec && rec.app && Array.isArray(rec.app.dependencies) ? rec.app.dependencies : [];
      for (const depRaw of deps) {
        const dep = String(depRaw || '').trim().toLowerCase();
        if (!dep || dep === key) continue;
        await visit(dep, rec ? rec.channel : chHint);
      }
      stack.delete(key);
      visited.add(key);
      order.push(key);
    }

    await visit(start, preferChannel);
    if (cycle) return { ok: false, error: 'dependency cycle detected' };
    if (unresolved.size) return { ok: false, error: `unresolved dependencies: ${Array.from(unresolved).join(', ')}` };
    return { ok: true, order, records };
  }

  async function installAppWithDependencies(appId, preferChannel, opts) {
    const id = String(appId || '').trim().toLowerCase();
    const options = opts && typeof opts === 'object' ? opts : {};
    const openAfter = options.openAfter === true;
    const closeModalOnDone = options.closeModalOnDone === true;

    const plan = await buildInstallPlan(id, preferChannel);
    if (!plan || plan.ok !== true) return { ok: false, error: plan && plan.error ? plan.error : 'dependency plan failed' };

    const order = Array.isArray(plan.order) ? plan.order : [];
    const toInstall = order.filter((x) => !installedById.has(x));
    const depsOnly = toInstall.filter((x) => x !== id);
    const label = metaFor(id, { prefer: 'store' }).name || id;

    if (depsOnly.length) {
      const lines = depsOnly.map((d) => `- ${metaFor(d, { prefer: 'store' }).name || d}`).join('\n');
      const ok = await openConfirmModal({
        title: `Install dependencies for ${label}?`,
        message: `This app requires:\n\n${lines}\n\nInstall and start dependencies automatically, then install ${label}.`,
        confirmText: 'Install dependencies',
        cancelText: 'Cancel',
        danger: false,
      });
      if (!ok) return { ok: false, canceled: true };
    }

    const splashToken = showGlobalSplash({
      title: `Installing ${label}`,
      sub: depsOnly.length ? `Installing dependencies (0/${depsOnly.length + 1})...` : 'Preparing app...',
      showProgress: true,
      progress: 1,
      dismissable: true,
    });

    try {
      const totalSteps = Math.max(1, toInstall.length);
      let step = 0;

      for (const currentId of order) {
        const installed = installedById.get(currentId) || null;
        const needsInstall = !installed;
        const rec = plan.records.get(currentId) || null;
        const channel = rec ? String(rec.channel || preferChannel || 'main') : String(preferChannel || 'main');

        if (needsInstall) {
          step += 1;
          startProgress(currentId, 'install');
          updateGlobalSplashProgress(Math.round((step / totalSteps) * 90));
          if (globalSplashTitleEl) globalSplashTitleEl.textContent = `Installing ${metaFor(currentId, { prefer: 'store' }).name || currentId}`;
          if (globalSplashSubEl)
            globalSplashSubEl.textContent = depsOnly.length
              ? `Installing ${step}/${totalSteps}...`
              : 'Preparing app...';

          await apiJson(`/api/v0/apps/${encodeURIComponent(currentId)}/install`, {
            method: 'POST',
            body: JSON.stringify({ channel }),
          });
          try {
            await apiAppAction(currentId, 'up');
          } catch {}
          finishProgress(currentId);
          await refreshInstalled();
        } else {
          // If installed but stopped, start it when requested as a dependency chain.
          try {
            if (!isLaunchableStatus(installed.status)) {
              pendingAppActions.set(currentId, { kind: 'up', startedAt: Date.now() });
              renderTopbarActivity();
              await apiAppAction(currentId, 'up');
              await refreshInstalled();
            }
          } catch {}
        }
      }

      updateGlobalSplashProgress(100);
      await refresh();

      if (openAfter) openApp({ id, name: metaFor(id).name || id });
      if (closeModalOnDone) closeModal();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err && err.message ? String(err.message) : String(err) };
    } finally {
      hideGlobalSplash(splashToken);
    }
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

	    const rawShots = Array.isArray(meta.screenshots) ? meta.screenshots : [];
      const logoSrc = String(meta.logo || meta.icon || '').trim().toLowerCase();
	    const shots = rawShots
        .map((shot) => String(shot || '').trim())
        .filter((shot) => {
          if (!shot) return false;
          const lower = shot.toLowerCase();
          if (logoSrc && lower === logoSrc) return false;
          if (lower.includes('/logo') || lower.includes('logo.') || lower.includes('/icon') || lower.includes('icon.')) return false;
          return true;
        });
      if (!shots.length) shots.push(makeShot(meta.name || id, meta.desc || 'Preview'));

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

      const deps = Array.isArray(meta.dependencies) ? meta.dependencies : [];
      if (deps.length) {
        const depRow = document.createElement('div');
        depRow.className = 'forgeos-modal__kv';
        const k = document.createElement('div');
        k.className = 'forgeos-modal__kv-k';
        k.textContent = 'Dependencies';
        const v = document.createElement('div');
        v.className = 'forgeos-modal__kv-v';
        v.style.display = 'flex';
        v.style.flexWrap = 'wrap';
        v.style.gap = '6px';
        deps.forEach((depId) => {
          const dep = String(depId || '').trim().toLowerCase();
          if (!dep) return;
          const chip = document.createElement('span');
          chip.className = 'axe-pill';
          const depInstalled = installedById.get(dep) || null;
          const label = metaFor(dep, { prefer: 'store' }).name || dep;
          chip.textContent = depInstalled ? `${label}` : `${label} (missing)`;
          chip.title = depInstalled ? `Installed (${depInstalled.status || 'unknown'})` : 'Not installed';
          v.appendChild(chip);
        });
        depRow.appendChild(k);
        depRow.appendChild(v);
        details.appendChild(depRow);
      }

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
            const splashToken = showGlobalSplash({
              title: `Updating ${meta.name || id}`,
              sub: 'Applying update...',
              showProgress: true,
              progress: 1,
            });
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
                await refresh();
                // Re-render this details panel so the installed version / update badge update immediately.
                openStoreModal(id);
                reloadOpenAppFrames(id);
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
            hideGlobalSplash(splashToken);
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
            startProgress(id, 'rollback');
            const splashToken = showGlobalSplash({
              title: `Rolling back ${label}`,
              sub: 'Restoring previous version...',
              showProgress: true,
              progress: 1,
            });
            try {
              await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/rollback`, {
                method: 'POST',
                body: JSON.stringify({ version: v }),
              });
              await refresh();
              finishProgress(id);
              showToast('Rollback complete', null);
            } catch (err) {
              cancelProgress(id);
              await openNoticeModal({
                kind: 'Error',
                title: 'Rollback failed',
                message: err && err.message ? String(err.message) : String(err),
                danger: true,
              });
            } finally {
              hideGlobalSplash(splashToken);
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
        const pick = await openChoiceModal({
          title: `Uninstall ${label}`,
          message:
            'Choose how to uninstall:\n\n' +
            'Keep data: removes containers, keeps app data (fast reinstall).\n' +
            'Purge data: removes containers and deletes the app data folder (recommended for a clean uninstall; irreversible).',
          kind: 'System',
          choices: [
            { label: 'Keep data', value: 'keep' },
            { label: 'Purge data', value: 'purge', danger: true },
            { label: 'Cancel', value: 'cancel' },
          ],
        });
        if (!pick || pick === 'cancel') return;

        const purge = pick === 'purge';
        btnUninstall.disabled = true;
        const prev = btnUninstall.textContent;
      btnUninstall.textContent = 'Uninstalling...';
        startProgress(id, 'uninstall');
        const splashToken = showGlobalSplash({
          title: `Uninstalling ${label}`,
          sub: purge ? 'Removing containers + deleting data...' : 'Removing containers...',
          showProgress: true,
          progress: 1,
        });
        try {
          openAppIds = openAppIds.filter((x) => x !== id);
          saveOpenApps();
          await apiJson(`/api/v0/apps/${encodeURIComponent(id)}/uninstall`, {
            method: 'POST',
            body: JSON.stringify({ purge }),
          });
          await refresh();
          finishProgress(id);
          closeModal();
        } catch (err) {
          cancelProgress(id);
          await openNoticeModal({
            kind: 'Error',
            title: 'Uninstall failed',
            message: err && err.message ? String(err.message) : String(err),
            danger: true,
          });
          btnUninstall.disabled = false;
          btnUninstall.textContent = prev;
        } finally {
          hideGlobalSplash(splashToken);
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
        try {
          btnInstall.disabled = true;
          const prev = btnInstall.textContent;
          btnInstall.textContent = 'Installing...';
          const res = await installAppWithDependencies(id, meta.channel || activeStoreChannel || 'main', {
            openAfter: true,
            closeModalOnDone: true,
          });
          if (!res || res.ok !== true) {
            if (res && res.canceled) return;
            throw new Error((res && res.error) || 'install failed');
          }
          btnInstall.textContent = prev;
        } catch (err) {
          await openNoticeModal({
            kind: 'Error',
            title: 'Install failed',
            message: err && err.message ? String(err.message) : String(err),
            danger: true,
          });
        } finally {
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
    if (isMobileLayout()) {
      toggleMobileSidebar();
      return;
    }
    const current = loadSidebarMode();
    if (current === 'manual') {
      sidebarManualOpen = !sidebarManualOpen;
      saveSidebarManualOpen(sidebarManualOpen);
      applySidebarMode('manual');
      return;
    }
    const next = current === 'collapsed' ? 'static' : 'collapsed';
    setSidebarMode(next);
  });

  btnSidebarPin?.addEventListener('click', () => {
    if (isMobileLayout()) return;
    const current = loadSidebarMode();
    setSidebarMode(current === 'static' ? 'auto' : 'static');
  });

  btnMobileMenu?.addEventListener('click', () => toggleMobileSidebar());
  mobileBackdrop?.addEventListener('click', () => setMobileSidebarOpen(false));

  document.addEventListener('click', (e) => {
    if (!isMobileLayout()) return;
    if (!document.body.classList.contains('forgeos-mobile-sidebar-open')) return;
    const target = e.target instanceof Element ? e.target.closest('.forgeos-nav-item, .forgeos-app-item') : null;
    if (target) setMobileSidebarOpen(false);
  });

  window.addEventListener('resize', () => {
    if (!isMobileLayout()) {
      setMobileSidebarOpen(false);
      applySidebarMode(loadSidebarMode());
    }
  });

  settingSidebarSelect?.addEventListener('change', () => setSidebarMode(settingSidebarSelect.value));
  settingSettingsLayoutSelect?.addEventListener('change', () => {
    settingsLayout = String(settingSettingsLayoutSelect.value || '').trim().toLowerCase() === 'split' ? 'split' : 'single';
    saveSettingsLayout(settingsLayout);
    applySettingsLayout();
    showToast('Settings layout saved', null);
  });

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

  btnUpdateCheck?.addEventListener('click', () => refreshSystemUpdateCheck({ force: true, user: true }).catch(() => {}));
  btnUpdateApply?.addEventListener('click', () => applySystemUpdate().catch(() => {}));
  btnUpdateSave?.addEventListener('click', () => saveSystemUpdateConfig().catch(() => {}));
  btnUpdateTokenClear?.addEventListener('click', () => clearSystemUpdateToken().catch(() => {}));
  btnStorageRefresh?.addEventListener('click', () => refreshStorageSettings().catch(() => {}));
  btnStorageSave?.addEventListener('click', () => saveStorageSettings().catch(() => {}));
  btnStorageOrphansScan?.addEventListener('click', () => refreshStorageOrphans({ sizes: false }).catch(() => {}));
  btnStorageOrphansScanSizes?.addEventListener('click', () => refreshStorageOrphans({ sizes: true }).catch(() => {}));
  btnStorageOrphansDelete?.addEventListener('click', () => deleteSelectedStorageOrphans().catch(() => {}));
  btnWifiToggle?.addEventListener('click', async () => {
    btnWifiToggle.disabled = true;
    const prev = btnWifiToggle.textContent;
    btnWifiToggle.textContent = 'Working...';
    try {
      await refreshWifiStatus();
      const target = !wifiStateCache.enabled;
      const res = await apiJsonTimeout(
        '/api/v0/system/wifi/toggle',
        { method: 'POST', body: JSON.stringify({ enabled: target }) },
        60000,
      ).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'toggle failed');
      if (!target && wifiNetworksEl) wifiNetworksEl.innerHTML = '';
      await refreshWifiStatus();
    } catch (e) {
      await openNoticeModal({
        kind: 'Error',
        title: 'Wi‑Fi update failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnWifiToggle.disabled = false;
      btnWifiToggle.textContent = prev;
    }
  });
  btnWifiScan?.addEventListener('click', () => scanWifiNetworks().catch(() => {}));
  btnWifiDisconnect?.addEventListener('click', async () => {
    btnWifiDisconnect.disabled = true;
    const prev = btnWifiDisconnect.textContent;
    btnWifiDisconnect.textContent = 'Disconnecting...';
    try {
      const res = await apiJsonTimeout('/api/v0/system/wifi/disconnect', { method: 'POST', body: '{}' }, 30000).catch(() => null);
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'disconnect failed');
      if (wifiNetworksEl) wifiNetworksEl.innerHTML = '';
      await refreshWifiStatus();
    } catch (e) {
      await openNoticeModal({
        kind: 'Error',
        title: 'Wi‑Fi disconnect failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnWifiDisconnect.disabled = false;
      btnWifiDisconnect.textContent = prev;
    }
  });
  btnMqttSave?.addEventListener('click', () => saveMqttConfig().catch(() => {}));
  btnDiscordSave?.addEventListener('click', () => saveDiscordConfig().catch(() => {}));
  btnWatchdogSave?.addEventListener('click', () => saveWatchdogConfig().catch(() => {}));
  mqttEnabledInput?.addEventListener('change', () => {
    setMqttInputsEnabled(!!(mqttEnabledInput && mqttEnabledInput.checked));
    saveMqttConfig().catch(() => {});
  });
  btnAuthUpdate?.addEventListener('click', async () => {
    if (!authUsernameInput || !authPasswordInput) return;
    const username = String(authUsernameInput.value || '').trim();
    const password = String(authPasswordInput.value || '');
    if (!username) {
      showToast('Username required', 'error');
      return;
    }
    if (password.trim().length < 10) {
      showToast('Password must be at least 10 characters', 'error');
      return;
    }
    btnAuthUpdate.disabled = true;
    const prev = btnAuthUpdate.textContent;
    btnAuthUpdate.textContent = 'Saving...';
    try {
      const res = await apiJson('/api/v0/auth/credentials', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (!res || res.ok !== true) throw new Error((res && res.error) || 'save failed');
      if (authPasswordInput) authPasswordInput.value = '';
      showToast('Credentials updated', null);
      await refreshAuthSettings();
    } catch (e) {
      showToast('Update failed', 'error');
      await openNoticeModal({
        kind: 'Error',
        title: 'Update failed',
        message: e && e.message ? String(e.message) : String(e),
        danger: true,
      });
    } finally {
      btnAuthUpdate.disabled = false;
      btnAuthUpdate.textContent = prev;
    }
  });

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
  btnAppsPagePrev?.addEventListener('click', () => stepAppsPage(-1));
  btnAppsPageNext?.addEventListener('click', () => stepAppsPage(1));
  btnAppsPageAdd?.addEventListener('click', async () => {
    try {
      if (!appsPagesLoaded) {
        await refreshAppsPagesState(installedAppsCache);
      }
      appsPagesState = normalizePagesState(appsPagesState, installedAppsCache);
      const pages = appsPagesList();
      const n = pages.length + 1;
      const id = newPageId();
      const name = `Page ${n}`;
      appsPagesState.pages = pages.concat([{ id, name, items: [] }]);
      appsPagesState.active = id;
      activeAppsPageId = id;
      scheduleAppsPagesSave();
      renderAppsLauncher(installedAppsCache);
    } catch (e) {
      showToast('Failed to add page', e && e.message ? String(e.message) : String(e));
    }
  });

  if (appsLauncherGridEl) {
    let swipe = null;
    appsLauncherGridEl.addEventListener(
      'pointerdown',
      (e) => {
        if (!(e instanceof PointerEvent)) return;
        if (e.pointerType !== 'touch') return;
        if (launcherDrag) return;
        const mode = String(dashboardMode || '').toLowerCase();
        if (activeViewKey !== 'dashboard' || mode !== 'appslist') return;
        const t = e.target;
        if (t && t instanceof Element && t.closest('.forgeos-launcher-item')) return;
        swipe = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, active: true };
      },
      { passive: true },
    );
    appsLauncherGridEl.addEventListener(
      'pointermove',
      (e) => {
        if (!(e instanceof PointerEvent)) return;
        if (!swipe || swipe.id !== e.pointerId) return;
        if (!swipe.active) return;
        swipe.dx = e.clientX - swipe.x;
        swipe.dy = e.clientY - swipe.y;
      },
      { passive: true },
    );
    const finish = () => {
      if (!swipe) return;
      const dx = Number(swipe.dx) || 0;
      const dy = Number(swipe.dy) || 0;
      swipe = null;
      if (Math.abs(dx) < 90) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx > 0) stepAppsPage(-1);
      else stepAppsPage(1);
    };
    appsLauncherGridEl.addEventListener('pointerup', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (!swipe || swipe.id !== e.pointerId) return;
      finish();
    });
    appsLauncherGridEl.addEventListener('pointercancel', (e) => {
      if (!(e instanceof PointerEvent)) return;
      if (!swipe || swipe.id !== e.pointerId) return;
      swipe = null;
    });
  }
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
  btnStoreCustom?.addEventListener('click', () => openCustomStoreModal().catch(() => {}));
  btnFixApp?.addEventListener('click', () => openFixAppModal().catch(() => {}));

  bindStoreChannelButtons();

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
  sidebarManualOpen = loadSidebarManualOpen();
  applySidebarMode(loadSidebarMode());
  settingsLayout = loadSettingsLayout();
  applySettingsLayout();
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

  // Render cached Fleet/Widgets immediately for a snappy first paint.
  try {
    const cachedFleet = loadFleetCache();
    if (cachedFleet) renderFleet(cachedFleet);
  } catch {}
  try {
    const cachedWidgets = loadWidgetsCache();
    if (cachedWidgets) {
      hasLoadedWidgets = true;
      lastWidgets = cachedWidgets;
      renderDashboardWidgets(lastWidgets);
      setWidgetsUpdated(cachedWidgets.time);
    }
  } catch {}

  if (kioskEnabledInput) {
    kioskEnabledInput.addEventListener('change', async () => {
      try {
        const enabled = !!kioskEnabledInput.checked;
        showToast(enabled ? 'Enabling kiosk mode...' : 'Disabling kiosk mode...', null);
        await saveConsoleSettings({ enabled, prompted: true });
        showToast('Kiosk setting saved', null);
      } catch (err) {
        showToast('Kiosk save failed', err && err.message ? err.message : String(err || ''));
        kioskEnabledInput.checked = !(kioskEnabledInput.checked);
      }
    });
  }
  async function setTopbarMode(nextMode) {
    const mode = normalizeTopbarMode(nextMode);
    uiConfigCache = { ...(uiConfigCache && typeof uiConfigCache === 'object' ? uiConfigCache : {}), topbar_mode: mode, topbar_pinned: mode === 'static' };
    if (settingTopbarSelect) settingTopbarSelect.value = mode;
    topbarTempOpen = false;
    topbarHoverOpen = false;
    applyTopbarMode();
    try {
      await saveUiConfig({ topbar_mode: mode, topbar_pinned: mode === 'static' });
      showToast('Top bar setting saved', null);
    } catch (err) {
      showToast('Top bar save failed', err && err.message ? err.message : 'error');
      await refreshUiConfig();
    }
  }

  if (settingTopbarSelect) {
    settingTopbarSelect.addEventListener('change', async () => {
      await setTopbarMode(settingTopbarSelect.value);
    });
  }

  if (btnTopbarToggle) {
    btnTopbarToggle.addEventListener('click', async (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch {}
      const mode = getTopbarMode();
      if (mode === 'manual') {
        topbarTempOpen = !topbarTempOpen;
        applyTopbarMode();
        return;
      }
      await setTopbarMode(mode === 'static' ? 'auto' : 'static');
    });
  }

  if (desktopTopbarEl) {
    desktopTopbarEl.addEventListener('mouseenter', () => {
      if (isMobileLayout()) return;
      if (getTopbarMode() !== 'auto') return;
      topbarHoverOpen = true;
      applyTopbarMode();
    });
    desktopTopbarEl.addEventListener('mouseleave', () => {
      if (isMobileLayout()) return;
      if (getTopbarMode() !== 'auto') return;
      topbarHoverOpen = false;
      applyTopbarMode();
    });
    desktopTopbarEl.addEventListener('click', (e) => {
      if (!isMobileLayout()) return;
      const mode = getTopbarMode();
      if (mode !== 'auto' && mode !== 'manual') return;
      const target = e && e.target ? e.target : null;
      if (target && target.closest && target.closest('button')) return;
      topbarTempOpen = !topbarTempOpen;
      applyTopbarMode();
    });
    document.addEventListener(
      'pointerdown',
      (e) => {
        const mode = getTopbarMode();
        if (mode !== 'auto' && mode !== 'manual') return;
        if (!topbarTempOpen) return;
        const target = e && e.target ? e.target : null;
        if (target && target.closest && target.closest('.forgeos-desktop-topbar')) return;
        topbarTempOpen = false;
        applyTopbarMode();
      },
      { capture: true },
    );
  }
  refreshStoreCustomConfig().catch(() => {});
  refreshSystemUpdateStatus().catch(() => {});
  refreshSystemUpdateConfig().catch(() => {});
  refreshAuthSettings().catch(() => {});
  refreshSystemSettings().catch(() => {});
  refreshUiConfig().catch(() => {});
  refreshSessionConfig().catch(() => {});
  refreshMqttConfig().catch(() => {});
  refreshDiscordConfig().catch(() => {});
  refreshWatchdogConfig().catch(() => {});
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
  startSystemUpdateAutoCheck(3600);
})();
