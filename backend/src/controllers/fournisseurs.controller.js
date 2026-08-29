const pool = require("../config/db");
const getPagination = require("../utils/pagination");

async function list(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();
  const where=[]; const params=[];
  if (search) { const q=`%${search}%`; where.push("(nom LIKE ? OR code LIKE ? OR email LIKE ? OR telephone LIKE ?)"); params.push(q,q,q,q); }
  if (status) { where.push("statut=?"); params.push(status); }
  const sqlWhere=where.length?`WHERE ${where.join(" AND ")}`:"";
  const [[count]]=await pool.query(`SELECT COUNT(*) total FROM fournisseurs ${sqlWhere}`,params);
  const [rows]=await pool.query(`SELECT * FROM fournisseurs ${sqlWhere} ORDER BY id DESC LIMIT ? OFFSET ?`,[...params,limit,offset]);
  res.json({ok:true,data:rows,pagination:{page,limit,total:count.total,pages:Math.ceil(count.total/limit)}});
}

async function getOne(req,res){
  const [[row]]=await pool.query("SELECT * FROM fournisseurs WHERE id=?",[req.params.id]);
  if(!row)return res.status(404).json({ok:false,message:"Fournisseur introuvable."});
  res.json({ok:true,data:row});
}

async function create(req,res){
  const {nom,contactName=null,email=null,telephone=null,adresse=null,wilaya=null,nif=null,nis=null,registreCommerce=null,statut="ACTIF",notes=null}=req.body;
  if(!nom)return res.status(400).json({ok:false,message:"Le nom du fournisseur est obligatoire."});
  const code=`FOU-${Date.now().toString().slice(-8)}`;
  const [result]=await pool.query(
    `INSERT INTO fournisseurs (code,nom,contact_name,email,telephone,adresse,wilaya,nif,nis,registre_commerce,statut,notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [code,nom,contactName,email,telephone,adresse,wilaya,nif,nis,registreCommerce,statut,notes]
  );
  res.status(201).json({ok:true,id:result.insertId,code,message:"Fournisseur créé."});
}

async function update(req,res){
  const {nom,contactName,email,telephone,adresse,wilaya,nif,nis,registreCommerce,statut,notes}=req.body;
  const [result]=await pool.query(
    `UPDATE fournisseurs SET nom=COALESCE(?,nom),contact_name=?,email=?,telephone=?,adresse=?,wilaya=?,nif=?,nis=?,registre_commerce=?,statut=COALESCE(?,statut),notes=? WHERE id=?`,
    [nom??null,contactName??null,email??null,telephone??null,adresse??null,wilaya??null,nif??null,nis??null,registreCommerce??null,statut??null,notes??null,req.params.id]
  );
  if(!result.affectedRows)return res.status(404).json({ok:false,message:"Fournisseur introuvable."});
  res.json({ok:true,message:"Fournisseur modifié."});
}

async function remove(req,res){
  const [result]=await pool.query("DELETE FROM fournisseurs WHERE id=?",[req.params.id]);
  if(!result.affectedRows)return res.status(404).json({ok:false,message:"Fournisseur introuvable."});
  res.json({ok:true,message:"Fournisseur supprimé."});
}

module.exports={list,getOne,create,update,remove};
