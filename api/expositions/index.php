<?php
// api/expositions/index.php - CRUD Expositions & Jointures Artistes / Visites Virtuelles
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
                'title' => 'Mémoires Subtiles & Formes Contemporaines',
                'date_range' => '12 Février - 30 Avril 2026',
                'summary' => 'Une immersion totale dans la rencontre entre traditions plastiques et expressions contemporaines.',
                'description' => 'Cette exposition majeure rassemble les œuvres de plasticiens de renom autour du thème des mémoires visuelles.',
                'image_url' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
                'visite_virtuelle_id' => 1,
                'visite_title' => 'Espace d\'Exposition Principal CeGPA 3D',
                'visite_url' => 'https://my.matterport.com/show/?m=sample1',
                'status' => 'en_cours',
                'artistes' => [
                    ['id' => 1, 'first_name' => 'Kofi', 'last_name' => 'Aziagbe', 'profession' => 'Peintre & Plasticien', 'photo_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'],
                    ['id' => 2, 'first_name' => 'Abla', 'last_name' => 'Sessi', 'profession' => 'Sculptrice & Designeuse', 'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80']
                ]
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
            $stmt = $db->prepare("
                SELECT e.*, v.title AS visite_title, v.url AS visite_url, v.embed_url AS visite_embed_url 
                FROM expositions e
                LEFT JOIN visites_virtuelles v ON e.visite_virtuelle_id = v.id
                WHERE e.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $exposition = $stmt->fetch();

            if ($exposition) {
                // Récupérer les artistes associés
                $artStmt = $db->prepare("
                    SELECT a.*, ea.role 
                    FROM artistes a
                    JOIN exposition_artiste ea ON a.id = ea.artiste_id
                    WHERE ea.exposition_id = :expo_id
                ");
                $artStmt->execute([':expo_id' => $id]);
                $exposition['artistes'] = $artStmt->fetchAll();

                sendResponse(200, $exposition);
            } else {
                sendResponse(404, null, "Exposition non trouvée.");
            }
        } else {
            $isPublicFilter = isset($_GET['public']) && $_GET['public'] == '1';
            $whereClause = $isPublicFilter ? "WHERE (e.in_active_list IS NULL OR e.in_active_list = 1) AND (e.is_public IS NULL OR e.is_public = 1)" : "";

            $stmt = $db->query("
                SELECT e.*, v.title AS visite_title, v.url AS visite_url 
                FROM expositions e
                LEFT JOIN visites_virtuelles v ON e.visite_virtuelle_id = v.id
                {$whereClause}
                ORDER BY e.created_at DESC
            ");
            $expositions = $stmt->fetchAll();

            // Attacher les artistes pour chaque exposition
            foreach ($expositions as &$expo) {
                $artStmt = $db->prepare("
                    SELECT a.id, a.first_name, a.last_name, a.profession, a.photo_url, ea.role 
                    FROM artistes a
                    JOIN exposition_artiste ea ON a.id = ea.artiste_id
                    WHERE ea.exposition_id = :expo_id
                ");
                $artStmt->execute([':expo_id' => $expo['id']]);
                $expo['artistes'] = $artStmt->fetchAll();
            }

            sendResponse(200, $expositions);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? '');
        $date_range = trim($input['date_range'] ?? '');
        $summary = trim($input['summary'] ?? '');
        $description = trim($input['description'] ?? '');
        $image_url = trim($input['image_url'] ?? '');
        $visite_virtuelle_id = !empty($input['visite_virtuelle_id']) ? (int)$input['visite_virtuelle_id'] : null;
        $status = $input['status'] ?? 'en_cours';
        $in_active_list = isset($input['in_active_list']) ? (int)$input['in_active_list'] : 1;
        $is_public = isset($input['is_public']) ? (int)$input['is_public'] : 1;
        $submission_date = !empty($input['submission_date']) ? trim($input['submission_date']) : date('d/m/Y');
        $artist_ids = $input['artist_ids'] ?? []; // Tableau d'IDs d'artistes à associer

        if (empty($title) || empty($summary)) {
            sendResponse(400, null, "Le nom (titre) et le résumé sont obligatoires.");
        }

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("
                INSERT INTO expositions (title, date_range, summary, description, image_url, visite_virtuelle_id, status, in_active_list, is_public, submission_date) 
                VALUES (:title, :date_range, :summary, :description, :image_url, :visite_virtuelle_id, :status, :in_active_list, :is_public, :submission_date)
            ");
            $stmt->execute([
                ':title' => $title,
                ':date_range' => $date_range,
                ':summary' => $summary,
                ':description' => $description,
                ':image_url' => $image_url,
                ':visite_virtuelle_id' => $visite_virtuelle_id,
                ':status' => $status,
                ':in_active_list' => $in_active_list,
                ':is_public' => $is_public,
                ':submission_date' => $submission_date
            ]);
            $expoId = $db->lastInsertId();

            // Association des artistes
            if (!empty($artist_ids) && is_array($artist_ids)) {
                $assocStmt = $db->prepare("INSERT INTO exposition_artiste (exposition_id, artiste_id) VALUES (:expo_id, :art_id)");
                foreach ($artist_ids as $artId) {
                    $assocStmt->execute([':expo_id' => $expoId, ':art_id' => (int)$artId]);
                }
            }

            $db->commit();
            sendResponse(201, [
                'id' => $expoId, 
                'title' => $title,
                'in_active_list' => $in_active_list,
                'is_public' => $is_public,
                'submission_date' => $submission_date
            ], "Exposition créée avec succès.");
        } catch (Exception $e) {
            $db->rollBack();
            sendResponse(500, null, "Erreur lors de la création de l'exposition : " . $e->getMessage());
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;

        if (!$id) {
            sendResponse(400, null, "ID de l'exposition requis.");
        }

        // Cas de mise à jour rapide des drapeaux d'activation / publication
        if (isset($input['toggle_action'])) {
            try {
                if ($input['toggle_action'] === 'add_to_public') {
                    $stmt = $db->prepare("UPDATE expositions SET in_active_list = 1, is_public = 1 WHERE id = :id");
                    $stmt->execute([':id' => $id]);
                    sendResponse(200, ['id' => $id, 'in_active_list' => 1, 'is_public' => 1], "Exposition ajoutée au site public.");
                } else if ($input['toggle_action'] === 'toggle_public') {
                    $newPublic = !empty($input['is_public']) ? 1 : 0;
                    $stmt = $db->prepare("UPDATE expositions SET is_public = :pub WHERE id = :id");
                    $stmt->execute([':pub' => $newPublic, ':id' => $id]);
                    sendResponse(200, ['id' => $id, 'is_public' => $newPublic], "Visibilité publique mise à jour.");
                }
            } catch (Exception $e) {
                sendResponse(500, null, "Erreur lors de l'opération : " . $e->getMessage());
            }
        }

        $title = trim($input['title'] ?? '');
        $date_range = trim($input['date_range'] ?? '');
        $summary = trim($input['summary'] ?? '');
        $description = trim($input['description'] ?? '');
        $image_url = trim($input['image_url'] ?? '');
        $visite_virtuelle_id = !empty($input['visite_virtuelle_id']) ? (int)$input['visite_virtuelle_id'] : null;
        $status = $input['status'] ?? 'en_cours';
        $in_active_list = isset($input['in_active_list']) ? (int)$input['in_active_list'] : 1;
        $is_public = isset($input['is_public']) ? (int)$input['is_public'] : 1;
        $artist_ids = $input['artist_ids'] ?? null;

        try {
            $db->beginTransaction();

            $stmt = $db->prepare("
                UPDATE expositions 
                SET title = :title, date_range = :date_range, summary = :summary, 
                    description = :description, image_url = :image_url, 
                    visite_virtuelle_id = :visite_virtuelle_id, status = :status,
                    in_active_list = :in_active_list, is_public = :is_public
                WHERE id = :id
            ");
            $stmt->execute([
                ':id' => $id,
                ':title' => $title,
                ':date_range' => $date_range,
                ':summary' => $summary,
                ':description' => $description,
                ':image_url' => $image_url,
                ':visite_virtuelle_id' => $visite_virtuelle_id,
                ':status' => $status,
                ':in_active_list' => $in_active_list,
                ':is_public' => $is_public
            ]);

            // Mettre à jour les associations si fournies
            if ($artist_ids !== null && is_array($artist_ids)) {
                $delStmt = $db->prepare("DELETE FROM exposition_artiste WHERE exposition_id = :expo_id");
                $delStmt->execute([':expo_id' => $id]);

                $assocStmt = $db->prepare("INSERT INTO exposition_artiste (exposition_id, artiste_id) VALUES (:expo_id, :art_id)");
                foreach ($artist_ids as $artId) {
                    $assocStmt->execute([':expo_id' => $id, ':art_id' => (int)$artId]);
                }
            }

            $db->commit();
            sendResponse(200, ['id' => $id, 'title' => $title], "Exposition mise à jour avec succès.");
        } catch (Exception $e) {
            $db->rollBack();
            sendResponse(500, null, "Erreur de mise à jour : " . $e->getMessage());
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? json_decode(file_get_contents('php://input'), true)['id'] ?? null;
        $action = $_GET['action'] ?? json_decode(file_get_contents('php://input'), true)['action'] ?? 'remove_from_list';
        if (!$id) {
            sendResponse(400, null, "ID de l'exposition manquant.");
        }

        try {
            if ($action === 'permanent') {
                $stmt = $db->prepare("DELETE FROM expositions WHERE id = :id");
                $stmt->execute([':id' => $id]);
                sendResponse(200, ['id' => $id], "Exposition définitivement supprimée.");
            } else {
                // Supprimer de la liste des expositions (retire de la liste active et du site public, conserve dans l'historique)
                $stmt = $db->prepare("UPDATE expositions SET in_active_list = 0, is_public = 0 WHERE id = :id");
                $stmt->execute([':id' => $id]);
                sendResponse(200, ['id' => $id], "Exposition retirée de la liste et du site public (conservée dans l'historique).");
            }
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur de suppression : " . $e->getMessage());
        }
        break;

    default:
        sendResponse(405, null, "Méthode non autorisée.");
}
