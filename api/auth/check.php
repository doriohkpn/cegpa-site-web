<?php
// api/auth/check.php - Vérification du token/session administrateur
require_once '../config/cors.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    sendResponse(401, null, "Jeton d'authentification manquant.");
}

$jwt = $matches[1];
$decoded = json_decode(base64_decode($jwt), true);

if (!$decoded || !isset($decoded['exp']) || $decoded['exp'] < time()) {
    sendResponse(401, null, "Session expirée ou jeton invalide.");
}

sendResponse(200, [
    'user' => [
        'id' => $decoded['id'],
        'username' => $decoded['username'],
        'email' => $decoded['email'] ?? '',
        'role' => $decoded['role'] ?? 'admin'
    ]
], "Jeton valide.");
