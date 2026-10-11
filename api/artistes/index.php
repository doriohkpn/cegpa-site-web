<?php
// api/artistes/index.php - CRUD Artistes
require_once '../config/cors.php';
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    if ($method === 'GET') {
        sendResponse(200, [
            [
                'id' => 1,
                'first_name' => 'Kofi',
                'last_name' => 'Aziagbe',
                'profession' => 'Peintre & Plasticien',
                'bio' => 'Plasticien contemporain reconnu pour son travail sur les textures mixtes et matières brutes.',
                'photo_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
            ],
            [
                'id' => 2,
                'first_name' => 'Abla',
                'last_name' => 'Sessi',
                'profession' => 'Sculptrice & Designeuse',
                'bio' => 'Pionnière de la sculpture métallique recyclée.',
                'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
            ]
        ], "Données de démonstration.");
    } else {
        sendResponse(503, null, "Base de données indisponible.");
    }
}

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM artistes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $artiste = $stmt->fetch();
            if ($artiste) {
                sendResponse(200, $artiste);
            } else {
                sendResponse(404, null, "Artiste non trouvé.");
            }
        } else {
            $stmt = $db->query("SELECT * FROM artistes ORDER BY last_name ASC, first_name ASC");
            $artistes = $stmt->fetchAll();
            sendResponse(200, $artistes);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $first_name = trim($input['first_name'] ?? '');
        $last_name = trim($input['last_name'] ?? '');
        $profession = trim($input['profession'] ?? '');
        $bio = trim($input['bio'] ?? '');
        $photo_url = trim($input['photo_url'] ?? '');

        if (empty($first_name) || empty($last_name) || empty($profession)) {
            sendResponse(400, null, "Le prénom, le nom et la profession de l'artiste sont requis.");
        }

        try {
            $stmt = $db->prepare("INSERT INTO artistes (first_name, last_name, profession, bio, photo_url) VALUES (:first_name, :last_name, :profession, :bio, :photo_url)");
            $stmt->execute([
                ':first_name' => $first_name,
                ':last_name' => $last_name,
                ':profession' => $profession,
                ':bio' => $bio,
                ':photo_url' => $photo_url
            ]);
            $newId = $db->lastInsertId();
            sendResponse(201, [
                'id' => $newId,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'profession' => $profession,
                'bio' => $bio,
                'photo_url' => $photo_url
            ], "Artiste ajouté avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de l'ajout : " . $e->getMessage());
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        $first_name = trim($input['first_name'] ?? '');
        $last_name = trim($input['last_name'] ?? '');
        $profession = trim($input['profession'] ?? '');
        $bio = trim($input['bio'] ?? '');
        $photo_url = trim($input['photo_url'] ?? '');

        if (!$id || empty($first_name) || empty($last_name) || empty($profession)) {
            sendResponse(400, null, "ID, prénom, nom et profession requis.");
        }

        try {
            $stmt = $db->prepare("UPDATE artistes SET first_name = :first_name, last_name = :last_name, profession = :profession, bio = :bio, photo_url = :photo_url WHERE id = :id");
            $stmt->execute([
                ':id' => $id,
                ':first_name' => $first_name,
                ':last_name' => $last_name,
                ':profession' => $profession,
                ':bio' => $bio,
                ':photo_url' => $photo_url
            ]);
            sendResponse(200, [
                'id' => $id,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'profession' => $profession,
                'bio' => $bio,
                'photo_url' => $photo_url
            ], "Artiste mis à jour avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la mise à jour : " . $e->getMessage());
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? json_decode(file_get_contents('php://input'), true)['id'] ?? null;
        if (!$id) {
            sendResponse(400, null, "ID de l'artiste manquant.");
        }

        try {
            $stmt = $db->prepare("DELETE FROM artistes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(200, ['id' => $id], "Artiste supprimé avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la suppression : " . $e->getMessage());
        }
        break;

    default:
        sendResponse(405, null, "Méthode non autorisée.");
}
