<?php
// api/visites/index.php - CRUD des Visites Virtuelles (GET, POST, PUT, DELETE)
require_once '../config/cors.php';
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    // Si la DB n'est pas disponible, renvoyer une réponse 503 ou mock data pour GET
    if ($method === 'GET') {
        sendResponse(200, [
            [
                'id' => 1,
                'title' => 'Espace d\'Exposition Principal CeGPA 3D',
                'url' => 'https://my.matterport.com/show/?m=sample1',
                'embed_url' => 'https://my.matterport.com/show/?m=sample1',
                'description' => 'Visite immersive à 360° du grand hall d\'exposition contemporaine.'
            ],
            [
                'id' => 2,
                'title' => 'Pavillon des Sculptures et Bronzes',
                'url' => 'https://my.matterport.com/show/?m=sample2',
                'embed_url' => 'https://my.matterport.com/show/?m=sample2',
                'description' => 'Découvrez la collection permanente de bronzes et sculptures africaines.'
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
            $stmt = $db->prepare("SELECT * FROM visites_virtuelles WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $visite = $stmt->fetch();
            if ($visite) {
                sendResponse(200, $visite);
            } else {
                sendResponse(404, null, "Visite virtuelle non trouvée.");
            }
        } else {
            $stmt = $db->query("SELECT * FROM visites_virtuelles ORDER BY created_at DESC");
            $visites = $stmt->fetchAll();
            sendResponse(200, $visites);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? '');
        $url = trim($input['url'] ?? '');
        $embed_url = trim($input['embed_url'] ?? $url);
        $description = trim($input['description'] ?? '');

        if (empty($title) || empty($url)) {
            sendResponse(400, null, "Le titre et le lien de la visite virtuelle sont obligatoires.");
        }

        try {
            $stmt = $db->prepare("INSERT INTO visites_virtuelles (title, url, embed_url, description) VALUES (:title, :url, :embed_url, :description)");
            $stmt->execute([
                ':title' => $title,
                ':url' => $url,
                ':embed_url' => $embed_url,
                ':description' => $description
            ]);
            $newId = $db->lastInsertId();
            sendResponse(201, ['id' => $newId, 'title' => $title, 'url' => $url, 'embed_url' => $embed_url, 'description' => $description], "Visite virtuelle ajoutée avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de l'ajout : " . $e->getMessage());
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        $title = trim($input['title'] ?? '');
        $url = trim($input['url'] ?? '');
        $embed_url = trim($input['embed_url'] ?? $url);
        $description = trim($input['description'] ?? '');

        if (!$id || empty($title) || empty($url)) {
            sendResponse(400, null, "ID, titre et lien obligatoires.");
        }

        try {
            $stmt = $db->prepare("UPDATE visites_virtuelles SET title = :title, url = :url, embed_url = :embed_url, description = :description WHERE id = :id");
            $stmt->execute([
                ':id' => $id,
                ':title' => $title,
                ':url' => $url,
                ':embed_url' => $embed_url,
                ':description' => $description
            ]);
            sendResponse(200, ['id' => $id, 'title' => $title, 'url' => $url, 'embed_url' => $embed_url, 'description' => $description], "Visite virtuelle mise à jour.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la mise à jour : " . $e->getMessage());
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? json_decode(file_get_contents('php://input'), true)['id'] ?? null;
        if (!$id) {
            sendResponse(400, null, "ID de la visite virtuelle manquant.");
        }

        try {
            $stmt = $db->prepare("DELETE FROM visites_virtuelles WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(200, ['id' => $id], "Visite virtuelle supprimée avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la suppression : " . $e->getMessage());
        }
        break;

    default:
        sendResponse(405, null, "Méthode non autorisée.");
}
