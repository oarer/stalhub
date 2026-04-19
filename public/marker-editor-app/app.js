const TILE_SIZE = 256;
const WAYPOINT_ICON_IDS = [0, 1, 2, 3, 4, 5, 6];
const WAYPOINT_ICON_NAMES = ["custom", "chest", "cross", "flag", "flash", "magnifier", "question"];
const FAR_MARKER_SCALE_THRESHOLD = 0.9;
const TINTED_ICON_CACHE_LIMIT = 24000;
const WAYPOINT_INDEX_CHUNK_PX = 1024;

const state = {
  maps: [],
  staticData: {
    map: null,
    tiles: [],
  },
  activeMap: null,
  waypoints: [],
  stagedWaypoints: [],
  scale: 0.5,
  cameraX: 0,
  cameraY: 0,
  cameraDrag: {
    active: false,
    startX: 0,
    startY: 0,
    cameraX: 0,
    cameraY: 0,
  },
  selectionBox: {
    active: false,
    startMapPx: 0,
    startMapPy: 0,
    currentMapPx: 0,
    currentMapPy: 0,
    append: false,
  },
  selectionDrag: {
    active: false,
    startMapPx: 0,
    startMapPy: 0,
    snapshot: [],
  },
  interaction: {
    lastInputAt: 0,
    idleQualityTimer: 0,
  },
  selectedIds: new Set(),
  images: new Map(),
  iconImages: new Map(),
  tintedIcons: new Map(),
  tintedIconOrder: [],
  iconMasksBySize: new Map(),
  generated: null,
  generatedBounds: null,
  waypointIndex: {
    dirty: true,
    chunkSizePx: WAYPOINT_INDEX_CHUNK_PX,
    chunks: new Map(),
    entries: [],
  },
  tileLoad: {
    total: 0,
    done: 0,
    inProgress: false,
  },
  coordConfig: {
    scale: 512,
    offsetX: 0,
    offsetZ: 0,
    invertZ: false,
  },
  renderConfig: {
    highPerfMode: false,
  },
  imageTool: {
    sourceWidth: 0,
    sourceHeight: 0,
    aspect: 1,
    aspectLocked: true,
  },
  cfgSource: {
    name: "",
    handle: null,
    loaded: false,
  },
  perf: {
    drawCallsWindow: 0,
    fps: 0,
    fpsWindowStartedAt: performance.now(),
    lastDrawMs: 0,
    avgDrawMs: 0,
    nextOverlayAt: 0,
    stats: {
      tilesVisible: 0,
      tilesReady: 0,
      tilesLoading: 0,
      tilesFailed: 0,
      generatedVisible: 0,
      waypointsVisible: 0,
      waypointsChecked: 0,
      generatedCandidates: 0,
      generatedRows: 0,
      waypointTinted: 0,
      waypointFallback: 0,
      gridLines: 0,
      selectionRings: 0,
      selectionBoxActive: false,
      tClear: 0,
      tTiles: 0,
      tGrid: 0,
      tGenerated: 0,
      tWaypoints: 0,
      tSelection: 0,
      qualityMode: "full",
      highPerfMode: false,
      selected: 0,
      zoom: 0,
    },
  },
};

const canvas = document.getElementById("viewer");
const ctx = canvas.getContext("2d");
const mapSelect = document.getElementById("map-select");
const mapStats = document.getElementById("map-stats");
const loadStats = document.getElementById("load-stats");
const waypointList = document.getElementById("waypoint-list");
const coordScaleInput = document.getElementById("coord-scale");
const offsetXInput = document.getElementById("offset-x");
const offsetZInput = document.getElementById("offset-z");
const invertZInput = document.getElementById("invert-z");
const imageInput = document.getElementById("image-input");
const sourceImageSize = document.getElementById("source-image-size");
const targetWidthInput = document.getElementById("target-width");
const targetHeightInput = document.getElementById("target-height");
const aspectLockBtn = document.getElementById("aspect-lock-btn");
const targetResolutionNote = document.getElementById("target-resolution-note");
const genIconSelect = document.getElementById("gen-icon");
const autoIconsInput = document.getElementById("auto-icons");
const highPerfModeInput = document.getElementById("high-perf-mode");
const stickerScaleInput = document.getElementById("sticker-scale");
const generateBtn = document.getElementById("generate-btn");
const clearGeneratedBtn = document.getElementById("clear-generated-btn");
const deleteSelectedBtn = document.getElementById("delete-selected-btn");
const bakeImageBtn = document.getElementById("bake-image-btn");
const bakeCfgBtn = document.getElementById("bake-cfg-btn");
const cfgFileInput = document.getElementById("cfg-file-input");
const cfgPickBtn = document.getElementById("cfg-pick-btn");
const cfgStatus = document.getElementById("cfg-status");
const genStats = document.getElementById("gen-stats");
const perfStats = document.getElementById("perf-stats");

function clampTargetDimension(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return 256;
  return Math.max(1, Math.min(4096, Math.round(raw)));
}

function getTargetResolution() {
  return {
    width: clampTargetDimension(targetWidthInput?.value),
    height: clampTargetDimension(targetHeightInput?.value),
  };
}

function renderResolutionUi() {
  if (targetResolutionNote) {
    const { width, height } = getTargetResolution();
    targetResolutionNote.textContent = `${width} x ${height}`;
  }
  if (aspectLockBtn) {
    aspectLockBtn.textContent = state.imageTool.aspectLocked ? "🔒" : "🔓";
    aspectLockBtn.title = state.imageTool.aspectLocked ? "Связь сторон включена" : "Связь сторон выключена";
  }
  if (sourceImageSize) {
    if (state.imageTool.sourceWidth > 0 && state.imageTool.sourceHeight > 0) {
      sourceImageSize.textContent = `Источник: ${state.imageTool.sourceWidth} x ${state.imageTool.sourceHeight}`;
    } else {
      sourceImageSize.textContent = "Оригинал: не загружен";
    }
  }
}

function setTargetResolution(width, height) {
  const w = clampTargetDimension(width);
  const h = clampTargetDimension(height);
  if (targetWidthInput) targetWidthInput.value = String(w);
  if (targetHeightInput) targetHeightInput.value = String(h);
  renderResolutionUi();
}

function setCfgStatus(text) {
  if (cfgStatus) cfgStatus.textContent = text;
}

function parseCfgText(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    throw new Error("CFG не является валидным JSON");
  }
  if (!Array.isArray(raw)) {
    throw new Error("CFG должен быть массивом меток");
  }
  return raw;
}

function applyWaypointsFromRaw(raw, sourceLabel = "") {
  state.waypoints = raw.map((item, index) => toDisplayWaypoint(item, index, false));
  state.stagedWaypoints = [];
  state.selectedIds.clear();
  invalidateWaypointIndex();
  renderWaypointList();
  draw();
  setCfgStatus(sourceLabel ? `CFG: ${sourceLabel} (${state.waypoints.length} меток)` : `CFG: ${state.waypoints.length} меток`);
}

async function loadWaypointsFromSelectedCfg() {
  if (!state.cfgSource.loaded) {
    state.waypoints = [];
    state.stagedWaypoints = [];
    invalidateWaypointIndex();
    renderWaypointList();
    draw();
    return;
  }
  // Данные уже загружены в память при выборе файла, здесь только перерисовываем после смены карты.
  renderWaypointList();
  draw();
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  draw();
}

function getCoordConfig() {
  return state.coordConfig;
}

function refreshCoordConfig() {
  state.coordConfig = {
    scale: Number(coordScaleInput?.value) || 512,
    offsetX: Number(offsetXInput?.value) || 0,
    offsetZ: Number(offsetZInput?.value) || 0,
    invertZ: Boolean(invertZInput?.checked),
  };
  invalidateWaypointIndex();
}

function invalidateWaypointIndex() {
  state.waypointIndex.dirty = true;
}

function buildWaypointIndex() {
  const chunkSizePx = state.waypointIndex.chunkSizePx;
  const chunks = new Map();
  const entries = [];

  const addWaypoint = (waypoint) => {
    const pos = waypointToPixel(waypoint);
    const entry = {
      waypoint,
      x: pos.x,
      y: pos.y,
      color: waypoint.color?.hex || "#ff8b5e",
      iconIndex: waypoint.iconIndex ?? 0,
    };
    entries.push(entry);

    const cx = Math.floor(entry.x / chunkSizePx);
    const cy = Math.floor(entry.y / chunkSizePx);
    const key = `${cx},${cy}`;
    const bucket = chunks.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      chunks.set(key, [entry]);
    }
  };

  for (const waypoint of state.waypoints) addWaypoint(waypoint);
  for (const waypoint of state.stagedWaypoints) addWaypoint(waypoint);

  state.waypointIndex.chunks = chunks;
  state.waypointIndex.entries = entries;
  state.waypointIndex.dirty = false;
}

function setLoadStats(text) {
  if (loadStats) {
    loadStats.textContent = text;
  }
}

function getTileCacheStats() {
  let ready = 0;
  let loading = 0;
  let failed = 0;
  for (const entry of state.images.values()) {
    if (entry.failed) {
      failed += 1;
    } else if (entry.ready) {
      ready += 1;
    } else {
      loading += 1;
    }
  }
  return { ready, loading, failed, total: state.images.size };
}

function renderPerfOverlay(now = performance.now(), force = false) {
  if (!perfStats) return;
  if (!force && now < state.perf.nextOverlayAt) return;
  state.perf.nextOverlayAt = now + 220;

  const tileCache = getTileCacheStats();
  const p = state.perf;
  const s = p.stats;

  perfStats.textContent = [
    `FPS: ${p.fps.toFixed(1)}`,
    `Кадр: ${p.lastDrawMs.toFixed(2)} ms (avg ${p.avgDrawMs.toFixed(2)} ms)`,
    `Зум: ${s.zoom.toFixed(2)}x`,
    `Этапы(ms): clear ${s.tClear.toFixed(2)} | tiles ${s.tTiles.toFixed(2)} | grid ${s.tGrid.toFixed(2)} | gen ${s.tGenerated.toFixed(2)} | wp ${s.tWaypoints.toFixed(2)} | sel ${s.tSelection.toFixed(2)}`,
    `Режим: ${s.qualityMode}, high-perf: ${s.highPerfMode ? "on" : "off"}`,
    `Тайлы в кадре: ${s.tilesVisible} (готово ${s.tilesReady}, loading ${s.tilesLoading}, fail ${s.tilesFailed})`,
    `Кэш тайлов: ${tileCache.total} (готово ${tileCache.ready}, loading ${tileCache.loading}, fail ${tileCache.failed})`,
    `Gen: draw ${s.generatedVisible}, candidates ${s.generatedCandidates}, rows ${s.generatedRows}`,
    `WP: draw ${s.waypointsVisible}/${s.waypointsChecked}, tinted ${s.waypointTinted}, fallback ${s.waypointFallback}`,
    `Grid/Select: lines ${s.gridLines}, rings ${s.selectionRings}, box ${s.selectionBoxActive ? "on" : "off"}, selected ${s.selected}`,
  ].join("\n");
}

