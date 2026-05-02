-- Run once against qr_ordering. Adds numeric category `code` (auto-assigned for new rows).
USE qr_ordering;

ALTER TABLE menu_categories ADD COLUMN code INT UNSIGNED NULL;
UPDATE menu_categories SET code = id WHERE code IS NULL;
ALTER TABLE menu_categories MODIFY code INT UNSIGNED NOT NULL;
ALTER TABLE menu_categories ADD UNIQUE KEY uq_menu_categories_code (code);
