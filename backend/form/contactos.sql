-- ============================================================
--  Tabla de contactos del formulario web — SMED Technology
--  Cómo usar:
--   1. hPanel → Bases de datos → "Ingresar a phpMyAdmin"
--      (base de datos u938972921_smedapp)
--   2. Pestaña "SQL" → pega TODO esto → "Continuar".
-- ============================================================

CREATE TABLE IF NOT EXISTS `contactos` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`    VARCHAR(120) NOT NULL,
  `email`     VARCHAR(150) NOT NULL,
  `telefono`  VARCHAR(40)  DEFAULT NULL,
  `servicio`  VARCHAR(60)  DEFAULT NULL,
  `mensaje`   TEXT         NOT NULL,
  `ip`        VARCHAR(45)  DEFAULT NULL,
  `creado_en` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_creado_en` (`creado_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