function registerDrawPerf(drawMs, drawStats) {
  const now = performance.now();
  const p = state.perf;

  p.lastDrawMs = drawMs;
  p.avgDrawMs = p.avgDrawMs ? p.avgDrawMs * 0.82 + drawMs * 0.18 : drawMs;
  p.drawCallsWindow += 1;

  const elapsed = now - p.fpsWindowStartedAt;
  if (elapsed >= 400) {
    p.fps = (p.drawCallsWindow * 1000) / elapsed;
    p.drawCallsWindow = 0;
    p.fpsWindowStartedAt = now;
  }

  p.stats = {
    ...p.stats,
    ...drawStats,
    selected: state.selectedIds.size,
    zoom: state.scale,
    highPerfMode: state.renderConfig.highPerfMode,
  };

  renderPerfOverlay(now);
}

function markInteraction() {
  // Режим подмены иконок при движении отключён: оставляем полный рендер всегда.
}

function mapToPixel(tileX, tileZ) {
  const map = state.activeMap;
  const invertZ = getCoordConfig().invertZ;

  const px = (tileX - map.bounds.minX) * TILE_SIZE;
  const py = invertZ ? (map.bounds.maxZ - tileZ) * TILE_SIZE : (tileZ - map.bounds.minZ) * TILE_SIZE;

  return { x: px, y: py };
}

function mapPixelToTile(px, py) {
  const map = state.activeMap;
  const invertZ = getCoordConfig().invertZ;

  const tileX = px / TILE_SIZE + map.bounds.minX;
  const tileZ = invertZ ? map.bounds.maxZ - py / TILE_SIZE : py / TILE_SIZE + map.bounds.minZ;

  return { tileX, tileZ };
}

function screenToMapPixel(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const sx = clientX - rect.left;
  const sy = clientY - rect.top;

  const px = state.cameraX + (sx - canvas.clientWidth / 2) / state.scale;
  const py = state.cameraY + (sy - canvas.clientHeight / 2) / state.scale;

  return { x: px, y: py };
}

function tileToWorld(tileX, tileZ) {
  const cfg = getCoordConfig();
  return {
    x: (tileX - cfg.offsetX) * cfg.scale,
    z: (tileZ - cfg.offsetZ) * cfg.scale,
  };
}

function waypointToPixel(waypoint) {
  const cfg = getCoordConfig();
  const world = waypoint.pos;

  const tileX = world.x / cfg.scale + cfg.offsetX;
  const tileZ = world.z / cfg.scale + cfg.offsetZ;

  return mapToPixel(tileX, tileZ);
}

function waypointToTile(waypoint) {
  const cfg = getCoordConfig();
  return {
    x: waypoint.pos.x / cfg.scale + cfg.offsetX,
    z: waypoint.pos.z / cfg.scale + cfg.offsetZ,
  };
}

function getGeneratedMarkerTile(marker, generated = state.generated) {
  const scaleX = generated.scaleTiles;
  const scaleZ = generated.scaleTiles * (generated.height / generated.width);
  return {
    tileX: generated.centerTileX + marker.nx * scaleX,
    tileZ: generated.centerTileZ + marker.ny * scaleZ,
  };
}

function getEditablePoints() {
  const points = [];

  for (const waypoint of state.waypoints) {
    points.push({
      id: `wp:${waypoint.id}`,
      kind: "wp",
      waypoint,
      mapPos: waypointToPixel(waypoint),
    });
  }

  for (const waypoint of state.stagedWaypoints) {
    points.push({
      id: `staged:${waypoint.id}`,
      kind: "staged",
      waypoint,
      mapPos: waypointToPixel(waypoint),
    });
  }

  if (state.generated?.markers?.length) {
    for (let i = 0; i < state.generated.markers.length; i += 1) {
      const marker = state.generated.markers[i];
      const tile = getGeneratedMarkerTile(marker);
      points.push({
        id: `gen:${i}`,
        kind: "gen",
        markerIndex: i,
        marker,
        mapPos: mapToPixel(tile.tileX, tile.tileZ),
      });
    }
  }

  return points;
}

function drawSelectionOverlay() {
  let selectionRings = 0;
  const selected = state.selectedIds;
  if (selected.size) {
    const points = getEditablePoints();
    ctx.strokeStyle = "rgba(116, 228, 255, 0.95)";
    ctx.lineWidth = Math.max(1 / state.scale, 0.8 / state.scale);
    for (const point of points) {
      if (!selected.has(point.id)) continue;
      const r = 13 / state.scale;
      ctx.beginPath();
      ctx.arc(point.mapPos.x, point.mapPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
      selectionRings += 1;
    }
  }

  if (!state.selectionBox.active) {
    return { selectionRings, selectionBoxActive: false };
  }
  const box = state.selectionBox;
  const x = Math.min(box.startMapPx, box.currentMapPx);
  const y = Math.min(box.startMapPy, box.currentMapPy);
  const w = Math.abs(box.currentMapPx - box.startMapPx);
  const h = Math.abs(box.currentMapPy - box.startMapPy);

  ctx.fillStyle = "rgba(110, 205, 255, 0.16)";
  ctx.strokeStyle = "rgba(110, 205, 255, 0.95)";
  ctx.lineWidth = Math.max(1 / state.scale, 0.9 / state.scale);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  return { selectionRings, selectionBoxActive: true };
}

function findPointAt(mapPx, mapPy) {
  const points = getEditablePoints();
  const hitRadius = 14;
  const hitRadiusSq = hitRadius * hitRadius;
  let best = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const point of points) {
    const dx = point.mapPos.x - mapPx;
    const dy = point.mapPos.y - mapPy;
    const distSq = dx * dx + dy * dy;
    if (distSq <= hitRadiusSq && distSq < bestDist) {
      best = point;
      bestDist = distSq;
    }
  }

  return best;
}

function selectPointsInBox() {
  const box = state.selectionBox;
  const x1 = Math.min(box.startMapPx, box.currentMapPx);
  const y1 = Math.min(box.startMapPy, box.currentMapPy);
  const x2 = Math.max(box.startMapPx, box.currentMapPx);
  const y2 = Math.max(box.startMapPy, box.currentMapPy);

  if (!box.append) {
    state.selectedIds.clear();
  }
  const points = getEditablePoints();
  for (const point of points) {
    if (point.mapPos.x >= x1 && point.mapPos.x <= x2 && point.mapPos.y >= y1 && point.mapPos.y <= y2) {
      state.selectedIds.add(point.id);
    }
  }
}

function buildSelectionSnapshot() {
  const selected = state.selectedIds;
  const snapshot = [];

  for (const waypoint of state.waypoints) {
    const id = `wp:${waypoint.id}`;
    if (!selected.has(id)) continue;
    snapshot.push({
      id,
      kind: "wp",
      waypoint,
      x: waypoint.pos.x,
      z: waypoint.pos.z,
    });
  }

  for (const waypoint of state.stagedWaypoints) {
    const id = `staged:${waypoint.id}`;
    if (!selected.has(id)) continue;
    snapshot.push({
      id,
      kind: "staged",
      waypoint,
      x: waypoint.pos.x,
      z: waypoint.pos.z,
    });
  }

  if (state.generated?.markers?.length) {
    for (let i = 0; i < state.generated.markers.length; i += 1) {
      const id = `gen:${i}`;
      if (!selected.has(id)) continue;
      const marker = state.generated.markers[i];
      snapshot.push({
        id,
        kind: "gen",
        marker,
        nx: marker.nx,
        ny: marker.ny,
      });
    }
  }

  state.selectionDrag.snapshot = snapshot;
}

function applySelectionMove(deltaTileX, deltaTileZ) {
  const cfg = getCoordConfig();
  for (const item of state.selectionDrag.snapshot) {
    if (item.kind === "wp" || item.kind === "staged") {
      item.waypoint.pos.x = item.x + deltaTileX * cfg.scale;
      item.waypoint.pos.z = item.z + deltaTileZ * cfg.scale;
      continue;
    }

    if (item.kind === "gen" && state.generated) {
      const scaleX = state.generated.scaleTiles;
      const scaleZ = state.generated.scaleTiles * (state.generated.height / state.generated.width);
      item.marker.nx = item.nx + deltaTileX / Math.max(0.0001, scaleX);
      item.marker.ny = item.ny + deltaTileZ / Math.max(0.0001, scaleZ);
    }
  }

  // Позиции части вейпоинтов изменились.
  invalidateWaypointIndex();
}

function clearImageCache() {
  state.images.clear();
}

function clearTintedIconCache() {
  state.tintedIcons.clear();
  state.tintedIconOrder.length = 0;
}

function loadTileImage(tileX, tileZ) {
  const map = state.activeMap;
  const key = `${tileX},${tileZ}`;

  if (state.images.has(key)) {
    return state.images.get(key);
  }

  const image = new Image();
  const entry = { image, ready: false, failed: false };
  state.images.set(key, entry);

  image.onload = () => {
    entry.ready = true;
    draw();
  };

  image.onerror = () => {
    entry.failed = true;
    draw();
  };

  image.src = `/marker-editor-app/static_data/map/tiles/${tileX}.${tileZ}.png`;
  return entry;
}

function waitTileEntry(entry) {
  return new Promise((resolve) => {
    if (entry.ready || entry.failed) {
      resolve();
      return;
    }
    const onLoad = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      resolve();
    };
    const cleanup = () => {
      entry.image.removeEventListener("load", onLoad);
      entry.image.removeEventListener("error", onError);
    };
    entry.image.addEventListener("load", onLoad);
    entry.image.addEventListener("error", onError);
  });
}

async function preloadWholeMapTiles() {
  const map = state.activeMap;
  if (!map) return;
  const allTiles = Array.from(map.tileKeys);
  state.tileLoad.total = allTiles.length;
  state.tileLoad.done = 0;
  state.tileLoad.inProgress = true;
  setLoadStats(`Загрузка карты: 0/${state.tileLoad.total}`);

  const tasks = allTiles.map(async (key) => {
    const [sx, sz] = key.split(",");
    const entry = loadTileImage(Number(sx), Number(sz));
    await waitTileEntry(entry);
    state.tileLoad.done += 1;
    if (state.tileLoad.done % 25 === 0 || state.tileLoad.done === state.tileLoad.total) {
      setLoadStats(`Загрузка карты: ${state.tileLoad.done}/${state.tileLoad.total}`);
    }
  });

  await Promise.all(tasks);
  state.tileLoad.inProgress = false;
  setLoadStats(`Карта загружена: ${state.tileLoad.total}/${state.tileLoad.total}`);
}

