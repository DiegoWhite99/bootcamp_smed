<?php
// Evitar que errores de PHP rompan la respuesta
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// ── ¿La petición espera JSON (AJAX) o es un envío normal del navegador? ──
$accept  = $_SERVER['HTTP_ACCEPT'] ?? '';
$xrw     = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');
$wantsJson = (strpos($accept, 'application/json') !== false) || ($xrw === 'xmlhttprequest');

// Página a la que volver si es un envío sin JavaScript
$volver = $_SERVER['HTTP_REFERER'] ?? '/';

/**
 * Responde según el tipo de petición:
 *  - AJAX  → JSON (lo consume FormHandler.js para mostrar el mensaje verde)
 *  - Normal→ página HTML bonita (nunca JSON crudo a la vista del usuario)
 */
function responder(bool $ok, string $message, int $code, bool $wantsJson, string $volver): void
{
    http_response_code($code);

    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(["status" => $ok ? "success" : "error", "message" => $message]);
        exit;
    }

    // Respuesta HTML autocontenida y on-brand para envíos sin JavaScript
    $color = $ok ? '#22c55e' : '#ff6b6b';
    $icon  = $ok ? '&#10003;' : '&#10005;';
    $titulo = $ok ? '¡Mensaje enviado!' : 'Ups, algo pasó';
    $safeMsg = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $safeVolver = htmlspecialchars($volver, ENT_QUOTES, 'UTF-8');
    header('Content-Type: text/html; charset=utf-8');
    echo <<<HTML
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$titulo — SMED Technology</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:linear-gradient(160deg,#050505,#081b3b);color:#f5f5f5;
       font-family:'Poppins',system-ui,sans-serif;padding:24px;}
  .card{max-width:420px;text-align:center;background:rgba(8,27,59,.55);
        border:1px solid rgba(13,202,240,.2);border-radius:20px;padding:48px 32px;
        backdrop-filter:blur(16px);box-shadow:0 20px 60px rgba(0,0,0,.4);}
  .ic{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;
      font-size:34px;color:$color;border:2px solid $color;}
  h1{font-size:1.4rem;margin:0 0 12px;}
  p{color:rgba(245,245,245,.7);line-height:1.6;margin:0 0 28px;}
  a{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#0dcaf0,#0077b6);
    color:#050505;font-weight:600;text-decoration:none;border-radius:12px;}
</style></head>
<body><div class="card">
  <div class="ic">$icon</div>
  <h1>$titulo</h1>
  <p>$safeMsg</p>
  <a href="$safeVolver">Volver</a>
</div></body></html>
HTML;
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    responder(false, "Método no permitido.", 405, $wantsJson, $volver);
}

// ── Helper de sanitización ────────────────────────────────
$clean = fn($v) => trim(htmlspecialchars(strip_tags((string) $v), ENT_QUOTES, 'UTF-8'));

// ── Recibir y sanitizar datos principales ─────────────────
$nombre   = $clean($_POST['nombre']   ?? '');
$email    = trim(filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL));
$telefono = $clean($_POST['telefono'] ?? '');
$mensaje  = $clean($_POST['mensaje']  ?? '');

// El campo de "servicio" varía según el formulario (servicio / tipo / tipo_cliente)
$servicio = $clean($_POST['servicio'] ?? $_POST['tipo'] ?? $_POST['tipo_cliente'] ?? '');

// ── Validaciones ──────────────────────────────────────────
if (!$nombre || !$email || !$mensaje) {
    responder(false, "Por favor completa todos los campos obligatorios.", 400, $wantsJson, $volver);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, "El correo electrónico no es válido.", 400, $wantsJson, $volver);
}

// ── Campos extra (area, dispositivo, etc.) — no perder nada ─
$camposBase = ['nombre', 'email', 'telefono', 'mensaje', 'servicio', 'tipo', 'tipo_cliente'];
$extrasTxt  = '';
foreach ($_POST as $k => $v) {
    if (in_array($k, $camposBase, true) || $v === '' || is_array($v)) continue;
    $extrasTxt .= ucfirst($k) . ": " . $clean($v) . "\n";
}

