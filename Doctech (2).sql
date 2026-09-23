-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mer. 23 sep. 2026 à 23:46
-- Version du serveur : 10.4.21-MariaDB
-- Version de PHP : 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `Doctech`
--

-- --------------------------------------------------------

--
-- Structure de la table `articles`
--

CREATE TABLE `articles` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(60) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `name` varchar(220) NOT NULL,
  `name_ar` varchar(220) DEFAULT NULL,
  `short_name` varchar(120) DEFAULT NULL,
  `short_name_ar` varchar(120) DEFAULT NULL,
  `slug` varchar(250) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `short_description_ar` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `description_ar` longtext DEFAULT NULL,
  `category_id` int(10) UNSIGNED NOT NULL,
  `marque_id` int(10) UNSIGNED DEFAULT NULL,
  `fournisseur_id` int(10) UNSIGNED DEFAULT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `old_price` decimal(12,2) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('BROUILLON','ACTIF','INACTIF') NOT NULL DEFAULT 'ACTIF',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `articles`
--

INSERT INTO `articles` (`id`, `code`, `sku`, `name`, `name_ar`, `short_name`, `short_name_ar`, `slug`, `short_description`, `short_description_ar`, `description`, `description_ar`, `category_id`, `marque_id`, `fournisseur_id`, `purchase_price`, `price`, `old_price`, `stock`, `stock_enabled`, `featured`, `status`, `created_at`, `updated_at`) VALUES
(1, 'ART-36000425', NULL, 'Dell Vostro 3530', 'ديل Vostro 3530', NULL, NULL, 'dell-vostro-3530', NULL, NULL, 'Le Dell Vostro 3530 est un ordinateur portable professionnel polyvalent, adapté au travail de bureau, aux études et à la navigation Internet. Il offre un écran confortable, un processeur Intel Core i5, 8 Go de mémoire RAM et un SSD de 512 Go pour un démarrage rapide et une bonne réactivité.', 'حاسوب Dell Vostro 3530 هو جهاز محمول عملي ومتعدد الاستخدامات، مناسب للعمل المكتبي والدراسة وتصفح الإنترنت. يتميز بمعالج Intel Core i5 وذاكرة RAM بسعة 8GB وقرص SSD بسعة 512GB، مما يوفر سرعة جيدة في تشغيل النظام والبرامج.', 1, 1, NULL, '92000.00', '105000.00', NULL, 4, 1, 0, 'ACTIF', '2026-09-19 16:40:00', '2026-09-23 17:35:17'),
(2, 'ART-38834644', NULL, 'HP 15 i3 / 8 Go / 256 Go', 'إتش بي 15 بمعالج i3 وذاكرة 8GB وقرص 256GB', NULL, NULL, 'hp-15-i3-8-go-256-go', NULL, NULL, 'Le HP 15 est un ordinateur portable destiné aux étudiants, professionnels et utilisateurs quotidiens. Sa configuration avec processeur Intel Core i3, 8 Go de RAM et SSD de 256 Go permet de travailler confortablement sur les applications bureautiques, Internet et les tâches quotidiennes.', 'حاسوب HP 15 محمول مخصص للطلاب والمهنيين والاستخدام اليومي. يأتي بمعالج Intel Core i3 وذاكرة RAM بسعة 8GB وقرص SSD بسعة 256GB، وهو مناسب للأعمال المكتبية والدراسة وتصفح الإنترنت.', 1, 2, NULL, '105000.00', '119900.00', NULL, 10, 1, 0, 'ACTIF', '2026-09-20 21:13:54', '2026-09-20 21:41:11'),
(3, 'ART-38947068', NULL, 'Lenovo IdeaPad 3 i5 / 8 Go / 512 Go', 'لينوفو IdeaPad 3 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, NULL, 'lenovo-ideapad-3-i5-8-go-512-go', NULL, NULL, 'Le Lenovo IdeaPad 3 est un ordinateur portable polyvalent conçu pour les études, le télétravail et l\'utilisation quotidienne. Son processeur Intel Core i5, ses 8 Go de RAM et son SSD de 512 Go offrent une expérience fluide pour les tâches courantes.', 'Lenovo IdeaPad 3 هو حاسوب محمول متعدد الاستخدامات مناسب للدراسة والعمل عن بعد والاستخدام اليومي. يحتوي على معالج Intel Core i5 وذاكرة RAM بسعة 8GB وقرص SSD بسعة 512GB لتوفير أداء سريع وسلس.', 1, 3, NULL, '95000.00', '110000.00', NULL, 5, 1, 0, 'ACTIF', '2026-09-20 21:15:47', '2026-09-20 21:40:50'),
(4, 'ART-39030871', NULL, 'ASUS VivoBook 15 i5 / 8 Go / 512 Go', 'أسوس VivoBook 15 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, NULL, 'asus-vivobook-15-i5-8-go-512-go', NULL, NULL, 'L\'ASUS VivoBook 15 combine mobilité, confort et performances. Avec son écran de 15 pouces, son processeur Intel Core i5, 8 Go de RAM et son SSD de 512 Go, il convient parfaitement au travail, aux études et au divertissement.', 'ASUS VivoBook 15 يجمع بين سهولة التنقل والأداء والراحة. بفضل شاشته بحجم 15 بوصة ومعالج Intel Core i5 وذاكرة 8GB وقرص SSD بسعة 512GB، فهو مناسب للعمل والدراسة والترفيه.', 1, 4, NULL, '100000.00', '119000.00', NULL, 10, 1, 0, 'ACTIF', '2026-09-20 21:17:10', '2026-09-20 21:40:31'),
(5, 'ART-39145666', NULL, 'MSI Modern 15 i5 / 16 Go / 512 Go', 'إم إس آي Modern 15 بمعالج i5 وذاكرة 16GB وقرص 512GB', NULL, NULL, 'msi-modern-15-i5-16-go-512-go', NULL, NULL, 'Le MSI Modern 15 est un ordinateur portable élégant destiné aux professionnels, étudiants et créateurs de contenu. Sa configuration avec 16 Go de RAM et SSD de 512 Go permet de travailler avec plusieurs applications simultanément tout en conservant une bonne fluidité.', 'MSI Modern 15 هو حاسوب محمول أنيق موجه للمهنيين والطلاب ومنشئي المحتوى. بفضل ذاكرة RAM بسعة 16GB وقرص SSD بسعة 512GB، يوفر أداءً جيدًا عند تشغيل عدة تطبيقات في نفس الوقت.', 1, 5, NULL, '125000.00', '145000.00', NULL, 3, 1, 0, 'ACTIF', '2026-09-20 21:19:05', '2026-09-20 21:40:06'),
(6, 'ART-39240471', NULL, 'Microsoft Surface Laptop', 'مايكروسوفت Surface Laptop', NULL, NULL, 'microsoft-surface-laptop', NULL, NULL, 'Le Microsoft Surface Laptop est un ordinateur portable fin et élégant conçu pour la productivité et la mobilité. Il offre une excellente expérience pour la bureautique, les études, les visioconférences et la navigation Internet.', 'Microsoft Surface Laptop هو حاسوب محمول نحيف وأنيق مصمم للإنتاجية والتنقل. يوفر تجربة مناسبة للأعمال المكتبية والدراسة والاجتماعات عبر الإنترنت وتصفح الويب.', 1, 6, NULL, '145000.00', '170000.00', NULL, 5, 1, 0, 'ACTIF', '2026-09-20 21:20:40', '2026-09-20 21:39:44'),
(7, 'ART-39329613', NULL, 'Écran AOC 24 pouces Full HD', 'شاشة AOC مقاس 24 بوصة Full HD', NULL, NULL, 'ecran-aoc-24-pouces-full-hd', NULL, NULL, 'L\'écran AOC 24 pouces Full HD offre une image claire et confortable pour le travail, les études, la navigation Internet et le multimédia. Son format 24 pouces constitue un excellent compromis entre espace d\'affichage et encombrement.', 'شاشة AOC بحجم 24 بوصة وبدقة Full HD توفر صورة واضحة ومريحة للعمل والدراسة وتصفح الإنترنت ومشاهدة المحتوى. حجمها مناسب للحصول على مساحة عرض جيدة دون أن تشغل مساحة كبيرة.', 2, NULL, NULL, '20000.00', '24000.00', NULL, 5, 1, 0, 'ACTIF', '2026-09-20 21:22:09', '2026-09-20 21:39:23'),
(8, 'ART-39385751', NULL, 'Écran LG UltraWide 29 pouces', 'شاشة LG UltraWide مقاس 29 بوصة', NULL, NULL, 'ecran-lg-ultrawide-29-pouces', NULL, NULL, 'L\'écran LG UltraWide 29 pouces offre un espace de travail large et pratique. Son format panoramique est particulièrement adapté au multitâche, à la bureautique, au montage et à la productivité.', 'شاشة LG UltraWide بحجم 29 بوصة توفر مساحة عرض واسعة ومريحة. تصميمها العريض مناسب للعمل على عدة نوافذ في نفس الوقت والمونتاج والأعمال المكتبية والإنتاجية.', 2, NULL, NULL, '49000.00', '55000.00', NULL, 3, 1, 0, 'ACTIF', '2026-09-20 21:23:05', '2026-09-20 21:39:05'),
(9, 'ART-39449824', NULL, 'ASUS VG259 Gaming 24,5', 'شاشة ASUS VG259 للألعاب 24.5 بوصة', NULL, NULL, 'asus-vg259-gaming-245', NULL, NULL, 'L\'ASUS VG259 est un écran Gaming conçu pour offrir une expérience fluide et réactive. Il convient particulièrement aux joueurs recherchant une bonne qualité d\'image et une fréquence de rafraîchissement élevée.', 'شاشة ASUS VG259 مخصصة للألعاب وتوفر تجربة سلسة وسريعة الاستجابة. تناسب اللاعبين الذين يبحثون عن جودة صورة جيدة ومعدل تحديث مرتفع.', 2, 4, NULL, '39000.00', '45000.00', NULL, 2, 1, 0, 'ACTIF', '2026-09-20 21:24:09', '2026-09-20 21:38:44'),
(10, 'ART-39507175', NULL, 'Clavier USB Logitech K120', 'لوحة مفاتيح Logitech K120 USB', NULL, NULL, 'clavier-usb-logitech-k120', NULL, NULL, NULL, NULL, 3, NULL, NULL, '1900.00', '2500.00', NULL, 20, 1, 0, 'ACTIF', '2026-09-20 21:25:07', '2026-09-20 21:25:07'),
(11, 'ART-39571548', NULL, 'Clavier mécanique Gaming RGB', 'لوحة مفاتيح ميكانيكية للألعاب RGB', NULL, NULL, 'clavier-mecanique-gaming-rgb', NULL, NULL, NULL, NULL, 3, NULL, NULL, '6000.00', '7800.00', NULL, 5, 1, 0, 'ACTIF', '2026-09-20 21:26:11', '2026-09-20 21:27:35'),
(12, 'ART-39720450', NULL, 'Souris sans fil Logitech M185', 'فأرة لاسلكية Logitech M185', NULL, NULL, 'souris-sans-fil-logitech-m185', NULL, NULL, 'Le Logitech K120 est un clavier USB filaire simple et fiable. Il convient parfaitement à la bureautique, aux études et à une utilisation quotidienne avec un ordinateur de bureau ou portable.', 'لوحة مفاتيح Logitech K120 هي لوحة مفاتيح USB سلكية بسيطة وموثوقة. مناسبة للأعمال المكتبية والدراسة والاستخدام اليومي مع الحاسوب.', 4, NULL, NULL, '2100.00', '2700.00', NULL, 4, 1, 0, 'ACTIF', '2026-09-20 21:28:40', '2026-09-23 18:46:47'),
(13, 'ART-39770614', NULL, 'Souris Gaming Razer DeathAdder Essential', 'فأرة ألعاب Razer DeathAdder Essential', NULL, NULL, 'souris-gaming-razer-deathadder-essential', NULL, NULL, 'La Razer DeathAdder Essential est une souris Gaming ergonomique conçue pour les joueurs. Sa forme confortable et son capteur précis permettent une bonne maîtrise pendant les sessions de jeu.', 'فأرة Razer DeathAdder Essential هي فأرة ألعاب بتصميم مريح ومناسبة للاعبين. يوفر تصميمها المريح ومستشعرها الدقيق تحكمًا جيدًا أثناء اللعب.', 4, NULL, NULL, '4200.00', '5500.00', NULL, 20, 1, 0, 'ACTIF', '2026-09-20 21:29:30', '2026-09-23 18:55:54'),
(14, 'ART-39868336', NULL, 'Casque Gaming HyperX Cloud Stinger', 'سماعة ألعاب HyperX Cloud Stinger', NULL, NULL, 'casque-gaming-hyperx-cloud-stinger', NULL, NULL, 'Le HyperX Cloud Stinger est un casque Gaming confortable avec microphone intégré. Il convient aux jeux vidéo, aux appels vocaux et au divertissement multimédia.', 'سماعة HyperX Cloud Stinger هي سماعة ألعاب مريحة مزودة بميكروفون مدمج. مناسبة للألعاب والمكالمات الصوتية والاستماع إلى الوسائط المتعددة.', 5, NULL, NULL, '7500.00', '9500.00', NULL, 4, 1, 0, 'ACTIF', '2026-09-20 21:31:08', '2026-09-20 21:42:06'),
(15, 'ART-39950726', NULL, 'SSD Kingston 480 Go SATA', 'قرص Kingston SSD بسعة 480GB', NULL, NULL, 'ssd-kingston-480-go-sata', NULL, NULL, 'Le SSD Kingston 480 Go permet d\'améliorer considérablement la vitesse de démarrage et de chargement d\'un ordinateur. Il constitue une solution pratique pour remplacer un disque dur traditionnel.', 'قرص Kingston SSD بسعة 480GB يساعد على تحسين سرعة تشغيل الحاسوب وفتح البرامج. وهو حل عملي لاستبدال الأقراص الصلبة التقليدية.', 6, NULL, NULL, '4800.00', '5500.00', NULL, 5, 1, 0, 'ACTIF', '2026-09-20 21:32:30', '2026-09-20 21:42:47'),
(16, 'ART-40054109', NULL, 'SSD Samsung NVMe 1 To', 'قرص Samsung NVMe بسعة 1TB', NULL, NULL, 'ssd-samsung-nvme-1-to', NULL, NULL, 'Le SSD Samsung NVMe 1 To offre une capacité importante et des vitesses élevées pour le stockage des logiciels, documents, jeux et fichiers multimédias.', 'قرص Samsung NVMe بسعة 1TB يوفر مساحة تخزين كبيرة وسرعة عالية لحفظ البرامج والوثائق والألعاب وملفات الوسائط المتعددة.', 6, NULL, NULL, '11000.00', '13900.00', NULL, 4, 1, 0, 'ACTIF', '2026-09-20 21:34:14', '2026-09-23 18:46:47'),
(17, 'ART-40134681', NULL, 'Kingston DDR4 16 Go', 'ذاكرة Kingston DDR4 بسعة 16GB', NULL, NULL, 'kingston-ddr4-16-go', NULL, NULL, 'La mémoire Kingston DDR4 16 Go permet d\'améliorer la capacité multitâche d\'un ordinateur. Elle convient aux ordinateurs professionnels, domestiques et Gaming compatibles DDR4.', 'ذاكرة Kingston DDR4 بسعة 16GB تساعد على تحسين أداء الحاسوب عند تشغيل عدة برامج في نفس الوقت. مناسبة للحواسيب المكتبية والمنزلية وحواسيب الألعاب المتوافقة مع DDR4.', 7, NULL, NULL, '10000.00', '14000.00', NULL, 8, 1, 0, 'ACTIF', '2026-09-20 21:35:34', '2026-09-23 18:46:47'),
(18, 'ART-40186314', NULL, 'Carte graphique ASUS RTX 4060 8 Go', 'بطاقة رسومات ASUS RTX 4060 بسعة 8GB', NULL, NULL, 'carte-graphique-asus-rtx-4060-8-go', NULL, NULL, 'La carte graphique ASUS RTX 4060 8 Go est conçue pour les PC Gaming et les applications graphiques. Elle permet de profiter de bonnes performances dans les jeux modernes et les applications nécessitant une accélération graphique.', 'بطاقة الرسومات ASUS RTX 4060 بسعة 8GB مخصصة لحواسيب الألعاب والتطبيقات الرسومية. توفر أداءً جيدًا في الألعاب الحديثة والبرامج التي تحتاج إلى معالجة رسومية قوية.', 8, NULL, NULL, '58000.00', '72000.00', NULL, 0, 1, 0, 'ACTIF', '2026-09-20 21:36:26', '2026-09-23 21:17:23'),
(19, 'ART-40253335', NULL, 'imprimante multifonction Canon PIXMA', 'طابعة Canon PIXMA متعددة الوظائف', NULL, NULL, 'imprimante-multifonction-canon-pixma', NULL, NULL, 'La Canon PIXMA est une imprimante polyvalente adaptée à l\'impression de documents et de photos. Elle constitue une solution pratique pour la maison, les étudiants et les petits bureaux.', 'طابعة Canon PIXMA متعددة الاستخدامات ومناسبة لطباعة الوثائق والصور. تعتبر حلاً عمليًا للمنزل والطلاب والمكاتب الصغيرة.', 10, NULL, NULL, '14000.00', '19000.00', NULL, 15, 1, 0, 'ACTIF', '2026-09-20 21:37:33', '2026-09-20 22:18:07');

