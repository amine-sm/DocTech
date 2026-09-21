
const axios = require("axios");

const BASE_URL = (
  process.env.ELOGISTIA_BASE_URL ||
  "https://api.elogistia.com"
).replace(/\/$/, "");

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();

/**
 * ============================================================
 * CONFIGURATION
 * ============================================================
 */

function getApiKey() {
  const key = process.env.ELOGISTIA_API_KEY;

  if (!key) {
    throw new Error(
      "ELOGISTIA_API_KEY manquante dans le fichier .env"
    );
  }

  return key.trim();
}

/**
 * ============================================================
 * REQUEST ELOGISTIA
 * ============================================================
 */

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

  const url = `${BASE_URL}/${String(endpoint).replace(/^\/+/, "")}`;

  console.log(
    `ELOGISTIA → ${method.toUpperCase()} ${url}`
  );

  const response = await axios({
    method,
    url,

    params,

    data,

    timeout: 30000,

    responseType,

    headers: {
      Accept: "application/json",

      // Authentification Elogistia
      key: apiKey,

      "User-Agent": "DOCTECH/1.0",

      ...headers,
    },

    validateStatus: () => true,
  });

  console.log(
    `ELOGISTIA ← ${response.status} ${method.toUpperCase()} ${endpoint}`
  );

  if (response.status >= 400) {
    const error = new Error(
      `Elogistia HTTP ${response.status}`
    );

    error.response = response;

    throw error;
  }

  return response.data;
}

/**
 * ============================================================
 * CACHE
 * ============================================================
 */

