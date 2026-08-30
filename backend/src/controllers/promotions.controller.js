const pool = require("../config/db");

async function list(_req,res){
  const [rows]=await pool.query(`SELECT p.*,COUNT(pa.article_id) article_count FROM promotions p LEFT JOIN promotion_articles pa ON pa.promotion_id=p.id GROUP BY p.id ORDER BY p.id DESC`);
  res.json({ok:true,data:rows});
}
async function getOne(req,res){
  const [[promotion]]=await pool.query('SELECT * FROM promotions WHERE id=?',[req.params.id]);
  if(!promotion)return res.status(404).json({ok:false,message:'Promotion introuvable.'});
  const [articles]=await pool.query(`SELECT a.id,a.code,a.name,a.name_ar,a.price FROM articles a JOIN promotion_articles pa ON pa.article_id=a.id WHERE pa.promotion_id=?`,[promotion.id]);
  res.json({ok:true,data:{...promotion,articles}});
}
async function create(req,res){
  const b=req.body;
  if(!b.name||!b.value||!b.startAt||!b.endAt)return res.status(400).json({ok:false,message:'Nom, valeur et dates obligatoires.'});
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [result]=await conn.query(
      'INSERT INTO promotions(name,name_ar,type,value,badge,badge_ar,start_at,end_at,active) VALUES(?,?,?,?,?,?,?,?,?)',
      [b.name,b.nameAr||null,b.type||'POURCENTAGE',b.value,b.badge||null,b.badgeAr||null,b.startAt,b.endAt,b.active===false?0:1]
    );
    for(const id of b.articleIds||[])await conn.query('INSERT IGNORE INTO promotion_articles(promotion_id,article_id) VALUES(?,?)',[result.insertId,id]);
    await conn.commit();
    res.status(201).json({ok:true,id:result.insertId,message:'Promotion créée.'});
  }catch(error){await conn.rollback();throw error}finally{conn.release()}
}
async function update(req,res){
  const [[current]]=await pool.query('SELECT * FROM promotions WHERE id=?',[req.params.id]);
  if(!current)return res.status(404).json({ok:false,message:'Promotion introuvable.'});
  const b=req.body;const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    await conn.query(
      'UPDATE promotions SET name=?,name_ar=?,type=?,value=?,badge=?,badge_ar=?,start_at=?,end_at=?,active=? WHERE id=?',
      [b.name??current.name,b.nameAr??current.name_ar,b.type??current.type,b.value??current.value,b.badge??current.badge,b.badgeAr??current.badge_ar,b.startAt??current.start_at,b.endAt??current.end_at,b.active===undefined?current.active:b.active?1:0,req.params.id]
    );
    if(Array.isArray(b.articleIds)){
      await conn.query('DELETE FROM promotion_articles WHERE promotion_id=?',[req.params.id]);
      for(const id of b.articleIds)await conn.query('INSERT IGNORE INTO promotion_articles(promotion_id,article_id) VALUES(?,?)',[req.params.id,id]);
    }
    await conn.commit();
    res.json({ok:true,message:'Promotion modifiée.'});
  }catch(error){await conn.rollback();throw error}finally{conn.release()}
}
async function remove(req,res){const [result]=await pool.query('DELETE FROM promotions WHERE id=?',[req.params.id]);if(!result.affectedRows)return res.status(404).json({ok:false,message:'Promotion introuvable.'});res.json({ok:true,message:'Promotion supprimée.'})}
module.exports={list,getOne,create,update,remove};
