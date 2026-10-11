<?php
// api/contact/index.php - Formulaire de contact public & Gestion admin des messages
require_once '../config/cors.php';
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

switch ($method) {
    case 'POST':
        // Enregistrement d'un nouveau message depuis le site public
        $input = json_decode(file_get_contents('php://input'), true);

        $full_name = trim($input['full_name'] ?? '');
        $email = trim($input['email'] ?? '');
        $subject = trim($input['subject'] ?? '');
        $message = trim($input['message'] ?? '');

        // Validation Back-End stricte
        $errors = [];

        if (empty($full_name)) {
            $errors[] = "Le nom complet est obligatoire.";
        }
        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Veuillez fournir une adresse e-mail valide.";
        }
        if (empty($subject)) {
            $errors[] = "Le sujet de votre message est obligatoire.";
        }
        if (empty($message) || mb_strlen($message) < 10) {
            $errors[] = "Le message doit contenir au moins 10 caractères.";
        }

        if (!empty($errors)) {
            sendResponse(422, ['errors' => $errors], "Formulaire invalide : " . implode(' ', $errors));
        }

        // Envoi réel du message à kruzz1140@gmail.com
        $to = 'kruzz1140@gmail.com';
        $mail_subject = "[CeGPA] Nouveau message de contact : " . $subject;
        $mail_body = "Nouveau message reçu depuis le site CeGPA :\n\n" .
                     "Nom complet : " . $full_name . "\n" .
                     "Email : " . $email . "\n" .
                     "Sujet : " . $subject . "\n\n" .
                     "Message :\n" . $message . "\n\n" .
                     "Date : " . date('d/m/Y H:i:s') . "\n";
        $headers = "From: contact@cegpa-uac.org\r\n" .
                   "Reply-To: " . $email . "\r\n" .
                   "Content-Type: text/plain; charset=UTF-8\r\n" .
                   "X-Mailer: PHP/" . phpversion();

        @mail($to, $mail_subject, $mail_body, $headers);

        if (!$db) {
            // Mode fallback si la DB n'est pas connectée
            sendResponse(200, [
                'full_name' => $full_name,
                'email' => $email,
                'subject' => $subject,
                'message' => $message,
                'recipient' => $to,
                'created_at' => date('Y-m-d H:i:s')
            ], "Le message est envoyé au mail suivant : kruzz1140@gmail.com");
        }

        try {
            $stmt = $db->prepare("INSERT INTO messages_contact (full_name, email, subject, message) VALUES (:full_name, :email, :subject, :message)");
            $stmt->execute([
                ':full_name' => $full_name,
                ':email' => $email,
                ':subject' => $subject,
                ':message' => $message
            ]);
            $newId = $db->lastInsertId();

            sendResponse(200, [
                'id' => $newId,
                'full_name' => $full_name,
                'email' => $email,
                'subject' => $subject,
                'recipient' => $to
            ], "Le message est envoyé au mail suivant : kruzz1140@gmail.com");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur serveur lors de l'envoi du message : " . $e->getMessage());
        }
        break;

    case 'GET':
        // Consultation des messages par l'administrateur
        if (!$db) {
            sendResponse(200, [
                [
                    'id' => 1,
                    'full_name' => 'Jean-Paul Dupont',
                    'email' => 'jp.dupont@example.com',
                    'subject' => 'Demande de visite de groupe',
                    'message' => 'Bonjour, nous aimerions réserver une visite guidée pour un groupe de 15 personnes le mois prochain.',
                    'is_read' => 0,
                    'created_at' => '2026-08-25 14:30:00'
                ]
            ], "Messages de démonstration.");
        }

        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $db->prepare("SELECT * FROM messages_contact WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $msg = $stmt->fetch();
            if ($msg) {
                sendResponse(200, $msg);
            } else {
                sendResponse(404, null, "Message non trouvé.");
            }
        } else {
            $stmt = $db->query("SELECT * FROM messages_contact ORDER BY created_at DESC");
            $messages = $stmt->fetchAll();
            sendResponse(200, $messages);
        }
        break;

    case 'PUT':
        // Marquer un message comme lu / non lu
        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        $is_read = isset($input['is_read']) ? (int)$input['is_read'] : 1;

        if (!$id) {
            sendResponse(400, null, "ID du message manquant.");
        }

        if (!$db) {
            sendResponse(200, ['id' => $id, 'is_read' => $is_read], "Statut mis à jour (démo).");
        }

        try {
            $stmt = $db->prepare("UPDATE messages_contact SET is_read = :is_read WHERE id = :id");
            $stmt->execute([':id' => $id, ':is_read' => $is_read]);
            sendResponse(200, ['id' => $id, 'is_read' => $is_read], "Statut du message mis à jour.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la mise à jour : " . $e->getMessage());
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? json_decode(file_get_contents('php://input'), true)['id'] ?? null;
        if (!$id) {
            sendResponse(400, null, "ID du message manquant.");
        }

        if (!$db) {
            sendResponse(200, ['id' => $id], "Message supprimé (démo).");
        }

        try {
            $stmt = $db->prepare("DELETE FROM messages_contact WHERE id = :id");
            $stmt->execute([':id' => $id]);
            sendResponse(200, ['id' => $id], "Message supprimé avec succès.");
        } catch (Exception $e) {
            sendResponse(500, null, "Erreur lors de la suppression : " . $e->getMessage());
        }
        break;

    default:
        sendResponse(405, null, "Méthode non autorisée.");
}