function getCache(key) {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function setCache(key, value) {
  cache.set(key, {
    time: Date.now(),
    value,
  });

  return value;
}

/**
 * ============================================================
 * WILAYAS
 *
 * GET /getWilayas
 * ============================================================
 */

async function getWilayas() {
  const cacheKey = "elogistia:wilayas";

  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await request(
    "GET",
    "/getWilayas"
  );

  return setCache(cacheKey, data);
}

/**
 * ============================================================
 * COMMUNES
 *
 * GET /getMunicipalities
 *
 * Exemple :
 * /api/elogistia/municipalities?wilaya=31
 * ============================================================
 */

async function getMunicipalities(wilaya) {
  if (
    wilaya === undefined ||
    wilaya === null ||
    wilaya === ""
  ) {
    throw new Error("wilaya obligatoire");
  }

  const cacheKey =
    `elogistia:municipalities:${wilaya}`;

  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await request(
    "GET",
    "/getMunicipalities",
    {
      params: {
        wilaya,
      },
    }
  );

  return setCache(cacheKey, data);
}

/**
 * Alias pratique
 */
async function getCommunes(wilaya) {
  return getMunicipalities(wilaya);
}

/**
 * ============================================================
 * AGENCES / POINTS RELAIS
 *
 * GET /getAgences
 * ============================================================
 */

async function getAgences() {
  const cacheKey = "elogistia:agences";

  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await request(
    "GET",
    "/getAgences"
  );

  return setCache(cacheKey, data);
}

/**
 * Alias
 */
async function getOffices() {
  return getAgences();
}

/**
 * ============================================================
 * FRAIS DE LIVRAISON
 *
 * GET /getShippingCost
 * ============================================================
 */

async function getShippingCost() {
  const cacheKey = "elogistia:shipping-cost";

  const cached = getCache(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await request(
    "GET",
    "/getShippingCost"
  );

  return setCache(cacheKey, data);
}

/**
 * Alias
 */
async function getRates() {
  return getShippingCost();
}

/**
 * ============================================================
 * COMMANDES
 *
 * GET /getOrders
 * ============================================================
 */

async function getOrders(params = {}) {
  return request(
    "GET",
    "/getOrders",
    {
      params,
    }
  );
}

/**
 * ============================================================
 * COMMANDE PAR TRACKING
 *
 * GET /getOrders?tracking=XXXX
 * ============================================================
 */

async function getOrderByTracking(tracking) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/getOrders",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * Alias standard
 */
async function getOrder(tracking) {
  return getOrderByTracking(tracking);
}

/**
 * ============================================================
 * TRACKING
 *
 * GET /getTracking
 *
 * Selon l'API Elogistia, le tracking renvoie
 * l'historique des événements.
 * ============================================================
 */

async function getTracking(tracking) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/getTracking",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * Alias
 */
async function getTrackingHistory(tracking) {
  return getTracking(tracking);
}

/**
 * ============================================================
 * MANY TRACKING
 *
 * GET /getTracking
 *
 * tracking peut être :
 *
 * ?tracking=AAA
 *
 * ou :
 *
 * ?tracking=AAA,BBB,CCC
 * ============================================================
 */

async function getManyTracking(tracking) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/getTracking",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * ============================================================
 * AJOUTER COMMANDE
 *
 * POST /insertCommande
 * ============================================================
 */

async function insertCommande(order = {}) {
  if (
    !order ||
    typeof order !== "object" ||
    Array.isArray(order)
  ) {
    throw new Error(
      "Les données de la commande sont invalides"
    );
  }

  /**
   * On garde le body envoyé par ton frontend.
   *
   * Elogistia utilise notamment :
   *
   * modeDeLivraison
   *
   * et pour les échanges :
   *
   * modeDeLivraison = 4
   */

  const payload = {
    ...order,
  };

  if (
    process.env.ELOGISTIA_DELIVERY_MODE &&
    payload.modeDeLivraison === undefined
  ) {
    payload.modeDeLivraison =
      Number(
        process.env.ELOGISTIA_DELIVERY_MODE
      );
  }

  return request(
    "POST",
    "/insertCommande",
    {
      data: payload,
    }
  );
}

/**
 * Alias standard
 */
async function createOrder(order) {
  return insertCommande(order);
}

/**
 * ============================================================
 * MODIFIER STATUT
 *
 * Attention :
 * Le endpoint Elogistia utilisé pour les statuts peut
 * dépendre de la version du compte/API.
 *
 * On conserve le endpoint attendu par ton controller.
 * ============================================================
 */

async function updateOrderStatus(
  tracking,
  status
) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  if (
    status === undefined ||
    status === null ||
    status === ""
  ) {
    throw new Error(
      "status obligatoire"
    );
  }

  return request(
    "PATCH",
    `/orders/${encodeURIComponent(
      tracking
    )}/status`,
    {
      data: {
        status,
      },
    }
  );
}

/**
 * ============================================================
 * SUPPRIMER COMMANDE
 *
 * GET /deleteOrder?tracking=XXXX
 * ============================================================
 */

async function deleteOrder(tracking) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/deleteOrder",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * Alias standard
 */
async function cancelOrder(tracking) {
  return deleteOrder(tracking);
}

/**
 * ============================================================
 * BORDEREAU 10x10
 *
 * GET /printBordereau_10x10
 * ============================================================
 */

async function printBordereau10x10(
  tracking
) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/printBordereau_10x10",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * ============================================================
 * BORDEREAU 10x15
 *
 * GET /printBordereau_10x15
 * ============================================================
 */

async function printBordereau10x15(
  tracking
) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/printBordereau_10x15",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * ============================================================
 * BORDEREAU 15x20
 *
 * GET /printBordereau_15x20
 * ============================================================
 */

async function printBordereau15x20(
  tracking
) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/printBordereau_15x20",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * ============================================================
 * BORDEREAU MULTIPLE
 *
 * GET /printBordereauMultiple
 *
 * tracking peut être :
 *
 * AAA,BBB,CCC
 * ============================================================
 */

async function printBordereauMultiple(
  tracking
) {
  if (!tracking) {
    throw new Error(
      "tracking obligatoire"
    );
  }

  return request(
    "GET",
    "/printBordereauMultiple",
    {
      params: {
        tracking,
      },
    }
  );
}

/**
 * ============================================================
 * TEST CREDENTIALS
 * ============================================================
 */

async function testCredentials() {
  try {
    await getWilayas();

    return {
      ok: true,
      message:
        "Connexion Elogistia réussie",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error.response?.data ||
        error.message,
    };
  }
}

/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

module.exports = {
  // HTTP interne
  request,

  // Référentiel
  getWilayas,
  getMunicipalities,
  getCommunes,
  getAgences,
  getOffices,
  getShippingCost,
  getRates,

  // Commandes
  getOrders,
  getOrderByTracking,
  getOrder,
  insertCommande,
  createOrder,

  // Tracking
  getTracking,
  getTrackingHistory,
  getManyTracking,

  // Actions
  updateOrderStatus,
  deleteOrder,
  cancelOrder,

  // Bordereaux
  printBordereau10x10,
  printBordereau10x15,
  printBordereau15x20,
  printBordereauMultiple,

  // Test
  testCredentials,
};