function loadWaypointIcon(iconIndex) {
  const key = String(iconIndex);
  if (state.iconImages.has(key)) {
    return state.iconImages.get(key);
  }

  const image = new Image();
  const entry = { image, ready: false, failed: false };
  state.iconImages.set(key, entry);

  image.onload = () => {
    entry.ready = true;
    draw();
  };
  image.onerror = () => {
    entry.failed = true;
    draw();
  };
  image.src = `/marker-editor-app/static_data/icons/${iconIndex}.png`;
  return entry;
}

function waitWaypointIcon(iconIndex) {
  return new Promise((resolve, reject) => {
    const entry = loadWaypointIcon(iconIndex);
    if (entry.ready) {
      resolve(entry.image);
      return;
    }
    if (entry.failed) {
      reject(new Error(`Не удалось загрузить иконку ${iconIndex}`));
      return;
    }

    const onLoad = () => {
      cleanup();
      resolve(entry.image);
    };
    const onError = () => {
      cleanup();
      reject(new Error(`Не удалось загрузить иконку ${iconIndex}`));
    };
    const cleanup = () => {
      entry.image.removeEventListener("load", onLoad);
      entry.image.removeEventListener("error", onError);
    };

    entry.image.addEventListener("load", onLoad);
    entry.image.addEventListener("error", onError);
  });
}

function rgbaToHex(r, g, b) {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`;
}

function quantizeColorChannel(v, levels = 16) {
  const clamped = Math.max(0, Math.min(255, v));
  if (levels <= 1) return clamped;
  const bucket = Math.round((clamped / 255) * (levels - 1));
  return Math.round((bucket / (levels - 1)) * 255);
}

function buildGeneratedMarkerRows(generated) {
  const rows = Array.from({ length: generated.height }, () => []);
  for (let i = 0; i < generated.markers.length; i += 1) {
    const marker = generated.markers[i];
    const py = Math.max(0, Math.min(generated.height - 1, marker.py | 0));
    rows[py].push(marker);
  }
  for (const row of rows) {
    row.sort((a, b) => a.px - b.px);
  }
  generated.markerRows = rows;
}

function getVisibleGeneratedPixelBounds(generated) {
  const halfW = canvas.clientWidth / 2 / state.scale;
  const halfH = canvas.clientHeight / 2 / state.scale;
  const minVisibleX = state.cameraX - halfW;
  const maxVisibleX = state.cameraX + halfW;
  const minVisibleY = state.cameraY - halfH;
  const maxVisibleY = state.cameraY + halfH;

  const a = mapPixelToTile(minVisibleX, minVisibleY);
  const b = mapPixelToTile(maxVisibleX, maxVisibleY);
  const tileMinX = Math.min(a.tileX, b.tileX);
  const tileMaxX = Math.max(a.tileX, b.tileX);
  const tileMinZ = Math.min(a.tileZ, b.tileZ);
  const tileMaxZ = Math.max(a.tileZ, b.tileZ);

  const scaleX = generated.scaleTiles;
  const scaleZ = generated.scaleTiles * (generated.height / generated.width);
  const pxMin = Math.max(
    0,
    Math.floor(((tileMinX - generated.centerTileX) / Math.max(0.0001, scaleX) + 0.5) * generated.width) - 2
  );
  const pxMax = Math.min(
    generated.width - 1,
    Math.ceil(((tileMaxX - generated.centerTileX) / Math.max(0.0001, scaleX) + 0.5) * generated.width) + 2
  );
  const pyMin = Math.max(
    0,
    Math.floor(((tileMinZ - generated.centerTileZ) / Math.max(0.0001, scaleZ) + 0.5) * generated.height) - 2
  );
  const pyMax = Math.min(
    generated.height - 1,
    Math.ceil(((tileMaxZ - generated.centerTileZ) / Math.max(0.0001, scaleZ) + 0.5) * generated.height) + 2
  );

  return { pxMin, pxMax, pyMin, pyMax };
}

function decodeColorRaw(colorRaw) {
  const argb = Number(colorRaw) & 0xffffffff;
  return {
    argb,
    a: (argb >> 24) & 0xff,
    r: (argb >> 16) & 0xff,
    g: (argb >> 8) & 0xff,
    b: argb & 0xff,
    hex: `#${((argb >> 16) & 0xff).toString(16).padStart(2, "0").toUpperCase()}${((argb >> 8) & 0xff)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase()}${(argb & 0xff).toString(16).padStart(2, "0").toUpperCase()}`,
  };
}

function parseDisplayWaypointColor(raw) {
  let colorRaw = Number(raw.colorRaw ?? raw.color ?? -1);
  const hasColorObject = raw.color && typeof raw.color === "object" && typeof raw.color.hex === "string";

  if (hasColorObject) {
    const color = {
      argb: Number(raw.color.argb ?? 0),
      a: Number(raw.color.a ?? 255),
      r: Number(raw.color.r ?? 255),
      g: Number(raw.color.g ?? 255),
      b: Number(raw.color.b ?? 255),
      hex: raw.color.hex,
    };
    if (!Number.isFinite(colorRaw)) {
      colorRaw = ((color.a << 24) | (color.r << 16) | (color.g << 8) | color.b) | 0;
    }
    return { colorRaw, color };
  }

  if (!Number.isFinite(colorRaw)) {
    colorRaw = -1;
  }
  return { colorRaw, color: decodeColorRaw(colorRaw) };
}

function parseDisplayWaypointPos(raw) {
  return {
    x: Number(raw.pos?.x ?? 0),
    y: Number(raw.pos?.y ?? 70),
    z: Number(raw.pos?.z ?? 0),
  };
}

function toDisplayWaypoint(raw, id, fromBuffer = false) {
  const iconIndex = Number(raw.icon_index ?? raw.iconIndex ?? 0);
  const { colorRaw, color } = parseDisplayWaypointColor(raw);

  return {
    id,
    name: raw.name || (fromBuffer ? "buffer" : `WP-${id + 1}`),
    iconIndex,
    iconName: WAYPOINT_ICON_NAMES[iconIndex] || "unknown",
    colorRaw,
    color,
    type: raw.type || "manual",
    canPositionFloat: Boolean(raw.can_position_float ?? raw.canPositionFloat ?? true),
    time: Number(raw.time ?? Date.now()),
    fromBuffer,
    pos: parseDisplayWaypointPos(raw),
  };
}

function buildAlphaMaskFromImage(image, size) {
  const canvas2 = document.createElement("canvas");
  canvas2.width = size;
  canvas2.height = size;
  const c2 = canvas2.getContext("2d", { willReadFrequently: true });
  c2.clearRect(0, 0, size, size);
  c2.drawImage(image, 0, 0, size, size);
  const data = c2.getImageData(0, 0, size, size).data;
  const mask = new Uint8Array(size * size);

  let solidCount = 0;
  for (let i = 0; i < size * size; i += 1) {
    const alpha = data[i * 4 + 3];
    if (alpha > 20) {
      mask[i] = 1;
      solidCount += 1;
    }
  }

  return {
    size,
    mask,
    density: solidCount / Math.max(1, size * size),
  };
}

async function getIconMasks(size) {
  const key = String(size);
  if (state.iconMasksBySize.has(key)) {
    return state.iconMasksBySize.get(key);
  }

  const entries = [];
  for (const iconIndex of WAYPOINT_ICON_IDS) {
    const image = await waitWaypointIcon(iconIndex);
    const alpha = buildAlphaMaskFromImage(image, size);
    entries.push({ iconIndex, ...alpha });
  }
  state.iconMasksBySize.set(key, entries);
  return entries;
}

function getTintedIcon(iconIndex, colorHex) {
  const cacheKey = `${iconIndex}|${String(colorHex)}`;
  if (state.tintedIcons.has(cacheKey)) {
    return state.tintedIcons.get(cacheKey);
  }

  const iconEntry = loadWaypointIcon(iconIndex);
  if (!iconEntry.ready) {
    return null;
  }

  const base = iconEntry.image;
  const canvas2 = document.createElement("canvas");
  canvas2.width = base.naturalWidth;
  canvas2.height = base.naturalHeight;
  const c2 = canvas2.getContext("2d");
  c2.drawImage(base, 0, 0);
  c2.globalCompositeOperation = "source-in";
  c2.fillStyle = colorHex;
  c2.fillRect(0, 0, canvas2.width, canvas2.height);
  c2.globalCompositeOperation = "source-over";

  state.tintedIcons.set(cacheKey, canvas2);
  state.tintedIconOrder.push(cacheKey);
  if (state.tintedIconOrder.length > TINTED_ICON_CACHE_LIMIT) {
    const oldest = state.tintedIconOrder.shift();
    if (oldest) {
      state.tintedIcons.delete(oldest);
    }
  }
  return canvas2;
}

function drawGrid() {
  const map = state.activeMap;
  if (!map) return 0;

  const widthTiles = map.bounds.maxX - map.bounds.minX + 1;
  const heightTiles = map.bounds.maxZ - map.bounds.minZ + 1;

  ctx.strokeStyle = "rgba(120, 160, 200, 0.18)";
  ctx.lineWidth = 1 / state.scale;

  for (let x = 0; x <= widthTiles; x += 1) {
    const px = x * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, heightTiles * TILE_SIZE);
    ctx.stroke();
  }

  for (let z = 0; z <= heightTiles; z += 1) {
    const py = z * TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(widthTiles * TILE_SIZE, py);
    ctx.stroke();
  }
  return widthTiles + 1 + (heightTiles + 1);
}

