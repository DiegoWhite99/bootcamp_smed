<?php
/**
 * Conexión a MySQL mediante PDO.
 * Devuelve un objeto PDO listo, o null si no hay credenciales / falla la conexión.
 * Las credenciales viven en config.php (no versionado).
 */
function smed_db_connect(array $cfg): ?PDO
{
    if (empty($cfg['DB_NAME']) || empty($cfg['DB_USER'])) {
        return null;
    }

    $host = $cfg['DB_HOST'] ?? 'localhost';
    $dsn  = "mysql:host={$host};dbname={$cfg['DB_NAME']};charset=utf8mb4";

    try {
        return new PDO($dsn, $cfg['DB_USER'], $cfg['DB_PASS'] ?? '', [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (\Throwable $e) {
        error_log('SMED DB connect error: ' . $e->getMessage());
        return null;
    }
}
