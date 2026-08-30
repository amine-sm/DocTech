CREATE DATABASE IF NOT EXISTS doctech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE doctech;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NULL,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  module VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT UNSIGNED NOT NULL,
  permission_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(40) NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIF','INACTIF','CONGE','MALADIE') NOT NULL DEFAULT 'ACTIF',
  role_id INT UNSIGNED NOT NULL,
  last_login DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fournisseurs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  nom VARCHAR(180) NOT NULL,
  contact_name VARCHAR(180) NULL,
  email VARCHAR(190) NULL,
  telephone VARCHAR(40) NULL,
  adresse VARCHAR(255) NULL,
  wilaya VARCHAR(100) NULL,
  nif VARCHAR(100) NULL,
  nis VARCHAR(100) NULL,
  registre_commerce VARCHAR(100) NULL,
  statut ENUM('ACTIF','INACTIF') NOT NULL DEFAULT 'ACTIF',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NULL,
  description_ar TEXT NULL,
  image_url VARCHAR(500) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS marques (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  name_ar VARCHAR(150) NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NULL,
  description_ar TEXT NULL,
  logo_url VARCHAR(500) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  sku VARCHAR(100) NULL UNIQUE,
  name VARCHAR(220) NOT NULL,
  name_ar VARCHAR(220) NULL,
  short_name VARCHAR(120) NULL,
  short_name_ar VARCHAR(120) NULL,
  slug VARCHAR(250) NOT NULL UNIQUE,
  short_description VARCHAR(500) NULL,
  short_description_ar VARCHAR(500) NULL,
  description LONGTEXT NULL,
  description_ar LONGTEXT NULL,
  category_id INT UNSIGNED NOT NULL,
  marque_id INT UNSIGNED NULL,
  fournisseur_id INT UNSIGNED NULL,
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  old_price DECIMAL(12,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  stock_enabled TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('BROUILLON','ACTIF','INACTIF') NOT NULL DEFAULT 'ACTIF',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_articles_marque FOREIGN KEY (marque_id) REFERENCES marques(id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_fournisseur FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL,
  INDEX idx_articles_status (status),
  INDEX idx_articles_category (category_id),
  INDEX idx_articles_marque (marque_id),
  FULLTEXT INDEX ftx_articles_name_description (name, short_description, description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS article_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id INT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  alt_text_ar VARCHAR(255) NULL,
  color_value VARCHAR(100) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_article_images_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_article_images_article (article_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS article_variants (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id INT UNSIGNED NOT NULL,
  type ENUM('COULEUR','TAILLE','POINTURE','PARFUM') NOT NULL,
  value VARCHAR(100) NOT NULL,
  value_ar VARCHAR(100) NULL,
  color_hex VARCHAR(20) NULL,
  sku VARCHAR(100) NULL UNIQUE,
  price_override DECIMAL(12,2) NULL,
  stock INT NULL,
  image_id INT UNSIGNED NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_variants_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_variants_image FOREIGN KEY (image_id) REFERENCES article_images(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  name_ar VARCHAR(180) NULL,
  type ENUM('POURCENTAGE','MONTANT') NOT NULL DEFAULT 'POURCENTAGE',
  value DECIMAL(12,2) NOT NULL,
  badge VARCHAR(80) NULL,
  badge_ar VARCHAR(80) NULL,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_promotions_dates (active, start_at, end_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotion_articles (
  promotion_id INT UNSIGNED NOT NULL,
  article_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (promotion_id, article_id),
  CONSTRAINT fk_promotion_articles_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
  CONSTRAINT fk_promotion_articles_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS commandes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tracking_number VARCHAR(80) NOT NULL UNIQUE,
  customer_name VARCHAR(180) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  wilaya VARCHAR(100) NULL,
  commune VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  note TEXT NULL,
  delivery_type ENUM('HOME','STORE') NOT NULL DEFAULT 'HOME',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('CASH_ON_DELIVERY') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  status ENUM('NOUVELLE','CONFIRMEE','PREPARATION','EXPEDIEE','LIVREE','ANNULEE') NOT NULL DEFAULT 'NOUVELLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_commandes_status (status),
  INDEX idx_commandes_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS commande_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  commande_id BIGINT UNSIGNED NOT NULL,
  article_id INT UNSIGNED NULL,
  variant_id INT UNSIGNED NULL,
  product_name VARCHAR(220) NOT NULL,
  sku VARCHAR(100) NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_commande_items_commande FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  CONSTRAINT fk_commande_items_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL,
  CONSTRAINT fk_commande_items_variant FOREIGN KEY (variant_id) REFERENCES article_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity VARCHAR(120) NOT NULL,
  entity_id VARCHAR(80) NULL,
  payload JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB;

INSERT INTO roles (code, name, description, is_system)
VALUES
('ADMIN', 'Administrateur', 'Accès complet à l’administration', 1),
('OPERATEUR', 'Opérateur', 'Gestion commerciale et commandes', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO permissions (code, name, module) VALUES
('dashboard.view','Voir le tableau de bord','dashboard'),
('users.view','Voir les utilisateurs','users'),
('users.create','Créer un utilisateur','users'),
('users.update','Modifier un utilisateur','users'),
('users.delete','Supprimer un utilisateur','users'),
('roles.view','Voir les rôles','roles'),
('roles.create','Créer un rôle','roles'),
('roles.update','Modifier un rôle','roles'),
('roles.delete','Supprimer un rôle','roles'),
('permissions.view','Voir les permissions','permissions'),
('fournisseurs.view','Voir les fournisseurs','fournisseurs'),
('fournisseurs.create','Créer un fournisseur','fournisseurs'),
('fournisseurs.update','Modifier un fournisseur','fournisseurs'),
('fournisseurs.delete','Supprimer un fournisseur','fournisseurs'),
('categories.view','Voir les catégories','categories'),
('categories.create','Créer une catégorie','categories'),
('categories.update','Modifier une catégorie','categories'),
('categories.delete','Supprimer une catégorie','categories'),
('marques.view','Voir les marques','marques'),
('marques.create','Créer une marque','marques'),
('marques.update','Modifier une marque','marques'),
('marques.delete','Supprimer une marque','marques'),
('articles.view','Voir les articles','articles'),
('articles.create','Créer un article','articles'),
('articles.update','Modifier un article','articles'),
('articles.delete','Supprimer un article','articles'),
('promotions.view','Voir les promotions','promotions'),
('promotions.create','Créer une promotion','promotions'),
('promotions.update','Modifier une promotion','promotions'),
('promotions.delete','Supprimer une promotion','promotions'),
('commandes.view','Voir les commandes','commandes'),
('commandes.update','Modifier les commandes','commandes'),
('uploads.create','Téléverser des images','uploads')
ON DUPLICATE KEY UPDATE name = VALUES(name), module = VALUES(module);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.code = 'ADMIN';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  'dashboard.view','fournisseurs.view','categories.view','marques.view','articles.view',
  'promotions.view','commandes.view','commandes.update','uploads.create'
)
WHERE r.code = 'OPERATEUR';
