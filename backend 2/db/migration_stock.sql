-- DOCTECH STOCK + ROUTES FIX
-- À exécuter sur la base doctech existante avant de redémarrer l'API.

USE doctech;

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id INT UNSIGNED NOT NULL,
  type ENUM('ENTREE','SORTIE','AJUSTEMENT') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  stock_before INT NOT NULL,
  stock_after INT NOT NULL,
  purchase_price DECIMAL(12,2) NULL,
  price DECIMAL(12,2) NULL,
  old_price DECIMAL(12,2) NULL,
  fournisseur_id INT UNSIGNED NULL,
  reference VARCHAR(120) NULL,
  note TEXT NULL,
  user_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_movements_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_movements_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,
  CONSTRAINT fk_stock_movements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stock_movements_article (article_id),
  INDEX idx_stock_movements_created_at (created_at),
  INDEX idx_stock_movements_type (type)
) ENGINE=InnoDB;

INSERT INTO permissions (code,name,module) VALUES
('stock.view','Voir le stock','stock'),
('stock.create','Enregistrer les mouvements de stock','stock')
ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id,p.id
FROM roles r CROSS JOIN permissions p
WHERE r.code='ADMIN' AND p.code IN ('stock.view','stock.create');
