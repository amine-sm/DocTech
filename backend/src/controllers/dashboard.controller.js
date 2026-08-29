const pool=require('../config/db');
async function summary(_req,res){
  const [[users]]=await pool.query("SELECT COUNT(*) total FROM users");
  const [[articles]]=await pool.query("SELECT COUNT(*) total, SUM(status='ACTIF') active, SUM(stock_enabled=1 AND stock<=5) low_stock FROM articles");
  const [[suppliers]]=await pool.query("SELECT COUNT(*) total FROM fournisseurs WHERE statut='ACTIF'");
  const [[orders]]=await pool.query("SELECT COUNT(*) total, SUM(status='NOUVELLE') new_orders, COALESCE(SUM(CASE WHEN status='LIVREE' THEN total ELSE 0 END),0) revenue FROM commandes");
  const [[today]]=await pool.query("SELECT COUNT(*) total, COALESCE(SUM(total),0) amount FROM commandes WHERE DATE(created_at)=CURDATE()");
  const [recentOrders]=await pool.query("SELECT id,tracking_number,customer_name,status,total,created_at FROM commandes ORDER BY id DESC LIMIT 8");
  const [topArticles]=await pool.query(`SELECT ci.article_id,ci.product_name,SUM(ci.quantity) quantity,SUM(ci.line_total) amount FROM commande_items ci JOIN commandes c ON c.id=ci.commande_id WHERE c.status<>'ANNULEE' GROUP BY ci.article_id,ci.product_name ORDER BY quantity DESC LIMIT 8`);
  const [salesByDay]=await pool.query(`SELECT DATE(created_at) day,COUNT(*) orders,COALESCE(SUM(total),0) amount FROM commandes WHERE created_at>=DATE_SUB(CURDATE(),INTERVAL 13 DAY) AND status<>'ANNULEE' GROUP BY DATE(created_at) ORDER BY day`);
  res.json({ok:true,data:{cards:{users:users.total,articles:articles.total,activeArticles:articles.active,lowStock:articles.low_stock,suppliers:suppliers.total,orders:orders.total,newOrders:orders.new_orders,revenue:orders.revenue,todayOrders:today.total,todayAmount:today.amount},recentOrders,topArticles,salesByDay}})
}
module.exports={summary};
