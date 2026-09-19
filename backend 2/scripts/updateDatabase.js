require('dotenv').config();
const mysql = require('mysql2/promise');
const DB = process.env.DB_NAME || 'doctech';
async function columnExists(conn,table,column){const [[r]]=await conn.query(`SELECT COUNT(*) total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? AND COLUMN_NAME=?`,[DB,table,column]);return Number(r.total)>0;}
async function tableExists(conn,table){const [[r]]=await conn.query(`SELECT COUNT(*) total FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?`,[DB,table]);return Number(r.total)>0;}
async function addColumn(conn,table,column,definition,after=null){if(await columnExists(conn,table,column)) return; await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}${after?` AFTER \`${after}\``:''}`); console.log(`[ADD] ${table}.${column}`);}
async function run(){
 const conn=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:DB,charset:'utf8mb4'});
 try{
  await addColumn(conn,'categories','name_ar','VARCHAR(150) NULL','name'); await addColumn(conn,'categories','description_ar','TEXT NULL','description');
  await addColumn(conn,'marques','name_ar','VARCHAR(150) NULL','name'); await addColumn(conn,'marques','description','TEXT NULL','slug'); await addColumn(conn,'marques','description_ar','TEXT NULL','description'); await addColumn(conn,'marques','sort_order','INT NOT NULL DEFAULT 0','active');
  await addColumn(conn,'articles','name_ar','VARCHAR(220) NULL','name'); await addColumn(conn,'articles','short_name_ar','VARCHAR(120) NULL','short_name'); await addColumn(conn,'articles','short_description_ar','VARCHAR(500) NULL','short_description'); await addColumn(conn,'articles','description_ar','LONGTEXT NULL','description');
  await addColumn(conn,'article_images','alt_text_ar','VARCHAR(255) NULL','alt_text'); await addColumn(conn,'article_variants','value_ar','VARCHAR(100) NULL','value');
  await addColumn(conn,'promotions','name_ar','VARCHAR(180) NULL','name'); await addColumn(conn,'promotions','badge_ar','VARCHAR(80) NULL','badge');
  if(!(await tableExists(conn,'product_stock_lots'))){await conn.query(`CREATE TABLE product_stock_lots(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,article_id INT UNSIGNED NOT NULL,quantity_initial INT UNSIGNED NOT NULL,quantity_remaining INT UNSIGNED NOT NULL,purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,supplier_id INT UNSIGNED NULL,reference VARCHAR(120) NULL,notes TEXT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_stock_lots_article FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,CONSTRAINT fk_stock_lots_supplier FOREIGN KEY(supplier_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,INDEX idx_stock_lots_article_remaining(article_id,quantity_remaining,created_at)) ENGINE=InnoDB`); console.log('[ADD] product_stock_lots');}
  if(!(await tableExists(conn,'stock_movements'))){await conn.query(`CREATE TABLE stock_movements(id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,article_id INT UNSIGNED NOT NULL,lot_id BIGINT UNSIGNED NULL,type ENUM('ENTRY','EXIT','ADJUSTMENT') NOT NULL,quantity INT UNSIGNED NOT NULL,stock_before INT NOT NULL DEFAULT 0,stock_after INT NOT NULL DEFAULT 0,purchase_price DECIMAL(12,2) NULL,selling_price DECIMAL(12,2) NULL,supplier_id INT UNSIGNED NULL,reference VARCHAR(120) NULL,notes TEXT NULL,user_id INT UNSIGNED NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT fk_stock_mov_article FOREIGN KEY(article_id) REFERENCES articles(id) ON DELETE CASCADE,CONSTRAINT fk_stock_mov_lot FOREIGN KEY(lot_id) REFERENCES product_stock_lots(id) ON DELETE SET NULL,CONSTRAINT fk_stock_mov_supplier FOREIGN KEY(supplier_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,CONSTRAINT fk_stock_mov_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,INDEX idx_stock_mov_article_created(article_id,created_at),INDEX idx_stock_mov_type_created(type,created_at)) ENGINE=InnoDB`); console.log('[ADD] stock_movements');}
  // Important: stock_movements may already exist from an older version without lot_id.
  // Migrate the existing table instead of assuming CREATE TABLE will run.
  await addColumn(conn,'stock_movements','lot_id','BIGINT UNSIGNED NULL','article_id');
  await addColumn(conn,'stock_movements','stock_before','INT NOT NULL DEFAULT 0','quantity');
  await addColumn(conn,'stock_movements','stock_after','INT NOT NULL DEFAULT 0','stock_before');
  await addColumn(conn,'stock_movements','purchase_price','DECIMAL(12,2) NULL','stock_after');
  await addColumn(conn,'stock_movements','selling_price','DECIMAL(12,2) NULL','purchase_price');
  await addColumn(conn,'stock_movements','supplier_id','INT UNSIGNED NULL','selling_price');
  await addColumn(conn,'stock_movements','reference','VARCHAR(120) NULL','supplier_id');
  await addColumn(conn,'stock_movements','notes','TEXT NULL','reference');
  await addColumn(conn,'stock_movements','user_id','INT UNSIGNED NULL','notes');

  await conn.query(`INSERT INTO permissions(code,name,module) VALUES ('stock.view','Voir le stock','stock'),('stock.create','Créer une entrée/sortie stock','stock') ON DUPLICATE KEY UPDATE name=VALUES(name),module=VALUES(module)`);
  await conn.query(`INSERT IGNORE INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('stock.view','stock.create') WHERE r.code='ADMIN'`);
  await conn.query(`INSERT IGNORE INTO role_permissions(role_id,permission_id) SELECT r.id,p.id FROM roles r JOIN permissions p ON p.code IN ('stock.view','stock.create') WHERE r.code='OPERATEUR'`);
  const [[{missing}]]=await conn.query(`SELECT COUNT(*) missing FROM articles a WHERE a.stock>0 AND NOT EXISTS(SELECT 1 FROM product_stock_lots l WHERE l.article_id=a.id)`);
  if(Number(missing)>0){await conn.query(`INSERT INTO product_stock_lots(article_id,quantity_initial,quantity_remaining,purchase_price,selling_price,supplier_id,reference,notes) SELECT a.id,a.stock,a.stock,a.purchase_price,a.price,a.fournisseur_id,'MIGRATION','Lot initial créé automatiquement lors de la mise à niveau' FROM articles a WHERE a.stock>0 AND NOT EXISTS(SELECT 1 FROM product_stock_lots l WHERE l.article_id=a.id)`); console.log(`[MIGRATION] ${missing} article(s) converti(s) en lot initial.`);}
  await addColumn(conn,'commandes','delivery_provider','VARCHAR(30) NULL','delivery_type');
  await addColumn(conn,'commandes','delivery_tracking','VARCHAR(120) NULL','delivery_provider');
  await addColumn(conn,'commandes','delivery_sync_status',"ENUM('PENDING','SYNCED','ERROR') NOT NULL DEFAULT 'PENDING'",'delivery_tracking');
  await addColumn(conn,'commandes','delivery_sync_error','TEXT NULL','delivery_sync_status');
  await addColumn(conn,'commandes','delivery_synced_at','DATETIME NULL','delivery_sync_error');
  await addColumn(conn,'commandes','delivery_wilaya_id','VARCHAR(30) NULL','wilaya');
  await addColumn(conn,'commandes','delivery_commune_id','VARCHAR(30) NULL','commune');
  await addColumn(conn,'commandes','delivery_mode','VARCHAR(30) NULL','delivery_commune_id');
  await addColumn(conn,'commandes','delivery_stop_desk','VARCHAR(30) NULL','delivery_mode');
  console.log('Mise à jour stock terminée.');
 }finally{await conn.end();}
}
run().catch(e=>{console.error('[ERREUR]',e);process.exit(1)});
