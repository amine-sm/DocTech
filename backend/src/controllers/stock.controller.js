const pool = require('../config/db');
const getPagination = require('../utils/pagination');

function n(value, fallback = 0) {
  const x = Number(value);
  return Number.isFinite(x) ? x : fallback;
}

async function articles(req, res) {
  const search = String(req.query.search || '').trim();
  const params = [];
  let where = '';
  if (search) {
    where = 'WHERE a.name LIKE ? OR a.code LIKE ? OR a.sku LIKE ?';
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  const [rows] = await pool.query(
    `SELECT a.id,a.code,a.sku,a.name,a.price,a.old_price,a.purchase_price,a.stock,a.stock_enabled,
            f.nom fournisseur_name,
            (SELECT COALESCE(SUM(l.quantity_remaining),0) FROM product_stock_lots l WHERE l.article_id=a.id) lot_stock
     FROM articles a LEFT JOIN fournisseurs f ON f.id=a.fournisseur_id
     ${where} ORDER BY a.id DESC`, params);
  res.json({ ok: true, data: rows });
}

async function movements(req, res) {
  const { page, limit, offset } = getPagination(req.query, 30, 100);
  const params = [];
  const where = [];
  if (req.query.articleId) { where.push('m.article_id=?'); params.push(req.query.articleId); }
  if (req.query.type) { where.push('m.type=?'); params.push(req.query.type); }
  const sqlWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [[count]] = await pool.query(`SELECT COUNT(*) total FROM stock_movements m ${sqlWhere}`, params);
  const [rows] = await pool.query(
    `SELECT m.*,a.name article_name,a.code article_code,l.purchase_price lot_purchase_price,l.selling_price lot_selling_price,
            f.nom fournisseur_name
     FROM stock_movements m
     JOIN articles a ON a.id=m.article_id
     LEFT JOIN product_stock_lots l ON l.id=m.lot_id
     LEFT JOIN fournisseurs f ON f.id=m.fournisseur_id
     ${sqlWhere} ORDER BY m.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  res.json({ ok: true, data: rows, pagination: { page, limit, total: count.total, pages: Math.ceil(count.total / limit) } });
}

async function entry(req, res) {
  const b = req.body;
  const articleId = Number(b.articleId);
  const quantity = Number(b.quantity);
  if (!articleId || !Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ ok:false, message:'Article et quantité positive obligatoires.' });
  const purchasePrice = n(b.purchasePrice, 0);
  const sellingPrice = n(b.sellingPrice, 0);
  if (purchasePrice < 0 || sellingPrice < 0) return res.status(400).json({ok:false,message:'Les prix ne peuvent pas être négatifs.'});
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[a]] = await conn.query('SELECT * FROM articles WHERE id=? FOR UPDATE', [articleId]);
    if (!a) return res.status(404).json({ok:false,message:'Article introuvable.'});
    const oldStock = Number(a.stock || 0);
    const newStock = oldStock + quantity;
    const [lotResult] = await conn.query(
      `INSERT INTO product_stock_lots(article_id,quantity_initial,quantity_remaining,purchase_price,selling_price,supplier_id,reference,notes)
       VALUES(?,?,?,?,?,?,?,?)`,
      [articleId,quantity,quantity,purchasePrice,sellingPrice,b.fournisseurId || null,b.reference || null,b.notes || null]);
    await conn.query('UPDATE articles SET stock=?,purchase_price=?,price=? WHERE id=?',[newStock,purchasePrice,sellingPrice,articleId]);
    await conn.query(
      `INSERT INTO stock_movements(article_id,lot_id,type,quantity,stock_before,stock_after,purchase_price,selling_price,supplier_id,reference,notes,user_id)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [articleId,lotResult.insertId,'ENTRY',quantity,oldStock,newStock,purchasePrice,sellingPrice,b.fournisseurId||null,b.reference||null,b.notes||null,req.user?.id||null]);
    await conn.commit();
    res.status(201).json({ok:true,message:'Entrée stock enregistrée.',data:{articleId,lotId:lotResult.insertId,stockBefore:oldStock,stockAfter:newStock}});
  } catch(e) { await conn.rollback(); throw e; } finally { conn.release(); }
}

async function exit(req, res) {
  const b=req.body;
  const articleId=Number(b.articleId); const quantity=Number(b.quantity);
  if(!articleId || !Number.isInteger(quantity) || quantity<=0) return res.status(400).json({ok:false,message:'Article et quantité positive obligatoires.'});
  const conn=await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[a]]=await conn.query('SELECT * FROM articles WHERE id=? FOR UPDATE',[articleId]);
    if(!a) return res.status(404).json({ok:false,message:'Article introuvable.'});
    const oldStock=Number(a.stock||0);
    if(a.stock_enabled && oldStock<quantity) return res.status(400).json({ok:false,message:`Stock insuffisant. Disponible : ${oldStock}.`});
    let remaining=quantity;
    const [lots]=await conn.query('SELECT * FROM product_stock_lots WHERE article_id=? AND quantity_remaining>0 ORDER BY created_at ASC,id ASC FOR UPDATE',[articleId]);
    if (a.stock_enabled && lots.reduce((s,l)=>s+Number(l.quantity_remaining),0) < quantity) return res.status(409).json({ok:false,message:'Le stock par lots ne correspond pas au stock article. Faites un inventaire avant la sortie.'});
    for(const lot of lots){
      if(remaining<=0) break;
      const take=Math.min(remaining,Number(lot.quantity_remaining));
      await conn.query('UPDATE product_stock_lots SET quantity_remaining=quantity_remaining-? WHERE id=?',[take,lot.id]);
      await conn.query(
        `INSERT INTO stock_movements(article_id,lot_id,type,quantity,stock_before,stock_after,purchase_price,selling_price,supplier_id,reference,notes,user_id)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
        [articleId,lot.id,'EXIT',take,oldStock-(quantity-remaining),oldStock-(quantity-remaining)-take,lot.purchase_price,lot.selling_price,b.fournisseurId||lot.supplier_id||null,b.reference||null,b.notes||null,req.user?.id||null]);
      remaining-=take;
    }
    if(remaining>0) return res.status(409).json({ok:false,message:'Impossible de répartir la sortie dans les lots.'});
    const newStock=oldStock-quantity;
    await conn.query('UPDATE articles SET stock=? WHERE id=?',[newStock,articleId]);
    await conn.commit();
    res.json({ok:true,message:'Sortie stock enregistrée.',data:{articleId,stockBefore:oldStock,stockAfter:newStock}});
  } catch(e){await conn.rollback();throw e;} finally{conn.release();}
}

async function lots(req,res){
  const [rows]=await pool.query(`SELECT l.*,a.name article_name,a.code article_code,f.nom fournisseur_name
    FROM product_stock_lots l JOIN articles a ON a.id=l.article_id LEFT JOIN fournisseurs f ON f.id=l.supplier_id
    WHERE l.article_id=? ORDER BY l.created_at ASC,l.id ASC`,[req.params.articleId]);
  res.json({ok:true,data:rows});
}

module.exports={articles,movements,entry,exit,lots};