function drawWaypoints(useFastMode = false) {
  if (!state.activeMap) {
    return { waypointsVisible: 0, waypointsChecked: 0, waypointTinted: 0, waypointFallback: 0 };
  }
  const totalWaypoints = state.waypoints.length + state.stagedWaypoints.length;
  if (!totalWaypoints) {
    return { waypointsVisible: 0, waypointsChecked: 0, waypointTinted: 0, waypointFallback: 0 };
  }

  const halfW = canvas.clientWidth / 2 / state.scale;
  const halfH = canvas.clientHeight / 2 / state.scale;
  const iconMargin = Math.max(12 / state.scale, 6);
  const minVisibleX = state.cameraX - halfW - iconMargin;
  const maxVisibleX = state.cameraX + halfW + iconMargin;
  const minVisibleY = state.cameraY - halfH - iconMargin;
  const maxVisibleY = state.cameraY + halfH + iconMargin;
  const useFarMode = state.scale < FAR_MARKER_SCALE_THRESHOLD || useFastMode;
  const useSimpleCircles = state.renderConfig.highPerfMode;

  let waypointsChecked = 0;
  let waypointsVisible = 0;
  let waypointTinted = 0;
  let waypointFallback = 0;

  const drawWaypoint = (waypoint, px, py, color, iconIndex) => {
    waypointsVisible += 1;
    if (useFarMode || useSimpleCircles) {
      if (useSimpleCircles) {
        const radius = 6 / state.scale;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.65)";
        ctx.lineWidth = Math.max(1 / state.scale, 0.8 / state.scale);
        ctx.stroke();
      } else {
        const s = Math.max(1 / state.scale, 0.8 / state.scale);
        ctx.fillStyle = color;
        ctx.fillRect(px - s * 0.5, py - s * 0.5, s, s);
      }
      waypointFallback += 1;
      return;
    }

    const tinted = getTintedIcon(iconIndex, color);
    if (tinted) {
      waypointTinted += 1;
      const w = tinted.width / state.scale;
      const h = tinted.height / state.scale;
      ctx.drawImage(tinted, px - w / 2, py - h / 2, w, h);
    } else {
      waypointFallback += 1;
      const radius = 6 / state.scale;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.65)";
      ctx.lineWidth = Math.max(1 / state.scale, 0.8 / state.scale);
      ctx.stroke();
    }
  };

  // Во время перетаскивания позиции меняются каждый кадр, индекс может устаревать.
  if (state.selectionDrag.active) {
    const drawCollection = (collection) => {
      for (const waypoint of collection) {
        waypointsChecked += 1;
        const pos = waypointToPixel(waypoint);
        if (
          pos.x < minVisibleX ||
          pos.x > maxVisibleX ||
          pos.y < minVisibleY ||
          pos.y > maxVisibleY
        ) {
          continue;
        }
        drawWaypoint(
          waypoint,
          pos.x,
          pos.y,
          waypoint.color?.hex || "#ff8b5e",
          waypoint.iconIndex ?? 0
        );
      }
    };

    drawCollection(state.waypoints);
    drawCollection(state.stagedWaypoints);
    return {
      waypointsVisible,
      waypointsChecked,
      waypointTinted,
      waypointFallback,
    };
  }

  if (state.waypointIndex.dirty) {
    buildWaypointIndex();
  }

  const chunkSizePx = state.waypointIndex.chunkSizePx;
  const cx1 = Math.floor(minVisibleX / chunkSizePx);
  const cx2 = Math.floor(maxVisibleX / chunkSizePx);
  const cy1 = Math.floor(minVisibleY / chunkSizePx);
  const cy2 = Math.floor(maxVisibleY / chunkSizePx);

  for (let cy = cy1; cy <= cy2; cy += 1) {
    for (let cx = cx1; cx <= cx2; cx += 1) {
      const key = `${cx},${cy}`;
      const bucket = state.waypointIndex.chunks.get(key);
      if (!bucket) continue;

      for (const entry of bucket) {
        waypointsChecked += 1;
        if (
          entry.x < minVisibleX ||
          entry.x > maxVisibleX ||
          entry.y < minVisibleY ||
          entry.y > maxVisibleY
        ) {
          continue;
        }
        drawWaypoint(entry.waypoint, entry.x, entry.y, entry.color, entry.iconIndex);
      }
    }
  }

  return {
    waypointsVisible,
    waypointsChecked,
    waypointTinted,
    waypointFallback,
  };
}

function getGeneratedRenderModes(useFastMode) {
  return {
    useFarMode: state.scale < FAR_MARKER_SCALE_THRESHOLD || useFastMode,
    useSimpleCircles: state.renderConfig.highPerfMode,
  };
}

function drawGeneratedFallbackMarker(pos, colorHex, useSimpleCircles) {
  if (useSimpleCircles) {
    const radius = 4 / state.scale;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = colorHex;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = Math.max(1 / state.scale, 0.75 / state.scale);
    ctx.stroke();
    return;
  }

  const s = Math.max(1 / state.scale, 0.7 / state.scale);
  ctx.fillStyle = colorHex;
  ctx.fillRect(pos.x - s * 0.5, pos.y - s * 0.5, s, s);
}

function drawGeneratedMarkerIcon(pos, colorHex, iconIndex) {
  const tinted = getTintedIcon(iconIndex, colorHex);
  if (tinted) {
    const w = tinted.width / state.scale;
    const h = tinted.height / state.scale;
    ctx.drawImage(tinted, pos.x - w / 2, pos.y - h / 2, w, h);
    return;
  }

  const r = 4 / state.scale;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = colorHex;
  ctx.fill();
}

function updateGeneratedBounds(generated, scaleX, scaleZ) {
  const boundMinTileX = generated.centerTileX - scaleX / 2;
  const boundMaxTileX = generated.centerTileX + scaleX / 2;
  const boundMinTileZ = generated.centerTileZ - scaleZ / 2;
  const boundMaxTileZ = generated.centerTileZ + scaleZ / 2;
  const p1 = mapToPixel(boundMinTileX, boundMinTileZ);
  const p2 = mapToPixel(boundMaxTileX, boundMaxTileZ);
  const margin = 12 / state.scale;

  state.generatedBounds = {
    minX: Math.min(p1.x, p2.x) - margin,
    minY: Math.min(p1.y, p2.y) - margin,
    maxX: Math.max(p1.x, p2.x) + margin,
    maxY: Math.max(p1.y, p2.y) + margin,
  };
}

function drawGeneratedBounds() {
  if (!state.generatedBounds) return;

  ctx.strokeStyle = "rgba(94,194,255,0.8)";
  ctx.lineWidth = Math.max(1 / state.scale, 0.8 / state.scale);
  ctx.strokeRect(
    state.generatedBounds.minX,
    state.generatedBounds.minY,
    state.generatedBounds.maxX - state.generatedBounds.minX,
    state.generatedBounds.maxY - state.generatedBounds.minY
  );
}

function drawGeneratedMarkers(useFastMode = false) {
  const generated = state.generated;
  if (!generated || !generated.markers.length) {
    state.generatedBounds = null;
    return { generatedVisible: 0, generatedCandidates: 0, generatedRows: 0 };
  }
  if (!generated.markerRows) {
    buildGeneratedMarkerRows(generated);
  }

  const selectedIconIndex = Number(genIconSelect.value) || 0;
  const useAutoIcons = autoIconsInput ? autoIconsInput.checked : true;
  generated.iconIndex = selectedIconIndex;

  const scaleX = generated.scaleTiles;
  const scaleZ = generated.scaleTiles * (generated.height / generated.width);
  const { useFarMode, useSimpleCircles } = getGeneratedRenderModes(useFastMode);
  const visible = getVisibleGeneratedPixelBounds(generated);
  let drawnCount = 0;
  let candidateCount = 0;
  let rowsVisited = 0;

  for (let py = visible.pyMin; py <= visible.pyMax; py += 1) {
    const row = generated.markerRows[py];
    if (!row || !row.length) continue;
    rowsVisited += 1;
    for (const marker of row) {
      candidateCount += 1;
      if (marker.px < visible.pxMin || marker.px > visible.pxMax) continue;

      const tileX = generated.centerTileX + marker.nx * scaleX;
      const tileZ = generated.centerTileZ + marker.ny * scaleZ;
      const pos = mapToPixel(tileX, tileZ);
      drawnCount += 1;

      if (useFarMode || useSimpleCircles) {
        drawGeneratedFallbackMarker(pos, marker.colorHex, useSimpleCircles);
        continue;
      }

      const iconIndex = useAutoIcons ? marker.iconIndex ?? selectedIconIndex : selectedIconIndex;
      drawGeneratedMarkerIcon(pos, marker.colorHex, iconIndex);
    }
  }

  updateGeneratedBounds(generated, scaleX, scaleZ);
  drawGeneratedBounds();
  return {
    generatedVisible: drawnCount,
    generatedCandidates: candidateCount,
    generatedRows: rowsVisited,
  };
}

