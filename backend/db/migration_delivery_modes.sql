-- DOCTECH / Delivery modes HOME + DESK
-- Run once on an existing database after migration_elogistia.sql.

ALTER TABLE commandes
  MODIFY COLUMN delivery_type ENUM('HOME','DESK','STORE') NOT NULL DEFAULT 'HOME';

ALTER TABLE commandes
  ADD COLUMN delivery_agency_id VARCHAR(80) NULL AFTER delivery_stop_desk,
  ADD COLUMN delivery_agency_name VARCHAR(255) NULL AFTER delivery_agency_id;
