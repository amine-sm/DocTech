const axios = require("axios");

const BASE_URL = (
  process.env.ELOGISTIA_BASE_URL ||
  "https://api.elogistia.com"
).replace(/\/$/, "");

const CACHE_TTL = 5 * 60 * 1000;

const cache = new Map();

/* =========================================================
   API KEY
========================================================= */

function getApiKey() {
  const key = process.env.ELOGISTIA_API_KEY;

  if (!key) {
    throw new Error(
      "ELOGISTIA_API_KEY manquante dans le fichier .env"
    );
  }

  return String(key).trim();
}

/* =========================================================
   CACHE
========================================================= */

function getCache(key) {
  const item = cache.get(key);

  if (!item) return null;

  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function setCache(key, value) {
  cache.set(key, { time: Date.now(), value });
  return value;
}

/* =========================================================
   REQUEST ELOGISTIA (GET standard)
========================================================= */

async function request(
  method,
  endpoint,
  {
    params = {},
    data = undefined,
    headers = {},
    responseType = "json",
  } = {}
) {
  const apiKey = getApiKey();

  const cleanEndpoint = String(endpoint).replace(/^\/+/, "");

  const url = `${BASE_URL}/${cleanEndpoint}`;

  const finalParams = { ...params, key: apiKey };

  console.log("==============================================");
  console.log(`ELOGISTIA → ${method.toUpperCase()}`);
  console.log(
    `${url}?${new URLSearchParams(
      Object.entries(finalParams).map(([k, v]) => [k, String(v)])
    )
      .toString()
      .replace(apiKey, "********")}`
  );
  console.log("==============================================");

  const response = await axios({
    method,
    url,
    params: finalParams,
    data,
    timeout: 30000,
    responseType,
    headers: {
      Accept: "application/json",
      "User-Agent": "DOCTECH/1.0",
      ...headers,
    },
    validateStatus: () => true,
  });

  console.log(`ELOGISTIA ← ${response.status}`);

  if (response.status >= 400) {
    console.error("ELOGISTIA ERROR:", response.data);

    const error = new Error(`Elogistia HTTP ${response.status}`);
    error.response = response;
    throw error;
  }

  return response.data;
}

/* =========================================================
   NORMALISATION
========================================================= */

/**
 * Elogistia renvoie souvent : { body: [...] }
 * On teste `body` EN PREMIER.
 */
function extractArray(data, possibleKeys = []) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  // ⭐ Elogistia standard
  if (Array.isArray(data.body)) return data.body;

  for (const key of possibleKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.results)) return data.results;

  return [];
}

/* =========================================================
   WILAYAS
========================================================= */

async function getWilayas() {
  const cacheKey = "elogistia:wilayas";

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await request("GET", "/getWilayas");

  console.log("ELOGISTIA WILAYAS RAW:");
  console.dir(data, { depth: null });

  return setCache(cacheKey, data);
}

/* =========================================================
   COMMUNES
========================================================= */

async function getMunicipalities(wilaya) {
  if (
    wilaya === undefined ||
    wilaya === null ||
    String(wilaya).trim() === ""
  ) {
    throw new Error("wilaya obligatoire");
  }

  const wilayaValue = String(wilaya).trim();
  const cacheKey = `elogistia:municipalities:${wilayaValue}`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await request("GET", "/getMunicipalities", {
    params: { wilaya: wilayaValue },
  });

  console.log(`ELOGISTIA COMMUNES ${wilayaValue}:`);
  console.dir(data, { depth: null });

  return setCache(cacheKey, data);
}

async function getCommunes(wilaya) {
  return getMunicipalities(wilaya);
}

/* =========================================================
   AGENCES
========================================================= */

async function getAgences(wilaya) {
  const params = {};

  if (
    wilaya !== undefined &&
    wilaya !== null &&
    String(wilaya).trim() !== ""
  ) {
    params.wilaya = String(wilaya).trim();
  }

  const cacheKey = `elogistia:agences:${params.wilaya || "all"}`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await request("GET", "/getAgences", { params });

  console.log("ELOGISTIA AGENCES:");
  console.dir(data, { depth: null });

  return setCache(cacheKey, data);
}

async function getOffices(wilaya) {
  return getAgences(wilaya);
}

/* =========================================================
   TARIFS
========================================================= */

async function getShippingCost(wilaya) {
  const params = {};

  if (
    wilaya !== undefined &&
    wilaya !== null &&
    String(wilaya).trim() !== ""
  ) {
    params.wilaya = String(wilaya).trim();
  }

  const cacheKey = `elogistia:shipping-cost:${
    params.wilaya || "all"
  }`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await request("GET", "/getShippingCost", { params });

  console.log("ELOGISTIA SHIPPING COST RAW:");
  console.dir(data, { depth: null });

  return setCache(cacheKey, data);
}

/* ⭐ ALIAS (compatibilité avec commandes.controller.js) */

async function getShippingCosts(wilaya) {
  return getShippingCost(wilaya);
}

async function getRates(wilaya) {
  return getShippingCost(wilaya);
}

/* =========================================================
   COMMANDES (lecture)
========================================================= */

async function getOrders(params = {}) {
  return request("GET", "/getOrders", { params });
}

async function getOrderByTracking(tracking) {
  if (!tracking) throw new Error("tracking obligatoire");

  return request("GET", "/getOrders", {
    params: { tracking },
  });
}