function drawMapTiles() {
  const map = state.activeMap;
  if (!map) {
    return { tilesVisible: 0, tilesReady: 0, tilesLoading: 0, tilesFailed: 0 };
  }
  const invertZ = getCoordConfig().invertZ;

  const viewWidth = canvas.clientWidth;
  const viewHeight = canvas.clientHeight;
  const halfW = viewWidth / 2 / state.scale;
  const halfH = viewHeight / 2 / state.scale;

  const minVisibleX = state.cameraX - halfW;
  const maxVisibleX = state.cameraX + halfW;
  const minVisibleY = state.cameraY - halfH;
  const maxVisibleY = state.cameraY + halfH;

  const startTileX = Math.floor(minVisibleX / TILE_SIZE) + map.bounds.minX - 1;
  const endTileX = Math.ceil(maxVisibleX / TILE_SIZE) + map.bounds.minX + 1;

  const startTileZ = invertZ
    ? map.bounds.maxZ - Math.ceil(maxVisibleY / TILE_SIZE) - 1
    : Math.floor(minVisibleY / TILE_SIZE) + map.bounds.minZ - 1;
  const endTileZ = invertZ
    ? map.bounds.maxZ - Math.floor(minVisibleY / TILE_SIZE) + 1
    : Math.ceil(maxVisibleY / TILE_SIZE) + map.bounds.minZ + 1;
  let tilesVisible = 0;
  let tilesReady = 0;
  let tilesLoading = 0;
  let tilesFailed = 0;

  for (let z = startTileZ; z <= endTileZ; z += 1) {
    for (let x = startTileX; x <= endTileX; x += 1) {
      const tileKey = `${x},${z}`;
      if (!map.tileKeys.has(tileKey)) continue;
      tilesVisible += 1;

      const drawPos = mapToPixel(x, z);
      const entry = loadTileImage(x, z);

      if (entry.ready) {
        tilesReady += 1;
        ctx.drawImage(entry.image, drawPos.x, drawPos.y, TILE_SIZE, TILE_SIZE);
      } else {
        if (entry.failed) {
          tilesFailed += 1;
        } else {
          tilesLoading += 1;
        }
        ctx.fillStyle = entry.failed ? "#6f2f2f" : "#1a2f3f";
        ctx.fillRect(drawPos.x, drawPos.y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
  return { tilesVisible, tilesReady, tilesLoading, tilesFailed };
}

function draw() {
  const startedAt = performance.now();
  const useFastMode = false;
  const t0 = performance.now();
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  const tClear = performance.now() - t0;

  if (!state.activeMap) {
    ctx.fillStyle = "#9db1c5";
    ctx.font = "14px Segoe UI";
    ctx.fillText("Карта не выбрана", 20, 30);
    registerDrawPerf(performance.now() - startedAt, {
      tilesVisible: 0,
      tilesReady: 0,
      tilesLoading: 0,
      tilesFailed: 0,
      generatedVisible: 0,
      waypointsVisible: 0,
      waypointsChecked: 0,
      generatedCandidates: 0,
      generatedRows: 0,
      waypointTinted: 0,
      waypointFallback: 0,
      gridLines: 0,
      selectionRings: 0,
      selectionBoxActive: false,
      tClear,
      tTiles: 0,
      tGrid: 0,
      tGenerated: 0,
      tWaypoints: 0,
      tSelection: 0,
      qualityMode: useFastMode ? "fast" : "full",
    });
    return;
  }

  ctx.save();
  ctx.translate(canvas.clientWidth / 2, canvas.clientHeight / 2);
  ctx.scale(state.scale, state.scale);
  ctx.translate(-state.cameraX, -state.cameraY);

  const tTilesStart = performance.now();
  const tileStats = drawMapTiles();
  const tTiles = performance.now() - tTilesStart;

  const tGridStart = performance.now();
  const gridLines = drawGrid();
  const tGrid = performance.now() - tGridStart;

  const tGeneratedStart = performance.now();
  const generatedStats = drawGeneratedMarkers(useFastMode);
  const tGenerated = performance.now() - tGeneratedStart;

  const tWaypointsStart = performance.now();
  const waypointStats = drawWaypoints(useFastMode);
  const tWaypoints = performance.now() - tWaypointsStart;

  const tSelectionStart = performance.now();
  const selectionStats = drawSelectionOverlay();
  const tSelection = performance.now() - tSelectionStart;

  ctx.restore();
  registerDrawPerf(performance.now() - startedAt, {
    ...tileStats,
    ...generatedStats,
    ...waypointStats,
    gridLines,
    ...selectionStats,
    tClear,
    tTiles,
    tGrid,
    tGenerated,
    tWaypoints,
    tSelection,
    qualityMode: useFastMode ? "fast" : "full",
  });
}

function updateMapStats() {
  if (!state.activeMap) {
    mapStats.textContent = "";
    return;
  }

  const map = state.activeMap;
  const widthTiles = map.bounds.maxX - map.bounds.minX + 1;
  const heightTiles = map.bounds.maxZ - map.bounds.minZ + 1;

  mapStats.innerHTML = [
    `Тайлов: <b>${map.tileCount}</b>`,
    `Тип: <b>.${map.extension}</b>`,
    `X: <b>${map.bounds.minX}..${map.bounds.maxX}</b>`,
    `Z: <b>${map.bounds.minZ}..${map.bounds.maxZ}</b>`,
    `Сетка: <b>${widthTiles} x ${heightTiles}</b>`,
  ].join("<br>");
}

function renderWaypointList() {
  if (!waypointList) return;
  waypointList.innerHTML = "";
  const all = [...state.waypoints, ...state.stagedWaypoints];
  for (const waypoint of all) {
    const tile = waypointToTile(waypoint);
    const colorHex = waypoint.color?.hex || "#FFFFFF";
    const iconName = waypoint.iconName || "unknown";
    const idPrefix = waypoint.fromBuffer ? `staged:${waypoint.id}` : `wp:${waypoint.id}`;
    const selected = state.selectedIds.has(idPrefix);
    const item = document.createElement("div");
    item.className = "waypoint-item";
    item.innerHTML = `
      <div><b>${waypoint.fromBuffer ? "[B] " : ""}${waypoint.name}</b> (icon ${waypoint.iconIndex}: ${iconName}) ${
        selected ? "<b>[selected]</b>" : ""
      }</div>
      <div>Цвет: <span class="color-swatch" style="background:${colorHex}"></span> ${colorHex}</div>
      <div>X: ${waypoint.pos.x.toFixed(2)} Y: ${waypoint.pos.y.toFixed(2)} Z: ${waypoint.pos.z.toFixed(2)}</div>
      <div>Tile X: ${tile.x.toFixed(2)} Tile Z: ${tile.z.toFixed(2)}</div>
    `;
    waypointList.appendChild(item);
  }
}

function fitToMap() {
  if (!state.activeMap) return;

  const map = state.activeMap;
  const width = (map.bounds.maxX - map.bounds.minX + 1) * TILE_SIZE;
  const height = (map.bounds.maxZ - map.bounds.minZ + 1) * TILE_SIZE;

  state.cameraX = width / 2;
  state.cameraY = height / 2;

  const scaleX = (canvas.clientWidth * 0.92) / width;
  const scaleY = (canvas.clientHeight * 0.92) / height;
  state.scale = Math.max(0.08, Math.min(2.2, Math.min(scaleX, scaleY)));
}

function updateGeneratedStats(text) {
  if (genStats) {
    genStats.textContent = text;
  } else {
    setLoadStats(text);
  }
}

function currentCenterTile() {
  const centerPxX = state.cameraX;
  const centerPxY = state.cameraY;
  const center = mapPixelToTile(centerPxX, centerPxY);
  return center;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    image.src = url;
  });
}

function prepareImageData(image, targetWidth = 256, targetHeight = 256) {
  const width = clampTargetDimension(targetWidth);
  const height = clampTargetDimension(targetHeight);
  const canvas2 = document.createElement("canvas");
  canvas2.width = width;
  canvas2.height = height;
  const c2 = canvas2.getContext("2d", { willReadFrequently: true });
  // Намеренно растягиваем в заданный рендер, чтобы детализация зависела от выбранного разрешения.
  c2.drawImage(image, 0, 0, width, height);
  return c2.getImageData(0, 0, width, height);
}

function generateUniformMarkers(imageData, { useAutoIcons, fixedIconIndex }) {
  const { width, height, data } = imageData;
  const markers = [];
  let autoCursor = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a < 22) continue;

      const r = quantizeColorChannel(data[idx], 16);
      const g = quantizeColorChannel(data[idx + 1], 16);
      const b = quantizeColorChannel(data[idx + 2], 16);
      let iconIndex = fixedIconIndex;

      if (useAutoIcons) {
        iconIndex = WAYPOINT_ICON_IDS[autoCursor % WAYPOINT_ICON_IDS.length];
        autoCursor += 1;
      }

      markers.push({
        px: x,
        py: y,
        nx: (x + 0.5) / width - 0.5,
        ny: (y + 0.5) / height - 0.5,
        area: 1,
        r,
        g,
        b,
        colorHex: rgbaToHex(r, g, b),
        iconIndex,
      });
    }
  }

  return markers;
}

function applyIconStrategyToMarkers(markers, useAutoIcons, fixedIconIndex) {
  if (!Array.isArray(markers)) return;
  if (!useAutoIcons) {
    for (const marker of markers) {
      marker.iconIndex = fixedIconIndex;
    }
    return;
  }

  for (let i = 0; i < markers.length; i += 1) {
    markers[i].iconIndex = WAYPOINT_ICON_IDS[i % WAYPOINT_ICON_IDS.length];
  }
}

function makeTargetMask(imageData, alphaThreshold = 22) {
  const { width, height, data } = imageData;
  const mask = new Uint8Array(width * height);
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = y * width + x;
      const alpha = data[idx * 4 + 3];
      if (alpha >= alphaThreshold) {
        mask[idx] = 1;
        count += 1;
      }
    }
  }

  return { mask, count };
}

function scoreStampPlacement(targetMask, coveredMask, width, height, cx, cy, iconMask) {
  const half = Math.floor(iconMask.size / 2);
  let gain = 0;
  let spill = 0;
  let overlap = 0;

  for (let iy = 0; iy < iconMask.size; iy += 1) {
    for (let ix = 0; ix < iconMask.size; ix += 1) {
      if (!iconMask.mask[iy * iconMask.size + ix]) continue;

      const x = cx + ix - half;
      const y = cy + iy - half;
      if (x < 0 || y < 0 || x >= width || y >= height) {
        spill += 1;
        continue;
      }

      const idx = y * width + x;
      const target = targetMask[idx] === 1;
      if (target) {
        overlap += 1;
        if (!coveredMask[idx]) {
          gain += 1;
        }
      } else {
        spill += 1;
      }
    }
  }

  // Счёт: награждаем за новое покрытие, немного за удержание внутри цели,
  // и штрафуем за "пролив" в пустые зоны.
  const score = gain * 1.25 + overlap * 0.25 - spill * 0.5;
  return { score, gain };
}

function paintStampCoverage(coveredMask, targetMask, width, height, cx, cy, iconMask) {
  const half = Math.floor(iconMask.size / 2);
  let gain = 0;

  for (let iy = 0; iy < iconMask.size; iy += 1) {
    for (let ix = 0; ix < iconMask.size; ix += 1) {
      if (!iconMask.mask[iy * iconMask.size + ix]) continue;

      const x = cx + ix - half;
      const y = cy + iy - half;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;

      const idx = y * width + x;
      if (targetMask[idx] && !coveredMask[idx]) {
        gain += 1;
      }
      coveredMask[idx] = 1;
    }
  }

  return gain;
}

function sampleRgb(imageData, x, y, radius = 1) {
  const { width, height, data } = imageData;
  const x1 = Math.max(0, x - radius);
  const y1 = Math.max(0, y - radius);
  const x2 = Math.min(width - 1, x + radius);
  const y2 = Math.min(height - 1, y + radius);

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let yy = y1; yy <= y2; yy += 1) {
    for (let xx = x1; xx <= x2; xx += 1) {
      const idx = (yy * width + xx) * 4;
      const alpha = data[idx + 3];
      if (alpha < 22) continue;
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      count += 1;
    }
  }

  if (!count) {
    const idx = (Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
  }

  return {
    r: Math.round(sumR / count),
    g: Math.round(sumG / count),
    b: Math.round(sumB / count),
  };
}

function chooseBestMaskAt(targetMask, coveredMask, width, height, x, y, candidateMasks) {
  let bestMask = candidateMasks[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestGain = 0;

  for (const iconMask of candidateMasks) {
    const scoreInfo = scoreStampPlacement(targetMask, coveredMask, width, height, x, y, iconMask);
    if (scoreInfo.score > bestScore) {
      bestScore = scoreInfo.score;
      bestGain = scoreInfo.gain;
      bestMask = iconMask;
    }
  }

  return { iconMask: bestMask, score: bestScore, gain: bestGain };
}

function findNearestTargetPixel(targetMask, coveredMask, width, height, sx, sy, radius, preferUncovered = true) {
  const x0 = Math.max(0, sx - radius);
  const y0 = Math.max(0, sy - radius);
  const x1 = Math.min(width - 1, sx + radius);
  const y1 = Math.min(height - 1, sy + radius);

  let best = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const idx = y * width + x;
      if (!targetMask[idx]) continue;
      if (preferUncovered && coveredMask[idx]) continue;

      const dx = x - sx;
      const dy = y - sy;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = { x, y };
      }
    }
  }

  return best;
}

