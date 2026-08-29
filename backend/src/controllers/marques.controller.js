const pool = require("../config/db");
const makeSlug = require("../utils/slug");

async function list(_req,res){
  const [rows]=await pool.query(`SELECT m.*, (SELECT COUNT(*) FROM articles a WHERE a.marque_id=m.id) article_count FROM marques m ORDER BY m.name`);
  res.json({ok:true,data:rows});
}
async function getOne(req,res){
  const [[row]]=await pool.query("SELECT * FROM marques WHERE id=?",[req.params.id]);
  if(!row)return res.status(404).json({ok:false,message:"Marque introuvable."});
  res.json({ok:true,data:row});
}
async function create(req,res){
  const {name,logoUrl=null,active=true}=req.body;
  if(!name)return res.status(400).json({ok:false,message:"Le nom est obligatoire."});
  const slug=req.body.slug?makeSlug(req.body.slug):makeSlug(name);
  const [result]=await pool.query("INSERT INTO marques (name,slug,logo_url,active) VALUES (?,?,?,?)",[name.trim(),slug,logoUrl,active?1:0]);
  res.status(201).json({ok:true,id:result.insertId,slug,message:"Marque créée."});
}
async function update(req,res){
  const [[current]]=await pool.query("SELECT * FROM marques WHERE id=?",[req.params.id]);
  if(!current)return res.status(404).json({ok:false,message:"Marque introuvable."});
  const name=req.body.name??current.name;
  const slug=req.body.slug?makeSlug(req.body.slug):(req.body.name?makeSlug(req.body.name):current.slug);
  await pool.query("UPDATE marques SET name=?,slug=?,logo_url=?,active=? WHERE id=?",[
    name,slug,req.body.logoUrl??current.logo_url,req.body.active===undefined?current.active:req.body.active?1:0,req.params.id
  ]);
  res.json({ok:true,message:"Marque modifiée."});
}
async function remove(req,res){
  const [result]=await pool.query("DELETE FROM marques WHERE id=?",[req.params.id]);
  if(!result.affectedRows)return res.status(404).json({ok:false,message:"Marque introuvable."});
  res.json({ok:true,message:"Marque supprimée."});
}
module.exports={list,getOne,create,update,remove};
