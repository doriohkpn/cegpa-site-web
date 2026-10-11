<?php
// api/config/database.php - Connexion PDO à la base de données MySQL CeGPA

class Database {
    private $host = "localhost";
    private $db_name = "cegpa_db";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $exception) {
            // En cas d'erreur de connexion, on enregistre l'erreur
            error_log("Connection error: " . $exception->getMessage());
        }
        return $this->conn;
    }
}