async function getOrder(tracking) {
  return getOrderByTracking(tracking);
}

/* =========================================================
   TRACKING 
========================================================= */

async function getTracking(tracking) {
  if (!tracking) throw new Error("tracking obligatoire");

  return request("GET", "/getTracking", {
    params: { tracking },
  });
}

async function getTrackingHistory(tracking) {
  return getTracking(tracking);
}

async function getManyTracking(tracking) {
  if (!tracking) throw new Error("tracking obligatoire");

  return request("GET", "/getTracking", {
    params: { tracking },
  });
}

/* =========================================================
   INSERT COMMANDE
   ⚠️ IMPORTANT : cet endpoint utilise :
   - apiKey (pas key)
   - product / price (singuliers, pipe-separated)
   - stop_desk (underscore)
   - Content-Type: application/x-www-form-urlencoded
========================================================= */

async function insertCommande(order = {}) {
  if (
    !order ||
    typeof order !== "object" ||
    Array.isArray(order)
  ) {
    throw new Error("Les données de la commande sont invalides");
  }

  const apiKey = getApiKey();

  const payload = new URLSearchParams();

  // ⭐ apiKey (pas key)
  payload.append("apiKey", apiKey);

  payload.append("name", String(order.name || ""));
  payload.append(
    "firstname",
    String(order.firstname || "")
  );
  payload.append("mail", String(order.mail || ""));
  payload.append("phone", String(order.phone || ""));
  payload.append(
    "address",
    String(order.address || "")
  );
  payload.append(
    "commune",
    String(order.commune || "")
  );
  payload.append(
    "fraisDeLivraison",
    String(order.fraisDeLivraison ?? 0)
  );
  payload.append(
    "remarque",
    String(order.remarque || "")
  );

  // ⭐ stop_desk (underscore)
  payload.append(
    "stop_desk",
    String(
      order.stop_desk ??
        order.stopDesk ??
        process.env.ELOGISTIA_HOME_STOP_DESK ??
        "0"
    )
  );

  payload.append(
    "wilaya",
    String(order.wilaya || "")
  );

  // ⭐ product (singulier, pipe-separated)
  payload.append(
    "product",
    String(order.product ?? order.products ?? "")
  );

  // ⭐ price (singulier, pipe-separated)
  payload.append(
    "price",
    String(order.price ?? order.prices ?? "")
  );

  payload.append(
    "modeDeLivraison",
    String(
      order.modeDeLivraison ??
        process.env.ELOGISTIA_DELIVERY_MODE ??
        "4"
    )
  );

  payload.append(
    "exchangeName",
    String(order.exchangeName || "")
  );

  payload.append(
    "idCommande",
    String(order.idCommande || "")
  );

  payload.append(
    "poids",
    String(
      order.poids ??
        process.env.ELOGISTIA_DEFAULT_WEIGHT ??
        "1"
    )
  );

  const url = `${BASE_URL}/insertCommande/`;

  console.log("==============================================");
  console.log("ELOGISTIA → POST (insertCommande)");
  console.log(
    `${url}?${payload
      .toString()
      .replace(encodeURIComponent(apiKey), "********")}`
  );
  console.log("==============================================");

  const response = await axios({
    method: "POST",
    url,
    data: payload.toString(),
    timeout: 30000,
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "DOCTECH/1.0",
    },
    validateStatus: () => true,
  });

  console.log(`ELOGISTIA ← ${response.status}`);

  if (response.status >= 400) {
    console.error(
      "ELOGISTIA ERROR:",
      response.data
    );

    const error = new Error(
      `Elogistia HTTP ${response.status}`
    );
    error.response = response;
    throw error;
  }

  const data = response.data;

  /*
   * Elogistia renvoie souvent :
   * { body: [ { Tracking: "...", logID: "..." } ], itemCount: 1 }
   * On extrait le tracking.
   */
  let tracking = null;

  if (Array.isArray(data?.body) && data.body[0]) {
    tracking =
      data.body[0].Tracking ??
      data.body[0].tracking ??
      null;
  } else if (data?.Tracking) {
    tracking = data.Tracking;
  } else if (data?.tracking) {
    tracking = data.tracking;
  }

  return {
    ...data,
    tracking,
  };
}

async function createOrder(order) {
  return insertCommande(order);
}

/* =========================================================
   DELETE
========================================================= */

async function deleteOrder(tracking) {
  if (!tracking) throw new Error("tracking obligatoire");

  return request("GET", "/deleteOrder", {
    params: { tracking },
  });
}

async function cancelOrder(tracking) {
  return deleteOrder(tracking);
}

/* =========================================================
   UPDATE STATUS
========================================================= */

async function updateOrdersStatus(tracking, status) {
  if (!tracking) throw new Error("tracking obligatoire");

  return request("GET", "/updateOrdersStatus", {
    params: {
      tracking,
      status: String(status),
    },
  });
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  request,
  extractArray,

  getWilayas,
  getMunicipalities,
  getCommunes,
  getAgences,
  getOffices,

  getShippingCost,
  getShippingCosts,
  getRates,

  getOrders,
  getOrderByTracking,
  getOrder,
  getTracking,
  getTrackingHistory,
  getManyTracking,

  insertCommande,
  createOrder,
  deleteOrder,
  cancelOrder,
  updateOrdersStatus,
};