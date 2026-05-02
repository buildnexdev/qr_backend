-- Optional SKU / short code for menu rows + wider category for multiple names (run once on existing DBs).
ALTER TABLE menu ADD COLUMN item_code VARCHAR(64) NULL;
ALTER TABLE menu MODIFY COLUMN category VARCHAR(512) NULL;