-- --------------------------------------------------------

--
-- Structure de la table `article_images`
--

CREATE TABLE `article_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED NOT NULL,
  `url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `alt_text_ar` varchar(255) DEFAULT NULL,
  `color_value` varchar(100) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `article_images`
--

INSERT INTO `article_images` (`id`, `article_id`, `url`, `alt_text`, `alt_text_ar`, `color_value`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, 'http://localhost:4000/uploads/1789835973478-beacb2b126e3.jpeg', 'Dell Vostro 3530', 'ديل Vostro 3530', NULL, 1, 0, '2026-09-19 16:40:00'),
(2, 1, 'http://localhost:4000/uploads/1789835973520-265345ff969d.jpeg', 'Dell Vostro 3530', 'ديل Vostro 3530', NULL, 0, 1, '2026-09-19 16:40:00'),
(3, 1, 'http://localhost:4000/uploads/1789835973539-7953a57c927a.jpeg', 'Dell Vostro 3530', 'ديل Vostro 3530', NULL, 0, 2, '2026-09-19 16:40:00'),
(4, 1, 'http://localhost:4000/uploads/1789835973556-00acaa010f93.jpeg', 'Dell Vostro 3530', 'ديل Vostro 3530', NULL, 0, 3, '2026-09-19 16:40:00'),
(6, 2, 'http://localhost:4000/uploads/1789938893829-4d73aea6a503.jpeg', 'HP 15 i3 / 8 Go / 256 Go', 'إتش بي 15 بمعالج i3 وذاكرة 8GB وقرص 256GB', NULL, 0, 0, '2026-09-20 21:14:55'),
(7, 2, 'http://localhost:4000/uploads/1789938893857-9e1d4d8e7182.jpeg', 'HP 15 i3 / 8 Go / 256 Go', 'إتش بي 15 بمعالج i3 وذاكرة 8GB وقرص 256GB', NULL, 0, 1, '2026-09-20 21:14:55'),
(8, 2, 'http://localhost:4000/uploads/1789938893870-0515206f7da1.jpeg', 'HP 15 i3 / 8 Go / 256 Go', 'إتش بي 15 بمعالج i3 وذاكرة 8GB وقرص 256GB', NULL, 1, 2, '2026-09-20 21:14:55'),
(10, 3, 'http://localhost:4000/uploads/1789938976022-7dbef1d6cda5.jpeg', 'Lenovo IdeaPad 3 i5 / 8 Go / 512 Go', 'لينوفو IdeaPad 3 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 0, 0, '2026-09-20 21:16:19'),
(11, 3, 'http://localhost:4000/uploads/1789938976037-4d43fdb4c653.jpeg', 'Lenovo IdeaPad 3 i5 / 8 Go / 512 Go', 'لينوفو IdeaPad 3 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 0, 1, '2026-09-20 21:16:19'),
(12, 3, 'http://localhost:4000/uploads/1789938976048-3e18f1a77801.jpeg', 'Lenovo IdeaPad 3 i5 / 8 Go / 512 Go', 'لينوفو IdeaPad 3 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 1, 2, '2026-09-20 21:16:19'),
(14, 4, 'http://localhost:4000/uploads/1789939064556-aeb3d9b28a61.jpeg', 'ASUS VivoBook 15 i5 / 8 Go / 512 Go', 'أسوس VivoBook 15 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 1, 0, '2026-09-20 21:17:45'),
(15, 4, 'http://localhost:4000/uploads/1789939064576-a0572bd91481.jpeg', 'ASUS VivoBook 15 i5 / 8 Go / 512 Go', 'أسوس VivoBook 15 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 0, 1, '2026-09-20 21:17:45'),
(16, 4, 'http://localhost:4000/uploads/1789939064589-82eb8c9efbb2.jpeg', 'ASUS VivoBook 15 i5 / 8 Go / 512 Go', 'أسوس VivoBook 15 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 0, 2, '2026-09-20 21:17:45'),
(17, 4, 'http://localhost:4000/uploads/1789939064556-aeb3d9b28a61.jpeg', 'ASUS VivoBook 15 i5 / 8 Go / 512 Go', 'أسوس VivoBook 15 بمعالج i5 وذاكرة 8GB وقرص 512GB', NULL, 0, 3, '2026-09-20 21:17:45'),
(18, 5, 'http://localhost:4000/uploads/1789939142642-33faabbbaa83.jpeg', 'MSI Modern 15 i5 / 16 Go / 512 Go', 'إم إس آي Modern 15 بمعالج i5 وذاكرة 16GB وقرص 512GB', NULL, 1, 0, '2026-09-20 21:19:05'),
(19, 5, 'http://localhost:4000/uploads/1789939142657-6b02b39ffe73.jpeg', 'MSI Modern 15 i5 / 16 Go / 512 Go', 'إم إس آي Modern 15 بمعالج i5 وذاكرة 16GB وقرص 512GB', NULL, 0, 1, '2026-09-20 21:19:05'),
(20, 5, 'http://localhost:4000/uploads/1789939142667-9820a5dcea3e.jpeg', 'MSI Modern 15 i5 / 16 Go / 512 Go', 'إم إس آي Modern 15 بمعالج i5 وذاكرة 16GB وقرص 512GB', NULL, 0, 2, '2026-09-20 21:19:05'),
(21, 5, 'http://localhost:4000/uploads/1789939142678-27493a31b313.jpeg', 'MSI Modern 15 i5 / 16 Go / 512 Go', 'إم إس آي Modern 15 بمعالج i5 وذاكرة 16GB وقرص 512GB', NULL, 0, 3, '2026-09-20 21:19:05'),
(22, 6, 'http://localhost:4000/uploads/1789939221947-bde8c19c6800.jpeg', 'Microsoft Surface Laptop', 'مايكروسوفت Surface Laptop', NULL, 1, 0, '2026-09-20 21:20:40'),
(23, 6, 'http://localhost:4000/uploads/1789939221958-b7b060460232.jpeg', 'Microsoft Surface Laptop', 'مايكروسوفت Surface Laptop', NULL, 0, 1, '2026-09-20 21:20:40'),
(24, 6, 'http://localhost:4000/uploads/1789939221967-f08c8fae0c65.jpeg', 'Microsoft Surface Laptop', 'مايكروسوفت Surface Laptop', NULL, 0, 2, '2026-09-20 21:20:40'),
(25, 6, 'http://localhost:4000/uploads/1789939221977-d7ca0dc70c86.jpeg', 'Microsoft Surface Laptop', 'مايكروسوفت Surface Laptop', NULL, 0, 3, '2026-09-20 21:20:40'),
(26, 7, 'http://localhost:4000/uploads/1789939292112-488ec982152c.jpeg', 'Écran AOC 24 pouces Full HD', 'شاشة AOC مقاس 24 بوصة Full HD', NULL, 1, 0, '2026-09-20 21:22:09'),
(27, 7, 'http://localhost:4000/uploads/1789939314725-dd648b26ae85.jpeg', 'Écran AOC 24 pouces Full HD', 'شاشة AOC مقاس 24 بوصة Full HD', NULL, 0, 1, '2026-09-20 21:22:09'),
(28, 7, 'http://localhost:4000/uploads/1789939314749-cbdf6e61183e.jpeg', 'Écran AOC 24 pouces Full HD', 'شاشة AOC مقاس 24 بوصة Full HD', NULL, 0, 2, '2026-09-20 21:22:09'),
(29, 8, 'http://localhost:4000/uploads/1789939367984-d2da11dac1d0.jpeg', 'Écran LG UltraWide 29 pouces', 'شاشة LG UltraWide مقاس 29 بوصة', NULL, 1, 0, '2026-09-20 21:23:05'),
(30, 8, 'http://localhost:4000/uploads/1789939368005-00367d2e1d9a.jpeg', 'Écran LG UltraWide 29 pouces', 'شاشة LG UltraWide مقاس 29 بوصة', NULL, 0, 1, '2026-09-20 21:23:05'),
(31, 9, 'http://localhost:4000/uploads/1789939431211-5fe5f7d9cdfe.jpeg', 'ASUS VG259 Gaming 24,5', 'شاشة ASUS VG259 للألعاب 24.5 بوصة', NULL, 1, 0, '2026-09-20 21:24:09'),
(32, 9, 'http://localhost:4000/uploads/1789939431235-aae627e82bdf.jpeg', 'ASUS VG259 Gaming 24,5', 'شاشة ASUS VG259 للألعاب 24.5 بوصة', NULL, 0, 1, '2026-09-20 21:24:09'),
(33, 10, 'http://localhost:4000/uploads/1789939487764-7691c555767c.jpeg', 'Clavier USB Logitech K120', 'لوحة مفاتيح Logitech K120 USB', NULL, 1, 0, '2026-09-20 21:25:07'),
(34, 10, 'http://localhost:4000/uploads/1789939487750-d8fe94dca2b5.jpeg', 'Clavier USB Logitech K120', 'لوحة مفاتيح Logitech K120 USB', NULL, 0, 0, '2026-09-20 21:25:07'),
(35, 11, 'http://localhost:4000/uploads/1789939557234-133837533d9c.jpeg', 'Clavier mécanique Gaming RGB', 'لوحة مفاتيح ميكانيكية للألعاب RGB', NULL, 1, 0, '2026-09-20 21:26:11'),
(36, 11, 'http://localhost:4000/uploads/1789939557244-3309f96ddc0b.jpeg', 'Clavier mécanique Gaming RGB', 'لوحة مفاتيح ميكانيكية للألعاب RGB', NULL, 0, 1, '2026-09-20 21:26:11'),
(37, 12, 'http://localhost:4000/uploads/1789939708149-0d59727c2ea0.jpeg', 'Souris sans fil Logitech M185', 'فأرة لاسلكية Logitech M185', NULL, 1, 0, '2026-09-20 21:28:40'),
(38, 12, 'http://localhost:4000/uploads/1789939708174-0acd93ca3480.jpeg', 'Souris sans fil Logitech M185', 'فأرة لاسلكية Logitech M185', NULL, 0, 1, '2026-09-20 21:28:40'),
(39, 13, 'http://localhost:4000/uploads/1789939758310-54c67a46c67b.jpeg', 'Souris Gaming Razer DeathAdder Essential', 'فأرة ألعاب Razer DeathAdder Essential', NULL, 1, 0, '2026-09-20 21:29:30'),
(40, 13, 'http://localhost:4000/uploads/1789939758455-fb355b47fe0d.jpeg', 'Souris Gaming Razer DeathAdder Essential', 'فأرة ألعاب Razer DeathAdder Essential', NULL, 0, 1, '2026-09-20 21:29:30'),
(41, 14, 'http://localhost:4000/uploads/1789939844817-299a35992439.jpeg', 'Casque Gaming HyperX Cloud Stinger', 'سماعة ألعاب HyperX Cloud Stinger', NULL, 1, 0, '2026-09-20 21:31:08'),
(42, 14, 'http://localhost:4000/uploads/1789939851760-0e02b9c67f8d.jpeg', 'Casque Gaming HyperX Cloud Stinger', 'سماعة ألعاب HyperX Cloud Stinger', NULL, 0, 1, '2026-09-20 21:31:08'),
(43, 15, 'http://localhost:4000/uploads/1789939934718-86e8a12506b3.jpeg', 'SSD Kingston 480 Go SATA', 'قرص Kingston SSD بسعة 480GB', NULL, 1, 0, '2026-09-20 21:32:30'),
(44, 15, 'http://localhost:4000/uploads/1789939934759-905af093df82.jpeg', 'SSD Kingston 480 Go SATA', 'قرص Kingston SSD بسعة 480GB', NULL, 0, 1, '2026-09-20 21:32:30'),
(45, 16, 'http://localhost:4000/uploads/1789940033826-d2e5e676fd00.jpeg', 'SSD Samsung NVMe 1 To', 'قرص Samsung NVMe بسعة 1TB', NULL, 1, 0, '2026-09-20 21:34:14'),
(46, 16, 'http://localhost:4000/uploads/1789940033856-a739931b8d6c.jpeg', 'SSD Samsung NVMe 1 To', 'قرص Samsung NVMe بسعة 1TB', NULL, 0, 1, '2026-09-20 21:34:14'),
(47, 17, 'http://localhost:4000/uploads/1789940132961-b4bbfe9c3bf1.jpeg', 'Kingston DDR4 16 Go', 'ذاكرة Kingston DDR4 بسعة 16GB', NULL, 1, 0, '2026-09-20 21:35:34'),
(48, 17, 'http://localhost:4000/uploads/1789940132992-5d0dcbd6afec.jpeg', 'Kingston DDR4 16 Go', 'ذاكرة Kingston DDR4 بسعة 16GB', NULL, 0, 1, '2026-09-20 21:35:34'),
(49, 17, 'http://localhost:4000/uploads/1789940132998-1267e5362aea.jpeg', 'Kingston DDR4 16 Go', 'ذاكرة Kingston DDR4 بسعة 16GB', NULL, 0, 2, '2026-09-20 21:35:34'),
(50, 18, 'http://localhost:4000/uploads/1789940166021-f6c4bcf76031.jpeg', 'Carte graphique ASUS RTX 4060 8 Go', 'بطاقة رسومات ASUS RTX 4060 بسعة 8GB', NULL, 1, 0, '2026-09-20 21:36:26'),
(51, 18, 'http://localhost:4000/uploads/1789940166048-debcd658ea58.jpeg', 'Carte graphique ASUS RTX 4060 8 Go', 'بطاقة رسومات ASUS RTX 4060 بسعة 8GB', NULL, 0, 1, '2026-09-20 21:36:26'),
(52, 19, 'http://localhost:4000/uploads/1789940239066-13a1982dc40b.jpeg', 'imprimante multifonction Canon PIXMA', 'طابعة Canon PIXMA متعددة الوظائف', NULL, 1, 0, '2026-09-20 21:37:33'),
(53, 19, 'http://localhost:4000/uploads/1789940239102-08662521fdec.jpeg', 'imprimante multifonction Canon PIXMA', 'طابعة Canon PIXMA متعددة الوظائف', NULL, 0, 1, '2026-09-20 21:37:33');

-- --------------------------------------------------------

--
-- Structure de la table `article_variants`
--

CREATE TABLE `article_variants` (
  `id` int(10) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED NOT NULL,
  `type` enum('COULEUR','TAILLE','POINTURE','PARFUM') NOT NULL,
  `value` varchar(100) NOT NULL,
  `value_ar` varchar(100) DEFAULT NULL,
  `color_hex` varchar(20) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `price_override` decimal(12,2) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `image_id` int(10) UNSIGNED DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `entity` varchar(120) NOT NULL,
  `entity_id` varchar(80) DEFAULT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `name_ar` varchar(150) DEFAULT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `name_ar`, `slug`, `description`, `description_ar`, `image_url`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Ordinateurs', 'الحواسيب', 'ordinateurs', 'Découvrez notre sélection d\'ordinateurs portables, PC de bureau, PC Gaming et stations de travail adaptés aux études, au travail, à la bureautique, à la création et au gaming.', 'كتشف مجموعتنا من الحواسيب المحمولة والمكتبية وحواسيب الألعاب ومحطات العمل، المناسبة للدراسة والعمل والمكتب والتصميم والألعاب.', 'http://localhost:4000/uploads/1789833643534-36fb22ed6fea.jpeg', 1, 1, '2026-09-19 16:01:04', '2026-09-19 16:01:04'),
(2, NULL, 'écrans', 'الشاشات', 'ecrans', 'Des écrans adaptés à la bureautique, au travail professionnel, au multimédia et au gaming, avec différentes tailles, résolutions et fréquences de rafraîchissement.', '\nشاشات مناسبة للمكاتب والعمل الاحترافي والوسائط المتعددة والألعاب، بأحجام ودقات ومعدلات تحديث مختلفة.', 'http://localhost:4000/uploads/1789833746847-59526cddc844.jpeg', 1, 2, '2026-09-19 16:02:28', '2026-09-19 16:02:28'),
(3, NULL, 'Claviers', 'لوحات المفاتيح', 'claviers', 'Claviers filaires, sans fil, mécaniques et Gaming pour la bureautique, la programmation et le jeu vidéo.', 'وحات مفاتيح سلكية ولاسلكية وميكانيكية ومخصصة للألعاب، مناسبة للمكتب والبرمجة والألعاب.', 'http://localhost:4000/uploads/1789833796209-f41e45c884bc.jpeg', 1, 3, '2026-09-19 16:03:32', '2026-09-19 16:03:32'),
(4, NULL, 'Souris', 'الفأرات', 'souris', 'Une gamme de souris filaires, sans fil, Bluetooth et Gaming offrant précision et confort pour tous les usages.', '\nمجموعة من الفأرات السلكية واللاسلكية وBluetooth وGaming، توفر الدقة والراحة لمختلف الاستخدامات.', 'http://localhost:4000/uploads/1789833877323-b06e767c8188.jpeg', 1, 4, '2026-09-19 16:04:55', '2026-09-19 16:04:55'),
(5, NULL, 'Casques & Audio', 'السماعات والصوتيات', 'casques-audio', 'Casques, écouteurs, microphones et enceintes pour profiter d\'une expérience audio adaptée au travail, aux appels, au multimédia et au gaming.', '\nسماعات رأس وسماعات أذن وميكروفونات ومكبرات صوت لتجربة صوتية مناسبة للعمل والمكالمات والترفيه والألعاب.', 'http://localhost:4000/uploads/1789833981141-3a730d4bb129.jpeg', 1, 5, '2026-09-19 16:06:46', '2026-09-19 16:06:46'),
(6, NULL, 'Stockage', 'التخزين', 'stockage', 'Solutions de stockage rapides et fiables : SSD, SSD NVMe, disques durs, disques externes, clés USB et cartes mémoire.', 'حلول تخزين سريعة وموثوقة تشمل SSD وNVMe والأقراص الصلبة والأقراص الخارجية ومفاتيح USB وبطاقات الذاكرة.', 'http://localhost:4000/uploads/1789834081220-a17001039e59.jpeg', 1, 6, '2026-09-19 16:08:02', '2026-09-19 16:09:15'),
(7, NULL, 'Ram', 'ذاكرة الوصول العشوائي', 'ram', 'Mémoire RAM pour améliorer les performances et la capacité multitâche des ordinateurs portables et PC de bureau.', 'ذاكرة RAM لتحسين أداء الحاسوب وقدرته على تشغيل عدة برامج في نفس الوقت.', 'http://localhost:4000/uploads/1789834131625-a6a38152d849.jpeg', 1, 7, '2026-09-19 16:09:03', '2026-09-19 16:09:29'),
(8, NULL, 'Cartes graphiques', 'بطاقات الرسومات', 'cartes-graphiques', 'Cartes graphiques dédiées pour le gaming, la création de contenu, la 3D, le montage vidéo et les applications professionnelles.', 'بطاقات رسومات مخصصة للألعاب والتصميم ثلاثي الأبعاد وتحرير الفيديو وإنشاء المحتوى والاستخدامات الاحترافية.', 'http://localhost:4000/uploads/1789834248807-03d86a741943.jpeg', 1, 8, '2026-09-19 16:11:04', '2026-09-19 16:11:04'),
(9, NULL, 'Câbles & Adaptateurs', 'الكابلات والمحوّلات', 'cables-adaptateurs', 'Câbles et adaptateurs pour connecter vos ordinateurs, écrans, périphériques et équipements réseau.', 'كابلات ومحوّلات لتوصيل الحواسيب والشاشات والأجهزة الطرفية ومعدات الشبكة.', 'http://localhost:4000/uploads/1789834354920-e2278ac5c594.jpeg', 1, 9, '2026-09-19 16:12:36', '2026-09-19 16:12:36'),
(10, NULL, 'Imprimantes & Scanners', 'الطابعات والماسحات', 'imprimantes-scanners', 'Imprimantes et scanners pour la maison, le bureau et les entreprises, avec des solutions jet d\'encre, laser et multifonctions.', '\nطابعات وماسحات ضوئية للمنزل والمكتب والشركات، تشمل الطابعات النافثة للحبر والليزر والطابعات متعددة الوظائف.\n', 'http://localhost:4000/uploads/1789834417463-d86c4bec772f.jpeg', 1, 10, '2026-09-19 16:13:56', '2026-09-19 16:13:56');

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tracking_number` varchar(80) NOT NULL,
  `customer_name` varchar(180) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `wilaya` varchar(100) DEFAULT NULL,
  `commune` varchar(120) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `delivery_type` enum('HOME','DESK','STORE') NOT NULL DEFAULT 'HOME',
  `delivery_provider` varchar(30) DEFAULT NULL,
  `delivery_tracking` varchar(120) DEFAULT NULL,
  `delivery_sync_status` enum('PENDING','SYNCED','ERROR') NOT NULL DEFAULT 'PENDING',
  `delivery_sync_error` text DEFAULT NULL,
  `delivery_synced_at` datetime DEFAULT NULL,
  `delivery_wilaya_id` varchar(30) DEFAULT NULL,
  `delivery_commune_id` varchar(30) DEFAULT NULL,
  `delivery_mode` varchar(30) DEFAULT NULL,
  `delivery_stop_desk` varchar(30) DEFAULT NULL,
  `delivery_agency_id` varchar(30) DEFAULT NULL,
  `delivery_agency_name` varchar(150) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('CASH_ON_DELIVERY') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
  `status` enum('NOUVELLE','CONFIRMEE','PREPARATION','EXPEDIEE','LIVREE','ANNULEE') NOT NULL DEFAULT 'NOUVELLE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `tracking_number`, `customer_name`, `phone`, `wilaya`, `commune`, `address`, `note`, `delivery_type`, `delivery_provider`, `delivery_tracking`, `delivery_sync_status`, `delivery_sync_error`, `delivery_synced_at`, `delivery_wilaya_id`, `delivery_commune_id`, `delivery_mode`, `delivery_stop_desk`, `delivery_agency_id`, `delivery_agency_name`, `subtotal`, `delivery_fee`, `total`, `payment_method`, `status`, `created_at`, `updated_at`) VALUES
(1, 'DT-2026-99VY62', 'Mohammed el Amine Said Mansour', '0560727300', 'Alger', 'Bab Azzouar', 'TESR', NULL, 'HOME', 'ELOGISTIA', NULL, 'ERROR', 'Elogistia HTTP 401', NULL, '16', '526', '4', '0', NULL, NULL, '249000.00', '700.00', '249700.00', 'CASH_ON_DELIVERY', 'LIVREE', '2026-09-23 17:35:17', '2026-09-23 18:52:24'),
(2, 'DT-2026-9Y60JR', 'Mohammed el Amine Said Mansour', '0560723700', 'Adrar', 'Adrar', NULL, 'FDBFB', 'DESK', 'ELOGISTIA', NULL, 'ERROR', 'Elogistia HTTP 401', NULL, '1', '1', '4', '1', NULL, NULL, '12600.00', '750.00', '13350.00', 'CASH_ON_DELIVERY', 'LIVREE', '2026-09-23 18:31:18', '2026-09-23 18:52:04'),
(7, 'DT-2026-X0VHF4', 'dd', '0560727300', 'Adrar', 'Akabli', NULL, NULL, 'DESK', 'ELOGISTIA', NULL, 'ERROR', 'Elogistia HTTP 401', NULL, '1', '2', '4', '1', NULL, NULL, '29200.00', '750.00', '29950.00', 'CASH_ON_DELIVERY', 'LIVREE', '2026-09-23 18:46:47', '2026-09-23 18:52:02'),
(9, 'DT-2026-USWYOD', 'MOHAMMED', '0560727300', 'Chlef', 'Abou El Hassen', 'DD', 'DD', 'HOME', 'ELOGISTIA', NULL, 'ERROR', 'Elogistia HTTP 401', NULL, '2', '17', '4', '0', NULL, NULL, '5500.00', '800.00', '6300.00', 'CASH_ON_DELIVERY', 'ANNULEE', '2026-09-23 18:51:36', '2026-09-23 18:55:54');

-- --------------------------------------------------------

--
-- Structure de la table `commande_items`
--

CREATE TABLE `commande_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED DEFAULT NULL,
  `variant_id` int(10) UNSIGNED DEFAULT NULL,
  `product_name` varchar(220) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `line_total` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `commande_items`
--

INSERT INTO `commande_items` (`id`, `commande_id`, `article_id`, `variant_id`, `product_name`, `sku`, `unit_price`, `quantity`, `line_total`) VALUES
(1, 1, 1, NULL, 'Dell Vostro 3530', NULL, '105000.00', 1, '105000.00'),
(2, 1, 18, NULL, 'Carte graphique ASUS RTX 4060 8 Go', NULL, '72000.00', 2, '144000.00'),
(3, 2, 17, NULL, 'Kingston DDR4 16 Go', NULL, '12600.00', 1, '12600.00'),
(14, 7, 17, NULL, 'Kingston DDR4 16 Go', NULL, '12600.00', 1, '12600.00'),
(15, 7, 16, NULL, 'SSD Samsung NVMe 1 To', NULL, '13900.00', 1, '13900.00'),
(16, 7, 12, NULL, 'Souris sans fil Logitech M185', NULL, '2700.00', 1, '2700.00'),
(18, 9, 13, NULL, 'Souris Gaming Razer DeathAdder Essential', NULL, '5500.00', 1, '5500.00');

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

CREATE TABLE `fournisseurs` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `nom` varchar(180) NOT NULL,
  `contact_name` varchar(180) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `telephone` varchar(40) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `wilaya` varchar(100) DEFAULT NULL,
  `nif` varchar(100) DEFAULT NULL,
  `nis` varchar(100) DEFAULT NULL,
  `registre_commerce` varchar(100) DEFAULT NULL,
  `statut` enum('ACTIF','INACTIF') NOT NULL DEFAULT 'ACTIF',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `marques`
--

CREATE TABLE `marques` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `name_ar` varchar(150) DEFAULT NULL,
  `slug` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `description_ar` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `marques`
--

INSERT INTO `marques` (`id`, `name`, `name_ar`, `slug`, `description`, `description_ar`, `logo_url`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Dell', 'ديل', 'dell', 'Dell est une marque internationale spécialisée dans les ordinateurs, les équipements informatiques et les solutions technologiques. La marque propose une large gamme de produits : ordinateurs portables, PC de bureau, écrans, stations de travail, serveurs et accessoires informatiques.', 'Dell هي علامة عالمية متخصصة في صناعة أجهزة الكمبيوتر والتكنولوجيا وحلول البنية التحتية الرقمية. تقدم مجموعة واسعة من المنتجات، بما في ذلك الحواسيب المحمولة، أجهزة الكمبيوتر المكتبية، الشاشات، محطات العمل، الخوادم وملحقات الكمبيوتر.', 'http://localhost:4000/uploads/1789832737762-dcbf93ed9665.png', 1, 1, '2026-09-19 15:47:15', '2026-09-19 15:47:15'),
(2, 'HP', 'إتش بي', 'hp', 'HP (Hewlett-Packard) est une marque internationale spécialisée dans les technologies de l\'information, les ordinateurs et l\'impression. HP propose une large gamme de produits destinés aux particuliers, aux étudiants, aux professionnels et aux entreprises.', 'HP (Hewlett-Packard) هي علامة عالمية متخصصة في مجال تكنولوجيا المعلومات والحواسيب والطباعة. تقدم HP مجموعة واسعة من المنتجات الموجهة للأفراد، الطلاب، المحترفين والشركات.', 'http://localhost:4000/uploads/1789833012473-eec070a0ffe6.webp', 1, 2, '2026-09-19 15:50:42', '2026-09-19 15:50:42'),
(3, 'Lenovo', 'لينوفو', 'lenovo', 'Lenovo est une marque internationale spécialisée dans les ordinateurs, les technologies numériques et les solutions informatiques. La marque propose une large gamme de produits comprenant des ordinateurs portables, des PC de bureau, des écrans, des stations de travail, des tablettes et des accessoires informatiques.', 'Lenovo هي علامة عالمية متخصصة في مجال أجهزة الكمبيوتر والتكنولوجيا والحلول الرقمية. تقدم الشركة مجموعة واسعة من المنتجات، بما في ذلك الحواسيب المحمولة، أجهزة الكمبيوتر المكتبية، الشاشات، محطات العمل، الأجهزة اللوحية وملحقات الكمبيوتر.', 'http://localhost:4000/uploads/1789833186212-94198e0508db.jpeg', 1, 3, '2026-09-19 15:53:20', '2026-09-19 15:53:20'),
(4, 'ASUS', 'أسوس', 'asus', 'ASUS est une marque internationale spécialisée dans l\'informatique, l\'électronique et les technologies numériques. Elle propose des ordinateurs portables, PC de bureau, écrans, cartes graphiques, cartes mères, périphériques et équipements Gaming.\n\nLa marque propose des solutions adaptées aux étudiants, professionnels, créateurs de contenu et joueurs.', 'ASUS (أسوس) هي شركة عالمية متخصصة في مجال أجهزة الكمبيوتر والإلكترونيات والتكنولوجيا. تقدم مجموعة واسعة من المنتجات، بما في ذلك الحواسيب المحمولة، أجهزة الكمبيوتر المكتبية، الشاشات، بطاقات الرسومات، اللوحات الأم، الأجهزة المخصصة للألعاب وملحقات الكمبيوتر.', 'http://localhost:4000/uploads/1789833373696-589f2db7ab49.png', 1, 4, '2026-09-19 15:56:31', '2026-09-19 15:56:31'),
(5, 'MSI', 'إم إس آي', 'msi', 'MSI est une marque internationale spécialisée dans les ordinateurs et composants haute performance. Elle est particulièrement connue pour ses produits Gaming, mais propose également des solutions pour les créateurs de contenu, les professionnels et les entreprises.\n\nMSI commercialise des ordinateurs portables, PC de bureau, écrans, cartes graphiques, cartes mères, alimentations, SSD et périphériques Gaming.', 'MSI هي علامة عالمية متخصصة في أجهزة الكمبيوتر عالية الأداء، وتشتهر خصوصًا بأجهزة Gaming ومكونات الكمبيوتر الاحترافية. تقدم MSI أيضًا أجهزة مخصصة لمنشئي المحتوى، المحترفين والشركات.\n\nتشمل منتجات MSI الحواسيب المحمولة، أجهزة الكمبيوتر المكتبية، الشاشات، بطاقات الرسومات، اللوحات الأم، مزودات الطاقة، وحدات SSD وملحقات Gaming.', 'http://localhost:4000/uploads/1789833419310-29c1e85e64d7.png', 1, 5, '2026-09-19 15:57:14', '2026-09-19 15:57:14'),
(6, 'Microsoft Surface', 'مايكروسوفت سيرفس', 'microsoft-surface', 'Microsoft Surface est une famille d\'ordinateurs et d\'appareils développée par Microsoft. Les appareils Surface combinent mobilité, design moderne, Windows et intégration avec les services Microsoft.\n\nLa gamme Surface propose des appareils destinés au travail, aux études, aux réunions, à la mobilité et à la productivité quotidienne, notamment des appareils 2-en-1 pouvant être utilisés comme ordinateur portable ou tablette.', 'Microsoft Surface هي عائلة من أجهزة الكمبيوتر والأجهزة المحمولة التي تطورها شركة Microsoft. تجمع أجهزة Surface بين التصميم الأنيق، قابلية التنقل، نظام Windows والتكامل مع خدمات Microsoft.\n\nتقدم Surface أجهزة مناسبة للعمل، الدراسة، الاجتماعات، التنقل والإنتاجية اليومية، بالإضافة إلى أجهزة 2 في 1 يمكن استخدامها كحاسوب محمول أو جهاز لوحي.', 'http://localhost:4000/uploads/1789833457175-1aef6778225f.png', 1, 6, '2026-09-19 15:57:53', '2026-09-19 15:57:53');

-- --------------------------------------------------------

--
-- Structure de la table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `module` varchar(80) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `permissions`
--

INSERT INTO `permissions` (`id`, `code`, `name`, `module`, `created_at`) VALUES
(1, 'dashboard.view', 'Voir le tableau de bord', 'dashboard', '2026-09-18 22:24:31'),
(2, 'users.view', 'Voir les utilisateurs', 'users', '2026-09-18 22:24:31'),
(3, 'users.create', 'Créer un utilisateur', 'users', '2026-09-18 22:24:31'),
(4, 'users.update', 'Modifier un utilisateur', 'users', '2026-09-18 22:24:31'),
(5, 'users.delete', 'Supprimer un utilisateur', 'users', '2026-09-18 22:24:31'),
(6, 'roles.view', 'Voir les rôles', 'roles', '2026-09-18 22:24:31'),
(7, 'roles.create', 'Créer un rôle', 'roles', '2026-09-18 22:24:31'),
(8, 'roles.update', 'Modifier un rôle', 'roles', '2026-09-18 22:24:31'),
(9, 'roles.delete', 'Supprimer un rôle', 'roles', '2026-09-18 22:24:31'),
(10, 'permissions.view', 'Voir les permissions', 'permissions', '2026-09-18 22:24:31'),
(11, 'fournisseurs.view', 'Voir les fournisseurs', 'fournisseurs', '2026-09-18 22:24:31'),
(12, 'fournisseurs.create', 'Créer un fournisseur', 'fournisseurs', '2026-09-18 22:24:31'),
(13, 'fournisseurs.update', 'Modifier un fournisseur', 'fournisseurs', '2026-09-18 22:24:31'),
(14, 'fournisseurs.delete', 'Supprimer un fournisseur', 'fournisseurs', '2026-09-18 22:24:31'),
(15, 'categories.view', 'Voir les catégories', 'categories', '2026-09-18 22:24:31'),
(16, 'categories.create', 'Créer une catégorie', 'categories', '2026-09-18 22:24:31'),
(17, 'categories.update', 'Modifier une catégorie', 'categories', '2026-09-18 22:24:31'),
(18, 'categories.delete', 'Supprimer une catégorie', 'categories', '2026-09-18 22:24:31'),
(19, 'marques.view', 'Voir les marques', 'marques', '2026-09-18 22:24:31'),
(20, 'marques.create', 'Créer une marque', 'marques', '2026-09-18 22:24:31'),
(21, 'marques.update', 'Modifier une marque', 'marques', '2026-09-18 22:24:31'),
(22, 'marques.delete', 'Supprimer une marque', 'marques', '2026-09-18 22:24:31'),
(23, 'articles.view', 'Voir les articles', 'articles', '2026-09-18 22:24:31'),
(24, 'articles.create', 'Créer un article', 'articles', '2026-09-18 22:24:31'),
(25, 'articles.update', 'Modifier un article', 'articles', '2026-09-18 22:24:31'),
(26, 'articles.delete', 'Supprimer un article', 'articles', '2026-09-18 22:24:31'),
(27, 'promotions.view', 'Voir les promotions', 'promotions', '2026-09-18 22:24:31'),
(28, 'promotions.create', 'Créer une promotion', 'promotions', '2026-09-18 22:24:31'),
(29, 'promotions.update', 'Modifier une promotion', 'promotions', '2026-09-18 22:24:31'),
(30, 'promotions.delete', 'Supprimer une promotion', 'promotions', '2026-09-18 22:24:31'),
(31, 'stock.view', 'Voir le stock', 'stock', '2026-09-18 22:24:31'),
(32, 'stock.create', 'Créer une entrée/sortie stock', 'stock', '2026-09-18 22:24:31'),
(33, 'commandes.view', 'Voir les commandes', 'commandes', '2026-09-18 22:24:31'),
(34, 'commandes.update', 'Modifier les commandes', 'commandes', '2026-09-18 22:24:31'),
(35, 'uploads.create', 'Téléverser des images', 'uploads', '2026-09-18 22:24:31');

-- --------------------------------------------------------

--
-- Structure de la table `product_stock_lots`
--

CREATE TABLE `product_stock_lots` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED NOT NULL,
  `quantity_initial` int(10) UNSIGNED NOT NULL,
  `quantity_remaining` int(10) UNSIGNED NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `supplier_id` int(10) UNSIGNED DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `product_stock_lots`
--

INSERT INTO `product_stock_lots` (`id`, `article_id`, `quantity_initial`, `quantity_remaining`, `purchase_price`, `selling_price`, `supplier_id`, `reference`, `notes`, `created_at`) VALUES
(1, 1, 5, 4, '92000.00', '105000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-19 16:40:00'),
(2, 2, 10, 10, '105000.00', '119900.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:13:54'),
(3, 3, 5, 5, '95000.00', '110000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:15:47'),
(4, 4, 10, 10, '100000.00', '119000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:17:10'),
(5, 5, 3, 3, '125000.00', '145000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:19:05'),
(6, 6, 5, 5, '145000.00', '170000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:20:40'),
(7, 7, 5, 5, '20000.00', '24000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:22:09'),
(8, 8, 3, 3, '49000.00', '55000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:23:05'),
(9, 9, 2, 2, '39000.00', '45000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:24:09'),
(10, 10, 20, 20, '1900.00', '2500.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:25:07'),
(11, 12, 5, 4, '2100.00', '2700.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:28:40'),
(12, 14, 4, 4, '7500.00', '9500.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:31:08'),
(13, 15, 5, 5, '4800.00', '5500.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:32:30'),
(14, 16, 5, 4, '11000.00', '13900.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:34:14'),
(15, 17, 10, 8, '10000.00', '14000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:35:34'),
(16, 18, 2, 0, '58000.00', '72000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:36:26'),
(17, 19, 5, 5, '14000.00', '19000.00', NULL, 'INITIAL', 'Stock initial à la création de l’article', '2026-09-20 21:37:33'),
(18, 11, 5, 5, '6000.00', '7800.00', NULL, 'INITIAL_FIX', 'Lot créé automatiquement (était manquant)', '2026-09-23 18:50:29'),
(19, 13, 20, 20, '4200.00', '5500.00', NULL, 'INITIAL_FIX', 'Lot créé automatiquement (était manquant)', '2026-09-23 18:50:29');

-- --------------------------------------------------------

--
-- Structure de la table `promotions`
--

CREATE TABLE `promotions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(180) NOT NULL,
  `name_ar` varchar(180) DEFAULT NULL,
  `type` enum('POURCENTAGE','MONTANT') NOT NULL DEFAULT 'POURCENTAGE',
  `value` decimal(12,2) NOT NULL,
  `badge` varchar(80) DEFAULT NULL,
  `badge_ar` varchar(80) DEFAULT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `promotions`
--

INSERT INTO `promotions` (`id`, `name`, `name_ar`, `type`, `value`, `badge`, `badge_ar`, `start_at`, `end_at`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Test', 'test', 'POURCENTAGE', '10.00', 'd', 'd', '2026-09-23 19:19:00', '2026-09-27 19:19:00', 1, '2026-09-23 18:19:11', '2026-09-23 18:19:11');

-- --------------------------------------------------------

--
-- Structure de la table `promotion_articles`
--

CREATE TABLE `promotion_articles` (
  `promotion_id` int(10) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `promotion_articles`
--

INSERT INTO `promotion_articles` (`promotion_id`, `article_id`) VALUES
(1, 17);

-- --------------------------------------------------------

--
-- Structure de la table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `roles`
--

INSERT INTO `roles` (`id`, `code`, `name`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN', 'Administrateur', 'Accès complet à l’administration', 1, '2026-09-18 22:24:31', '2026-09-18 22:24:31'),
(2, 'OPERATEUR', 'Opérateur', 'Gestion commerciale et commandes', 1, '2026-09-18 22:24:31', '2026-09-18 22:24:31');

-- --------------------------------------------------------

--
-- Structure de la table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(2, 1),
(2, 11),
(2, 15),
(2, 19),
(2, 23),
(2, 27),
(2, 31),
(2, 32),
(2, 33),
(2, 34),
(2, 35);

-- --------------------------------------------------------

--
-- Structure de la table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` int(10) UNSIGNED NOT NULL,
  `lot_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` enum('ENTRY','EXIT','ADJUSTMENT') NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `stock_before` int(11) NOT NULL DEFAULT 0,
  `stock_after` int(11) NOT NULL DEFAULT 0,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `selling_price` decimal(12,2) DEFAULT NULL,
  `supplier_id` int(10) UNSIGNED DEFAULT NULL,
  `reference` varchar(120) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `article_id`, `lot_id`, `type`, `quantity`, `stock_before`, `stock_after`, `purchase_price`, `selling_price`, `supplier_id`, `reference`, `notes`, `user_id`, `created_at`) VALUES
(1, 1, 1, 'EXIT', 1, 5, 4, '92000.00', '105000.00', NULL, 'COMMANDE:1', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 17:35:17'),
(2, 18, 16, 'EXIT', 2, 2, 0, '58000.00', '72000.00', NULL, 'COMMANDE:1', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 17:35:17'),
(3, 17, 15, 'EXIT', 1, 10, 9, '10000.00', '14000.00', NULL, 'COMMANDE:2', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 18:31:18'),
(10, 17, 15, 'EXIT', 1, 9, 8, '10000.00', '14000.00', NULL, 'COMMANDE:7', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 18:46:47'),
(11, 16, 14, 'EXIT', 1, 5, 4, '11000.00', '13900.00', NULL, 'COMMANDE:7', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 18:46:47'),
(12, 12, 11, 'EXIT', 1, 5, 4, '2100.00', '2700.00', NULL, 'COMMANDE:7', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 18:46:47'),
(13, 13, 19, 'EXIT', 1, 20, 19, '4200.00', '5500.00', NULL, 'COMMANDE:9', 'Sortie automatique à la création de la commande', NULL, '2026-09-23 18:51:36'),
(14, 13, 19, 'ENTRY', 1, 19, 20, '4200.00', '5500.00', NULL, 'COMMANDE:9', 'Restitution suite annulation/retour', 1, '2026-09-23 18:55:54');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(40) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('ACTIF','INACTIF','CONGE','MALADIE') NOT NULL DEFAULT 'ACTIF',
  `role_id` int(10) UNSIGNED NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `code`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `status`, `role_id`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'USR-11540042', 'Admin', 'DOCTECH', 'admin@doctech.local', NULL, '$2b$12$RLxGombVYo/yo/FzxdO2GOrSSWCHgRa9mHoJdHk2VdpqKiXpeUgbC', 'ACTIF', 1, '2026-09-23 18:35:49', '2026-09-19 09:52:20', '2026-09-23 17:35:49');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_articles_fournisseur` (`fournisseur_id`),
  ADD KEY `idx_articles_status` (`status`),
  ADD KEY `idx_articles_category` (`category_id`),
  ADD KEY `idx_articles_marque` (`marque_id`);
ALTER TABLE `articles` ADD FULLTEXT KEY `ftx_articles_name_description` (`name`,`short_description`,`description`);

--
-- Index pour la table `article_images`
--
ALTER TABLE `article_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_article_images_article` (`article_id`);

--
-- Index pour la table `article_variants`
--
ALTER TABLE `article_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `fk_variants_article` (`article_id`),
  ADD KEY `fk_variants_image` (`image_id`);

--
-- Index pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_user` (`user_id`),
  ADD KEY `idx_audit_created_at` (`created_at`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_categories_parent` (`parent_id`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_number` (`tracking_number`),
  ADD KEY `idx_commandes_status` (`status`),
  ADD KEY `idx_commandes_created_at` (`created_at`),
  ADD KEY `idx_commandes_delivery_tracking` (`delivery_tracking`),
  ADD KEY `idx_commandes_delivery_sync` (`delivery_sync_status`);

--
-- Index pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_commande_items_commande` (`commande_id`),
  ADD KEY `fk_commande_items_article` (`article_id`),
  ADD KEY `fk_commande_items_variant` (`variant_id`);

--
-- Index pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `marques`
--
ALTER TABLE `marques`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Index pour la table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `product_stock_lots`
--
ALTER TABLE `product_stock_lots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stock_lots_supplier` (`supplier_id`),
  ADD KEY `idx_stock_lots_article_remaining` (`article_id`,`quantity_remaining`,`created_at`);

--
-- Index pour la table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_promotions_dates` (`active`,`start_at`,`end_at`);

--
-- Index pour la table `promotion_articles`
--
ALTER TABLE `promotion_articles`
  ADD PRIMARY KEY (`promotion_id`,`article_id`),
  ADD KEY `fk_promotion_articles_article` (`article_id`);

--
-- Index pour la table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `fk_role_permissions_permission` (`permission_id`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stock_mov_lot` (`lot_id`),
  ADD KEY `fk_stock_mov_supplier` (`supplier_id`),
  ADD KEY `fk_stock_mov_user` (`user_id`),
  ADD KEY `idx_stock_mov_article_created` (`article_id`,`created_at`),
  ADD KEY `idx_stock_mov_type_created` (`type`,`created_at`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `article_images`
--
ALTER TABLE `article_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT pour la table `article_variants`
--
ALTER TABLE `article_variants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `commande_items`
--
ALTER TABLE `commande_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `marques`
--
ALTER TABLE `marques`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `product_stock_lots`
--
ALTER TABLE `product_stock_lots`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `fk_articles_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_articles_fournisseur` FOREIGN KEY (`fournisseur_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_articles_marque` FOREIGN KEY (`marque_id`) REFERENCES `marques` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `article_images`
--
ALTER TABLE `article_images`
  ADD CONSTRAINT `fk_article_images_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `article_variants`
--
ALTER TABLE `article_variants`
  ADD CONSTRAINT `fk_variants_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_variants_image` FOREIGN KEY (`image_id`) REFERENCES `article_images` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `commande_items`
--
ALTER TABLE `commande_items`
  ADD CONSTRAINT `fk_commande_items_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commande_items_commande` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_commande_items_variant` FOREIGN KEY (`variant_id`) REFERENCES `article_variants` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `product_stock_lots`
--
ALTER TABLE `product_stock_lots`
  ADD CONSTRAINT `fk_stock_lots_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_lots_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `promotion_articles`
--
ALTER TABLE `promotion_articles`
  ADD CONSTRAINT `fk_promotion_articles_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_promotion_articles_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_mov_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_stock_mov_lot` FOREIGN KEY (`lot_id`) REFERENCES `product_stock_lots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stock_mov_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `fournisseurs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stock_mov_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
