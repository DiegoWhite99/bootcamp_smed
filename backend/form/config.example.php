<?php
/**
 * Plantilla de configuración SMTP para el formulario de contacto.
 *
 * CÓMO USAR:
 *  1. Copia este archivo como "config.php" en la misma carpeta.
 *  2. Rellena SMTP_PASS con la contraseña del buzón contacto@smedtech.com.co
 *     (la misma que usas para entrar al webmail de Hostinger).
 *  3. NO subas config.php a GitHub (ya está en .gitignore).
 *
 * Datos SMTP de Hostinger (Titan / Hostinger Email):
 *   Host:   smtp.hostinger.com
 *   Puerto: 465  (SSL)   ó   587 (TLS)
 */

return [
    // --- Credenciales del buzón que ENVÍA (autenticación SMTP) ---
    'SMTP_HOST'   => 'smtp.hostinger.com',
    'SMTP_PORT'   => 465,
    'SMTP_SECURE' => 'ssl',                       // 'ssl' para 465, 'tls' para 587
    'SMTP_USER'   => 'contacto@smedtech.com.co',  // buzón real de Hostinger
    'SMTP_PASS'   => 'TU_CONTRASEÑA_AQUI',        // <-- contraseña del buzón

    // --- Quién aparece como remitente ---
    'FROM_EMAIL'  => 'contacto@smedtech.com.co',  // debe ser el mismo buzón autenticado
    'FROM_NAME'   => 'SMED Technology - Web',

    // --- A dónde LLEGAN los mensajes del formulario ---
    'TO_EMAIL'    => 'contacto@smedtech.com.co',
    'TO_NAME'     => 'SMED Technology',

    // --- Copia opcional (deja '' para desactivar) ---
    'CC_EMAIL'    => 'smed.techhub@gmail.com',

    // --- Base de datos MySQL (Hostinger → Bases de datos) ---
    'DB_HOST'     => 'localhost',
    'DB_NAME'     => 'u938972921_xxxxx',
    'DB_USER'     => 'u938972921_xxxxx',
    'DB_PASS'     => 'TU_CONTRASEÑA_BD',
];
