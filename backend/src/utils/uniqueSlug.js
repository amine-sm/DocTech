const makeSlug = require('./slug');

async function uniqueSlug(conn, value, { table = 'articles', id = null } = {}) {
  const base = makeSlug(value) || `article-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (true) {
    const params = [candidate];
    let sql = `SELECT id FROM ${table} WHERE slug=?`;
    if (id != null) { sql += ' AND id<>?'; params.push(id); }
    const [[row]] = await conn.query(sql, params);
    if (!row) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}
module.exports = uniqueSlug;
