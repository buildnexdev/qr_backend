-- Full table management fields (run once on existing DBs).
ALTER TABLE tables ADD COLUMN table_code VARCHAR(32) NULL AFTER name;
ALTER TABLE tables ADD COLUMN capacity INT UNSIGNED NOT NULL DEFAULT 4 AFTER table_code;
ALTER TABLE tables ADD COLUMN branch_id INT NULL AFTER capacity;
ALTER TABLE tables ADD COLUMN floor_section VARCHAR(128) NULL AFTER branch_id;
ALTER TABLE tables ADD COLUMN qr_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER floor_section;
ALTER TABLE tables ADD COLUMN self_ordering TINYINT(1) NOT NULL DEFAULT 1 AFTER qr_enabled;
ALTER TABLE tables ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER self_ordering;
ALTER TABLE tables ADD COLUMN occupied_since DATETIME NULL AFTER status;
