-- Adminer 4.7.7 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `dnd`;
CREATE DATABASE `dnd` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `dnd`;

CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `version` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `users_by_label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `label`, `email`, `password`, `version`) VALUES
('ajm',	    'AJ Mortensen',	  'ajm@gmail.com',	        NULL,	NULL),
('eric',  	'Eric Lowry',	    'eric@myrealms.org',	    NULL,	NULL),
('max',	    'Max Lowry',	    'chunkjustice@gmail.com',	NULL,	NULL),
('milneb',	'Austin Miller',	'sexy-austin-69@aol.com',	NULL,	NULL),
('nate',	  'Nate Lowry',	    'keeperofzulu@gmail.com',	NULL,	NULL);

CREATE TABLE `players` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `label` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `players_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `players` (`id`, `user_id`, `label`, `description`) VALUES
('bart',	'nate',	  'Bart, the Rakish Rouge',	NULL),
('biff',	'eric',	  'Biff Stryker',	NULL),
('phosk',	'max',	  'Phosk',	NULL),
('wench',	'milneb',	'Sexy Serving Wench',	NULL),
('witch',	'milneb',	'Sexy Witch',	NULL),
('yetti',	'ajm',	  'Yetti the fluffy rabbit',	NULL);

CREATE VIEW `players_dv` AS
SELECT 
  `players`.*, 
  `users`.`label` as `user_label`,
  `users`.`email` as `user_email`
FROM `players`, `users`
WHERE `players`.`user_id` = `users`.`id`;

CREATE TABLE `campaigns` (
  `id` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `dm` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dm` (`dm`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`dm`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `campaigns` (`id`, `label`, `dm`, `description`) VALUES
('a-simple-task',	  'A Simple Task...',	  'max',	NULL),
('weeping-willow',	'The Weeping Willow',	'ajm',	NULL);

CREATE TABLE `campaign_players` (
  `campaign_id` varchar(50) NOT NULL,
  `player_id` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`campaign_id`,`player_id`),
  KEY `player_id` (`player_id`),
  CONSTRAINT `campaign_players_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `campaign_players_ibfk_4` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `campaign_players` (`campaign_id`, `player_id`, `status`) VALUES
('a-simple-task',	  'bart',	  NULL),
('a-simple-task',	  'biff',	  NULL),
('a-simple-task',	  'witch',	NULL),
('a-simple-task',	  'yetti',	NULL),
('weeping-willow',	'bart',	  NULL),
('weeping-willow',	'biff',	  NULL),
('weeping-willow',	'phosk',	NULL),
('weeping-willow',	'wench',	NULL);
