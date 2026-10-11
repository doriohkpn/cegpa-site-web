<?php
// api/artistes/upload.php - Endpoint d'upload de photo d'artiste
require_once '../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(405, null, "Méthode non autorisée.");
}

if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(400, null, "Aucun fichier image valide n'a été téléversé.");
}

$file = $_FILES['photo'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];

if (!in_array($file['type'], $allowedTypes)) {
    sendResponse(400, null, "Format de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP, GIF.");
}

$maxSize = 5 * 1024 * 1024; // 5 MB
if ($file['size'] > $maxSize) {
    sendResponse(400, null, "Le fichier est trop volumineux (Maximum 5 Mo).");
}

$uploadDir = __DIR__ . '/../../uploads/artistes/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'artiste_' . uniqid() . '_' . time() . '.' . $extension;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $publicUrl = '/uploads/artistes/' . $filename;
    sendResponse(200, [
        'url' => $publicUrl,
        'filename' => $filename
    ], "Photo d'artiste téléversée avec succès.");
} else {
    sendResponse(500, null, "Erreur lors de l'enregistrement du fichier sur le serveur.");
}