function buildIntegral(imageData) {
  const { width, height, data } = imageData;
  const W = width + 1;
  const H = height + 1;
  const size = W * H;

  const sumR = new Float64Array(size);
  const sumG = new Float64Array(size);
  const sumB = new Float64Array(size);
  const sumA = new Float64Array(size);
  const sumR2 = new Float64Array(size);
  const sumG2 = new Float64Array(size);
  const sumB2 = new Float64Array(size);

  for (let y = 1; y <= height; y += 1) {
    for (let x = 1; x <= width; x += 1) {
      const src = ((y - 1) * width + (x - 1)) * 4;
      const r = data[src];
      const g = data[src + 1];
      const b = data[src + 2];
      const a = data[src + 3];

      const i = y * W + x;
      const left = i - 1;
      const top = i - W;
      const topLeft = top - 1;

      sumR[i] = r + sumR[left] + sumR[top] - sumR[topLeft];
      sumG[i] = g + sumG[left] + sumG[top] - sumG[topLeft];
      sumB[i] = b + sumB[left] + sumB[top] - sumB[topLeft];
      sumA[i] = a + sumA[left] + sumA[top] - sumA[topLeft];

      sumR2[i] = r * r + sumR2[left] + sumR2[top] - sumR2[topLeft];
      sumG2[i] = g * g + sumG2[left] + sumG2[top] - sumG2[topLeft];
      sumB2[i] = b * b + sumB2[left] + sumB2[top] - sumB2[topLeft];
    }
  }

  return { width, height, W, sumR, sumG, sumB, sumA, sumR2, sumG2, sumB2 };
}

function regionSum(arr, W, x, y, w, h) {
  const x1 = x;
  const y1 = y;
  const x2 = x + w;
  const y2 = y + h;
  return arr[y2 * W + x2] - arr[y1 * W + x2] - arr[y2 * W + x1] + arr[y1 * W + x1];
}

function regionStats(integral, x, y, w, h) {
  const n = w * h;
  const sR = regionSum(integral.sumR, integral.W, x, y, w, h);
  const sG = regionSum(integral.sumG, integral.W, x, y, w, h);
  const sB = regionSum(integral.sumB, integral.W, x, y, w, h);
  const sA = regionSum(integral.sumA, integral.W, x, y, w, h);
  const sR2 = regionSum(integral.sumR2, integral.W, x, y, w, h);
  const sG2 = regionSum(integral.sumG2, integral.W, x, y, w, h);
  const sB2 = regionSum(integral.sumB2, integral.W, x, y, w, h);

  const mR = sR / n;
  const mG = sG / n;
  const mB = sB / n;
  const mA = sA / n;

  const vR = Math.max(0, sR2 / n - mR * mR);
  const vG = Math.max(0, sG2 / n - mG * mG);
  const vB = Math.max(0, sB2 / n - mB * mB);

  return {
    r: mR,
    g: mG,
    b: mB,
    a: mA,
    variance: vR + vG + vB,
  };
}

function makeNode(integral, x, y, w, h) {
  const stats = regionStats(integral, x, y, w, h);
  return { x, y, w, h, ...stats };
}

function splitNode(integral, node) {
  const w1 = Math.floor(node.w / 2);
  const h1 = Math.floor(node.h / 2);
  const w2 = node.w - w1;
  const h2 = node.h - h1;

  if (w1 < 1 || h1 < 1 || w2 < 1 || h2 < 1) {
    return [];
  }

  return [
    makeNode(integral, node.x, node.y, w1, h1),
    makeNode(integral, node.x + w1, node.y, w2, h1),
    makeNode(integral, node.x, node.y + h1, w1, h2),
    makeNode(integral, node.x + w1, node.y + h1, w2, h2),
  ];
}

