-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 28, 2023 at 10:31 AM
-- Server version: 8.0.27
-- PHP Version: 7.4.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pcmaintenance`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'User ID',
  `username` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Username',
  `password` varchar(72) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Hashed password',
  `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'User added date',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Department ID',
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Department Name',
  `abbr` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Department Abbreviation',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `operations`
--

DROP TABLE IF EXISTS `operations`;
CREATE TABLE IF NOT EXISTS `operations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Operation ID',
  `unit_id` int UNSIGNED NOT NULL COMMENT 'Unit ID',
  `operation` int UNSIGNED NOT NULL COMMENT 'Operation Done: 1 - Clean, 2 - Repair, 3 - Update, 4- Removed',
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Operation description and details',
  `date_start` datetime NOT NULL COMMENT 'Starting date of the operation',
  `date_end` datetime NOT NULL COMMENT 'Ending date of the operation',
  PRIMARY KEY (`id`),
  KEY `UNIT_FK_1` (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE IF NOT EXISTS `units` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'PC Unit ID',
  `dept_id` int UNSIGNED NOT NULL COMMENT 'Department ID',
  `area` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT 'Department Area',
  `status` varchar(255) NOT NULL COMMENT 'PC Unit Status',
  `removed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Unit was removed',
  `added_by` int NOT NULL COMMENT 'Added by',
  `date_encoded` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Date encoded to system',
  PRIMARY KEY (`id`),
  KEY `OFFICE_FK_1` (`dept_id`),
  KEY `USER_FK_1` (`added_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `operations`
--
ALTER TABLE `operations`
  ADD CONSTRAINT `UNIT_FK_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `OFFICE_FK_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `USER_FK_1` FOREIGN KEY (`added_by`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
