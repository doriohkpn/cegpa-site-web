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
(1, 'Visite Virtuelle - La Jeunesse Africaine', 'https://visite.art-africain-virtuel.bj/jeunesse-africaine/', 'https://visite.art-africain-virtuel.bj/jeunesse-africaine/', 'Visite immersive 360° de l\'exposition La Jeunesse Africaine dans la Société.'),
(2, 'Visite Virtuelle - Héritage & Métamorphoses', 'https://visite.art-africain-virtuel.bj/heritage-metamorphoses/', 'https://visite.art-africain-virtuel.bj/heritage-metamorphoses/', 'Visite immersive 360° de l\'exposition Héritage & Métamorphoses.');

-- Expositions officielles CeGPA
INSERT INTO `expositions` (`id`, `title`, `date_range`, `summary`, `description`, `image_url`, `visite_virtuelle_id`, `status`, `in_active_list`, `is_public`) VALUES
(1, 'La Jeunesse Africaine dans la Société', 'du 15/10/2026 au 15/01/2027', 'L\'exposition « La Jeunesse Africaine dans la Société » célèbre une jeunesse africaine consciente de ses responsabilités, fière de ses héritages et résolument tournée vers l\'avenir.', 'À travers un ensemble d\'œuvres figuratives majeures spécialement conçues pour cet événement, le parcours explore quatre piliers essentiels : l\'affirmation de soi, l\'ancrage spirituel, le dynamisme économique des marchés populaires et la liberté d\'expression citoyenne.', '/assets/images/expo_jeunesse_africaine.jpg', 1, 'en_cours', 1, 1),
(2, 'Héritage & Métamorphoses', 'du 15/10/2026 au 15/01/2027', 'L\'exposition « Héritage & Métamorphoses : Tradition et Modernité dans l\'Art Africain » propose un dialogue plastique inédit entre la peinture de Koffi Mensah et les sculptures d\'Ayaba Zinsou.', 'Une immersion sensorielle au croisement des mémoires ancestrales et des mutations contemporaines, interrogeant la place des mythes fondateurs face à l\'accélération du XXIe siècle.', '/assets/images/expo_heritage_metamorphoses.jpg', 2, 'en_cours', 1, 1);

-- Artistes officiels
INSERT INTO `artistes` (`id`, `first_name`, `last_name`, `profession`, `bio`, `photo_url`) VALUES
(1, 'Amina', 'DOSSA', 'Artiste Peintre', 'Artiste peintre béninoise diplômée de l\'École Nationale Supérieure d\'Art de Porto-Novo, réputée pour ses portraits vibrants célébrant la résilience et l\'élan vital des jeunes générations.', '/assets/images/amina_dossa.jpg'),
(2, 'Sèdjro', 'ADANHO', 'Artiste Peintre & Plasticien', 'Peintre plasticien explorant la transmission intergénérationnelle, les mémoires spirituelles et le respect des valeurs communautaires africaines.', '/assets/images/sedjro_adanho.jpg'),
(3, 'Naïma', 'SOGLO', 'Artiste Plasticienne & Coloriste', 'Plasticienne renommée capturant l\'effervescence économique, la solidarité et la vitalité des marchés populaires d\'Afrique de l\'Ouest.', '/assets/images/naima_soglo.jpg'),
(4, 'Malik', 'GBAGUIDI', 'Artiste Peintre Expressionniste', 'Peintre expressionniste abordant les thèmes de l\'engagement citoyen, de la poésie urbaine et de la liberté d\'expression.', '/assets/images/malik_gbaguidi.jpg'),
(5, 'Koffi', 'MENSAH', 'Artiste Peintre & Plasticien', 'Peintre explorant la rencontre plastique entre les symboles royaux du Danxomè et les paysages urbains électriques.', '/assets/images/koffi_mensah.jpg'),
(6, 'Ayaba', 'ZINSOU', 'Sculptrice & Plasticienne', 'Sculptrice sur bronze et ébène, réinterprétant les canons sacrés de la statuaire ancestrale dans une épure moderniste saisissante.', '/assets/images/ayaba_zinsou.jpg');

-- Associations Exposition <-> Artiste
INSERT INTO `exposition_artiste` (`exposition_id`, `artiste_id`, `role`) VALUES
(1, 1, 'Artiste Peintre'),
(1, 2, 'Peintre & Plasticien'),
(1, 3, 'Plasticienne & Coloriste'),
(1, 4, 'Peintre Expressionniste'),
(2, 5, 'Peintre & Plasticien'),
(2, 6, 'Sculptrice & Plasticienne');

-- Messages de contact exemple
INSERT INTO `messages_contact` (`full_name`, `email`, `subject`, `message`, `is_read`) VALUES
('Jean-Paul Dupont', 'jp.dupont@example.com', 'Demande de visite de groupe', 'Bonjour, nous aimerions réserver une visite guidée pour un groupe de 15 personnes le mois prochain. Quels sont les tarifs et disponibilités ?', 0);
