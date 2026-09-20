const BASE_URL = (process.env.ELOGISTIA_BASE_URL || "https://api.elogistia.com").replace(/\/$/, "");
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();

function getApiKey() {
  const key = process.env.ELOGISTIA_API_KEY;
  if (!key) {
    const error = new Error("ELOGISTIA_API_KEY n'est pas configurée.");
    error.status = 503;
    throw error;
  }
  return key;
}

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}/${String(path).replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function request(path, { method = "GET", params = {} } = {}) {
  const url = buildUrl(path, params);
  const response = await fetch(url, {
    method,
    headers: { Accept: "application/json, text/plain, */*" },
  });

  const contentType = response.headers.get("content-type") || "";
  const isBinary = /application\/(pdf|octet-stream)|image\//i.test(contentType);
  const raw = isBinary ? Buffer.from(await response.arrayBuffer()) : await response.text();
  let data = raw;
  if (!isBinary) {
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (_) {
      // Some Elogistia endpoints return plain text.
    }
  }

  if (!response.ok) {
    const error = new Error(
      typeof data === "string" ? data || `Elogistia HTTP ${response.status}` : data?.message || `Elogistia HTTP ${response.status}`,
    );
    error.status = 502;
    error.providerStatus = response.status;
    error.providerData = data;
    throw error;
  }

  return { data, contentType, status: response.status };
}

function unwrap(value) {
  if (!value) return value;
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    for (const key of ["data", "result", "results", "items", "wilayas", "municipalities", "shippingCost", "shippingCosts"]) {
      if (value[key] !== undefined) return unwrap(value[key]);
    }
  }
  return value;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function normalizeWilayas(payload) {
  const source = unwrap(payload);
  if (!Array.isArray(source)) return [];
  return source.map((row, index) => {
    if (typeof row !== "object" || row === null) return { id: index + 1, name: String(row) };
    const id = row.id ?? row.code ?? row.wilaya_id ?? row.wilayaId ?? row.numero ?? row.number;
    const name = row.wilaya ?? row.name ?? row.nom ?? row.label ?? row.title;
    return { id: id ?? index + 1, name: name ?? String(id ?? index + 1), raw: row };
  });
}

function normalizeMunicipalities(payload) {
  const source = unwrap(payload);
  if (!Array.isArray(source)) return [];
  return source.map((row, index) => {
    if (typeof row !== "object" || row === null) return { id: index + 1, name: String(row) };
    const id = row.id ?? row.code ?? row.commune_id ?? row.municipality_id ?? row.municipalityId;
    const name = row.commune ?? row.municipality ?? row.name ?? row.nom ?? row.label ?? row.title;
    return { id: id ?? index + 1, name: name ?? String(id ?? index + 1), raw: row };
  });
}

function normalizeShippingCosts(payload) {
  const source = unwrap(payload);
  const rows = [];

  if (Array.isArray(source)) {
    for (const row of source) {
      if (row && typeof row === "object") {
        const wilayaId = row.wilaya_id ?? row.wilayaId ?? row.id ?? row.code ?? row.wilaya;
        const name = row.wilaya ?? row.name ?? row.nom ?? row.label;
        const home = toNumber(row.home ?? row.domicile ?? row.delivery ?? row.fraisDeLivraison ?? row.frais_livraison ?? row.tarif ?? row.price ?? row.cost ?? row.amount);
        const desk = toNumber(row.stop_desk ?? row.stopDesk ?? row.bureau ?? row.retrait ?? row.stopdesk);
        if (wilayaId !== undefined || home !== null || desk !== null) rows.push({ wilayaId, name, home, desk, raw: row });
      }
    }
    return rows;
  }

  if (source && typeof source === "object") {
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === "object") {
        const home = toNumber(value.home ?? value.domicile ?? value.delivery ?? value.fraisDeLivraison ?? value.tarif ?? value.price ?? value.cost ?? value.amount);
        const desk = toNumber(value.stop_desk ?? value.stopDesk ?? value.bureau ?? value.retrait ?? value.stopdesk);
        rows.push({ wilayaId: value.wilaya_id ?? value.wilayaId ?? value.id ?? key, name: value.wilaya ?? value.name ?? value.nom, home, desk, raw: value });
      } else {
        rows.push({ wilayaId: key, name: key, home: toNumber(value), desk: null, raw: value });
      }
    }
  }

  return rows;
}


