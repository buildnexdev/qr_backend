-- Run once on existing databases: menu.image was VARCHAR(255) and cannot hold base64 data URLs.
USE qr_ordering;

ALTER TABLE menu MODIFY COLUMN image LONGTEXT;
