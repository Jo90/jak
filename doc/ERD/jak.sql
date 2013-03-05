-- MySQL dump 10.13  Distrib 5.5.29, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: jak
-- ------------------------------------------------------
-- Server version	5.5.29-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `address` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `streetUnit` varchar(30) DEFAULT NULL COMMENT 'flat/unit/level/apartment/lot#',
  `streetRef` varchar(30) DEFAULT NULL COMMENT 'street number',
  `streetName` varchar(100) NOT NULL COMMENT 'street name/lot identifier',
  `streetType` varchar(30) DEFAULT NULL COMMENT 'street type',
  `streetLot` varchar(30) DEFAULT NULL,
  `location` int(10) unsigned NOT NULL COMMENT 'location.id',
  `postcode` varchar(10) DEFAULT NULL COMMENT 'postcode/zip',
  `name` varchar(255) DEFAULT NULL COMMENT 'expanded name maintained by trigger',
  PRIMARY KEY (`id`),
  KEY `address__fk1_idx` (`location`),
  CONSTRAINT `fk_address_1` FOREIGN KEY (`location`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Addresses';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arInvoice`
--

DROP TABLE IF EXISTS `arInvoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arInvoice` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `issued` int(10) unsigned NOT NULL COMMENT 'uts',
  `arPayment` int(10) unsigned NOT NULL COMMENT 'uts - simple accounting method',
  `address` varchar(255) DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_arInvoice_1_idx` (`arPayment`),
  CONSTRAINT `fk_arInvoice_1` FOREIGN KEY (`arPayment`) REFERENCES `arPayment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arInvoice`
--

LOCK TABLES `arInvoice` WRITE;
/*!40000 ALTER TABLE `arInvoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `arInvoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arInvoiceItem`
--

DROP TABLE IF EXISTS `arInvoiceItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arInvoiceItem` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `arInvoice` int(10) unsigned NOT NULL,
  `job` int(10) unsigned NOT NULL,
  `glAccount` int(10) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_arInvoiceItem_1_idx` (`arInvoice`),
  KEY `fk_arInvoiceItem_2_idx` (`glAccount`),
  CONSTRAINT `fk_arInvoiceItem_1` FOREIGN KEY (`arInvoice`) REFERENCES `arInvoice` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_arInvoiceItem_2` FOREIGN KEY (`glAccount`) REFERENCES `glAccount` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arInvoiceItem`
--

LOCK TABLES `arInvoiceItem` WRITE;
/*!40000 ALTER TABLE `arInvoiceItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `arInvoiceItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arPayment`
--

DROP TABLE IF EXISTS `arPayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arPayment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `received` int(10) NOT NULL COMMENT 'uts',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `method` varchar(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arPayment`
--

LOCK TABLES `arPayment` WRITE;
/*!40000 ALTER TABLE `arPayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `arPayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dbTable`
--

DROP TABLE IF EXISTS `dbTable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dbTable` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dbTable_uk1` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dbTable`
--

LOCK TABLES `dbTable` WRITE;
/*!40000 ALTER TABLE `dbTable` DISABLE KEYS */;
/*!40000 ALTER TABLE `dbTable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `glAccount`
--

DROP TABLE IF EXISTS `glAccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `glAccount` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `org` int(10) unsigned NOT NULL,
  `name` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_account_1_idx` (`org`),
  CONSTRAINT `fk_glAccount_1` FOREIGN KEY (`org`) REFERENCES `org` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `glAccount`
--

LOCK TABLES `glAccount` WRITE;
/*!40000 ALTER TABLE `glAccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `glAccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `glPeriod`
--

DROP TABLE IF EXISTS `glPeriod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `glPeriod` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `yyyymm` varchar(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='accounting periods (future?)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `glPeriod`
--

LOCK TABLES `glPeriod` WRITE;
/*!40000 ALTER TABLE `glPeriod` DISABLE KEYS */;
/*!40000 ALTER TABLE `glPeriod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grp`
--

DROP TABLE IF EXISTS `grp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grp` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL COMMENT 'Spouse/Partner/Associate',
  PRIMARY KEY (`id`),
  KEY `idx_grp_1` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grp`
--

LOCK TABLES `grp` WRITE;
/*!40000 ALTER TABLE `grp` DISABLE KEYS */;
/*!40000 ALTER TABLE `grp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info`
--

DROP TABLE IF EXISTS `info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `info` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dbTable` int(10) unsigned NOT NULL,
  `pk` int(10) unsigned NOT NULL,
  `displayOrder` tinyint(4) NOT NULL DEFAULT '1',
  `viewable` char(1) NOT NULL DEFAULT 'P' COMMENT '(P)ublic, (G)roup, (I)ndividual',
  `created` int(10) NOT NULL,
  `createdBy` varchar(30) NOT NULL,
  `category` varchar(30) DEFAULT NULL,
  `detail` text,
  PRIMARY KEY (`id`),
  KEY `info_idx1` (`dbTable`),
  CONSTRAINT `info_fk1` FOREIGN KEY (`dbTable`) REFERENCES `dbTable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info`
--

LOCK TABLES `info` WRITE;
/*!40000 ALTER TABLE `info` DISABLE KEYS */;
/*!40000 ALTER TABLE `info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ref` int(10) DEFAULT NULL COMMENT 'Company job number',
  `created` int(10) unsigned NOT NULL COMMENT 'date',
  `property` int(10) unsigned NOT NULL,
  `reminder` int(10) unsigned DEFAULT NULL COMMENT 'uts',
  `status` varchar(30) DEFAULT NULL COMMENT 'status - can it be calculated',
  `weather` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_1_idx` (`property`),
  CONSTRAINT `fk_job_1` FOREIGN KEY (`property`) REFERENCES `property` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobCategory`
--

DROP TABLE IF EXISTS `jobCategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobCategory` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job` int(10) unsigned NOT NULL,
  `parent` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jobCategory_1_idx` (`job`),
  KEY `fk_jobCategory_2_idx` (`parent`),
  CONSTRAINT `fk_jobCategory_1` FOREIGN KEY (`job`) REFERENCES `job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_jobCategory_2` FOREIGN KEY (`parent`) REFERENCES `jobCategory` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobCategory`
--

LOCK TABLES `jobCategory` WRITE;
/*!40000 ALTER TABLE `jobCategory` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobCategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobCost`
--

DROP TABLE IF EXISTS `jobCost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobCost` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job` int(10) unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_jobCost_1_idx` (`job`),
  CONSTRAINT `fk_jobCost_1` FOREIGN KEY (`job`) REFERENCES `job` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobCost`
--

LOCK TABLES `jobCost` WRITE;
/*!40000 ALTER TABLE `jobCost` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobCost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobService`
--

DROP TABLE IF EXISTS `jobService`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobService` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job` int(10) unsigned NOT NULL,
  `jobServiceType` int(10) unsigned NOT NULL,
  `fee` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_jobService_1_idx` (`job`),
  KEY `fk_jobService_2_idx` (`jobServiceType`),
  CONSTRAINT `fk_jobService_1` FOREIGN KEY (`job`) REFERENCES `job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_jobService_2` FOREIGN KEY (`jobServiceType`) REFERENCES `jobServiceType` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobService`
--

LOCK TABLES `jobService` WRITE;
/*!40000 ALTER TABLE `jobService` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobService` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobServiceType`
--

DROP TABLE IF EXISTS `jobServiceType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobServiceType` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `org` int(10) unsigned NOT NULL,
  `fee` float NOT NULL DEFAULT '0',
  `seq` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_jobServiceType_1_idx` (`org`),
  CONSTRAINT `fk_jobServiceType_1` FOREIGN KEY (`org`) REFERENCES `org` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobServiceType`
--

LOCK TABLES `jobServiceType` WRITE;
/*!40000 ALTER TABLE `jobServiceType` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobServiceType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lib`
--

DROP TABLE IF EXISTS `lib`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lib` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dbTable` int(10) unsigned NOT NULL,
  `pk` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_lib_1_idx` (`dbTable`),
  CONSTRAINT `fk_lib_1` FOREIGN KEY (`dbTable`) REFERENCES `dbTable` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lib`
--

LOCK TABLES `lib` WRITE;
/*!40000 ALTER TABLE `lib` DISABLE KEYS */;
/*!40000 ALTER TABLE `lib` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libItem`
--

DROP TABLE IF EXISTS `libItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `libItem` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lib` int(10) unsigned NOT NULL,
  `media` varchar(30) NOT NULL,
  `file` varchar(80) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_libItem_1_idx` (`lib`),
  CONSTRAINT `fk_libItem_1` FOREIGN KEY (`lib`) REFERENCES `lib` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libItem`
--

LOCK TABLES `libItem` WRITE;
/*!40000 ALTER TABLE `libItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `libItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `full` varchar(255) DEFAULT NULL COMMENT 'Full hierarchical name',
  PRIMARY KEY (`id`),
  KEY `location_fk1_idx` (`parent`),
  CONSTRAINT `location_fk1` FOREIGN KEY (`parent`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created` int(10) unsigned NOT NULL,
  `dbTable` int(10) unsigned NOT NULL,
  `pk` int(10) unsigned NOT NULL,
  `usr` int(10) unsigned NOT NULL,
  `what` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `org`
--

DROP TABLE IF EXISTS `org`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `org` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created` int(10) NOT NULL,
  `contactDetail` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='organisations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `org`
--

LOCK TABLES `org` WRITE;
/*!40000 ALTER TABLE `org` DISABLE KEYS */;
/*!40000 ALTER TABLE `org` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orgUsr`
--

DROP TABLE IF EXISTS `orgUsr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orgUsr` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `org` int(10) unsigned NOT NULL,
  `usr` int(10) unsigned NOT NULL,
  `role` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grpUsr_uk1` (`org`,`usr`),
  KEY `grpUsr_fk1_idx` (`org`),
  KEY `grpUsr_fk2_idx` (`usr`),
  CONSTRAINT `orgUsr_fk1` FOREIGN KEY (`org`) REFERENCES `org` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orgUsr_fk2` FOREIGN KEY (`usr`) REFERENCES `usr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orgUsr`
--

LOCK TABLES `orgUsr` WRITE;
/*!40000 ALTER TABLE `orgUsr` DISABLE KEYS */;
/*!40000 ALTER TABLE `orgUsr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propItem`
--

DROP TABLE IF EXISTS `propItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `propItem` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `property` int(10) unsigned NOT NULL,
  `propItemType` int(10) unsigned DEFAULT NULL,
  `seq` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `indent` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_propItem_1_idx` (`property`),
  KEY `fk_propItem_2_idx` (`propItemType`),
  CONSTRAINT `fk_propItem_1` FOREIGN KEY (`property`) REFERENCES `property` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_propItem_2` FOREIGN KEY (`propItemType`) REFERENCES `propItemType` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propItem`
--

LOCK TABLES `propItem` WRITE;
/*!40000 ALTER TABLE `propItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `propItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propItemType`
--

DROP TABLE IF EXISTS `propItemType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `propItemType` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned NOT NULL COMMENT 'parent component',
  `def` tinyint(1) NOT NULL DEFAULT '1',
  `seq` tinyint(4) NOT NULL,
  `indent` tinyint(4) NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_propertyComponent_1_idx` (`parent`),
  CONSTRAINT `fk_propItemType_1` FOREIGN KEY (`parent`) REFERENCES `propItemType` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propItemType`
--

LOCK TABLES `propItemType` WRITE;
/*!40000 ALTER TABLE `propItemType` DISABLE KEYS */;
/*!40000 ALTER TABLE `propItemType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propItemVal`
--

DROP TABLE IF EXISTS `propItemVal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `propItemVal` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job` int(10) unsigned NOT NULL,
  `propItem` int(10) unsigned NOT NULL,
  `propItemValType` int(10) unsigned NOT NULL,
  `detail` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_propItemVal_2_idx` (`propItemValType`),
  KEY `fk_propItemVal_3_idx` (`job`),
  KEY `fk_propItemVal_1_idx` (`propItem`),
  CONSTRAINT `fk_propItemVal_1` FOREIGN KEY (`propItem`) REFERENCES `propItem` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_propItemVal_2` FOREIGN KEY (`propItemValType`) REFERENCES `propItemValType` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_propItemVal_3` FOREIGN KEY (`job`) REFERENCES `job` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propItemVal`
--

LOCK TABLES `propItemVal` WRITE;
/*!40000 ALTER TABLE `propItemVal` DISABLE KEYS */;
/*!40000 ALTER TABLE `propItemVal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propItemValType`
--

DROP TABLE IF EXISTS `propItemValType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `propItemValType` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent` int(10) unsigned NOT NULL,
  `seq` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `indent` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propItemValType`
--

LOCK TABLES `propItemValType` WRITE;
/*!40000 ALTER TABLE `propItemValType` DISABLE KEYS */;
/*!40000 ALTER TABLE `propItemValType` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `property` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `address` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `property__fk1_idx` (`address`),
  CONSTRAINT `fk_property_1` FOREIGN KEY (`address`) REFERENCES `address` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property`
--

LOCK TABLES `property` WRITE;
/*!40000 ALTER TABLE `property` DISABLE KEYS */;
/*!40000 ALTER TABLE `property` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dbTable` int(10) unsigned NOT NULL,
  `pk` int(10) unsigned NOT NULL,
  `displayOrder` tinyint(4) NOT NULL DEFAULT '1',
  `tag` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_infoTag_1_idx` (`dbTable`),
  CONSTRAINT `tag_fk1` FOREIGN KEY (`dbTable`) REFERENCES `dbTable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='categories';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usr`
--

DROP TABLE IF EXISTS `usr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usr` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created` int(10) unsigned NOT NULL COMMENT 'UTC date/time',
  `logon` varchar(45) DEFAULT NULL COMMENT 'usually email',
  `password` varchar(45) DEFAULT NULL COMMENT 'encrypted/hashed',
  `title` varchar(10) DEFAULT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `udx_usr_1` (`logon`),
  KEY `idx_usr_1` (`firstName`),
  KEY `idx_usr_2` (`lastName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usr`
--

LOCK TABLES `usr` WRITE;
/*!40000 ALTER TABLE `usr` DISABLE KEYS */;
INSERT INTO `usr` VALUES (1,0,'jj','jj','Mr','Joseph','Douglas');
/*!40000 ALTER TABLE `usr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usrAddress`
--

DROP TABLE IF EXISTS `usrAddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usrAddress` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `address` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usrAddress_1_idx` (`usr`),
  KEY `fk_usrAddress_2_idx` (`address`),
  CONSTRAINT `fk_usrAddress_1` FOREIGN KEY (`usr`) REFERENCES `usr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usrAddress_2` FOREIGN KEY (`address`) REFERENCES `address` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usrAddress`
--

LOCK TABLES `usrAddress` WRITE;
/*!40000 ALTER TABLE `usrAddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `usrAddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usrAssoc`
--

DROP TABLE IF EXISTS `usrAssoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usrAssoc` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `grp` int(10) unsigned NOT NULL,
  `category` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usrAssoc_1_idx` (`usr`),
  KEY `fk_usrAssoc_2_idx` (`grp`),
  CONSTRAINT `fk_usrAssoc_1` FOREIGN KEY (`usr`) REFERENCES `usr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usrAssoc_2` FOREIGN KEY (`grp`) REFERENCES `grp` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='User Associations';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usrAssoc`
--

LOCK TABLES `usrAssoc` WRITE;
/*!40000 ALTER TABLE `usrAssoc` DISABLE KEYS */;
/*!40000 ALTER TABLE `usrAssoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usrJob`
--

DROP TABLE IF EXISTS `usrJob`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usrJob` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `job` int(10) unsigned NOT NULL,
  `purpose` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_usrJob_1_idx` (`usr`),
  KEY `fk_usrJob_2_idx` (`job`),
  CONSTRAINT `fk_usrJob_1` FOREIGN KEY (`usr`) REFERENCES `usr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usrJob_2` FOREIGN KEY (`job`) REFERENCES `job` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usrJob`
--

LOCK TABLES `usrJob` WRITE;
/*!40000 ALTER TABLE `usrJob` DISABLE KEYS */;
/*!40000 ALTER TABLE `usrJob` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usrLink`
--

DROP TABLE IF EXISTS `usrLink`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usrLink` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usr` int(10) unsigned NOT NULL,
  `dbTable` int(10) unsigned NOT NULL,
  `pk` int(10) unsigned NOT NULL,
  `purpose` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usrLink_fk1_idx` (`usr`),
  KEY `usrLink_fk2_idx` (`dbTable`),
  CONSTRAINT `usrLink_fk1` FOREIGN KEY (`usr`) REFERENCES `usr` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usrLink_fk2` FOREIGN KEY (`dbTable`) REFERENCES `dbTable` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='user associated data';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usrLink`
--

LOCK TABLES `usrLink` WRITE;
/*!40000 ALTER TABLE `usrLink` DISABLE KEYS */;
/*!40000 ALTER TABLE `usrLink` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-03-06 11:01:16
