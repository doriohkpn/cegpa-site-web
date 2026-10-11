-- ============================================================
-- Base de Données CeGPA (Centre d'Exposition et Galerie Patrimoniale)
-- Fichier: database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `cegpa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `cegpa_db`;

-- ------------------------------------------------------------
-- Table: admin_users (Gestion des administrateurs)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: visites_virtuelles (Lien et métadonnées des Visites Virtuelles 3D/VR)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visites_virtuelles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `embed_url` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: expositions (Expositions publiques)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expositions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `date_range` VARCHAR(100) NOT NULL,
  `summary` TEXT NOT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `visite_virtuelle_id` INT DEFAULT NULL,
  `status` ENUM('en_cours', 'a_venir', 'passee') DEFAULT 'en_cours',
  `in_active_list` TINYINT(1) DEFAULT 1,
  `is_public` TINYINT(1) DEFAULT 1,
  `submission_date` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`visite_virtuelle_id`) REFERENCES `visites_virtuelles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: artistes (Artistes référencés)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `artistes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `profession` VARCHAR(150) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table pivot: exposition_artiste (Association N:N Expositions <-> Artistes)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `exposition_artiste` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exposition_id` INT NOT NULL,
  `artiste_id` INT NOT NULL,
  `role` VARCHAR(100) DEFAULT 'Artiste exposé',
  FOREIGN KEY (`exposition_id`) REFERENCES `expositions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`artiste_id`) REFERENCES `artistes`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_expo_artiste` (`exposition_id`, `artiste_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: messages_contact (Messages reçus via le formulaire "À propos / Contact")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages_contact` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Insertion des données de démonstration / Seed Data
-- ============================================================

-- Compte administrateur par défaut (mot de passe: admin123)
INSERT INTO `admin_users` (`username`, `email`, `password_hash`, `role`) VALUES
('admin', 'admin@cegpa.org', '$2y$10$8uW7h4R6wzJ/S.o4yB.pdu.nL45YtM3YI2fHkYkU2eLh4.Z4d3J', 'administrator')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Visites virtuelles
INSERT INTO `visites_virtuelles` (`id`, `title`, `url`, `embed_url`, `description`) VALUES
(1, 'Espace d\'Exposition Principal CeGPA 3D', 'https://my.matterport.com/show/?m=sample1', 'https://my.matterport.com/show/?m=sample1', 'Visite immersive à 360° du grand hall d\'exposition contemporaine.'),
(2, 'Pavillon des Sculptures et Bronzes', 'https://my.matterport.com/show/?m=sample2', 'https://my.matterport.com/show/?m=sample2', 'Découvrez la collection permanente de bronzes et sculptures africaines.');

-- Expositions
INSERT INTO `expositions` (`id`, `title`, `date_range`, `summary`, `description`, `image_url`, `visite_virtuelle_id`, `status`) VALUES
(1, 'Mémoires Subtiles & Formes Contemporaines', '12 Février - 30 Avril 2026', 'Une immersion totale dans la rencontre entre traditions plastiques et expressions contemporaines.', 'Cette exposition majeure rassemble les œuvres de plasticiens de renom autour du thème des mémoires visuelles. À travers l\'usage de pigments naturels, de pièces métalliques réemployées et de sculptures monumentales, les artistes explorent la frontière entre passé et avenir.', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80', 1, 'en_cours'),
(2, 'Lumières du Patrimoine et Échos du Temps', '15 Mai - 10 Juillet 2026', 'Exploration photographique et picturale des paysages sacrés et monuments patrimoniaux.', 'Une sélection captivante d\'œuvres photographiques et de toiles acryliques mettant en valeur la beauté architecturale et la mémoire des lieux historiques.', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80', 2, 'a_venir');

-- Artistes
INSERT INTO `artistes` (`id`, `first_name`, `last_name`, `profession`, `bio`, `photo_url`) VALUES
(1, 'Kofi', 'Aziagbe', 'Peintre & Plasticien', 'Kofi Aziagbe est un artiste plasticien contemporain reconnu pour son travail sur les textures mixtes, la matière brute et les couleurs ocre emblématiques.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'),
(2, 'Abla', 'Sessi', 'Sculptrice & Designeuse', 'Pionnière de la sculpture métallique recyclée, Abla Sessi transforme l\'acier et le bronze en silhouettes fluides évoquant le mouvement et la danse.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
(3, 'Dossa', 'Gbaguidi', 'Photographe d\'Art', 'Photographe spécialisé dans le patrimoine architectural et les portraits studio à la lumière naturelle.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80');

-- Associations Exposition <-> Artiste
INSERT INTO `exposition_artiste` (`exposition_id`, `artiste_id`, `role`) VALUES
(1, 1, 'Peintre principal'),
(1, 2, 'Sculptrice invitée'),
(2, 3, 'Photographe d\'exposition');

-- Messages de contact exemple
INSERT INTO `messages_contact` (`full_name`, `email`, `subject`, `message`, `is_read`) VALUES
('Jean-Paul Dupont', 'jp.dupont@example.com', 'Demande de visite de groupe', 'Bonjour, nous aimerions réserver une visite guidée pour un groupe de 15 personnes le mois prochain. Quels sont les tarifs et disponibilités ?', 0);
