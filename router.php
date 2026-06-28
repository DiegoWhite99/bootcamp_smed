<?php
// ════════════════════════════════════════════════
//  Router para el servidor integrado de PHP (solo desarrollo local)
//  Imita las reglas del .htaccess (URLs limpias) para que el sitio
//  funcione igual que en Hostinger sin necesidad de Apache/LiteSpeed.
//
//  Uso:  php -S localhost:3000 router.php
//  Luego abre:  http://localhost:3000
// ════════════════════════════════════════════════

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 1) Raíz → página de inicio (igual que index.php redirige a /nosotros)
if ($uri === '/' || $uri === '') {
    $uri = '/nosotros';
}

// 2) Mapa de URLs limpias → archivos reales (igual que el .htaccess)
$rutas = [
    '/nosotros'     => '/src/pages/AboutUs.html',
    '/servicios'    => '/src/pages/Services.html',
    '/soporte'      => '/src/pages/Soporte.html',
    '/redes'        => '/src/pages/Redes.html',
    '/cloud'        => '/src/pages/Cloud.html',
    '/desarrollo'   => '/src/pages/Desarrollo.html',
    '/asesorias'    => '/src/pages/Asesorias.html',
    '/tienda'       => '/src/pages/Store.html',
    '/experiencias' => '/src/pages/Experiences.html',
    '/login'        => '/src/pages/login.html',
    '/habeas-data'  => '/src/pages/HabeasData.html',
];

$clave = rtrim($uri, '/');
if ($clave === '') $clave = $uri;

if (isset($rutas[$clave])) {
    $archivo = __DIR__ . $rutas[$clave];
    if (is_file($archivo)) {
        header('Content-Type: text/html; charset=UTF-8');
        readfile($archivo);
        return true;
    }
}

// 3) Archivos reales (css, js, imágenes, etc.) → servir tal cual
$archivoReal = __DIR__ . $uri;
if (is_file($archivoReal)) {
    return false; // deja que el servidor de PHP lo sirva con su MIME
}

// 4) No encontrado
http_response_code(404);
echo "404 — Ruta no encontrada: " . htmlspecialchars($uri);
return true;