// ── Cargar configuración SMTP ─────────────────────────────
$configFile = __DIR__ . '/config.php';
$cfg = is_file($configFile) ? require $configFile : null;

$asunto    = "Nuevo contacto web: " . ($servicio ?: "Consulta general");
$contenido = "Nombre: $nombre\n"
           . "Email: $email\n"
           . "Teléfono: " . ($telefono ?: "-") . "\n"
           . "Servicio: " . ($servicio ?: "-") . "\n"
           . ($extrasTxt ?: "")
           . "\nMensaje:\n$mensaje\n";

// Para el historial en BD, guardamos los extras junto al mensaje
$mensajeBD = $extrasTxt ? ($mensaje . "\n\n---\n" . $extrasTxt) : $mensaje;

// ── Guardar en base de datos (no bloquea el envío si falla) ─
if ($cfg) {
    require_once __DIR__ . '/db.php';
    $pdo = smed_db_connect($cfg);
    if ($pdo) {
        try {
            $stmt = $pdo->prepare(
                "INSERT INTO contactos (nombre, email, telefono, servicio, mensaje, ip)
                 VALUES (:nombre, :email, :telefono, :servicio, :mensaje, :ip)"
            );
            $stmt->execute([
                ':nombre'   => $nombre,
                ':email'    => $email,
                ':telefono' => $telefono ?: null,
                ':servicio' => $servicio ?: null,
                ':mensaje'  => $mensajeBD,
                ':ip'       => $_SERVER['REMOTE_ADDR'] ?? null,
            ]);
        } catch (\Throwable $e) {
            error_log('FormContact DB insert error: ' . $e->getMessage());
        }
    }
}

// ── Intentar envío por SMTP (PHPMailer) ───────────────────
$enviado = false;
$errorSmtp = '';

if ($cfg && !empty($cfg['SMTP_PASS']) && $cfg['SMTP_PASS'] !== 'TU_CONTRASEÑA_AQUI') {
    require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
    require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $cfg['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $cfg['SMTP_USER'];
        $mail->Password   = $cfg['SMTP_PASS'];
        $mail->SMTPSecure = $cfg['SMTP_SECURE']; // ssl / tls
        $mail->Port       = (int) $cfg['SMTP_PORT'];
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($cfg['FROM_EMAIL'], $cfg['FROM_NAME']);
        $mail->addAddress($cfg['TO_EMAIL'], $cfg['TO_NAME']);
        $mail->addReplyTo($email, $nombre);
        if (!empty($cfg['CC_EMAIL'])) {
            $mail->addCC($cfg['CC_EMAIL']);
        }

        $mail->Subject = $asunto;
        $mail->Body    = $contenido;

        $mail->send();
        $enviado = true;
    } catch (\Throwable $e) {
        $errorSmtp = $mail->ErrorInfo ?: $e->getMessage();
        error_log("FormContact SMTP error: $errorSmtp");
    }
}

// ── Respuesta ─────────────────────────────────────────────
if ($enviado) {
    responder(true, "¡Mensaje enviado con éxito! Te responderemos pronto.", 200, $wantsJson, $volver);
}

// Fallback (entorno local o SMTP sin configurar): guardar en log
$logDir = __DIR__ . "/../logs";
if (!is_dir($logDir)) { @mkdir($logDir, 0775, true); }
$logFile = $logDir . "/email_log.txt";
$registro = "-----------------------------------\n"
          . "Fecha: " . date("Y-m-d H:i:s") . "\n"
          . "Asunto: $asunto\n"
          . ($errorSmtp ? "Error SMTP: $errorSmtp\n" : "")
          . "\n" . $contenido . "\n";

if (@file_put_contents($logFile, $registro, FILE_APPEND)) {
    responder(true, "¡Mensaje recibido! Te responderemos pronto.", 200, $wantsJson, $volver);
} else {
    responder(false, "No pudimos enviar el mensaje. Intenta de nuevo más tarde.", 500, $wantsJson, $volver);
}
