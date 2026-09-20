-- DOCTECH / Elogistia integration
ALTER TABLE commandes
  ADD COLUMN delivery_provider VARCHAR(30) NULL AFTER delivery_type,
  ADD COLUMN delivery_tracking VARCHAR(120) NULL AFTER delivery_provider,
  ADD COLUMN delivery_sync_status ENUM('PENDING','SYNCED','ERROR') NOT NULL DEFAULT 'PENDING' AFTER delivery_tracking,
  ADD COLUMN delivery_sync_error TEXT NULL AFTER delivery_sync_status,
  ADD COLUMN delivery_synced_at DATETIME NULL AFTER delivery_sync_error,
  ADD COLUMN delivery_wilaya_id VARCHAR(30) NULL AFTER wilaya,
  ADD COLUMN delivery_commune_id VARCHAR(30) NULL AFTER commune,
  ADD COLUMN delivery_mode VARCHAR(30) NULL AFTER delivery_commune_id,
  ADD COLUMN delivery_stop_desk VARCHAR(30) NULL AFTER delivery_mode,
  ADD COLUMN delivery_agency_id VARCHAR(80) NULL AFTER delivery_stop_desk,
  ADD COLUMN delivery_agency_name VARCHAR(255) NULL AFTER delivery_agency_id,
  ADD INDEX idx_commandes_delivery_tracking (delivery_tracking),
  ADD INDEX idx_commandes_delivery_sync (delivery_sync_status);