function normalizeAgences(payload) {
  const source = unwrap(payload);
  if (!Array.isArray(source)) return [];

  return source.map((row, index) => {
    if (!row || typeof row !== "object") {
      return { id: index + 1, name: String(row || index + 1), address: "", phone: "", raw: row };
    }

    return {
      id: row.id ?? row.agence_id ?? row.agency_id ?? row.code ?? row.stationCode ?? row.station_code ?? index + 1,
      name: row.name ?? row.nom ?? row.agence ?? row.agency ?? row.label ?? row.title ?? `Bureau ${index + 1}`,
      address: row.address ?? row.adresse ?? row.location ?? "",
      phone: row.phone ?? row.telephone ?? row.tel ?? "",
      wilayaId: row.wilaya_id ?? row.wilayaId ?? row.wilaya ?? null,
      communeId: row.commune_id ?? row.communeId ?? row.commune ?? null,
      raw: row,
    };
  });
}

async function getAgences(wilaya) {
  const key = `agences:${wilaya || "all"}`;
  const hit = cached(key);
  if (hit) return hit;

  const params = { key: getApiKey() };
  if (wilaya) params.wilaya = wilaya;

  const { data } = await request("getAgences/", { params });
  return setCached(key, { data, items: normalizeAgences(data) });
}

function extractTracking(payload) {
  const seen = new Set();
  const visit = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") {
      const match = value.match(/\b(?:ELO|SEG|L)-[A-Z0-9-]+\b/i);
      return match ? match[0] : null;
    }
    if (typeof value !== "object") return null;
    if (seen.has(value)) return null;
    seen.add(value);
    for (const key of ["tracking", "Tracking", "trackingNumber", "tracking_number", "code", "success"]) {
      const found = visit(value[key]);
      if (found) return found;
    }
    for (const child of Object.values(value)) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  return visit(payload);
}

function cached(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.at > CACHE_TTL) return null;
  return entry.value;
}

function setCached(key, value) {
  cache.set(key, { at: Date.now(), value });
  return value;
}

async function getWilayas() {
  const hit = cached("wilayas");
  if (hit) return hit;
  const { data } = await request("getWilayas/", { params: { key: getApiKey() } });
  return setCached("wilayas", { data, items: normalizeWilayas(data) });
}

async function getMunicipalities(wilaya) {
  const key = `municipalities:${wilaya}`;
  const hit = cached(key);
  if (hit) return hit;
  const { data } = await request("getMunicipalities/", { params: { key: getApiKey(), wilaya } });
  return setCached(key, { data, items: normalizeMunicipalities(data) });
}

async function getShippingCosts() {
  const hit = cached("shipping-costs");
  if (hit) return hit;
  const { data } = await request("getShippingCost/", { params: { key: getApiKey() } });
  return setCached("shipping-costs", { data, items: normalizeShippingCosts(data) });
}

async function createOrder({
  name,
  firstname = "",
  mail = "",
  phone,
  address,
  commune,
  fraisDeLivraison,
  remarque = "",
  stopDesk = process.env.ELOGISTIA_STOP_DESK || "2",
  wilaya,
  products,
  prices,
  modeDeLivraison = process.env.ELOGISTIA_DELIVERY_MODE || "4",
  exchangeName = "",
  idCommande,
  poids = process.env.ELOGISTIA_DEFAULT_WEIGHT || "1",
}) {
  const params = {
    apiKey: getApiKey(),
    name,
    firstname,
    mail,
    phone,
    address,
    commune,
    fraisDeLivraison,
    remarque,
    stop_desk: stopDesk,
    wilaya,
    product: products,
    price: prices,
    modeDeLivraison,
    exchangeName,
    IdCommande: idCommande,
    poids,
  };
  const { data } = await request("insertCommande/", { method: "POST", params });
  return { data, tracking: extractTracking(data) };
}

async function getTracking(tracking) {
  return request("getTracking/", { params: { apiKey: getApiKey(), tracking } });
}

async function getOrder(tracking) {
  return request("getOrders/", { params: { key: getApiKey(), tracking } });
}

async function getOrders() {
  return request("getOrders/", { params: { key: getApiKey() } });
}

async function updateOrderStatus(tracking, status) {
  return request("updateOrdersStatus/", { params: { apiKey: getApiKey(), tracking, status } });
}

async function deleteOrder(tracking) {
  return request("deleteOrder/", { params: { apiKey: getApiKey(), tracking } });
}

async function getManyTracking(tracking) {
  return request("getManyTracking/", { params: { apiKey: getApiKey(), tracking } });
}

async function printBordereau(tracking, format = "10x10") {
  const endpoint = format === "10x15" ? "printBordereau_multiple_10x15/" : "printBordereau_10x10/";
  return request(endpoint, { params: { apiKey: getApiKey(), tracking } });
}

module.exports = {
  getWilayas,
  getMunicipalities,
  getAgences,
  getShippingCosts,
  createOrder,
  getTracking,
  getOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  getManyTracking,
  printBordereau,
  normalizeShippingCosts,
};
