<?php
header('Content-Type: application/json; charset=utf-8');
// Evitar que errores de PHP rompan el JSON de respuesta
ini_set('display_errors', 0);
ini_set('log_errors', 1);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit;
}

// ── Recibir y sanitizar datos ─────────────────────────────
$nombre   = trim(filter_input(INPUT_POST, 'nombre',   FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$email    = trim(filter_input(INPUT_POST, 'email',    FILTER_SANITIZE_EMAIL) ?? '');
$telefono = trim(filter_input(INPUT_POST, 'telefono', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$servicio = trim(filter_input(INPUT_POST, 'servicio', FILTER_SANITIZE_SPECIAL_CHARS) ?? '');
$mensaje  = trim(filter_input(INPUT_POST, 'mensaje',  FILTER_SANITIZE_SPECIAL_CHARS) ?? '');

// ── Validaciones ──────────────────────────────────────────
if (!$nombre || !$email || !$mensaje) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Por favor completa todos los campos obligatorios."]);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "El correo electrónico no es válido."]);
    exit;
}

// ── Cargar configuración SMTP ─────────────────────────────
$configFile = __DIR__ . '/config.php';
$cfg = is_file($configFile) ? require $configFile : null;

$asunto    = "Nuevo contacto web: " . ($servicio ?: "Consulta general");
$contenido = "Nombre: $nombre\n"
           . "Email: $email\n"
           . "Teléfono: " . ($telefono ?: "-") . "\n"
           . "Servicio: " . ($servicio ?: "-") . "\n\n"
           . "Mensaje:\n$mensaje\n";

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
                ':mensaje'  => $mensaje,
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
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "¡Mensaje enviado con éxito! Te responderemos pronto."]);
    exit;
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
    http_response_code(200);
    echo json_encode([
        "status"  => "success",
        "message" => "Mensaje recibido (modo local: guardado en logs, SMTP no configurado)."
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al enviar el mensaje. Intenta nuevamente más tarde."]);
}
