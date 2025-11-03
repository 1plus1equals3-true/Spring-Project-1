# mcl_project

```
CREATE TABLE `board` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`title` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`content` TEXT NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`rating` INT(11) NULL DEFAULT '0',
	`hit` INT(11) NULL DEFAULT '0',
	`recommend` INT(11) NULL DEFAULT '0',
	`regdate` DATETIME NULL DEFAULT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	`ip` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`board_type` INT(11) NULL DEFAULT '0',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `board_attachments` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`bidx` INT(11) NULL DEFAULT NULL COMMENT 'FK',
	`dir` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`stored_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`original_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`status` ENUM('temp','active') NULL DEFAULT 'temp' COLLATE 'utf8mb4_uca1400_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `board_comments` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`bidx` INT(11) NOT NULL COMMENT 'FK',
	`userid` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`ment` TEXT NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`regdate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `category` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`category` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`type` ENUM('TEXT','SELECT','DATE') NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `category_list` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`category_idx` INT(11) NOT NULL COMMENT 'FK',
	`value` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`sort` INT(11) NULL DEFAULT '0',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`group_idx` INT(11) NULL DEFAULT NULL COMMENT 'FK',
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`item` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`regdate` DATETIME NULL DEFAULT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_attachments` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NULL DEFAULT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`dir` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`stored_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`original_name` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`status` ENUM('temp','active') NOT NULL DEFAULT 'temp' COLLATE 'utf8mb4_uca1400_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_attachments_mapping` (
	`attachments_idx` INT(11) NOT NULL,
	`collection_idx` INT(11) NOT NULL,
	PRIMARY KEY (`attachments_idx`, `collection_idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_category_value` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`collection_idx` INT(11) NOT NULL COMMENT 'FK - 묶어 유니크',
	`category_idx` INT(11) NOT NULL COMMENT 'FK - 묶어 유니크',
	`value` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	PRIMARY KEY (`idx`) USING BTREE,
	UNIQUE INDEX `UQ_collection_category` (`collection_idx`, `category_idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_group` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`title` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`regdate` DATETIME NULL DEFAULT NULL,
	`moddate` DATETIME NULL DEFAULT NULL,
	PRIMARY KEY (`idx`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `collection_option` (
	`userid` VARCHAR(50) NOT NULL COMMENT 'FK' COLLATE 'utf8mb4_uca1400_ai_ci',
	`quick` TINYINT(1) NULL DEFAULT '0',
	`category1` INT(11) NULL DEFAULT NULL COMMENT 'category idx',
	`category2` INT(11) NULL DEFAULT NULL COMMENT 'category idx',
	PRIMARY KEY (`userid`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `member` (
	`idx` INT(11) NOT NULL AUTO_INCREMENT,
	`userid` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`pwd` VARCHAR(200) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`nickname` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`birth` DATE NULL DEFAULT NULL,
	`file` VARCHAR(200) NULL DEFAULT NULL COLLATE 'utf8mb4_uca1400_ai_ci',
	`grade` INT(11) NULL DEFAULT '1',
	`regdate` DATETIME NOT NULL,
	PRIMARY KEY (`idx`) USING BTREE,
	UNIQUE INDEX `userid` (`userid`) USING BTREE
)
COLLATE='utf8mb4_uca1400_ai_ci'
ENGINE=InnoDB
;

```