function generateAdaptiveMarkers(imageData, { resolution, maxMarkers }) {
  const integral = buildIntegral(imageData);
  const resolutionLevel = Math.max(64, Math.min(1024, resolution));
  const detailLevel = Math.round(((resolutionLevel - 64) / (1024 - 64)) * 300);
  const minAlpha = 16;
  const minCell = detailLevel > 210 ? 1 : detailLevel > 140 ? 2 : detailLevel > 80 ? 3 : 4;
  const varianceThreshold = Math.max(120, (145 - detailLevel * 0.68) * 18);

  const leaves = [makeNode(integral, 0, 0, imageData.width, imageData.height)];

  while (true) {
    let bestIndex = -1;
    let bestVar = -1;

    for (let i = 0; i < leaves.length; i += 1) {
      const node = leaves[i];
      const canSplit = node.w > minCell * 2 && node.h > minCell * 2;
      if (!canSplit) continue;
      if (node.a < minAlpha) continue;
      if (node.variance > bestVar) {
        bestVar = node.variance;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) break;
    if (bestVar < varianceThreshold) break;
    if (leaves.length + 3 > maxMarkers) break;

    const node = leaves[bestIndex];
    const parts = splitNode(integral, node);
    if (!parts.length) break;

    leaves.splice(bestIndex, 1, ...parts);
  }

  const markers = [];
  for (const node of leaves) {
    if (node.a < minAlpha) continue;

    const r = Math.max(0, Math.min(255, Math.round(node.r)));
    const g = Math.max(0, Math.min(255, Math.round(node.g)));
    const b = Math.max(0, Math.min(255, Math.round(node.b)));

    const px = Math.max(0, Math.min(imageData.width - 1, Math.round(node.x + node.w / 2)));
    const py = Math.max(0, Math.min(imageData.height - 1, Math.round(node.y + node.h / 2)));
    markers.push({
      px,
      py,
      nx: (node.x + node.w / 2) / imageData.width - 0.5,
      ny: (node.y + node.h / 2) / imageData.height - 0.5,
      area: node.w * node.h,
      colorHex: rgbaToHex(r, g, b),
      r,
      g,
      b,
    });
  }

  markers.sort((a, b) => b.area - a.area);
  return markers.slice(0, maxMarkers);
}

function buildCoverageMarkerFromPixel(imageData, width, height, near) {
  const rgb = sampleRgb(imageData, near.x, near.y, 1);
  return {
    px: near.x,
    py: near.y,
    nx: (near.x + 0.5) / width - 0.5,
    ny: (near.y + 0.5) / height - 0.5,
    area: 1,
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    colorHex: rgbaToHex(rgb.r, rgb.g, rgb.b),
  };
}
function isTooCloseToPlacedPoints(placedPoints, point, minDistSq, lookback = 180) {
  for (let i = placedPoints.length - 1; i >= 0 && i >= placedPoints.length - lookback; i -= 1) {
    const p = placedPoints[i];
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    if (dx * dx + dy * dy < minDistSq) {
      return true;
    }
  }
  return false;
}
function placeCoverageMarker(ctx, marker, iconMask) {
  marker.iconIndex = iconMask.iconIndex;
  ctx.coveredTarget += paintStampCoverage(
    ctx.coveredMask,
    ctx.targetMask,
    ctx.width,
    ctx.height,
    marker.px,
    marker.py,
    iconMask
  );
  ctx.positioned.push(marker);
  ctx.placedPoints.push({ x: marker.px, y: marker.py });
}
function tryPlaceCoverageMarkerAt(ctx, near, enforceDistance = true) {
  if (!near) return false;
  if (enforceDistance && isTooCloseToPlacedPoints(ctx.placedPoints, near, ctx.minDistSq)) {
    return false;
  }
  const best = chooseBestMaskAt(
    ctx.targetMask,
    ctx.coveredMask,
    ctx.width,
    ctx.height,
    near.x,
    near.y,
    ctx.candidateMasks
  );
  if (best.gain <= 0) return false;
  const marker = buildCoverageMarkerFromPixel(ctx.imageData, ctx.width, ctx.height, near);
  placeCoverageMarker(ctx, marker, best.iconMask);
  return true;
}
function runCoverageGridPass(ctx) {
  for (let gy = 0; gy < ctx.height && ctx.positioned.length < ctx.maxMarkers; gy += ctx.baseStep) {
    const row = Math.floor(gy / ctx.baseStep);
    const shift = row % 2 === 0 ? 0 : Math.floor(ctx.baseStep / 2);
    for (let gx = shift; gx < ctx.width && ctx.positioned.length < ctx.maxMarkers; gx += ctx.baseStep) {
      const near = findNearestTargetPixel(
        ctx.targetMask,
        ctx.coveredMask,
        ctx.width,
        ctx.height,
        gx,
        gy,
        Math.max(2, ctx.baseStep),
        true
      );
      tryPlaceCoverageMarkerAt(ctx, near, true);
    }
  }
}
function getBestUncoveredCell(ctx) {
  let bestCell = null;
  let bestUncoveredRatio = 0;
  for (let y0 = 0; y0 < ctx.height; y0 += ctx.cellSize) {
    for (let x0 = 0; x0 < ctx.width; x0 += ctx.cellSize) {
      const x1 = Math.min(ctx.width, x0 + ctx.cellSize);
      const y1 = Math.min(ctx.height, y0 + ctx.cellSize);
      let targetPixels = 0;
      let uncoveredPixels = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const idx = y * ctx.width + x;
          if (!ctx.targetMask[idx]) continue;
          targetPixels += 1;
          if (!ctx.coveredMask[idx]) {
            uncoveredPixels += 1;
          }
        }
      }
      if (!targetPixels) continue;
      const uncoveredRatio = uncoveredPixels / targetPixels;
      if (uncoveredRatio < ctx.minCellUncoveredRatio) continue;
      if (uncoveredRatio > bestUncoveredRatio) {
        bestUncoveredRatio = uncoveredRatio;
        bestCell = { x0, y0, x1, y1 };
      }
    }
  }
  return bestCell;
}
function getUncoveredCellCentroid(cell, targetMask, coveredMask, width) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = cell.y0; y < cell.y1; y += 1) {
    for (let x = cell.x0; x < cell.x1; x += 1) {
      const idx = y * width + x;
      if (targetMask[idx] && !coveredMask[idx]) {
        sumX += x;
        sumY += y;
        count += 1;
      }
    }
  }
  if (!count) return null;
  return { x: Math.round(sumX / count), y: Math.round(sumY / count) };
}
function runCoverageFillPass(ctx) {
  while (ctx.positioned.length < ctx.maxMarkers && ctx.coveredTarget / ctx.targetCount < ctx.targetCoverage) {
    const bestCell = getBestUncoveredCell(ctx);
    if (!bestCell) break;
    const centroid = getUncoveredCellCentroid(bestCell, ctx.targetMask, ctx.coveredMask, ctx.width);
    if (!centroid) break;
    const near = findNearestTargetPixel(
      ctx.targetMask,
      ctx.coveredMask,
      ctx.width,
      ctx.height,
      centroid.x,
      centroid.y,
      Math.max(2, Math.floor(ctx.cellSize / 2)),
      true
    );
    if (!tryPlaceCoverageMarkerAt(ctx, near, false)) {
      break;
    }
  }
}
async function optimizeMarkersForCoverage(imageData, baseMarkers, { resolution, maxMarkers, useAutoIcons, fixedIconIndex }) {
  const { width, height } = imageData;
  const resolutionLevel = Math.max(64, Math.min(1024, resolution));
  const detailLevel = Math.round(((resolutionLevel - 64) / (1024 - 64)) * 300);
  const { mask: targetMask, count: targetCount } = makeTargetMask(imageData);
  const coveredMask = new Uint8Array(width * height);
  const stampSize = Math.max(7, Math.min(18, Math.round(12 - detailLevel * 0.022)));
  const iconMasks = await getIconMasks(stampSize);
  const candidateMasks = useAutoIcons ? iconMasks : iconMasks.filter((item) => item.iconIndex === fixedIconIndex);
  const positioned = [];
  if (!targetCount || !candidateMasks.length) {
    return baseMarkers;
  }
  const targetCoverage = Math.max(0.9, Math.min(0.997, 0.9 + detailLevel * 0.00045));
  const estimatedSpacing = Math.max(2, Math.sqrt(targetCount / Math.max(1, maxMarkers)));
  const densityScale =
    detailLevel > 100
      ? 1 - Math.min(0.48, ((detailLevel - 100) / 200) * 0.48)
      : 1 + Math.min(0.16, ((100 - detailLevel) / 100) * 0.16);
  const baseStep = Math.max(2, Math.round(estimatedSpacing * densityScale));
  const minDist = Math.max(1.25, baseStep * 0.58);
  const ctxCoverage = {
    imageData,
    width,
    height,
    targetMask,
    coveredMask,
    targetCount,
    candidateMasks,
    positioned,
    placedPoints: [],
    maxMarkers,
    targetCoverage,
    baseStep,
    minDistSq: minDist * minDist,
    cellSize: Math.max(5, Math.round(baseStep * 1.9)),
    minCellUncoveredRatio: detailLevel >= 180 ? 0.035 : detailLevel >= 100 ? 0.05 : detailLevel >= 70 ? 0.08 : 0.06,
    coveredTarget: 0,
  };
  runCoverageGridPass(ctxCoverage);
  runCoverageFillPass(ctxCoverage);
  return positioned;
}
function buildGeneratedWaypoints() {
  const generated = state.generated;
  if (!generated) return [];

  const now = Date.now();
  const scaleX = generated.scaleTiles;
  const scaleZ = generated.scaleTiles * (generated.height / generated.width);
  const useAutoIcons = autoIconsInput ? autoIconsInput.checked : true;

  return generated.markers.map((marker, index) => {
    const tileX = generated.centerTileX + marker.nx * scaleX;
    const tileZ = generated.centerTileZ + marker.ny * scaleZ;
    const world = tileToWorld(tileX, tileZ);
    const colorRaw = ((255 << 24) | (marker.r << 16) | (marker.g << 8) | marker.b) | 0;

    return {
      color: colorRaw,
      can_position_float: true,
      time: now + index,
      icon_index: useAutoIcons ? marker.iconIndex ?? generated.iconIndex : generated.iconIndex,
      pos: {
        x: Number(world.x.toFixed(3)),
        y: 70.0,
        z: Number(world.z.toFixed(3)),
      },
      name: "",
      type: "manual",
    };
  });
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function generateFromImage() {
  const file = imageInput.files?.[0];
  if (!file) {
    updateGeneratedStats("Выбери картинку для генерации");
    return;
  }

  const target = getTargetResolution();
  const fixedIconIndex = Number(genIconSelect.value) || 0;
  const useAutoIcons = autoIconsInput ? autoIconsInput.checked : true;

  updateGeneratedStats("Генерация: равномерный посев точек...");

  try {
    const image = await loadImageFromFile(file);
    const imageData = prepareImageData(image, target.width, target.height);
    const markers = generateUniformMarkers(imageData, { useAutoIcons, fixedIconIndex });

    const center = currentCenterTile();
    state.generated = {
      fileName: file.name,
      sourceImageData: imageData,
      width: imageData.width,
      height: imageData.height,
      markers,
      resolution: target.width,
      centerTileX: center.tileX,
      centerTileZ: center.tileZ,
      scaleTiles: Math.max(0.2, Number(stickerScaleInput.value) || 1),
      iconIndex: fixedIconIndex,
      useAutoIcons,
    };
    buildGeneratedMarkerRows(state.generated);

    updateGeneratedStats(`Готово: ${markers.length} меток, рендер ${imageData.width}x${imageData.height}`);
    draw();
  } catch (error) {
    console.error(error);
    updateGeneratedStats(`Ошибка генерации: ${error.message}`);
  }
}

function clearGenerated() {
  state.generated = null;
  state.generatedBounds = null;
  updateGeneratedStats("Нет сгенерированных меток");
  draw();
}

function bakeImageToBuffer() {
  if (!state.generated || !state.generated.markers.length) {
    updateGeneratedStats("Нечего запекать из картинки");
    return;
  }

  const data = buildGeneratedWaypoints();
  const startIndex = state.stagedWaypoints.length;
  for (let i = 0; i < data.length; i += 1) {
    state.stagedWaypoints.push(toDisplayWaypoint(data[i], startIndex + i, true));
  }

  state.generated = null;
  state.generatedBounds = null;
  state.selectedIds.clear();
  invalidateWaypointIndex();
  renderWaypointList();
  draw();
  updateGeneratedStats(`Запечено в буфер: +${data.length} (в буфере ${state.stagedWaypoints.length})`);
}

function buildCfgPayload() {
  const payload = [];
  const now = Date.now();
  let cursor = 0;

  const pushWaypoint = (waypoint) => {
    payload.push({
      color: Number(waypoint.colorRaw ?? -1),
      can_position_float: Boolean(waypoint.canPositionFloat ?? true),
      time: Number(waypoint.time ?? now + cursor),
      icon_index: Number(waypoint.iconIndex ?? 0),
      pos: {
        x: Number(waypoint.pos.x.toFixed(3)),
        y: Number(waypoint.pos.y.toFixed(3)),
        z: Number(waypoint.pos.z.toFixed(3)),
      },
      name: waypoint.name || "",
      type: waypoint.type || "manual",
    });
    cursor += 1;
  };

  for (const waypoint of state.waypoints) pushWaypoint(waypoint);
  for (const waypoint of state.stagedWaypoints) pushWaypoint(waypoint);
  return payload;
}

function reindexWaypointCollection(list) {
  for (let i = 0; i < list.length; i += 1) {
    list[i].id = i;
  }
}

function deleteSelectedMarkers() {
  if (!state.selectedIds.size) {
    updateGeneratedStats("Нет выделенных меток для удаления");
    return;
  }

  let removed = 0;

  const keptWaypoints = [];
  for (const waypoint of state.waypoints) {
    const id = `wp:${waypoint.id}`;
    if (state.selectedIds.has(id)) {
      removed += 1;
      continue;
    }
    keptWaypoints.push(waypoint);
  }
  state.waypoints = keptWaypoints;
  reindexWaypointCollection(state.waypoints);

  const keptStaged = [];
  for (const waypoint of state.stagedWaypoints) {
    const id = `staged:${waypoint.id}`;
    if (state.selectedIds.has(id)) {
      removed += 1;
      continue;
    }
    keptStaged.push(waypoint);
  }
  state.stagedWaypoints = keptStaged;
  reindexWaypointCollection(state.stagedWaypoints);

  if (state.generated?.markers?.length) {
    const keptMarkers = [];
    for (let i = 0; i < state.generated.markers.length; i += 1) {
      const id = `gen:${i}`;
      if (state.selectedIds.has(id)) {
        removed += 1;
        continue;
      }
      keptMarkers.push(state.generated.markers[i]);
    }
    state.generated.markers = keptMarkers;
    if (!state.generated.markers.length) {
      state.generated = null;
      state.generatedBounds = null;
    } else {
      buildGeneratedMarkerRows(state.generated);
    }
  }

  state.selectedIds.clear();
  invalidateWaypointIndex();
  renderWaypointList();
  draw();
  updateGeneratedStats(`Удалено меток: ${removed}`);
}

async function bakeCfg() {
  const payload = buildCfgPayload();
  try {
    if (
      state.cfgSource.handle &&
      typeof window.showSaveFilePicker === "function"
    ) {
      const writable = await state.cfgSource.handle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
      state.cfgSource.loaded = true;
      setCfgStatus(`CFG: ${state.cfgSource.name || "файл"} (${payload.length} меток)`);
    } else {
      downloadJson("waypoints.cfg", payload);
      setCfgStatus(`CFG: экспортирован в загрузки (${payload.length} меток)`);
    }

    state.stagedWaypoints = [];
    state.selectedIds.clear();
    state.waypoints = payload.map((item, index) => toDisplayWaypoint(item, index, false));
    invalidateWaypointIndex();
    renderWaypointList();
    draw();
    updateGeneratedStats(`Сохранено в cfg: ${payload.length} меток`);
  } catch (error) {
    console.error(error);
    updateGeneratedStats(`Ошибка записи cfg: ${error.message}`);
  }
}

async function pickCfgFile() {
  if (typeof window.showOpenFilePicker === "function") {
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: "Waypoints CFG/JSON",
            accept: { "application/json": [".json", ".cfg"], "text/plain": [".cfg", ".json"] },
          },
        ],
      });
      if (!handle) return;
      const file = await handle.getFile();
      const text = await file.text();
      const raw = parseCfgText(text);
      state.cfgSource.handle = handle;
      state.cfgSource.name = file.name;
      state.cfgSource.loaded = true;
      applyWaypointsFromRaw(raw, file.name);
      return;
    } catch (error) {
      if (error && error.name === "AbortError") return;
      console.error(error);
      setCfgStatus(`CFG: ошибка (${error.message})`);
      return;
    }
  }

  cfgFileInput?.click();
}

async function onCfgFileInputChanged() {
  const file = cfgFileInput?.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const raw = parseCfgText(text);
    state.cfgSource.handle = null;
    state.cfgSource.name = file.name;
    state.cfgSource.loaded = true;
    applyWaypointsFromRaw(raw, file.name);
  } catch (error) {
    console.error(error);
    setCfgStatus(`CFG: ошибка (${error.message})`);
  }
}

