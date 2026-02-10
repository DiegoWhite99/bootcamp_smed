<?php
header('Content-Type: application/json');
// Evitar que errores de PHP rompan el JSON
ini_set('display_errors', 0);
ini_set('log_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recibir y sanitizar datos del formulario
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_SPECIAL_CHARS);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $telefono = filter_input(INPUT_POST, 'telefono', FILTER_SANITIZE_SPECIAL_CHARS);
    $servicio = filter_input(INPUT_POST, 'servicio', FILTER_SANITIZE_SPECIAL_CHARS);
    $mensaje = filter_input(INPUT_POST, 'mensaje', FILTER_SANITIZE_SPECIAL_CHARS);

    // Validar campos requeridos
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
    
    // Configurar destinatario
    $destinatario = "smed.techhub@gmail.com";
    $asunto = "Nuevo contacto: " . ($servicio ? $servicio : "Consulta General");
    
    // Construir el mensaje
    $contenido = "Nombre: $nombre\n";
    $contenido .= "Email: $email\n";
    $contenido .= "Teléfono: $telefono\n";
    $contenido .= "Servicio: $servicio\n";
    $contenido .= "Mensaje:\n$mensaje\n";
    
    // Cabeceras
    $cabeceras = "From: no-reply@smedtechnology.com\r\n";
    $cabeceras .= "Reply-To: $email\r\n";
    $cabeceras .= "X-Mailer: PHP/" . phpversion();
    
    // Enviar correo (o guardar en log si falla mail())
    if (@mail($destinatario, $asunto, $contenido, $cabeceras)) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "¡Mensaje enviado con éxito!"]);
    } else {
        // Fallback para entorno local: guardar en archivo
        $logFile = __DIR__ . "/../logs/email_log.txt";
        $logInyection = "-----------------------------------\n";
        $logInyection .= "Fecha: " . date("Y-m-d H:i:s") . "\n";
        $logInyection .= "Para: $destinatario\n";
        $logInyection .= "Asunto: $asunto\n";
        $logInyection .= "Cabeceras: $cabeceras\n\n";
        $logInyection .= $contenido . "\n";
        
        if (file_put_contents($logFile, $logInyection, FILE_APPEND)) {
             http_response_code(200);
             echo json_encode([
                "status" => "success", 
                "message" => "Entorno local: El correo no se pudo enviar (falta SMTP), pero se guardó en src/utils/email_log.txt para verificación."
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al enviar el mensaje. Intenta nuevamente más tarde."]);
        }
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
}
?>