async function refreshGeneratedIconStrategy() {
  if (!state.generated || !state.generated.sourceImageData) return;

  const useAutoIcons = autoIconsInput ? autoIconsInput.checked : true;
  const fixedIconIndex = Number(genIconSelect.value) || 0;
  state.generated.useAutoIcons = useAutoIcons;
  state.generated.iconIndex = fixedIconIndex;
  updateGeneratedStats("Обновляю иконки...");

  try {
    applyIconStrategyToMarkers(state.generated.markers, useAutoIcons, fixedIconIndex);
    updateGeneratedStats(`Обновлено: ${state.generated.markers.length} меток`);
    draw();
  } catch (error) {
    console.error(error);
    updateGeneratedStats(`Ошибка пересчёта: ${error.message}`);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function loadMaps() {
  const data = await fetchJson("/marker-editor-app/static_data/map/manifest.json");
  state.staticData.map = data.map;
  state.staticData.tiles = data.tiles || [];
  state.maps = data.map ? [data.map] : [];

  if (mapSelect) {
    mapSelect.innerHTML = "";
    for (const map of state.maps) {
      const option = document.createElement("option");
      option.value = map.id;
      option.textContent = `${map.name} (${map.tileCount})`;
      mapSelect.appendChild(option);
    }
  }

  if (state.staticData.map) {
    await selectMap(state.staticData.map.id);
  }
}

async function selectMap(mapId) {
  const map = state.staticData.map;
  if (!map || map.id !== mapId) {
    throw new Error(`Static map '${mapId}' not found`);
  }
  const tiles = state.staticData.tiles || [];
  map.tileKeys = new Set(tiles.map((tile) => `${tile.x},${tile.z}`));

  state.activeMap = map;
  state.waypoints = [];
  state.stagedWaypoints = [];
  invalidateWaypointIndex();
  clearImageCache();
  clearTintedIconCache();
  updateMapStats();
  fitToMap();
  draw();
  renderWaypointList();
  await preloadWholeMapTiles();
  await loadWaypointsFromSelectedCfg();
  draw();
}

if (mapSelect) {
  mapSelect.addEventListener("change", async (event) => {
    await selectMap(event.target.value);
  });
}

[coordScaleInput, offsetXInput, offsetZInput, invertZInput].filter(Boolean).forEach((element) => {
  const refresh = () => {
    refreshCoordConfig();
    renderWaypointList();
    draw();
  };
  element.addEventListener("input", refresh);
  element.addEventListener("change", refresh);
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

canvas.addEventListener("mousedown", (event) => {
  markInteraction();
  if (event.button === 2) {
    state.cameraDrag.active = true;
    state.cameraDrag.startX = event.clientX;
    state.cameraDrag.startY = event.clientY;
    state.cameraDrag.cameraX = state.cameraX;
    state.cameraDrag.cameraY = state.cameraY;
    canvas.classList.add("dragging");
    return;
  }

  if (event.button !== 0 || !state.activeMap) return;
  const mapPoint = screenToMapPixel(event.clientX, event.clientY);
  const hit = findPointAt(mapPoint.x, mapPoint.y);

  if (hit && state.selectedIds.has(hit.id)) {
    state.selectionDrag.active = true;
    state.selectionDrag.startMapPx = mapPoint.x;
    state.selectionDrag.startMapPy = mapPoint.y;
    buildSelectionSnapshot();
    return;
  }

  state.selectionDrag.active = false;
  state.selectionBox.active = true;
  state.selectionBox.startMapPx = mapPoint.x;
  state.selectionBox.startMapPy = mapPoint.y;
  state.selectionBox.currentMapPx = mapPoint.x;
  state.selectionBox.currentMapPy = mapPoint.y;
  state.selectionBox.append = event.shiftKey;
  if (!state.selectionBox.append) {
    state.selectedIds.clear();
  }
  draw();
});

window.addEventListener("mousemove", (event) => {
  if (state.selectionDrag.active) {
    markInteraction();
    const cur = screenToMapPixel(event.clientX, event.clientY);
    const deltaTileX = (cur.x - state.selectionDrag.startMapPx) / TILE_SIZE;
    const deltaMapY = cur.y - state.selectionDrag.startMapPy;
    const deltaTileY = deltaMapY / TILE_SIZE;
    const invertZ = getCoordConfig().invertZ;
    const deltaTileZ = invertZ ? -deltaTileY : deltaTileY;
    applySelectionMove(deltaTileX, deltaTileZ);
    renderWaypointList();
    draw();
    return;
  }

  if (state.selectionBox.active) {
    markInteraction();
    const cur = screenToMapPixel(event.clientX, event.clientY);
    state.selectionBox.currentMapPx = cur.x;
    state.selectionBox.currentMapPy = cur.y;
    draw();
    return;
  }

  if (!state.cameraDrag.active) return;
  markInteraction();

  const dx = (event.clientX - state.cameraDrag.startX) / state.scale;
  const dy = (event.clientY - state.cameraDrag.startY) / state.scale;

  state.cameraX = state.cameraDrag.cameraX - dx;
  state.cameraY = state.cameraDrag.cameraY - dy;
  draw();
});

window.addEventListener("mouseup", () => {
  if (state.cameraDrag.active || state.selectionDrag.active || state.selectionBox.active) {
    markInteraction();
  }
  if (state.selectionBox.active) {
    const w = Math.abs(state.selectionBox.currentMapPx - state.selectionBox.startMapPx);
    const h = Math.abs(state.selectionBox.currentMapPy - state.selectionBox.startMapPy);
    if (w < 4 && h < 4) {
      const hit = findPointAt(state.selectionBox.currentMapPx, state.selectionBox.currentMapPy);
      if (hit) {
        state.selectedIds.add(hit.id);
      }
    } else {
      selectPointsInBox();
    }
    state.selectionBox.active = false;
    state.selectionBox.append = false;
    renderWaypointList();
    draw();
  }

  state.cameraDrag.active = false;
  state.selectionDrag.active = false;
  canvas.classList.remove("dragging");
});

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    markInteraction();

    const zoom = Math.exp(-event.deltaY * 0.0014);
    const oldScale = state.scale;
    const newScale = Math.min(8, Math.max(0.05, oldScale * zoom));

    const mouseX = event.offsetX - canvas.clientWidth / 2;
    const mouseY = event.offsetY - canvas.clientHeight / 2;

    const worldX = state.cameraX + mouseX / oldScale;
    const worldY = state.cameraY + mouseY / oldScale;

    state.scale = newScale;
    state.cameraX = worldX - mouseX / newScale;
    state.cameraY = worldY - mouseY / newScale;

    draw();
  },
  { passive: false }
);

window.addEventListener("resize", resizeCanvas);

if (imageInput) {
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) {
      state.imageTool.sourceWidth = 0;
      state.imageTool.sourceHeight = 0;
      state.imageTool.aspect = 1;
      renderResolutionUi();
      return;
    }
    try {
      const image = await loadImageFromFile(file);
      const srcW = Math.max(1, image.naturalWidth || image.width || 1);
      const srcH = Math.max(1, image.naturalHeight || image.height || 1);
      state.imageTool.sourceWidth = srcW;
      state.imageTool.sourceHeight = srcH;
      state.imageTool.aspect = srcW / srcH;

      if (state.imageTool.aspectLocked) {
        const curW = clampTargetDimension(targetWidthInput?.value);
        const nextH = clampTargetDimension(curW / Math.max(0.0001, state.imageTool.aspect));
        setTargetResolution(curW, nextH);
      } else {
        renderResolutionUi();
      }
    } catch (error) {
      console.error(error);
      sourceImageSize.textContent = `Источник: ошибка (${error.message})`;
    }
  });
}

if (targetWidthInput) {
  targetWidthInput.addEventListener("input", () => {
    const w = clampTargetDimension(targetWidthInput.value);
    if (state.imageTool.aspectLocked) {
      const h = clampTargetDimension(w / Math.max(0.0001, state.imageTool.aspect));
      setTargetResolution(w, h);
      return;
    }
    targetWidthInput.value = String(w);
    renderResolutionUi();
  });
}

if (targetHeightInput) {
  targetHeightInput.addEventListener("input", () => {
    const h = clampTargetDimension(targetHeightInput.value);
    if (state.imageTool.aspectLocked) {
      const w = clampTargetDimension(h * Math.max(0.0001, state.imageTool.aspect));
      setTargetResolution(w, h);
      return;
    }
    targetHeightInput.value = String(h);
    renderResolutionUi();
  });
}

if (aspectLockBtn) {
  aspectLockBtn.addEventListener("click", () => {
    state.imageTool.aspectLocked = !state.imageTool.aspectLocked;
    if (state.imageTool.aspectLocked) {
      const w = clampTargetDimension(targetWidthInput?.value);
      const h = clampTargetDimension(w / Math.max(0.0001, state.imageTool.aspect));
      setTargetResolution(w, h);
    } else {
      renderResolutionUi();
    }
  });
}

if (stickerScaleInput) {
  stickerScaleInput.addEventListener("input", () => {
    if (state.generated) {
      markInteraction();
      state.generated.scaleTiles = Math.max(0.2, Number(stickerScaleInput.value) || 1);
      draw();
    }
  });
}

if (genIconSelect) {
  genIconSelect.addEventListener("change", () => {
    if (state.generated) {
      refreshGeneratedIconStrategy();
    }
  });
}

if (autoIconsInput) {
  autoIconsInput.addEventListener("change", () => {
    if (state.generated) {
      refreshGeneratedIconStrategy();
    }
  });
}

if (highPerfModeInput) {
  highPerfModeInput.addEventListener("change", () => {
    state.renderConfig.highPerfMode = Boolean(highPerfModeInput.checked);
    draw();
  });
}

if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    generateFromImage();
  });
}

if (clearGeneratedBtn) {
  clearGeneratedBtn.addEventListener("click", () => {
    clearGenerated();
  });
}

if (deleteSelectedBtn) {
  deleteSelectedBtn.addEventListener("click", () => {
    deleteSelectedMarkers();
  });
}

if (bakeImageBtn) {
  bakeImageBtn.addEventListener("click", () => {
    bakeImageToBuffer();
  });
}

if (bakeCfgBtn) {
  bakeCfgBtn.addEventListener("click", () => {
    bakeCfg();
  });
}

if (cfgPickBtn) {
  cfgPickBtn.addEventListener("click", () => {
    pickCfgFile();
  });
}

if (cfgFileInput) {
  cfgFileInput.addEventListener("change", () => {
    onCfgFileInputChanged();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Delete" && event.key !== "Backspace") return;

  const active = document.activeElement;
  const isTyping =
    active &&
    (active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.tagName === "SELECT" ||
      active.isContentEditable);
  if (isTyping) return;

  if (!state.selectedIds.size) return;
  event.preventDefault();
  deleteSelectedMarkers();
});

(async function init() {
  refreshCoordConfig();
  state.renderConfig.highPerfMode = Boolean(highPerfModeInput?.checked);
  state.imageTool.aspectLocked = true;
  setTargetResolution(100, 100);
  renderResolutionUi();
  setCfgStatus("CFG: не выбран (нажми \"Выбрать CFG\")");
  resizeCanvas();
  renderPerfOverlay(performance.now(), true);

  try {
    await loadMaps();
  } catch (error) {
    console.error(error);
    mapStats.textContent = `Ошибка загрузки: ${error.message}`;
  }
})();







